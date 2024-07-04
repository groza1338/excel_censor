import {useEffect, useState} from 'react'
import './App.css'
import UploadFile from "./components/UploadFile.jsx";
const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';


function App() {

  return (
    <UploadFile/>
  )
}

export default App
