import { useContext, useState } from "react"
import axios from "axios"
import { UserContext } from "./UserContext"

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("") // Durum ekle

    const [isLoginOrRegister, setIsLoginOrRegister] = useState("register")

    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = isLoginOrRegister === "login" ? "/login" : "/register"
        try {
            // Sunucuya POST isteği gönder
            const { data } = await axios.post(url, { username, password })

            setLoggedInUsername(username)
            setId(data.id)
            setMessage("Registration successful") // Başarı mesajı
        } catch (error) {
            setMessage("Registration failed. Please try again" + error) // Hata mesajı
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input type="text" placeholder="username" className="block rounded-sm p-2 mb-2 border w-full" onChange={e => setUsername(e.target.value)} value={username} />
                <input type="password" placeholder="password" className="block rounded-sm p-2 mb-2 border w-full" onChange={e => setPassword(e.target.value)} value={password} />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2" type="submit" >
                    {isLoginOrRegister === "register" ? "Register" : "Login"}
                </button>
                <div className="text-center mt-2">
                    {isLoginOrRegister === "register" && (
                        <div>
                            Already a member?
                            <button onClick={() => setIsLoginOrRegister("login")}>Login here</button>
                        </div>
                    )}
                    {isLoginOrRegister === "login" && (
                        <div>
                            Do not have an account?
                            <button onClick={() => setIsLoginOrRegister("register")}>Register here</button>
                        </div>
                    )}
                </div>
            </form>
            {/* Durum mesajını göster */}
            {message && <div>{message}</div>}
        </div>
    )
}
