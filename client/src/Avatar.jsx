/* eslint-disable react/prop-types */

export const Avatar = ({ username, userId }) => {
    const colors = ["bg-amber-200", "bg-emerald-200", "bg-blue-200", "bg-cyan-200", "bg-teal-200", "bg-lime-200"]
    const userIdBase10 = parseInt(userId, 16)


    return (
        <div className={`border w-8 h-8 ${colors[userIdBase10 % colors.length]} rounded-full flex items-center justify-center opacity-70`}>
            {username[0].toUpperCase()}
        </div>
    )
}
