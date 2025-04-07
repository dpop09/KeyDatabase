import React, { useContext, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import { Modal, Box } from '@mui/material';

function NavBar() {
    
    const { accessId, permissions } = useContext(AuthContext);

    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    // modal handlers
    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);

    const navigate = useNavigate();
    const gotoKeys = () => {
        navigate('/');
    }
    const gotoRequestForms = () => {
        navigate('/requestforms');
    }
    const gotoHistoryLog = () => {
        navigate('/historylog');
    }
    const gotoUsers = () => {
        navigate('/users');
    }
    const gotoSettings = () => {
        if (permissions === "Admin") {
            navigate('/settings')
        }
        else {
            setErrorMessage('This action can only be performed by an admin.');
            handleModalShow();
        }
    }

    return (
        <>
            <div id="NavBar-div-container">
                <h1 id="NavBar-h1-title">ENGINEERING BUILDING KEY DATABASE {accessId}</h1>
                <div id="NavBar-div-links">
                    <button id="NavBar-button-link" onClick={gotoKeys}>KEYS</button>
                    <button id="NavBar-button-link" onClick={gotoRequestForms}>REQUEST FORMS</button>
                    <button id="NavBar-button-link" onClick={gotoHistoryLog}>HISTORY</button>
                    <button id="NavBar-button-link" onClick={gotoUsers}>USERS</button>
                    <button id="NavBar-button-link" onClick={gotoSettings}>SETTINGS</button>
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

export default NavBar;