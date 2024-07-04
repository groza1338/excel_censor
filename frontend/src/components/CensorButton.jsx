import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';

const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const CensorButton = ({ fileId, selectedColumns, onSuccess }) => {
  const handleCensor = async () => {
    if (!fileId) {
      message.error('No file uploaded');
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
      message.success('File censored successfully');
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      message.error('Censoring failed');
    }
  };

  return (
    <Button type="primary" onClick={handleCensor}>
      Censor Selected Columns
    </Button>
  );
};

export default CensorButton;
