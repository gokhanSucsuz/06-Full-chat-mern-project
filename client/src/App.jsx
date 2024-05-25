import axios from "axios";
import { Routes } from "./Routes";

function App() {
  axios.defaults.baseURL = 'https://zero6-full-chat-mern-project-api.onrender.com';
  axios.defaults.withCredentials = true;
  return (
    <Routes />
  )
}

export default App
