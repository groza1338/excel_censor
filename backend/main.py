from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
import pandas as pd
import aiofiles
import uuid
import os
import json
import asyncio
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from backend.work_with_excel.censor import read_excel_values, mask_columns, save_censored_file

app = FastAPI()

# Разрешаем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройка подключения к MongoDB
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.file_database
uploaded_files_collection = database.get_collection("uploaded_files")
censored_files_collection = database.get_collection("censored_files")

# Инициализация планировщика APScheduler
scheduler = AsyncIOScheduler()


async def delete_expired_files():
    # Текущая дата и время
    now = datetime.utcnow()
    # Порог времени для удаления файлов (1 час назад)
    expiration_time = now - timedelta(hours=1)

    # Удаление устаревших загруженных файлов
    async for file_info in uploaded_files_collection.find({"uploaded_at": {"$lt": expiration_time}}):
        file_path = Path(file_info["path"])
        if file_path.exists():
            os.remove(file_path)
        await uploaded_files_collection.delete_one({"_id": file_info["_id"]})

    # Удаление устаревших замаскированных файлов
    async for file_info in censored_files_collection.find({"created_at": {"$lt": expiration_time}}):
        file_path = Path(file_info["path"])
        if file_path.exists():
            os.remove(file_path)
        await censored_files_collection.delete_one({"_id": file_info["_id"]})


# Добавление задачи в планировщик (каждые 10 минут)
scheduler.add_job(delete_expired_files, IntervalTrigger(minutes=10))
scheduler.start()


@app.post("/api/uploadfile/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Генерируем уникальный идентификатор для файла
        unique_id = str(uuid.uuid4())
        file_location = f"backend/uploaded_files/{unique_id}_{file.filename}"

        async with aiofiles.open(file_location, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        df = read_excel_values(Path(file_location))
        columns = df.columns.tolist()

        # Сохраняем информацию о файле в БД
        upload_file_info = {
            "file_id": unique_id,
            "filename": file.filename,
            "path": file_location,
            "uploaded_at": datetime.utcnow()
        }
        await uploaded_files_collection.insert_one(upload_file_info)

        return {"file_id": unique_id, "filename": file.filename, "columns": columns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/maskcolumns/")
async def mask_columns_api(file_id: str = Form(...), columns_to_mask: str = Form(...)):
    try:
        file_info = await uploaded_files_collection.find_one({"file_id": file_id})
        if not file_info:
            raise HTTPException(status_code=400, detail="File ID not found")

        file_location = file_info["path"]
        original_filename = file_info["filename"]

        df = read_excel_values(Path(file_location))

        # Преобразуем строки индексов в список целых чисел
        columns_to_mask_list = [int(idx.strip()) for idx in columns_to_mask.split(',')]

        masked_df = mask_columns(df, columns_to_mask_list)

        # Генерируем уникальный идентификатор для замаскированного файла
        censored_unique_id = str(uuid.uuid4())
        censored_file_path = save_censored_file(masked_df, Path(
            f"backend/uploaded_files/{censored_unique_id}_{original_filename}"))

        # Сохраняем информацию о замаскированном файле в БД
        censored_file_info = {
            "censored_file_id": censored_unique_id,
            "filename": original_filename,
            "path": str(censored_file_path),
            "created_at": datetime.utcnow()
        }
        await censored_files_collection.insert_one(censored_file_info)

        return {"censored_file_id": censored_unique_id, "censored_filename": original_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{censored_file_id}")
async def download_file(censored_file_id: str):
    try:
        file_info = await censored_files_collection.find_one({"censored_file_id": censored_file_id})
        if not file_info:
            raise HTTPException(status_code=400, detail="Censored file ID not found")

        censored_file_path = file_info["path"]
        original_filename = file_info["filename"]
        censored_filename = f"{Path(original_filename).stem}_censored{Path(original_filename).suffix}"

        if not Path(censored_file_path).exists():
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(path=censored_file_path, filename=censored_filename,
                            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
