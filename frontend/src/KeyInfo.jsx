import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";

function KeyInfo() {

    const [keyRequestForm, setKeyRequestForm] = useState(null);

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/home');
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
            const data = await response.json();
            if (data) { // if the response is successful
                setKeyRequestForm(data);
            } else { // if the response is unsuccessful
                alert("Internal Server Error. Please try again later.");
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

    const getKeyNumber = (d) => {
        return d.key_number.split('-')[0];
    }

    const getKeySequence = (d) => {
        return d.key_number.split('-')[1];
    }

    return (
        <div id="KeyInfo-div-container">
            <h1 id="KeyInfo-h1-title">KEY {keyData.key_number} INFORMATION</h1>
            <form>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="tag_number">Tag Number: </label>
                    <input type="text" id="KeyInfo-input-tag_number" value={keyData.tag_number} disabled />
                </div>
                <br></br>
                <div id ="KeyInfo-div-row-flex-box">
                    <label for="tag_color">Tag Color: </label>
                    <input type="text" id="KeyInfo-input-tag_color" value={keyData.tag_color} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="core_number">Core Number: </label>
                    <input type="text" id="KeyInfo-input-core_number" value={keyData.core_number} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="room_number">Room Number: </label>
                    <input type="text" id="KeyInfo-input-room_number" value={keyData.room_number} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="room_type">Room Type: </label>
                    <input type="text" id="KeyInfo-input-room_number" value={keyData.room_type} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="key_number">Key Number: </label>
                    <input type="text" id="KeyInfo-input-key_number" value={keyData.key_number} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="available">Available: </label>
                    <input type="text" id="KeyInfo-input-available" value={keyData.available ? 'Yes' : 'No'} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="key_holder_fname">Key Holder's First Name: </label>
                    <input type="text" id="KeyInfo-input-key_holder_fname" value={keyData.key_holder_fname} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="key_holder_lname">Key Holder's Last Name: </label>
                    <input type="text" id="KeyInfo-input-key_holder_lname" value={keyData.key_holder_lname} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="date_assigned">Key Assigned Date: </label>
                    <input type="text" id="KeyInfo-input-date_assigned" value={keyData.date_assigned} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="comments">Comments </label>
                    <input type="text" id="KeyInfo-input-comments" value={keyData.comments} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="last_edited_by">Key Last Edited By: </label>
                    <input type="text" id="KeyInfo-input-last_edited_by" value={keyData.last_edited_by} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label for="date_last_edited">Date Last Edited: </label>
                    <input type="text" id="KeyInfo-input-date_last_edited" value={keyData.date_last_edited} disabled />
                </div>
                <br></br>
                <div id="KeyInfo-div-row-flex-box">
                    <label htmlFor="key_request_form">Key Request Form: </label>
                    {keyRequestForm?.image_data ? (
                        <img
                            src={`data:image/jpeg;base64,${keyRequestForm.image_data}`}
                            alt="Key Request Form"
                            style={{ width: '300px', height: 'auto' }}
                        />
                    ) : (
                        <p>The image was not found</p>
                    )}
                </div>
            </form>
            <button id="KeyInfo-button-back" onClick={handleGoBack}>Go Back</button>
        </div>
    )
}

export default KeyInfo