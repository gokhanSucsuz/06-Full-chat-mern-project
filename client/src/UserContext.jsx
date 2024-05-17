import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({})

export const UserContextProvider = ({ children }) => {
    const [username, setUsername] = useState("");
    const [id, setId] = useState(null)

    useEffect(() => {
        axios.get("/profile").then(res => {
            setId(res.data.userId)
            setUsername(res.data.username)
        }, [])
    })

    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>{children}</UserContext.Provider>
    )
}