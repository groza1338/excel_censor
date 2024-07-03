import {useEffect, useState} from 'react'
import './App.css'
const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';


function App() {

  return (
    <h1>
      Hello, world!
    </h1>
  )
}

export default App
