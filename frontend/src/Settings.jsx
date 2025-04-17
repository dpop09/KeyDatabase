import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Modal, Box } from '@mui/material';

function Settings() {

    // global state variables
    const { permissions } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions !== "Admin") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const handleAlertModalClose = () => setShowAlertModal(false);
    const handleAlertModalShow = () => setShowAlertModal(true); 
    const handleConfirmationModalClose = () => setShowConfirmationModal(false);
    const handleConfirmationModalShow = () => setShowConfirmationModal(true);

    const handleCreateBackup = async () => {
        try {
            const response = await fetch('http://localhost:8081/backup', { // send a POST request to the backend route
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.text(); // read the response as text
            if (result === 'true') {
                setAlertMessage("Database backup created successfully.")
            } else { // if the response is unsuccessful
                console.log(response)
                setAlertMessage("Internal Server Error. Please try again later.");
            }
            handleAlertModalShow();
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteDatabase = async () => {
        const confirm_input = document.getElementById("Settings-input-delete-confirm").value;
        if (confirm_input !== "Delete Database") {
            return;
        }
        try {
            const response = await fetch('http://localhost:8081/delete-db', { // send a POST request to the backend route
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            handleConfirmationModalClose();
            if (response.status === 200) {
                setAlertMessage("Database deleted successfully.")
                handleAlertModalShow();
            } else { // if the response is unsuccessful
                console.log(response)
                setAlertMessage("Internal Server Error. Please try again later.");
                handleAlertModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <>
            <NavBar />
            <div id="Settings-div-container">
                <div id="Settings-div-actions-container">
                    <div id="Settings-div-action">
                        <h1>Create Backup</h1>
                        <button id="Settings-button-backup" onClick={handleCreateBackup}>Backup</button>
                    </div>
                    <div id="Settings-div-action">
                        <h1>Delete Database</h1>
                        <button id="Settings-button-delete" onClick={handleConfirmationModalShow}>Delete</button>
                    </div>
                </div>
            </div>
            <Modal open={showAlertModal} onClose={handleAlertModalClose}>
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
                    <h2>{alertMessage}</h2>
                    <div id="Modal-div-buttons">
                        <button id="Modal-button-close" onClick={handleAlertModalClose}>Close</button>
                    </div>
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
                    <h2>Type "Delete Database" to confirm your action.</h2>
                    <input id="Settings-input-delete-confirm" placeholder="Delete Database"></input>
                    <div id="Modal-div-buttons">
                        <button id="Modal-button-close" onClick={handleConfirmationModalClose}>Cancel</button>
                        <button id="Modal-button-confirm" onClick={handleDeleteDatabase}>Delete</button>
                    </div>
                </Box>
            </Modal>
        </>
    )
}

export default Settings