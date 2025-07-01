import React from 'react'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

function Header() {

  const {userData} = useContext(AppContext);

  return (
    <div className='flex flex-col items-center justify-center h-screen text-gray-800'>
        <img src={assets.header_img} className='w-36 h-36 rounded-full mb-6' />

        <h1 className='text-4xl inline-flex gap-2 mb-2 sm:text-3xl font-medium'>
            Hi<span className='font-bold text-blue-600'>{userData ? userData.name : "Developer"}!</span> <img src={assets.hand_wave} className='w-8 aspect-square' /> 
        </h1>

        <h2 className='text-3xl font-semibold mb-4 sm:text-5xl'>Welcome to my app</h2>
        <p className='max-w-md mb-3'>Lets build something together, that will change the world</p>
        {/* <button className='bg-[#4C83EE] text-white py-2 px-4 rounded'>Get Started</button> */}
        <button className='border border-gray-500 rounded-full px-8 py-2 hover:bg-gray-100 transition-all'>Get Started</button>
    </div>
  )
}

export default Header