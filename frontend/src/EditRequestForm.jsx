import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function EditRequestForm() {

    // global state variables
    const { accessId, requestFormData } = useContext(AuthContext)

    // display an unauthorized page if the accessID is not found in the database
    if (accessId === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    const [pdfData, setPdfData] = useState(null);

    const navigate = useNavigate();
    const handleCancel = () => {
        navigate('/requestforms');
    }

    const getPdfData = async () => {
        try {
            const response = await fetch(`http://localhost:8081/get-key-request-form-image`, { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ form_id: requestFormData.form_id }),
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

    const handleSubmit = (event) => {
        event.preventDefault();
        const first_name = document.getElementById('EditRequestForm-input-first-name').value || document.getElementById('EditRequestForm-input-first-name').placeholder;
        const last_name = document.getElementById('EditRequestForm-input-last-name').value || document.getElementById('EditRequestForm-input-last-name').placeholder;
        const access_id = document.getElementById('EditRequestForm-input-access-id').value || document.getElementById('EditRequestForm-input-access-id').placeholder;
        const date_signed = document.getElementById('EditRequestForm-input-date-signed').value || requestFormData.date_signed;
        const file = document.getElementById('EditRequestForm-input-file').files[0] || null;
        const formData = new FormData();
        formData.append('form_id', requestFormData.form_id);
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('access_id', access_id);
        formData.append('date_signed', date_signed);
        formData.append('file', file);
        fetch(`http://localhost:8081/update-key-request-form`, { // send a POST request to the backend route
            method: 'POST',
            body: formData,
        }).then(response => {
            if (response.ok) { // if the response is successful
                navigate('/requestforms'); // redirect to the request forms page
            } else {
                console.log('Internal Server Error. Please try again later.'); // log an error message
            }
        }).catch(err => console.log(err));
    }

    const handleDelete = (event) => {
        event.preventDefault();
        fetch(`http://localhost:8081/delete-key-request-form`, { // send a POST request to the backend route
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ form_id: requestFormData.form_id }),
        }).then(response => {
            if (response.ok) { // if the response is successful
                navigate('/requestforms'); // redirect to the request forms page
            } else {
                console.log('Internal Server Error. Please try again later.'); // log an error message
            }
        }).catch(err => console.log(err));
    }

    return (
        <>
            <NavBar />
            <div id="EditRequestForm-div-container">
                <div id="EditRequestForm-div-flex-box">
                    <div id="EditRequestForm-div-left-box">
                        <div id="EditRequestForm-div-row-flex-box-title">
                            <h2>EDIT REQUEST FORM</h2>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Form ID:</h3>
                            <input id="EditRequestForm-input-form-id" type="text" placeholder={requestFormData.form_id} disabled />
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-even">
                            <h3>First Name:</h3>
                            <input id="EditRequestForm-input-first-name" type="text" placeholder={requestFormData.first_name}/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Last Name:</h3>
                            <input id="EditRequestForm-input-last-name" type="text" placeholder={requestFormData.last_name} />
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-even">
                            <h3>Access ID:</h3>
                            <input id="EditRequestForm-input-access-id" type="text" placeholder={requestFormData.access_id} />
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Date Signed:</h3>
                            <input id="EditRequestForm-input-date-signed" type="date" placeholder={requestFormData.date_signed} />
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-even">
                            <h3>Assigned Key 1:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_1} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Assigned Key 2:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_2} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-even">
                            <h3>Assigned Key 3:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_3} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Assigned Key 4:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_4} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-even">
                            <h3>PDF File:</h3>
                            <input id="EditRequestForm-input-file" type="file" accept=".pdf" onChange={handleFileChange} />
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-title">
                            <h2>QUICK ACTIONS</h2>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>DELETE FORM:</h3>
                            <button id="EditRequestForm-button-delete" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                    <div id="EditRequestForm-div-right-box">
                        {pdfData ? (
                            <iframe id="EditRequestForm-iframe-key-request-form" src={pdfData} alt="Key Request Form" />
                        ) : (
                            <h1 id="EditRequestForm-h1-no-request-form">No PDF associated with this form ID was found.</h1>
                        )}
                    </div>
                </div>
                <div id="EditRequestForm-div-button-container">
                    <button id="EditRequestForm-button-cancel" onClick={handleCancel}>Cancel</button>
                    <button id="EditRequestForm-button-submit" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </>
    )
}

export default EditRequestForm;