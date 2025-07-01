import { useState } from "react";
import { AppContext } from "./AppContext"

export const AppContextProvider = (props)=>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(false);
    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn, 
        user, setUser
    }


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
    
}