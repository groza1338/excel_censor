import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';

const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const DownloadFileButton = ({ censoredFileId, censoredFilename }) => {
  const handleDownload = async () => {
    if (!censoredFileId) {
      message.error('Нет файлов, для цензурирования');
      return;
    }

    try {
      const response = await axios({
        url: `${URL_API}/download/${censoredFileId}`,
        method: 'GET',
        responseType: 'blob', // Important
      });

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', censoredFilename); // Use the filename from the API
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('Файл успешно скачан!');
    } catch (error) {
      message.error('Ошибка при скачивании файла');
    }
  };

  return (
    <Button type="primary" onClick={handleDownload}>
      Скачать зацензуренный файл
    </Button>
  );
};

export default DownloadFileButton;
