import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';

const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const CensorButton = ({ fileId, selectedColumns, onSuccess, setHasError }) => {
  const handleCensor = async () => {
    if (!fileId) {
      message.error('Вы не загрузили файл!');
      setHasError(true);
      return;
    }

    if (selectedColumns.length === 0) {
      message.error('Вы не выбрали колонки для цензуры!');
      setHasError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('columns_to_mask', selectedColumns.join(','));

    try {
      const response = await axios.post(`${URL_API}/maskcolumns/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Данные спрятаны');
      setHasError(false);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      message.error('Ошибка при цензурировании');
      setHasError(true);
    }
  };

  return (
    <Button type="primary" onClick={handleCensor}>
      Спрятать выбранные колонки
    </Button>
  );
};

export default CensorButton;
