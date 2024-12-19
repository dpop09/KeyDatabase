import React from "react";
import { useNavigate } from "react-router-dom";

function NavBar() {

    const navigate = useNavigate();
    const gotoKeys = () => {
        navigate('/');
    }
    const gotoRequestForms = () => {
        navigate('/requestforms');
    }

    return (
        <div id="NavBar-div-container">
            <h1 id="NavBar-h1-title">ENGINEERING BUILDING KEY DATABASE</h1>
            <div id="NavBar-div-links">
                <button id="NavBar-button-link" onClick={gotoKeys}>KEYS</button>
                <button id="NavBar-button-link" onClick={gotoRequestForms}>REQUEST FORMS</button>
            </div>
        </div>
    )
}

export default NavBar;