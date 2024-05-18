import { useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "./UserContext"
import axios from "axios";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";

export const Chat = () => {
    const [ws, setWs] = useState(null)
    const { token } = useContext(UserContext);
    const [onlineUsers, setOnlineUsers] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const { username, id } = useContext(UserContext)
    const [newMessageText, setNewMessageText] = useState("")
    const [messages, setMessages] = useState([])
    const messageRef = useRef();

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
        } else {
            console.log(messageData.text)
            setMessages(prev => [...prev, { ...messageData }])
        }

    }

    const handleMessageSubmit = (e) => {
        e.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }))
        setNewMessageText("")
        setMessages(prev => [...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
        }])
    }

    useEffect(() => {
        const ref = messageRef.current;
        if (ref) ref.scrollIntoView({ behavior: "smooth", block: "end" })

    }, [messages])

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 pl-4">
                <Logo />

                {Object.keys(onlineUsers).filter(user => (
                    user !== id ? username : ""
                )).map(uId =>

                (<div onClick={() => setSelectedUserId(uId)} key={uId} className={`border-b border-gray-100 flex gap-2 items-center cursor-pointer ${uId === selectedUserId ? "bg-orange-50" : ""}`}>
                    {uId === selectedUserId && <div className="w-1 bg-orange-400 h-12 rounded-r-md"> </div>}
                    <div className="flex gap-2 py-2 pl-4 items-center">
                        <Avatar username={onlineUsers[uId]} userId={uId} />
                        <span>{onlineUsers[uId]}</span>
                    </div>
                </div>)
                )}
            </div>
            <div className="flex flex-col bg-orange-50 w-2/3 p-2">
                <div className="flex-grow">
                    {
                        !selectedUserId && (
                            <div className="flex flex-grow p-2 bg-orange-100 items-center justify-center h-full rounded-sm">
                                <div className="text-gray-300">
                                    &larr; Select a person from the sidebar
                                </div>
                            </div>
                        )
                    }
                    {
                        !!selectedUserId && (
                            <div className="relative h-full">
                                <div className="gap-2 overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                    {
                                        messages?.map((message, index) =>

                                            <div key={index} className={` ${message.sender === id ? "text-right" : ""}`}>
                                                <div className=
                                                    {`inline-block text-left p-2 my-2 rounded-md ${(message.sender === id ? "bg-orange-400 text-white p-4 w-fit" :
                                                        "bg-rose-400 text-white p-4 w-fit")}`}
                                                >
                                                    sender: {message.sender} <br />
                                                    id: {id} <br />
                                                    {message.text}
                                                </div>
                                            </div>

                                        )
                                    }
                                    <div ref={messageRef}></div>

                                </div>

                            </div>
                        )
                    }
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2 py-2" onSubmit={handleMessageSubmit}>
                        <input type="text"
                            className="bg-white flex-grow border rounded-sm p-2" placeholder="Type your message here"
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                        />
                        <button type="submit" className="bg-orange-500 rounded-sm p-2 text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>

                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
