import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Signin() {

    const navigate = useNavigate();

    const handleSignin = () => {
        navigate('/keys')
    }

    return (
        <>
            <h1 id="Signin-h1-page-title">ENGINEERING BUILDING KEY DATABASE</h1>
            <div id="Signin-div-container">
            <h1 id="Signin-h1-title">SIGNIN</h1>
            <form>
                <div id="Signin-div-row-flex-box">
                    <label for="username">USERNAME: </label>
                    <input dtype="text" id="Signin-input-username" name="username" />
                </div>
                <br></br>
                <div id="Signin-div-row-flex-box">
                    <label for="password">PASSWORD: </label>
                    <input type="password" id="Signin-input-password" name="password" />
                </div>
                <br></br>
                <button onClick={handleSignin} id="Signin-button-signin">Signin</button>
            </form>
        </div>
        </>
    )
}

export default Signin