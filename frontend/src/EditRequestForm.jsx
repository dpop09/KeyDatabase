import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Modal, Box } from '@mui/material';

function EditRequestForm() {

    // global state variables
    const { accessId, permissions, requestFormData } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    // state variables for the modals
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const [pdfData, setPdfData] = useState(null);

    // modal handlers
    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);
    const handleConfirmationModalClose = () => setShowConfirmationModal(false);
    const handleConfirmationModalShow = () => {
        if (permissions !== "Admin") {
            setErrorMessage("This action can only be performed by an admin.");
            handleModalShow();
            return
        }
        setShowConfirmationModal(true);
    }

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
                setErrorMessage('Only PDF files are allowed');
                handleModalShow();
            }
        } else {
            setPdfData(null);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
    
        const first_name = (document.getElementById('EditRequestForm-input-first-name').value) ?
                        document.getElementById('EditRequestForm-input-first-name').value.trim() :
                        document.getElementById('EditRequestForm-input-first-name').placeholder;
        const first_name_edit_flag = (document.getElementById('EditRequestForm-input-first-name').value) ? true : false;
        const last_name = (document.getElementById('EditRequestForm-input-last-name').value) ?
                        document.getElementById('EditRequestForm-input-last-name').value.trim() :
                        document.getElementById('EditRequestForm-input-last-name').placeholder;
        const last_name_edit_flag = (document.getElementById('EditRequestForm-input-last-name').value) ? true : false;
        const access_id = (document.getElementById('EditRequestForm-input-access-id').value) ?
                        document.getElementById('EditRequestForm-input-access-id').value.trim() :
                        document.getElementById('EditRequestForm-input-access-id').placeholder;
        const access_id_edit_flag = (document.getElementById('EditRequestForm-input-access-id').value) ? true : false;
        const date_signed = (document.getElementById('EditRequestForm-input-date-signed').value) ?
                        document.getElementById('EditRequestForm-input-date-signed').value :
                        document.getElementById('EditRequestForm-input-date-signed').placeholder;
        const date_signed_edit_flag = (document.getElementById('EditRequestForm-input-date-signed').value) ? true : false;
        
        // Properly retrieve the file
        const fileInput = document.getElementById('EditRequestForm-input-file');
        const file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;
        // check if any of the core fields are empty
        if (!first_name || !last_name || !access_id) {
            setErrorMessage("Please fill out all required fields.");
            handleModalShow();
            return
        }

        const formData = new FormData();
        formData.append('user_access_id', accessId);
        formData.append('form_id', requestFormData.form_id);
        formData.append('first_name', first_name);
        formData.append('first_name_edit_flag', first_name_edit_flag);
        formData.append('last_name', last_name);
        formData.append('last_name_edit_flag', last_name_edit_flag);
        formData.append('access_id', access_id);
        formData.append('access_id_edit_flag', access_id_edit_flag);
        formData.append('date_signed', date_signed);
        formData.append('date_signed_edit_flag', date_signed_edit_flag);
        
        if (file) {
            formData.append('file', file);
        }
    
        fetch(`http://localhost:8081/update-key-request-form`, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                navigate('/requestforms'); // Redirect if successful
            } else {
                setErrorMessage('Internal Server Error. Please try again later.');
                handleModalShow();
            }
        })
        .catch(err => console.log(err));
    };
    

    const handleDeleteForm = async () => {
        try {
            const response = await fetch(`http://localhost:8081/delete-key-request-form`, { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    user_access_id: accessId, 
                    form_id: requestFormData.form_id 
                }),
            })
            if (response.status === 200) {
                handleConfirmationModalClose();
                navigate('/requestforms'); // redirect to the request forms page
            } else { // if the response is unsuccessful
                handleConfirmationModalClose();
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getInfoFromAccessId = async (event) => {
        event.preventDefault();
        const input_access_id = document.getElementById('EditRequestForm-input-access-id').value
        // regular expression to match exactly 2 letters followed by 4 digits
        const regex = /^[A-Za-z]{2}\d{4}$/;
        // check if input_access_id matches the pattern
        if (!regex.test(input_access_id)) {
            // clear the inputs if the input access id doesn't follow format
            document.getElementById('EditRequestForm-input-first-name').value = null;
            document.getElementById('EditRequestForm-input-last-name').value = null;
            return
        }
        try {
            const response = await fetch('http://localhost:8081/get-info-from-access-id', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ input_access_id })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                console.log(data)
                // setting the input values dynamically
                document.getElementById('EditRequestForm-input-first-name').value = data.first_name;
                document.getElementById('EditRequestForm-input-last-name').value = data.last_name;
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
            <div id="EditRequestForm-div-container">
                <div id="EditRequestForm-div-flex-box">
                    <div id="EditRequestForm-div-left-box">
                        <div id="EditRequestForm-div-row-flex-box-title">
                            <h2>EDIT REQUEST FORM</h2>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Access ID:</h3>
                            <input id="EditRequestForm-input-access-id" type="text" placeholder={requestFormData.access_id} onChange={getInfoFromAccessId} />
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
                            <h3>Date Signed:</h3>
                            <input id="EditRequestForm-input-date-signed" type="date" placeholder={requestFormData.date_signed} />
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Assigned Key 1:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_1} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-even">
                            <h3>Assigned Key 2:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_2} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Assigned Key 3:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_3} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-even">
                            <h3>Assigned Key 4:</h3>
                            <input id="EditRequestForm-input-key-number" type="text" placeholder={requestFormData.assigned_key_4} disabled/>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>PDF File:</h3>
                            <input id="EditRequestForm-input-file" type="file" accept=".pdf" onChange={handleFileChange} />
                        </div>
                        <div id="EditRequestForm-div-row-flex-box-title">
                            <h2>QUICK ACTIONS</h2>
                        </div>
                        <div id="EditRequestForm-div-row-flex-box">
                            <h3>Delete Form:</h3>
                            <button id="EditRequestForm-button-delete" onClick={handleConfirmationModalShow}>Delete</button>
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
            <Modal open={showModal} onClose={handleModalClose}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: "8px",
                    alignItems: "center",     // Center horizontally
                    textAlign: "center"       // Center text inside
                }}>
                    <h2>{errorMessage}</h2>
                    <button id="Modal-button-close" onClick={handleModalClose}>Close</button>
                </Box>
            </Modal>
            <Modal open={showConfirmationModal} onClose={handleConfirmationModalClose}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: "8px",
                    alignItems: "center",     // Center horizontally
                    textAlign: "center"       // Center text inside
                }}>
                    <h2>Are you sure you'd like to delete request form {requestFormData.form_id}?</h2>
                    <div id="Modal-div-buttons">
                        <button id="Modal-button-close" onClick={handleConfirmationModalClose}>Cancel</button>
                        <button id="Modal-button-confirm" onClick={handleDeleteForm}>Delete</button>
                    </div>
                </Box>
            </Modal>
        </>
    )
}

export default EditRequestForm;