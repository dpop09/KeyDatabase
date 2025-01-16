import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";

function NavBar() {
    
    const { accessId } = useContext(AuthContext);

    const navigate = useNavigate();
    const gotoKeys = () => {
        navigate('/');
    }
    const gotoRequestForms = () => {
        navigate('/requestforms');
    }
    const gotoHistoryLog = () => {
        navigate('/historylog');
    }
    const gotoSettings = () => {
        navigate('/settings');
    }

    return (
        <div id="NavBar-div-container">
            <h1 id="NavBar-h1-title">ENGINEERING BUILDING KEY DATABASE {accessId}</h1>
            <div id="NavBar-div-links">
                <button id="NavBar-button-link" onClick={gotoKeys}>KEYS</button>
                <button id="NavBar-button-link" onClick={gotoRequestForms}>REQUEST FORMS</button>
                <button id="NavBar-button-link" onClick={gotoHistoryLog}>HISTORY LOG</button>
                <button id="NavBar-button-link" onClick={gotoSettings}>SETTINGS</button>
            </div>
        </div>
    )
}

export default NavBar;