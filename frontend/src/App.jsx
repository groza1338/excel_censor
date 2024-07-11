import { useState } from 'react';
import './App.css';
import UploadFile from "./components/UploadFile.jsx";
import ColumnSelector from "./components/ColumnSelector.jsx";
import CensorButton from "./components/CensorButton.jsx";
import DownloadFileButton from "./components/DownloadFileButton.jsx";

const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

function App() {
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [censoredFileId, setCensoredFileId] = useState(null);
  const [censoredFilename, setCensoredFilename] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleCensorSuccess = (data) => {
    setCensoredFileId(data.censored_file_id);
    setCensoredFilename(data.censored_filename);
    setHasError(false);
  };

  const handleFileUpload = () => {
    setSelectedColumns([]);
    setCensoredFileId(null);
    setCensoredFilename('');
    setHasError(false);
  };

  return (
    <div className="app-container">
      <h1>Цензор Excel-таблиц!</h1>
      <UploadFile setColumns={setColumns} setFileId={setFileId} onFileUpload={handleFileUpload} />
      {columns.length > 0 && (
        <>
          <ColumnSelector
            columns={columns}
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
          />
          <div className="button-container">
            <CensorButton
              fileId={fileId}
              selectedColumns={selectedColumns}
              onSuccess={handleCensorSuccess}
              setHasError={setHasError}
            />
          </div>
        </>
      )}
      {columns.length === 0 && fileId && (
        <h2>Файл пустой или содержит в себе несколько листов!</h2>
      )}
      {censoredFileId && !hasError && (
        <div className="button-container">
          <DownloadFileButton
            censoredFileId={censoredFileId}
            censoredFilename={censoredFilename}
          />
        </div>
      )}
    </div>
  );
}

export default App;
