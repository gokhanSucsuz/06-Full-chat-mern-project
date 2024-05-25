import axios from "axios";
import { Routes } from "./Routes";

function App() {
  axios.defaults.baseURL = 'https://06-full-chat-mern-project-wtln.vercel.app/';
  axios.defaults.withCredentials = true;
  return (
    <Routes />
  )
}

export default App
