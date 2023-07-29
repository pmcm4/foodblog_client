import axios from "axios";
import { useState, useEffect } from 'react';
import { createContext } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  // Set withCredentials to true for Axios
  axios.defaults.withCredentials = true;

  const login = async (inputs) => {
    try {
      const res = await axios.post("https://fbapi-668309e6ed75.herokuapp.com/api/auth/login", inputs);
  
      // Get the access_token from the response cookies
      const cookies = res.headers['set-cookie'];
      const accessTokenCookie = cookies.find((cookie) => cookie.startsWith('access_token='));
      if (accessTokenCookie) {
        const accessToken = accessTokenCookie.split(';')[0].split('=')[1];
  
        // Set the JWT token in localStorage
        localStorage.setItem("access_token", accessToken);
  
        // You can also set the access token in Axios headers if needed for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }
  
      // Update the currentUser state with the rest of the user data
      const { password, ...userData } = res.data;
      setCurrentUser(userData);
  
    } catch (error) {
      console.log(error);
    }
  };
  

  const logout = async () => {
    await axios.post("https://fbapi-668309e6ed75.herokuapp.com/api/auth/logout");
    setCurrentUser(null);

    // Remove the JWT token from localStorage upon logout
    localStorage.removeItem("access_token");
  };

  useEffect(() => {
    // Store the user data in localStorage whenever it changes
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>
  );
};
