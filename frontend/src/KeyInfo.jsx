import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";

function KeyInfo() {

    const [keyRequestForm, setKeyRequestForm] = useState(null);

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/home');
    }
    const handleEdit = () => {
        navigate('/editkey');
    }

    const { keyData } = useContext(AuthContext);

    const getKeyRequestForm = async () => {
        try {
            const response = await fetch('http://localhost:8081/getKeyRequestForm', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ key_number: keyData.key_number })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setKeyRequestForm(`data:image/jpeg;base64,${data.image_data}`);
            } else if (response.status === 404) { // if the response is unsuccessful
                console.log("Error 404: The corresponding key request form pdf file was not found.");
            } else {
                console.log("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const fetchKeyRequestForm = async () => {
            await getKeyRequestForm();
        };
        fetchKeyRequestForm();
    }, []);

    const displayDateAssigned = keyData.date_assigned 
        ? new Date(keyData.date_assigned).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }) 
        : "";
    
    const displayDateLastEdited = keyData.date_last_edited 
    ? new Date(keyData.date_last_edited).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
    }) 
    : "";

    return (
        <div id="KeyInfo-div-container">
            <h1 id="KeyInfo-h1-title">KEY {keyData.key_number} INFORMATION</h1>
            <div id="KeyInfo-div-flex-box">
                <form id="KeyInfo-form-container">
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="tag_number" id="KeyInfo-label-row">Tag Number: </label>
                        <input type="text" id="KeyInfo-input-tag_number" value={keyData.tag_number} disabled />
                    </div>
                    <div id ="KeyInfo-div-row-flex-box">
                        <label for="tag_color" id="KeyInfo-label-row">Tag Color: </label>
                        <input type="text" id="KeyInfo-input-tag_color" value={keyData.tag_color} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="core_number" id="KeyInfo-label-row">Core Number: </label>
                        <input type="text" id="KeyInfo-input-core_number" value={keyData.core_number} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="room_number" id="KeyInfo-label-row">Room Number: </label>
                        <input type="text" id="KeyInfo-input-room_number" value={keyData.room_number} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="room_type" id="KeyInfo-label-row">Room Type: </label>
                        <input type="text" id="KeyInfo-input-room_type" value={keyData.room_type} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="key_number" id="KeyInfo-label-row">Key Number: </label>
                        <input type="text" id="KeyInfo-input-key_number" value={keyData.key_number} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="available" id="KeyInfo-label-row">Available (Yes/No): </label>
                        <input type="text" id="KeyInfo-input-available" value={keyData.available ? 'Yes' : 'No'} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="key_holder_fname" id="KeyInfo-label-row">Key Holder's First Name: </label>
                        <input type="text" id="KeyInfo-input-key_holder_fname" value={keyData.key_holder_fname} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="key_holder_lname" id="KeyInfo-label-row">Key Holder's Last Name: </label>
                        <input type="text" id="KeyInfo-input-key_holder_lname" value={keyData.key_holder_lname} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="date_assigned" id="KeyInfo-label-row">Key Assigned Date (MM/DD/YYYY): </label>
                        <input 
                            type="text" 
                            id="KeyInfo-input-date_assigned" 
                            value={displayDateAssigned}
                            disabled 
                        />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="comments" id="KeyInfo-label-row">Comments</label>
                        <textarea id="KeyInfo-textarea-comments" rows="5" cols="5" value={keyData.comments} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="last_edited_by" id="KeyInfo-label-row">Key Last Edited By: </label>
                        <input type="text" id="KeyInfo-input-last_edited_by" value={keyData.last_edited_by} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="date_last_edited" id="KeyInfo-label-row">Date Last Edited (MM/DD/YYYY): </label>
                        <input type="text" id="KeyInfo-input-date_last_edited" value={displayDateLastEdited} disabled />
                    </div>
                    <div id="KeyInfo-div-row-flex-box">
                        <label for="key_request_form" id="KeyInfo-label-row">Key Request Form: </label>
                        <input type="text" id="KeyInfo-input-key_request_form" value={`${keyData.key_number}.pdf`} disabled />
                    </div>
                </form>
                <div id="KeyInfo-div-image-container">
                    {keyRequestForm ? (
                        <img
                            src={keyRequestForm}
                            alt="Key Request Form"
                            style={{ width: '600px', height: 'auto' }}
                        />
                    ) : (
                        <p>The image was not found</p>
                    )}
                </div>
            </div>
            <div id="KeyInfo-div-button-container">
                <button id="KeyInfo-button-back" onClick={handleGoBack}>Go Back</button>
                <button id="KeyInfo-button-edit" onClick={handleEdit} >Edit</button>
            </div>
        </div>
    )
}

export default KeyInfo