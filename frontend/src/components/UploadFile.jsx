import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const UploadFile = ({ setColumns, setFileId, onFileUpload }) => {
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
        setFileList([info.file]);
        setColumns(info.file.response.columns);
        setFileId(info.file.response.file_id);
        onFileUpload(); // сброс состояния
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      } else {
        setFileList(info.fileList);
      }
    },
    onRemove: () => {
      setFileList([]);
      setColumns([]);
      setFileId(null);
      onFileUpload(); // сброс состояния
    },
    fileList,
  };

  return (
    <div>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
    </div>
  );
};

export default UploadFile;
