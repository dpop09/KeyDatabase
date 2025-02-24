import React, { useContext, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Modal, Box } from '@mui/material';

function EditUser() {

    // global state variables
    const { accessId, permissions, selectedUser } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
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
        try {
            const fname = (document.getElementById('EditUser-input-fname').value) ? 
                        {value: document.getElementById('EditUser-input-fname').value, edit_flag: true} :
                        {value: document.getElementById('EditUser-input-fname').placeholder, edit_flag: false};
            const lname = (document.getElementById('EditUser-input-lname').value) ? 
                        {value: document.getElementById('EditUser-input-lname').value, edit_flag: true} :
                        {value: document.getElementById('EditUser-input-lname').placeholder, edit_flag: false};
            const title = (document.getElementById('EditUser-input-title').value) ? 
                        {value: document.getElementById('EditUser-input-title').value, edit_flag: true} :
                        {value: document.getElementById('EditUser-input-title').placeholder, edit_flag: false};
            const permissions = (document.getElementById('EditUser-select-permissions').value) ?
                        {value: document.getElementById('EditUser-select-permissions').value, edit_flag: true} :
                        {value: selectedUser.permission, edit_flag: false};
            if (!fname.edit_flag && !lname.edit_flag && !title.edit_flag && !permissions.edit_flag) {
                setErrorMessage("No edits were made.");
                handleModalShow();
                return;
            }
            const response = await fetch('http://localhost:8081/edit-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    user_access_id: accessId, 
                    fname, 
                    lname, 
                    access_id: selectedUser.access_id, 
                    title, 
                    permissions 
                }),
            });
            if (response.status === 200) {
                navigate('/users');
            } else {
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error)
        }
    }
    
    const handleDeleteUser = async () => {
        try {
            const response = await fetch('http://localhost:8081/delete-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_access_id: accessId, access_id: selectedUser.access_id }),
            });
            if (response.status === 200) {
                navigate('/users');
            } else {
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <NavBar />
            <div id="EditUser-div-container">
                <h1 id="EditUser-h1-title">Edit {selectedUser.first_name}'s Profile</h1>
                <div id="EditUser-div-form-container">
                    <div id="EditUser-div-input-container">
                        <label className="EditUser-label">Access ID:</label>
                        <input id="EditUser-input-access-id" className="EditUser-input-access-id" type="text" placeholder={selectedUser.access_id} disabled/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label className="EditUser-label">First Name:</label>
                        <input id="EditUser-input-fname" type="text" placeholder={selectedUser.first_name}/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label className="EditUser-label">Last Name:</label>
                        <input id="EditUser-input-lname" type="text" placeholder={selectedUser.last_name}/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label className="EditUser-label">Title:</label>
                        <input id="EditUser-input-title" type="text" placeholder={selectedUser.title}/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label className="EditUser-label">Permissions:</label>
                        <select id="EditUser-select-permissions" placeholder={selectedUser.permission}>
                            <option value="" hidden={true}>{selectedUser.permission}</option>
                            <option value="Student Employee">Student Employee</option>
                            <option value="Unauthorized">Unauthorized</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div id="EditUser-div-button-container">
                    <button id="EditUser-button-cancel" onClick={handleCancel}>Cancel</button>
                    <button id="EditUser-button-submit" onClick={handleSubmit}>Submit</button>
                    <button id="EditUser-button-delete" onClick={handleDeleteUser}>Delete</button>
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
                    alignItems: "center",
                    textAlign: "center"
                }}>
                    <h2>{errorMessage}</h2>
                    <button id="EditUser-button-modal" onClick={handleModalClose}>Close</button>
                </Box>
            </Modal>
        </>
    )
}

export default EditUser