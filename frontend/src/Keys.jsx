import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Modal, Box } from '@mui/material';

function Home() {

    // global state variables
    const { permissions, setKeyData } = useContext(AuthContext)

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

    const [data, setData] = useState([]);
    const [displayAdvancedSearch, setDisplayAdvancedSearch] = useState(false)

    // modal handlers
    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);

    const toggleDisplayAdvancedSearch = () => {
        setDisplayAdvancedSearch(!displayAdvancedSearch)
    }

    const navigate = useNavigate();
    const handleCreateKey = () => {
        navigate('/createkey');
    }

    const getAllKeys = async () => {
        try {
            const response = await fetch('http://localhost:8081/getall');
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getAllKeys();
    }, []);

    const handleSearch = async () => {
        const row = document.getElementById('Keys-input-search-row').value;
        if (!row) {
            return
        }
        try {
            const response = await fetch('http://localhost:8081/search-key', { // send a POST request to the backend route
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
        document.getElementById('Keys-input-search-row').value = null
        getAllKeys();
    }

    const handleAdvancedSearch = async () => {
        const input_tag_num = document.getElementById('Keys-input-advanced-search-tag-num').value
        const input_core = document.getElementById('Keys-input-advanced-search-core').value
        const input_room_num = document.getElementById('Keys-input-advanced-search-room-num').value
        const input_room_type = document.getElementById('Keys-input-advanced-search-room-type').value
        const input_key_num = document.getElementById('Keys-input-advanced-search-key-num').value
        const input_availability = document.getElementById('Keys-input-advanced-search-availability').value
        const input_fname = document.getElementById('Keys-input-advanced-search-fname').value
        const input_lname = document.getElementById('Keys-input-advanced-search-lname').value
        const input_access_id = document.getElementById('Keys-input-advanced-search-access-id').value
        const input_date_assigned = document.getElementById('Keys-input-advanced-search-date-assigned').value
        // do nothing if all of the inputs are empty
        if (input_tag_num && 
            input_core && 
            input_room_num && 
            input_room_type && 
            input_key_num && 
            input_availability && 
            input_fname && 
            input_lname && 
            input_access_id && 
            input_date_assigned) {
            return
        }
        try {
            const response = await fetch('http://localhost:8081/advanced-search-key', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ 
                    input_tag_num, 
                    input_core, 
                    input_room_num, 
                    input_room_type,
                    input_key_num, 
                    input_availability, 
                    input_fname, 
                    input_lname,
                    input_access_id, 
                    input_date_assigned 
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
        document.getElementById('Keys-input-advanced-search-tag-num').value = null
        document.getElementById('Keys-input-advanced-search-core').value = null
        document.getElementById('Keys-input-advanced-search-room-num').value = null
        document.getElementById('Keys-input-advanced-search-room-type').value = null
        document.getElementById('Keys-input-advanced-search-key-num').value = null
        document.getElementById('Keys-input-advanced-search-availability').value = null
        document.getElementById('Keys-input-advanced-search-fname').value = null
        document.getElementById('Keys-input-advanced-search-lname').value = null
        document.getElementById('Keys-input-advanced-search-access-id').value = null
        document.getElementById('Keys-input-advanced-search-date-assigned').value = null
        getAllKeys();
    }

    const handleDownloadKeys = async () => {
        try {
            const response = await fetch('http://localhost:8081/download-keys');
            const result = await response.text(); // read the response as text
            if (result === 'true') {
                setErrorMessage('Keys were successfully copied to a text file in the project directory in filedrop.')
            } else {
                setErrorMessage('Failed to copy keys to a text file. Please try again later.');
            }
            handleModalShow();
        } catch (error) {
            console.log(error);
        }
    }

    const handleRowClick = (d) => {
        setKeyData(d);
        navigate('/keyinfo');
    }

    const getReadableDateAssigned = (d) => {
        if (d.date_assigned === '0000-00-00' || d.date_assigned === '1969-12-31' || d.date_assigned === null) {
            return
        }
        // Create a Date object from the ISO date string
        const date = new Date(d.date_assigned);
    
        const options = { month: 'short' }; // Get the short month name (e.g., Oct)
        const day = date.getDate();
        const year = date.getFullYear();
    
        // Get the correct ordinal suffix (st, nd, rd, th) for the day
        const getOrdinal = (n) => {
            if (n > 3 && n < 21) return 'th'; // Covers 4th-20th
            switch (n % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
    
        const dayWithOrdinal = `${day}${getOrdinal(day)}`;
        const month = new Intl.DateTimeFormat('en-US', options).format(date);
    
        return `${month} ${dayWithOrdinal}, ${year}`;
    }

    // Helper function to compute contrast color from any CSS color string
    const getContrastColor = (d) => {
        if (d.tag_color === null) return 'black';
    
        // Create a temporary element to convert the color string to an RGB value
        const tempElem = document.createElement('div');
        tempElem.style.color = d.tag_color;
        document.body.appendChild(tempElem);
    
        // Get the computed color in rgb(a) format (e.g., "rgb(255, 165, 0)")
        const computedColor = window.getComputedStyle(tempElem).color;
        document.body.removeChild(tempElem);
    
        // Extract the r, g, b values
        const rgbValues = computedColor.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return 'black';
    
        const r = parseInt(rgbValues[0], 10);
        const g = parseInt(rgbValues[1], 10);
        const b = parseInt(rgbValues[2], 10);
    
        // Calculate the luminance using the ITU-R BT.709 formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
        // If luminance is high, return black; otherwise return white.
        return luminance > 0.5 ? 'black' : 'white';
    }

    return (
        <>
            <NavBar />
            <div id="Keys-div-container">
                <div id="Keys-div-top-flex-box">
                    <div id="Keys-div-search-container">
                        <h2>General Search:</h2>
                        <input id="Keys-input-search-row" type="text" placeholder="Search..." onChange={handleSearch}/>
                        <button id="Keys-button-clear-search" onClick={handleClearSearch}>Clear</button>
                    </div>
                    <div id="Keys-div-action-buttons">
                        <button id="Keys-button-download" onClick={handleDownloadKeys} />
                        <button id="Keys-button-advanced-search" onClick={toggleDisplayAdvancedSearch} />
                        <button id="Keys-button-create-key" onClick={handleCreateKey} />
                    </div>
                </div>
                {displayAdvancedSearch && (
                    <div id="Keys-div-advanced-search">
                        <div id="Keys-div-advanced-search-top">
                            <h2>Advanced Search:</h2>
                            <div id="Keys-div-advanced-search-buttons">
                                <button id="Keys-button-search" onClick={handleAdvancedSearch}>Search</button>
                                <button id="Keys-button-clear-search" onClick={handleClearAdvancedSearch}>Clear</button>
                            </div>
                        </div>
                        <div id="Keys-div-advanced-search-inputs-container">
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-tag-num">Tag Number:</label>
                                <input id="Keys-input-advanced-search-tag-num" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-core">Core:</label>
                                <input id="Keys-input-advanced-search-core" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-room-num">Room Number:</label>
                                <input id="Keys-input-advanced-search-room-num" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-room-type">Room Type:</label>
                                <input id="Keys-input-advanced-search-room-type" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-key-num">Key Number:</label>
                                <input id="Keys-input-advanced-search-key-num" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-availability">Availability:</label>
                                <select id="Keys-input-advanced-search-availability">
                                    <option value=""></option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-fname">First Name:</label>
                                <input id="Keys-input-advanced-search-fname" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-lname">Last Name:</label>
                                <input id="Keys-input-advanced-search-lname" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-access-id">Access ID:</label>
                                <input id="Keys-input-advanced-search-access-id" />
                            </div>
                            <div class="advanced-search-grid-item">
                                <label for="Keys-input-advanced-search-date-assigned">Date Assigned:</label>
                                <input type="date" id="Keys-input-advanced-search-date-assigned" />
                            </div>
                        </div>
                  </div>                               
                )}
                <div id="Keys-table-container">
                    <table id="Keys-table">
                        <tbody>
                            <tr id="Keys-tr-header">
                                <th id="Keys-th">Tag Number</th>
                                <th id="Keys-th">Core</th>
                                <th id="Keys-th">Room Number</th>
                                <th id="Keys-th">Room Type</th>
                                <th id="Keys-th">Key Number</th>
                                <th id="Keys-th">Avaliable</th>
                                <th id="Keys-th">First Name</th>
                                <th id="Keys-th">Last Name</th>
                                <th id="Keys-th">Access ID</th>
                                <th id="Keys-th">Date Assigned</th>
                                <th id="Keys-th">Comments</th>
                            </tr>
                            {data.map((d, i) => ( // Maps over the data array to create a table row (<tr>) for each item d in data. The index i is used as a unique key for each row.
                                <tr id="Keys-tr" key={i} onClick={() => handleRowClick(d)}>
                                    <td 
                                        id="Keys-td"
                                        style={{ 
                                            backgroundColor: d.tag_color || 'transparent', // Set background color or default to transparent
                                            color: getContrastColor(d) // Dynamically set text color for contrast
                                        }}
                                    >{d.tag_number}
                                    </td>
                                    <td id="Keys-td">{d.core_number}</td>
                                    <td id="Keys-td">{d.room_number}</td>
                                    <td id="Keys-td">{d.room_type}</td>
                                    <td id="Keys-td">{d.key_number}</td>
                                    <td 
                                        id="Keys-td"
                                        style={{ backgroundColor: d.key_holder_fname && d.key_holder_lname && d.key_holder_access_id && d.date_assigned ? 'lightcoral' : 'lightgreen' }}
                                    >
                                        {d.key_holder_fname && d.key_holder_lname && d.key_holder_access_id && d.date_assigned ? 'No' : 'Yes'}
                                    </td>
                                    <td id="Keys-td">{d.key_holder_fname}</td>
                                    <td id="Keys-td">{d.key_holder_lname}</td>         
                                    <td id="Keys-td">{d.key_holder_access_id}</td>       
                                    <td id="Keys-td">{getReadableDateAssigned(d)}</td>
                                    <td id="Keys-td">{d.comments}</td>
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
        </>
    )
}

export default Home;