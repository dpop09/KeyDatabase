import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";

function KeyInfo() {

    const navigate = useNavigate();
    const handleCancel = () => {
        navigate('/keyinfo');
    }

    const { keyData } = useContext(AuthContext);

    return (
        <div id="EditKey-div-container">
            <h1>Edit Key {keyData.key_number}</h1>
            <div id="EditKey-div-button-container">
                <button id="EditKey-button-cancel" onClick={handleCancel}>Cancel</button>
                <button id="EditKey-button-submit">Submit</button>
            </div>
        </div>
        
    )  
}

export default KeyInfo