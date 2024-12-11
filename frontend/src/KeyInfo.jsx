import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function KeyInfo() {

    const [keyRequestForm, setKeyRequestForm] = useState(null);

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/keys');
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
        <>
            <NavBar />
            <div id="KeyInfo-div-container">
                <div id="KeyInfo-div-flex-box">
                    <div id="KeyInfo-div-info-container">
                        <div id="KeyInfo-div-row-flex-box-title">
                            <h2>KEY INFO</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h2>Tag Number:</h2>
                            <h2>{keyData.tag_number}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h2>Tag Color:</h2>
                            <h2>{keyData.tag_color}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h2>Core Number:</h2>
                            <h2>{keyData.core_number}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h2>Room Number:</h2>
                            <h2>{keyData.room_number}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h2>Room Type:</h2>
                            <h2>{keyData.room_type}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h2>Key Number:</h2>
                            <h2>{keyData.key_number}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h2>Available:</h2>
                            <h2>{keyData.available ? "Yes" : "No"}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-title">
                            <h2>KEY HOLDER INFO</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h2>Key Holder's First Name:</h2>
                            <h2>{keyData.key_holder_fname}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h2>Key Holder's Last Name:</h2>
                            <h2>{keyData.key_holder_lname}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h2>Key Holder's Access ID:</h2>
                            <h2>{keyData.key_holder_access_id}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h2>Date Assigned:</h2>
                            <h2>{displayDateAssigned}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h2>Comments:</h2>
                            <h2>{keyData.comments}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-title">
                            <h2>EDITED BY</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h2>Last Edited By:</h2>
                            <h2>{keyData.last_edited_by}</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h2>Date Last Edited:</h2>
                            <h2>{displayDateLastEdited}</h2>
                        </div>
                    </div>
                    <div id="KeyInfo-div-image-container">
                        {keyRequestForm ? (
                            <img
                                src={keyRequestForm}
                                alt="Key Request Form"
                                style={{ width: '100%' }}
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
        </>
        
    )
}

export default KeyInfo