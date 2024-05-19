/* eslint-disable react/prop-types */

export const Avatar = ({ online, username, userId }) => {
    const colors = ["bg-amber-200", "bg-emerald-200", "bg-blue-200", "bg-cyan-200", "bg-teal-200", "bg-lime-200"]
    const userIdBase10 = parseInt(userId, 16)


    return (
        <div className={`relative border w-8 h-8 ${colors[userIdBase10 % colors.length]} rounded-full flex items-center justify-center `}>
            <div className="text-center w-full opacity-70">
                {username && username[0]?.toUpperCase()}
            </div>
            {
                online ? (<div className="absolute w-3 h-3 rounded-full bg-green-400 bottom-0 right-0"></div>) :
                    (<div className="absolute w-3 h-3 rounded-full bg-gray-400 bottom-0 right-0"></div>)
            }

        </div>
    )
}
