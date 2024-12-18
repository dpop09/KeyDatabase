import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [keyData, setKeyData] = useState(null);
    const [requestFormData, setRequestFormData] = useState(null);
    
    return (
        <AuthContext.Provider value={{ keyData, setKeyData, requestFormData, setRequestFormData }}>
            {children}
        </AuthContext.Provider>
    );
};