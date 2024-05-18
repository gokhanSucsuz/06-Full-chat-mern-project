import { useContext, useEffect, useState } from "react"
import { UserContext } from "./UserContext"
import axios from "axios";
import { Avatar } from "./Avatar";

export const Chat = () => {
    const [ws, setWs] = useState(null)
    const { token } = useContext(UserContext);
    const [onlineUsers, setOnlineUsers] = useState({})

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:4040");
        setWs(ws);
        ws.addEventListener("message", handleMessage);

        // Profil bilgilerini çekme
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Token'ı header'a ekleyin
                    }
                });
                console.log('Profile data:', response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();

        return () => {
            ws.removeEventListener("message", handleMessage);
            ws.close();
        };
    }, [token]);

    const showOnlinePeople = (peopleArray) => {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        })
        setOnlineUsers(people)
    }

    const handleMessage = (e) => {

        const messageData = JSON.parse(e.data)
        if ("online" in messageData) {
            showOnlinePeople(messageData.online)
        }
    }

    const selectContact = (userId) => {
        console.log(userId)
    }

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 pl-4 pt-4">
                <div className="flex gap-2 text-orange-700 font-bold mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                    Mern Chat App</div>
                {Object.keys(onlineUsers).map(userId =>
                (<div onClick={() => selectContact(userId)} key={userId} className="border-b border-gray-100 py-2 flex gap-2 items-center cursor-pointer ">
                    <Avatar username={onlineUsers[userId]} userId={userId} />
                    <span>{onlineUsers[userId]}</span>
                </div>)
                )}
            </div>
            <div className="flex flex-col bg-orange-50 w-2/3 p-2">
                <div className="flex-grow">Messages with selected person</div>
                <div className="flex gap-2">
                    <input type="text" className="bg-white flex-grow border rounded-sm p-2" placeholder="Type your message here" />
                    <button className="bg-orange-500 rounded-sm p-2 text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>

                    </button>
                </div>
            </div>
        </div>
    )
}
