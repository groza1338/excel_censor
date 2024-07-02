import {useEffect, useState} from 'react'
import './App.css'
const URL_API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';


function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {

    // Функция для получения данных с бэкенда
    const fetchMessage = async () => {
      try {
        const response = await fetch(`${URL_API}/hello/Sergey`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchMessage();
  }, []);
  return (
    <h1>
      {message}
    </h1>
  )
}

export default App
