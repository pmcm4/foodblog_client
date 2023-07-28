import axios from "axios";
import { useState, useEffect } from 'react';
import { createContext } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")) || null); // Get the user data from localStorage

  const login = async (inputs) => {
    try {
      const res = await axios.post("https://fbapi-668309e6ed75.herokuapp.com/api/auth/login", inputs);
      setCurrentUser(res.data);
  
      // Set the JWT token in localStorage upon successful login
      localStorage.setItem("access_token", res.data.access_token);
  
      // Set the JWT token in Axios headers for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
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
