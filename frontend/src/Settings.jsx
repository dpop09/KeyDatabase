import React, { useContext } from "react";
import { AuthContext } from './AuthContext'
import NavBar from "./NavBar";

function Settings() {

    // global state variables
    const { accessId } = useContext(AuthContext)

    // display an unauthorized page if the accessID is not found in the database
    if (accessId === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    return (
        <div>
            <NavBar />
            <h1>Settings</h1>
        </div>
    )
}

export default Settings