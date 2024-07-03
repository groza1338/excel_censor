from pathlib import Path
from typing import Optional, List
import pandas as pd


def read_excel_values(file_path: Path) -> pd.DataFrame:
    """
    Функция для считывания всех значений из Excel файла.

    Args:
        file_path (Path): Путь к Excel файлу.

    Returns:
        pd.DataFrame: DataFrame со всеми значениями из Excel файла.
    """
    df = pd.read_excel(file_path)
    return df


def mask_columns(df: pd.DataFrame, columns_to_mask: List[int]) -> pd.DataFrame:
    """
    Функция для замены данных в указанных столбцах на маскированные значения.

    Args:
        df (pd.DataFrame): DataFrame с данными.
        columns_to_mask (List[int]): Список индексов столбцов, данные в которых нужно заменить.

    Returns:
        pd.DataFrame: DataFrame с замаскированными данными.
    """
    for column_idx in columns_to_mask:
        if column_idx < len(df.columns):
            column = df.columns[column_idx]
            df[column] = df[column].apply(lambda x: '*' * len(str(x)) if pd.notnull(x) else x)
    return df


def save_censored_file(df: pd.DataFrame, original_file_path: Path) -> Path:
    """
    Функция для сохранения замаскированных данных в новый файл с постфиксом _censored.

    Args:
        df (pd.DataFrame): DataFrame с замаскированными данными.
        original_file_path (Path): Путь к оригинальному файлу Excel.

    Returns:
        Path: Путь к новому файлу с замаскированными данными.
    """
    censored_file_path = original_file_path.with_name(f"{original_file_path.stem}_censored{original_file_path.suffix}")
    df.to_excel(censored_file_path, index=False)
    return censored_file_path
