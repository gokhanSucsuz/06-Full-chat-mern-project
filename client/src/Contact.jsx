import { Avatar } from "./Avatar"

export const Contact = ({ id, username, onClick, selected, online }) => {
    return (
        <div onClick={() => onClick(id)} key={id} className={`border-b border-gray-100 flex gap-2 items-center cursor-pointer ${selected ? "bg-orange-50" : ""}`}>
            {selected && <div className="w-1 bg-orange-400 h-12 rounded-r-md"> </div>}
            <div className="flex gap-2 py-2 pl-4 items-center">
                <Avatar online={online} username={username} userId={id} />
                <span className="text-lg font-semibold font">{username.toString().toUpperCase()}</span>
            </div>
        </div>
    )
}
