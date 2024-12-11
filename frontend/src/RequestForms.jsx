import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function RequestForms() {
    return (
        <>
            <NavBar />
            <div id="RequestForms-div-container">
                <h1>REQUEST FORMS</h1>
            </div>
        </>
    )
}

export default RequestForms;