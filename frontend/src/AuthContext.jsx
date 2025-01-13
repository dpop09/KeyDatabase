import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    // global state variables to hold key and request form data across components
    const [keyData, setKeyData] = useState(null);
    const [requestFormData, setRequestFormData] = useState(null);
    const [accessId, setAccessId] = useState(null);
    
    return (
        <AuthContext.Provider value={{ keyData, setKeyData, requestFormData, setRequestFormData, accessId, setAccessId }}>
            {children}
        </AuthContext.Provider>
    );
};