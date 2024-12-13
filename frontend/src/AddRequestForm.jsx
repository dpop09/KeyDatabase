import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function AddRequestForm() {

    const navigate = useNavigate();

    const [pdfData, setPdfData] = useState(null);

    const handleGoBack = () => {
        navigate('/requestforms');
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    setPdfData(e.target.result);
                };
                fileReader.readAsDataURL(file);
            } else {
                alert('Only PDF files are allowed');
            }
        } else {
            setPdfData(null);
        }
    }

    const handleSubmit = () => {
        const first_name = document.getElementById('AddRequestForm-input-first-name').value;
        const last_name = document.getElementById('AddRequestForm-input-last-name').value;
        const access_id = document.getElementById('AddRequestForm-input-access-id').value;
        const date_signed = document.getElementById('AddRequestForm-input-date-signed').value;
        const file = document.getElementById('AddRequestForm-input-file').files[0];
        if (!first_name || !last_name || !access_id || !date_signed || !file) {
            alert("Please fill out all required fields.");
            return;
        }
        const formData = new FormData();
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('access_id', access_id);
        formData.append('date_signed', date_signed);
        formData.append('file', file);
        try {
            fetch('http://localhost:8081/add-key-request-form', { // send a POST request to the backend route
                method: 'POST',
                body: formData,
            }).then(response => {
                if (response.ok) { // if the response is successful
                    navigate('/requestforms'); // redirect to the request forms page
                } else {
                    console.log("Internal Server Error. Please try again later.");
                }
            }).catch(err => console.log(err));
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <>
            <NavBar />
            <div id="AddRequestForm-div-container">
                <div id="AddRequestForm-div-flex-box">
                    <div id="AddRequestForm-div-info-container">
                        <div id="AddRequestForm-div-row-flex-box-title">
                            <h2>ADD INFORMATION</h2>
                        </div>
                        <div id="AddRequestForm-div-row-flex-box">
                            <h2>First Name: </h2>
                            <input type="text" id="AddRequestForm-input-first-name" name="first_name" />
                        </div>
                        <div id="AddRequestForm-div-row-flex-box-even">
                            <h2>Last Name: </h2>
                            <input type="text" id="AddRequestForm-input-last-name" name="last_name" />
                        </div>
                        <div id="AddRequestForm-div-row-flex-box">
                            <h2>Access ID: </h2>
                            <input type="text" id="AddRequestForm-input-access-id" name="access_id" />
                        </div>
                        <div id="AddRequestForm-div-row-flex-box-even">
                            <h2>Date Signed: </h2>
                            <input type="date" id="AddRequestForm-input-date-signed" name="date_signed" />
                        </div>
                        <div id="AddRequestForm-div-row-flex-box">
                            <h2>PDF File: </h2>
                            <input type="file" id="AddRequestForm-input-file" accept="application/pdf" onChange={handleFileChange} />
                        </div>
                    </div>
                    <div id="AddRequestForm-div-image-container">
                        {pdfData ? (
                            <iframe id="AddRequestForm-iframe-key-request-form" src={pdfData} alt="Key Request Form" />
                        ) : (
                            <h1 id="AddRequestForm-h1-no-request-form">No PDF file provided.</h1>
                        )}
                    </div>
                </div>
                <div id="AddRequestForm-div-button-container">
                    <button id="AddRequestForm-button-cancel" onClick={handleGoBack}>Go Back</button>
                    <button id="AddRequestForm-button-submit" onClick={handleSubmit} >Submit</button>
                </div>
            </div>
        </>
    )
}

export default AddRequestForm