import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";

function EditKey() {

    const [keyRequestForm, setKeyRequestForm] = useState(null);
    
    const { keyData } = useContext(AuthContext);

    const navigate = useNavigate();
    const handleCancel = () => {
        navigate('/keyinfo');
    }

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const tag_number = document.getElementById('EditKey-input-tag_number').value || document.getElementById('EditKey-input-tag_number').placeholder;
        const tag_color = document.getElementById('EditKey-input-tag_color').value || document.getElementById('EditKey-input-tag_color').placeholder;
        const key_number = document.getElementById('EditKey-input-key_number').value || document.getElementById('EditKey-input-key_number').placeholder;
        const available = document.getElementById('EditKey-input-available').value || document.getElementById('EditKey-input-available').placeholder;
        const key_holder_fname = document.getElementById('EditKey-input-key_holder_fname').value || document.getElementById('EditKey-input-key_holder_fname').placeholder;
        const key_holder_lname = document.getElementById('EditKey-input-key_holder_lname').value || document.getElementById('EditKey-input-key_holder_lname').placeholder;
        let date_assigned = document.getElementById('EditKey-input-date_assigned').value || document.getElementById('EditKey-input-date_assigned').placeholder;
        const comments = document.getElementById('EditKey-textarea-comments').value || document.getElementById('EditKey-textarea-comments').placeholder;
        const dateParts = date_assigned.split('/'); // Split by '/'
        date_assigned = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; // Rebuild date
        try {
            const response = await fetch('http://localhost:8081/editKey', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    key_number: key_number,
                    tag_number: tag_number,
                    tag_color: tag_color,
                    available: available,
                    key_holder_fname: key_holder_fname,
                    key_holder_lname: key_holder_lname,
                    date_assigned: date_assigned,
                    comments: comments
                })
            })
            const result = await response.json();
            if (result) { // if the response is successful
                alert("Successfully updated key.");
            } else { // if the response is unsuccessful
                alert("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
        //navigate('/keyinfo');
    }

    return (
        <div id="EditKey-div-container">
            <h1>EDIT KEY {keyData.key_number}</h1>
            <div id="EditKey-div-flex-box">
                <form id="EditKey-form-container">
                    <div id="EditKey-div-row-flex-box">
                        <label for="tag_number" id="EditKey-label-row">Tag Number: </label>
                        <input type="text" id="EditKey-input-tag_number" placeholder={keyData.tag_number} />
                    </div>
                    <div id ="EditKey-div-row-flex-box">
                        <label for="tag_color" id="EditKey-label-row">Tag Color: </label>
                        <input type="text" id="EditKey-input-tag_color" placeholder={keyData.tag_color} />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="core_number" id="EditKey-label-row">Core Number: </label>
                        <input type="text" id="EditKey-input-core_number" placeholder={keyData.core_number} disabled />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="room_number" id="EditKey-label-row">Room Number: </label>
                        <input type="text" id="EditKey-input-room_number" placeholder={keyData.room_number} disabled />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="room_type" id="EditKey-label-row">Room Type: </label>
                        <input type="text" id="EditKey-input-room_type" placeholder={keyData.room_type} disabled />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="key_number" id="EditKey-label-row">Key Number: </label>
                        <input type="text" id="EditKey-input-key_number" placeholder={keyData.key_number} disabled />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="available" id="EditKey-label-row">Available (Yes/No): </label>
                        <input type="text" id="EditKey-input-available" placeholder={keyData.available ? 'Yes' : 'No'} />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="key_holder_fname" id="EditKey-label-row">Key Holder's First Name: </label>
                        <input type="text" id="EditKey-input-key_holder_fname" placeholder={keyData.key_holder_fname} />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="key_holder_lname" id="EditKey-label-row">Key Holder's Last Name: </label>
                        <input type="text" id="EditKey-input-key_holder_lname" placeholder={keyData.key_holder_lname} />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="date_assigned" id="EditKey-label-row">Key Assigned Date (MM/DD/YYYY): </label>
                        <input 
                            type="text" 
                            id="EditKey-input-date_assigned" 
                            placeholder={displayDateAssigned} 
                        />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="comments" id="EditKey-label-row">Comments </label>
                        <textarea id="EditKey-textarea-comments" rows="5" cols="5" placeholder={keyData.comments} />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="last_edited_by" id="EditKey-label-row">Key Last Edited By: </label>
                        <input type="text" id="EditKey-input-last_edited_by" placeholder={keyData.last_edited_by} disabled />
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <label for="date_last_edited" id="EditKey-label-row">Date Last Edited (MM/DD/YYYY): </label>
                        <input type="text" id="EditKey-input-date_last_edited" placeholder={displayDateLastEdited} disabled />
                    </div>
                </form>
                <div id="EditKey-div-image-container">
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
            <div id="EditKey-div-button-container">
                <button id="EditKey-button-cancel" onClick={handleCancel}>Cancel</button>
                <button id="EditKey-button-submit" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
        
    )  
}

export default EditKey