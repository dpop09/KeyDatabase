import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function KeyInfo() {

    // global state variables
    const { permissions, keyData } = useContext(AuthContext);

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    const [pdfData, setPdfData] = useState(null);

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/');
    }
    const handleEdit = () => {
        navigate('/editkey');
    }

    const getPdfData = async () => {
        try {
            const response = await fetch(`http://localhost:8081/get-key-request-form-image-with-key-number`, { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key_number: keyData.key_number }),
            });
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setPdfData(data.image_data);
            } else {
                console.log('Internal Server Error. Please try again later.'); // log an error message
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getPdfData();
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
                            <h3>Tag Number:</h3>
                            <h3>{keyData.tag_number}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h3>Tag Color:</h3>
                            <h3>{keyData.tag_color}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h3>Core Number:</h3>
                            <h3>{keyData.core_number}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h3>Room Number:</h3>
                            <h3>{keyData.room_number}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h3>Room Type:</h3>
                            <h3>{keyData.room_type}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h3>Key Number:</h3>
                            <h3>{keyData.key_number}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h3>Available:</h3>
                            <h3>{keyData.key_holder_fname && keyData.key_holder_lname && keyData.key_holder_access_id && keyData.date_assigned ? "No" : "Yes"}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-title">
                            <h2>KEY HOLDER INFO</h2>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h3>Key Holder's First Name:</h3>
                            <h3>{keyData.key_holder_fname}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h3>Key Holder's Last Name:</h3>
                            <h3>{keyData.key_holder_lname}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h3>Key Holder's Access ID:</h3>
                            <h3>{keyData.key_holder_access_id}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box-even">
                            <h3>Date Assigned:</h3>
                            <h3>{displayDateAssigned}</h3>
                        </div>
                        <div id="KeyInfo-div-row-flex-box">
                            <h3>Comments:</h3>
                            <h3>{keyData.comments}</h3>
                        </div>
                    </div>
                    <div id="KeyInfo-div-request-form-container">
                            {pdfData ? (
                                <iframe id="KeyInfo-iframe-key-request-form" src={pdfData} alt="Key Request Form" />
                            ) : (
                                <h1 id="KeyInfo-h1-no-request-form">No request form associated with this key is found.</h1>
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