import React, { useContext, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Modal, Box } from '@mui/material';

function AddUser() {

    // global state variables
    const { accessId, permissions } = useContext(AuthContext)

    // display an unauthorized page if the accessID is not found in the database
    if (permissions !== "Admin") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    // State for the Modal
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Modal handlers
    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);

    const navigate = useNavigate();
    const handleCancel = () => {
        navigate('/users');
    }

    const handleSubmit = async () => {
        const access_id_input = document.getElementById('AddUser-input-access-id').value;
        const fname_input = document.getElementById('AddUser-input-fname').value;
        const lname_input = document.getElementById('AddUser-input-lname').value;
        const title_input = document.getElementById('AddUser-input-title').value;
        const permissions_input = document.getElementById('AddUser-select-permissions').value;
        if (!access_id_input || !fname_input || !lname_input || !title_input || permissions_input === "") { // check if all required fields are filled
            setErrorMessage("Please fill out all required fields.");
            handleModalShow();
            return
        }
        try {
            const response = await fetch('http://localhost:8081/add-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    user_access_id: accessId, 
                    access_id: access_id_input,
                    fname: fname_input,
                    lname: lname_input,
                    title: title_input,
                    permissions: permissions_input,
                }),
            });
            if (response.status === 200) {
                navigate('/users');
            } else if (response.status === 400) {
                setErrorMessage("This user already exists.");
                handleModalShow();
            } else {
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const getInfoFromAccessId = async () => {
        const input_access_id = document.getElementById('AddUser-input-access-id').value
        // regular expression to match exactly 2 letters followed by 4 digits
        const regex = /^[A-Za-z]{2}\d{4}$/;
        // check if input_access_id matches the pattern
        if (!regex.test(input_access_id)) {
            // clear the inputs if the input access id doesn't follow format
            document.getElementById('AddUser-input-fname').value = null;
            document.getElementById('AddUser-input-lname').value = null;
            document.getElementById('AddUser-input-title').value = null;
            return
        }
        try {
            const response = await fetch('http://localhost:8081/get-name-title-from-access-id', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ input_access_id })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                // setting the input values dynamically
                document.getElementById('AddUser-input-fname').value = data.first_name;
                document.getElementById('AddUser-input-lname').value = data.last_name;
                document.getElementById('AddUser-input-title').value = data.title;
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
            <div id="AddUser-div-container">
                <h1 id="AddUser-h1-title">Add User</h1>
                <div id="AddUser-div-form-container">
                    <div id="AddUser-div-input-container">
                        <label className="AddUser-label">Access ID:</label>
                        <input id="AddUser-input-access-id" type="text" onChange={getInfoFromAccessId} />
                    </div>
                    <div id="AddUser-div-input-container">
                        <label className="AddUser-label">First Name:</label>
                        <input id="AddUser-input-fname" type="text" />
                    </div>
                    <div id="AddUser-div-input-container">
                        <label className="AddUser-label">Last Name:</label>
                        <input id="AddUser-input-lname" type="text" />
                    </div>
                    <div id="AddUser-div-input-container">
                        <label className="AddUser-label">Title:</label>
                        <input id="AddUser-input-title" type="text" />
                    </div>
                    <div id="AddUser-div-input-container">
                        <label className="AddUser-label">Permissions:</label>
                        <select id="AddUser-select-permissions">
                            <option value="" hidden>Select a permission</option>
                            <option value="Student Employee">Student Employee</option>
                            <option value="Unauthorized">Unauthorized</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div id="AddUser-div-button-container">
                    <button id="AddUser-button-cancel" onClick={handleCancel}>Cancel</button>
                    <button id="AddUser-button-submit" onClick={handleSubmit}>Submit</button>
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
        </>
    )
}

export default AddUser