import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [keyData, setKeyData] = useState(null);
    
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, keyData, setKeyData }}>
            {children}
        </AuthContext.Provider>
    );
};