import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home, Login, EmailVerify, ResetPassword } from './pages'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />  
      </Routes>
    </div>
  )
}

export default App
