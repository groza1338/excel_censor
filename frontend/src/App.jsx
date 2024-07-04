import {useEffect, useState} from 'react'
import './App.css'
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

  const handleCensorSuccess = (data) => {
    setCensoredFileId(data.censored_file_id);
    setCensoredFilename(data.censored_filename);
  };

  const handleFileUpload = () => {
    setSelectedColumns([]);
    setCensoredFileId(null);
    setCensoredFilename('');
  };

  return (
      <div style={{padding: 24}}>
          <h1>Upload and Censor Excel File</h1>
          <UploadFile setColumns={setColumns} setFileId={setFileId} onFileUpload={handleFileUpload}/>
          {columns.length > 0 && (
              <>
                  <ColumnSelector
                      columns={columns}
                      selectedColumns={selectedColumns}
                      setSelectedColumns={setSelectedColumns}
                  />
                  <CensorButton
                      fileId={fileId}
                      selectedColumns={selectedColumns}
                      onSuccess={handleCensorSuccess}
                  />
              </>
          )}
          {censoredFileId && (
              <DownloadFileButton
                  censoredFileId={censoredFileId}
                  censoredFilename={censoredFilename}
              />
          )}
      </div>
  )
}

export default App
