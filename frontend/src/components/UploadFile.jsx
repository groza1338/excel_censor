import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const UploadFile = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [fileList, setFileList] = useState([]);

  const props = {
    name: 'file',
    accept: '.xlsx',
    action: `${URL_API}/uploadfile/`,
    beforeUpload: (file) => {
      const isXLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isXLSX) {
        message.error('You can only upload XLSX file!');
      }
      return isXLSX || Upload.LIST_IGNORE;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        setFileInfo(info.file.response);
        // Очистка списка файлов, оставляем только последний загруженный файл
        setFileList([info.file]);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      } else {
        setFileList(info.fileList);
      }
    },
    onRemove: () => {
      setFileInfo(null);
      setFileList([]);
    },
    fileList,
  };

  return (
    <div>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      {fileInfo && (
        <div>
          <h3>File Uploaded:</h3>
          <p>File ID: {fileInfo.file_id}</p>
          <p>Filename: {fileInfo.filename}</p>
          <p>Columns: {fileInfo.columns.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
