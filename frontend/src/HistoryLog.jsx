import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import NavBar from "./NavBar";
import { Modal, Box } from '@mui/material';

function HistoryLog() {

    // global state variables
    const { accessId, permissions } = useContext(AuthContext)

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

    const [data, setData] = useState([]);
    const [displayAdvancedSearch, setDisplayAdvancedSearch] = useState(false)

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

    const toggleDisplayAdvancedSearch = () => {
        setDisplayAdvancedSearch(!displayAdvancedSearch)
    }

    const getAllHistory = async () => {
        try {
            const response = await fetch('http://localhost:8081/get-all-history');
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getAllHistory();
    }, []);

    const reverseData = () => {
        setData(prevData => [...prevData].reverse());
    };

    const handleDeleteHistory = async () => {
        try {
            const response = await fetch('http://localhost:8081/delete-history', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ access_id: accessId })
            })
            if (response.status === 200) {
                handleConfirmationModalClose();
                getAllHistory(); // update the history log table
            } else { // if the response is unsuccessful
                handleConfirmationModalClose();
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearch = async (event) => {
        const row = document.getElementById('HistoryLog-input-search-row').value;
        if (!row) { 
            return;
        }
        try {
            const response = await fetch('http://localhost:8081/search-history', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ row: row })
            })
            const data = await response.json();
            if (data) { // if the response is successful
                setData(data);
            } else { // if the response is unsuccessful
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearSearch = async () => {
        document.getElementById('HistoryLog-input-search-row').value = null
        getAllHistory();
    }

    const handleAdvancedSearch = async () => {
        const log_id = document.getElementById('HistoryLog-input-advanced-search-log-id').value;
        const user = document.getElementById('HistoryLog-input-advanced-search-user').value;
        const target_type = document.getElementById('HistoryLog-input-advanced-search-target-type').value;
        const target_id = document.getElementById('HistoryLog-input-advanced-search-target-id').value;
        const action_type = document.getElementById('HistoryLog-input-advanced-search-action-type').value;
        const action_details = document.getElementById('HistoryLog-input-advanced-search-action-details').value;
        const date = document.getElementById('HistoryLog-input-advanced-search-date').value;
        const time = document.getElementById('HistoryLog-input-advanced-search-time').value;
        // do nothing if all of the inputs are empty
        if (log_id &&
            user &&
            target_type &&
            target_id &&
            action_type &&
            action_details &&
            date &&
            time) {
            return
        }
        try {
            const response = await fetch('http://localhost:8081/advanced-search-history', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ 
                    log_id,
                    user,
                    target_type,
                    target_id,
                    action_type,
                    action_details,
                    date,
                    time 
                })
            })
            const data = await response.json();
            if (data) { // if the response is successful
                setData(data);
            } else { // if the response is unsuccessful
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleClearAdvancedSearch = async () => {
        document.getElementById('HistoryLog-input-advanced-search-log-id').value = null;
        document.getElementById('HistoryLog-input-advanced-search-user').value = null;
        document.getElementById('HistoryLog-input-advanced-search-target-type').value = null;
        document.getElementById('HistoryLog-input-advanced-search-target-id').value = null;
        document.getElementById('HistoryLog-input-advanced-search-action-type').value = null;
        document.getElementById('HistoryLog-input-advanced-search-action-details').value = null;
        document.getElementById('HistoryLog-input-advanced-search-date').value = null;
        document.getElementById('HistoryLog-input-advanced-search-time').value = null;
        getAllHistory();
    }

    const handleDownloadHistoryLog = async () => {
        try {
            const response = await fetch('http://localhost:8081/download-history-log');
            const result = await response.text(); // read the response as text
            if (result === 'true') {
                setErrorMessage('The history log was successfully copied to a text file in the project directory in filedrop.')
            } else {
                setErrorMessage('Failed to copy the history log to a text file. Please try again later.');
            }
            handleModalShow();
        } catch (error) {
            console.log(error);
        }
    }

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const getReadableDate = (log) => {
        // Parse the ISO string into a Date object
        const date = new Date(log);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // Using local time; if you want to display UTC instead, use getUTCMonth(), getUTCDate(), etc.
        const month = monthNames[date.getMonth()];
        const day = getOrdinal(date.getDate());
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    }
    const getReadableTime = (log) => {
        // Parse the ISO string into a Date object
        const date = new Date(log);
        // Using local time; if you want UTC time, use getUTCHours(), getUTCMinutes(), etc.
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const period = hours >= 12 ? 'pm' : 'am';
        // Convert from 24-hour (military) format to 12-hour format
        hours = hours % 12 || 12;
        return `${hours}:${minutes}:${seconds}${period}`;
    }

    return (
        <>
            <NavBar />
            <div id="HistoryLog-div-container">
                <div id="HistoryLog-div-top-flex-box">
                    <div id="HistoryLog-div-search-container">
                        <h2>General Search:</h2>
                        <input id="HistoryLog-input-search-row" type="text" placeholder="Search..." onChange={handleSearch} />
                        <button id="HistoryLog-button-clear-search" onClick={handleClearSearch}>Clear</button>
                    </div>
                    <div id="HistoryLog-div-action-buttons">
                        <button id="HistoryLog-button-sort" onClick={reverseData} />
                        <button id="HistoryLog-button-download" onClick={handleDownloadHistoryLog} />
                        <button id="HistoryLog-button-advanced-search" onClick={toggleDisplayAdvancedSearch} />
                        <button id="HistoryLog-button-delete-all" onClick={handleConfirmationModalShow} />
                    </div>
                </div>
                {displayAdvancedSearch && (
                    <div id="HistoryLog-div-advanced-search">
                        <div id="HistoryLog-div-advanced-search-top">
                            <h2>Advanced Search:</h2>
                            <div id="HistoryLog-div-advanced-search-buttons">
                                <button id="HistoryLog-button-search" onClick={handleAdvancedSearch}>Search</button>
                                <button id="HistoryLog-button-clear-search" onClick={handleClearAdvancedSearch}>Clear</button>
                            </div>
                        </div>
                        <div id="HistoryLog-advanced-search-inputs-container">
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-log-id">Log ID:</label>
                                <input id="HistoryLog-input-advanced-search-log-id" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-user">User:</label>
                                <input id="HistoryLog-input-advanced-search-user" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-target-type">Target Type:</label>
                                <input id="HistoryLog-input-advanced-search-target-type" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-target-id">Target ID:</label>
                                <input id="HistoryLog-input-advanced-search-target-id" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-action-type">Action Type:</label>
                                <input id="HistoryLog-input-advanced-search-action-type" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-action-details">Action Details:</label>
                                <input id="HistoryLog-input-advanced-search-action-details" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-date">Date:</label>
                                <input id="HistoryLog-input-advanced-search-date" type="date"/>
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-time">Time:</label>
                                <input id="HistoryLog-input-advanced-search-time" type="time"/>
                            </div>
                        </div>
                    </div>
                )}
                <div id="HistoryLog-table-container">
                    <table id="HistoryLog-table">
                        <tbody>
                            <tr id="HistoryLog-tr-header">
                                <th id="HistoryLog-th">Log ID</th>
                                <th id="HistoryLog-th">User</th>
                                <th id="HistoryLog-th">Target Type</th>
                                <th id="HistoryLog-th">Target ID</th>
                                <th id="HistoryLog-th">Action Type</th>
                                <th id="HistoryLog-th">Action Details</th>
                                <th id="HistoryLog-th">Date</th>
                                <th id="HistoryLog-th">Time</th>
                            </tr>
                            {data.map((log, i) => (
                                <tr id="HistoryLog-tr" key={i}>
                                    <td id="HistoryLog-td">{log.log_id}</td>
                                    <td id="HistoryLog-td">{log.user}</td>
                                    <td id="HistoryLog-td">{log.target_type}</td>
                                    <td id="HistoryLog-td">{log.target_id}</td>
                                    <td id="HistoryLog-td">{log.action_type}</td>
                                    <td id="HistoryLog-td">{log.log_action}</td>
                                    <td id="HistoryLog-td">{getReadableDate(log.log_time)}</td>
                                    <td id="HistoryLog-td">{getReadableTime(log.log_time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                    <h2>Are you sure you'd like to delete the history log?</h2>
                    <div id="Modal-div-buttons">
                        <button id="Modal-button-close" onClick={handleConfirmationModalClose}>Cancel</button>
                        <button id="Modal-button-confirm" onClick={handleDeleteHistory}>Delete</button>
                    </div>
                </Box>
            </Modal>
        </>
    )
}

export default HistoryLog