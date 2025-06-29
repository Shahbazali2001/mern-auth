import React, { useState } from 'react'
import { assets } from '../assets/assets'


const Login = () => {

  const [state, setState] = useState("Sign Up")

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
        <img src={assets.logo} className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

        <div className='w-full max-w-md bg-slate-900 p-10 sm:p-10 rounded-lg shadow-lg sm:w-96 text-indigo-300 text-sm'>
          <h2 className='text-3xl font-bold mb-4 text-center'>{state === "Sign Up" ? "Create Account" : "Log In"}</h2>
          <p className='text-center mb-4'>{state === "Sign Up" ? "Create Your Account" : "Login To Your Account"}</p>

          <form>
              <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                  <img src={assets.person_icon} alt="" />
                  <input type="text" placeholder='Full Name' required className='text-white bg-transparent border-none outline-none flex-1' />
              </div>
          </form>

        </div>
    </div>
  )
}

export default Login