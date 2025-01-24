import React, { useContext } from "react";
import { AuthContext } from './AuthContext'
import NavBar from "./NavBar";

function HistoryLog() {

    // global state variables
    const { permissions } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
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
            <h1>History Log</h1>
        </div>
    )
}

export default HistoryLog