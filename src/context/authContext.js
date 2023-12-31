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
      const response = await fetch("https://fbapi-668309e6ed75.herokuapp.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
        credentials: "include", // This enables sending cookies with the request
      });
  
      // Read the Set-Cookie header from the response
      const accessTokenHeader = response.headers.get("Set-Cookie");
  
      if (accessTokenHeader) {
        // Extract the access_token value from the Set-Cookie header
        const accessToken = accessTokenHeader.split(";")[0].split("=")[1];
  
        // Set the JWT token in localStorage
        localStorage.setItem("access_token", accessToken);
  
        // Set the access token in Axios headers for subsequent requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      }
  
      // Parse the response JSON
      const data = await response.json();
  
      // Update the currentUser state with the rest of the user data
      setCurrentUser(data);
  
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
