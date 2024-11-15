import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CreateKey() {

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/home');
    }

    const handleCreateKey = async () => {
        const tag_number = document.getElementById('KeyInfo-input-tag_number').value;
        const tag_color = document.getElementById('KeyInfo-input-tag_color').value;
        const core_number = document.getElementById('KeyInfo-input-core_number').value;
        const room_number = document.getElementById('KeyInfo-input-room_number').value;
        const room_type = document.getElementById('KeyInfo-input-room_type').value;
        const key_number = document.getElementById('KeyInfo-input-key_number').value;
        const available = document.getElementById('KeyInfo-input-available').value;
        const key_holder_fname = document.getElementById('KeyInfo-input-key_holder_fname').value;
        const key_holder_lname = document.getElementById('KeyInfo-input-key_holder_lname').value;
        const date_assigned = document.getElementById('KeyInfo-input-date_assigned').value;
        const comments = document.getElementById('KeyInfo-textarea-comments').value;
        try {
            const response = await fetch('http://localhost:8081/createKey', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    tag_number: tag_number,
                    tag_color: tag_color,
                    core_number: core_number,
                    room_number: room_number,
                    room_type: room_type,
                    key_number: key_number,
                    available: available,
                    key_holder_fname: key_holder_fname,
                    key_holder_lname: key_holder_lname,
                    date_assigned: date_assigned,
                    comments: comments
                })
            })
            const result = await response.json();
            console.log(result);
        } catch (error) {
            alert("Internal Server Error. Please try again later.");
            console.log(error);
        }
        handleGoBack();
    }

    return (
        <div id="KeyInfo-div-container">
            <h1 id="KeyInfo-h1-title">CREATE KEY</h1>
            <div id="KeyInfo-div-flex-box">
                <form id="KeyInfo-form-container">
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="tag_number" id="KeyInfo-label-row">Tag Number: </label>
                        <input type="text" id="KeyInfo-input-tag_number" />
                    </div>
                    <div id ="KeyInfo-div-row-flex-box">
                        <label for="tag_color" id="KeyInfo-label-row">Tag Color: </label>
                        <input type="text" id="KeyInfo-input-tag_color" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="core_number" id="KeyInfo-label-row">Core Number: </label>
                        <input type="text" id="KeyInfo-input-core_number" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="room_number" id="KeyInfo-label-row">Room Number: </label>
                        <input type="text" id="KeyInfo-input-room_number" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="room_type" id="KeyInfo-label-row">Room Type: </label>
                        <input type="text" id="KeyInfo-input-room_type" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="key_number" id="KeyInfo-label-row">Key Number: </label>
                        <input type="text" id="KeyInfo-input-key_number" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="available" id="KeyInfo-label-row">Available (Yes/No): </label>
                        <input type="text" id="KeyInfo-input-available" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="key_holder_fname" id="KeyInfo-label-row">Key Holder's First Name: </label>
                        <input type="text" id="KeyInfo-input-key_holder_fname" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="key_holder_lname" id="KeyInfo-label-row">Key Holder's Last Name: </label>
                        <input type="text" id="KeyInfo-input-key_holder_lname" />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="date_assigned" id="KeyInfo-label-row">Key Assigned Date (MM/DD/YYYY): </label>
                        <input 
                            type="text" 
                            id="KeyInfo-input-date_assigned" 
                        />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="comments" id="KeyInfo-label-row">Comments</label>
                        <textarea id="KeyInfo-textarea-comments" rows="5" cols="5" />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="key_request_form" id="EditKey-label-row">Key Request Form: </label>
                        <input type="file" id="EditKey-input-key_request_form" accept="application/pdf" />
                    </div>
                </form>
            </div>
            <div id="KeyInfo-div-button-container">
                <button id="KeyInfo-button-back" onClick={handleGoBack}>Cancel</button>
                <button id="KeyInfo-button-edit">Submit</button>
            </div>
        </div>
    )
}

export default CreateKey