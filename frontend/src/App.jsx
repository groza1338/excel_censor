import { useState } from 'react'
import './App.css'
const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>

    </>
  )
}

export default App
