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
from work_with_excel.censor import read_excel_values, mask_columns, save_censored_file

app = FastAPI(docs_url="/api/docs")

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
    now = datetime.utcnow()
    expiration_time = now - timedelta(hours=1)

    async for file_info in uploaded_files_collection.find({"uploaded_at": {"$lt": expiration_time}}):
        file_path = Path(file_info["path"])
        if file_path.exists():
            os.remove(file_path)
        await uploaded_files_collection.delete_one({"_id": file_info["_id"]})

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
        unique_id = str(uuid.uuid4())
        upload_dir = Path("uploaded_files")
        upload_dir.mkdir(parents=True, exist_ok=True)  # Создаем директорию, если она не существует

        file_location = upload_dir / f"{unique_id}_{file.filename}"

        async with aiofiles.open(file_location, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        df = read_excel_values(file_location)
        columns = df.columns.tolist()

        upload_file_info = {
            "file_id": unique_id,
            "filename": file.filename,
            "path": str(file_location),
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

        file_location = Path(file_info["path"])
        original_filename = file_info["filename"]
        censored_filename = original_filename.replace(".xlsx", "_censored.xlsx")

        df = read_excel_values(file_location)

        columns_to_mask_list = [int(idx.strip()) for idx in columns_to_mask.split(',')]

        masked_df = mask_columns(df, columns_to_mask_list)

        censored_unique_id = str(uuid.uuid4())
        censored_dir = Path("uploaded_files")
        censored_file_path = save_censored_file(masked_df, censored_dir / f"{censored_unique_id}_{censored_filename}")

        censored_file_info = {
            "censored_file_id": censored_unique_id,
            "filename": censored_filename,
            "path": str(censored_file_path),
            "created_at": datetime.utcnow()
        }
        await censored_files_collection.insert_one(censored_file_info)

        return {"censored_file_id": censored_unique_id, "censored_filename": censored_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{censored_file_id}")
async def download_file(censored_file_id: str):
    try:
        file_info = await censored_files_collection.find_one({"censored_file_id": censored_file_id})
        if not file_info:
            raise HTTPException(status_code=400, detail="Censored file ID not found")

        censored_file_path = Path(file_info["path"])
        original_filename = file_info["filename"]
        censored_filename = f"{Path(original_filename).stem}{Path(original_filename).suffix}"

        if not censored_file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(path=censored_file_path, filename=censored_filename,
                            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
