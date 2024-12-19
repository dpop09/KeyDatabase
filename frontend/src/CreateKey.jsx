import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function CreateKey() {

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/');
    }

    const handleCreateKey = (event) => {
        event.preventDefault();
        const tag_number = document.getElementById('CreateKey-input-tag-number').value;
        const tag_color = document.getElementById('CreateKey-input-tag-color').value;
        const core_number = document.getElementById('CreateKey-input-core-number').value;
        const room_number = document.getElementById('CreateKey-input-room-number').value;
        const room_type = document.getElementById('CreateKey-input-room-type').value;
        const key_number = document.getElementById('CreateKey-input-key-number').value;
        if (!tag_number || !tag_color || !core_number || !room_number || !room_type || !key_number) { // check if any of the key fields are empty
            alert("Please fill out all required fields.");
            return
        }
        try {
            const response = fetch('http://localhost:8081/create-key', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tag_number, tag_color, core_number, room_number, room_type, key_number })
            });
            if (response.ok) { // if the response is successful
                navigate('/keys');
            } else { // if the response is unsuccessful
                console.log("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <NavBar />
            <div id="CreateKey-div-container">
                <div id="CreateKey-div-input-container">
                    <div id="CreateKey-div-row-flex-box-title">
                        <h2>CREATE KEY</h2>
                    </div>
                    <div id="CreateKey-div-row-flex-box">
                        <h3>Tag Number:</h3>
                        <input type="text" id="CreateKey-input-tag-number" />
                    </div>
                    <div id="CreateKey-div-row-flex-box-even">
                        <h3>Tag Color:</h3>
                        <input type="text" id="CreateKey-input-tag-color" />
                    </div>
                    <div id="CreateKey-div-row-flex-box">
                        <h3>Core Number:</h3>
                        <input type="text" id="CreateKey-input-core-number" />
                    </div>
                    <div id="CreateKey-div-row-flex-box-even">
                        <h3>Room Number:</h3>
                        <input type="text" id="CreateKey-input-room-number" />
                    </div>
                    <div id="CreateKey-div-row-flex-box">
                        <h3>Room Type:</h3>
                        <input type="text" id="CreateKey-input-room-type" />
                    </div>
                    <div id="CreateKey-div-row-flex-box-even">
                        <h3>Key Number:</h3>
                        <input type="text" id="CreateKey-input-key-number" />
                    </div>
                </div>
                <div id="CreateKey-div-button-container">
                    <button id="CreateKey-button-go-back" onClick={handleGoBack}>Go Back</button>
                    <button id="CreateKey-button-create-key" onClick={handleCreateKey}>Create Key</button>
                </div>
            </div>
        </>
    )
}

export default CreateKey