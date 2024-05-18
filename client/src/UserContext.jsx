import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({})

export const UserContextProvider = ({ children }) => {
    const [username, setUsername] = useState("");
    const [id, setId] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("/profile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Token'ı buraya ekleyin
                    },
                });

                if (res.data && res.data.userId && res.data.username) {
                    setId(res.data.userId);
                    setUsername(res.data.username);
                } else {
                    console.warn("Received empty or invalid profile data");
                }
            } catch (error) {
                console.error("Error fetching profile:", error.response ? error.response.data : error.message);
            }
        };

        fetchProfile();
    }, []); // Bağımlılık dizisini ekleyin

    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    );
};
