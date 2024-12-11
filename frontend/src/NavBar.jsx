import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";

function NavBar() {

    const navigate = useNavigate();
    const gotoKeys = () => {
        navigate('/keys');
    }
    const gotoRequestForms = () => {
        navigate('/requestforms');
    }
    const handleLogout = () => {
        navigate('/');
    }

    return (
        <div id="NavBar-div-container">
            <h1 id="NavBar-h1-title">ENGINEERING BUILDING KEY DATABASE</h1>
            <div id="NavBar-div-links">
                <button id="NavBar-button-link" onClick={gotoKeys}>KEYS</button>
                <button id="NavBar-button-link" onClick={gotoRequestForms}>REQUEST FORMS</button>
                <button id="NavBar-button-link" onClick={handleLogout}>LOGOUT</button>
            </div>
        </div>
    )
}

export default NavBar;