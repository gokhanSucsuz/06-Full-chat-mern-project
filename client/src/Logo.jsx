import React from 'react'
import logo from "../public/2806190.jpg"

export const Logo = () => {
    return (
        <div className="flex border mr-4 rounded-md items-center gap-2 text-orange-700 font-bold my-4">
            <img className='rounded-50 w-20' src={logo} alt="logo" />
            <span className='text-xl font-bold overflow-hidden'>Simple Chat App</span>
        </div>
    )
}
