import React, { useContext, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function AddRequestForm() {

    // global state variables
    const { permissions } = useContext(AuthContext)

    // display an unauthorized page if the user is unauthorized
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    // state variable for the PDF data of the request form
    const [pdfData, setPdfData] = useState(null);

    // navigation back to the request forms page
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/requestforms');
    }

    // function to handle the file upload
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

    // function to handle the form submission
    const handleSubmit = () => {
        // get the values of the input fields
        const first_name = document.getElementById('AddRequestForm-input-first-name').value;
        const last_name = document.getElementById('AddRequestForm-input-last-name').value;
        const access_id = document.getElementById('AddRequestForm-input-access-id').value;
        const date_signed = document.getElementById('AddRequestForm-input-date-signed').value;
        const file = document.getElementById('AddRequestForm-input-file').files[0];
        // check if all required fields are filled
        if (!first_name || !last_name || !access_id || !file) {
            alert("Please fill out all required fields.");
            return;
        }
        // append the form data to a FormData object
        const formData = new FormData();
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('access_id', access_id);
        formData.append('date_signed', date_signed);
        formData.append('file', file);
        // send a POST request to the backend route
        try {
            fetch('http://localhost:8081/add-key-request-form', {
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
                        {pdfData ? ( /* display the PDF file */
                            <iframe id="AddRequestForm-iframe-key-request-form" src={pdfData} alt="Key Request Form" />
                        ) : ( /* display a message if no PDF file is provided */
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