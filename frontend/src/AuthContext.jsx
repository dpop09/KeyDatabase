import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    // global state variables to hold key and request form data across components
    const [keyData, setKeyData] = useState(null);
    const [requestFormData, setRequestFormData] = useState(null);
    const [accessId, setAccessId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // fetch the accessid currently logged in the windows operating system
    const getAccessIdFromOS = async () => {
        if (accessId != null) { // do nothing if the accessid is already set
            return
        }
        try {
            const response = await fetch('http://localhost:8081/get-access-id');
            const data = await response.json();
            setAccessId(data.access_id);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAccessIdFromOS();
    }, []);

    return (
        <AuthContext.Provider value={{ keyData, setKeyData, requestFormData, setRequestFormData, accessId, setAccessId, selectedUser, setSelectedUser }}>
            {children}
        </AuthContext.Provider>
    );
};