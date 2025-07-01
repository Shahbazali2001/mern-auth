import { useState } from "react";
import { AppContext } from "./AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState("");

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-user-data`);

      if (data?.success) {
        setUserData(data.userData);
      } else {
        toast.error(data?.message || "Failed to fetch user data");
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        "Server error while fetching user data";
      toast.error(errMsg);
    }
  };

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
