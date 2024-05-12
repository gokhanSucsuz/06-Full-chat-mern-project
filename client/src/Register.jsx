import { useState } from "react"
import axios from "axios"

export default function Register() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("") // Durum ekle

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // Sunucuya POST isteği gönder
            await axios.post("/register", { username, password })
            setMessage("Registration successful") // Başarı mesajı
        } catch (error) {
            setMessage("Registration failed. Please try again") // Hata mesajı
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input type="text" placeholder="username" className="block rounded-sm p-2 mb-2 border w-full" onChange={e => setUsername(e.target.value)} value={username} />
                <input type="password" placeholder="password" className="block rounded-sm p-2 mb-2 border w-full" onChange={e => setPassword(e.target.value)} value={password} />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2" type="submit" >Register</button>
            </form>
            {/* Durum mesajını göster */}
            {message && <div>{message}</div>}
        </div>
    )
}
