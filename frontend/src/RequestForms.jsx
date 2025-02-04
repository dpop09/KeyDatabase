import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function RequestForms() {

    // global state variables
    const { permissions, setRequestFormData } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    const [data, setData] = useState([]);
    const [imageData, setImageData] = useState(null);
    const [displayAdvancedSearch, setDisplayAdvancedSearch] = useState(false)

    const toggleDisplayAdvancedSearch = () => {
        setDisplayAdvancedSearch(!displayAdvancedSearch)
    }

    const navigate = useNavigate();
    const handleAddRequestForm = () => {
        navigate('/addrequestform');
    }

    const getImageData = async (form_id) => {
        if (imageData && imageData.form_id === form_id) 
            return; // Skip if the same image is already loaded
        try {
            const response = await fetch(`http://localhost:8081/get-key-request-form-image`, { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ form_id }),
            });
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setImageData(data.image_data);
            } else {
                console.log('Internal Server Error. Please try again later.'); // log an error message
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getAllRequestForms = async () => {
        try {
            const response = await fetch('http://localhost:8081/get-all-key-request-forms');
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getAllRequestForms();
    }, []);

    const handleSearch = async (event) => {
        event.preventDefault();
        const row = document.getElementById('RequestForms-input-search-row').value;
        if (!row) { // if the row is empty
            alert('Please enter a column and row to search.');
            return
        }
        try {
            const response = await fetch('http://localhost:8081/search-request-form', { // send a POST request to the backend route
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
                alert("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearSearch = async (event) => {
        event.preventDefault();
        document.getElementById('RequestForms-input-search-row').value = null
        getAllRequestForms();
    }

    const handleAdvancedSearch = async (event) => {
        event.preventDefault();
        const input_fname = document.getElementById('RequestForms-input-advanced-search-fname').value;
        const input_lname = document.getElementById('RequestForms-input-advanced-search-lname').value;
        const input_access_id = document.getElementById('RequestForms-input-advanced-search-access-id').value;
        const input_date_signed = document.getElementById('RequestForms-input-advanced-search-date-signed').value;
        const input_assigned_key = document.getElementById('RequestForms-input-advanced-search-assigned-key').value;
        // do nothing if none of the fields are filled
        if (!input_fname && !input_lname && !input_access_id && !input_date_signed && !input_assigned_key) {
            return
        }
        try {
            const response = await fetch('http://localhost:8081/advanced-search-request-form', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ input_fname, input_lname, input_access_id, input_date_signed, input_assigned_key })
            })
            const data = await response.json();
            if (data) { // if the response is successful
                setData(data);
            } else { // if the response is unsuccessful
                alert("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearAdvancedSearch = async (event) => {
        event.preventDefault();
        document.getElementById('RequestForms-input-advanced-search-fname').value = null
        document.getElementById('RequestForms-input-advanced-search-lname').value = null
        document.getElementById('RequestForms-input-advanced-search-access-id').value = null
        document.getElementById('RequestForms-input-advanced-search-date-signed').value = null
        document.getElementById('RequestForms-input-advanced-search-assigned-key').value = null
        getAllRequestForms();
    }

    const handleRowClick = (d) => {
        setRequestFormData(d);
        navigate('/editrequestform');
    }

    const getReadableDateSigned = (d) => {
        if (d.date_signed === '0000-00-00') {
            return
        }
        // Create a Date object from the ISO date string
        const date = new Date(d.date_signed);
    
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

    const getStatus = (d) => {
        const hasValidDate = d.date_signed && d.date_signed !== '0000-00-00';
        const hasAssignedKey = d.assigned_key_1 || d.assigned_key_2 || d.assigned_key_3 || d.assigned_key_4;
    
        if (!hasValidDate && !hasAssignedKey) {
            return "Pending"; // No valid signed date and no assigned keys
        } else if (hasValidDate && !hasAssignedKey) {
            return "Idle"; // Signed but no assigned keys
        } else if (hasValidDate && hasAssignedKey) {
            return "Active"; // Signed and at least one key assigned
        }
        return "Unknown"; // Fallback case
    };

    const getStatusColor = (d) => {
        const hasValidDate = d.date_signed && d.date_signed !== '0000-00-00';
        const hasAssignedKey = d.assigned_key_1 || d.assigned_key_2 || d.assigned_key_3 || d.assigned_key_4;
    
        if (!hasValidDate && !hasAssignedKey) {
            return "gold"; // Pending
        } else if (hasValidDate && !hasAssignedKey) {
            return "lightcoral"; // Idle
        } else if (hasValidDate && hasAssignedKey) {
            return "lightgreen"; // Active
        }
        return "grey"; // Default case
    };

    return (
        <>
            <NavBar />
            <div id="RequestForms-div-container">
                <div id="RequestForms-div-top-flex-box">
                    <div id="RequestForms-div-search-container">
                        <h2>General Search:</h2>
                        <input id="RequestForms-input-search-row" type="text" />
                        <button id="RequestForms-button-search" onClick={handleSearch}>Search</button>
                        <button id="RequestForms-button-clear-search" onClick={handleClearSearch}>Clear</button>
                    </div>
                    <div id="RequestForms-div-action-buttons">
                        <button id="RequestForms-button-advanced-search" onClick={toggleDisplayAdvancedSearch} />
                        <button id="RequestForms-button-add-form" onClick={handleAddRequestForm}/>
                    </div>
                </div>
                {displayAdvancedSearch && (
                    <div id="RequestForms-div-advanced-search">
                        <div id="RequestForms-div-advanced-search-top">
                            <h2>Advanced Search:</h2>
                            <div id="RequestForms-div-advanced-search-buttons">
                                <button id="RequestForms-button-search" onClick={handleAdvancedSearch}>Search</button>
                                <button id="RequestForms-button-clear-search" onClick={handleClearAdvancedSearch}>Clear</button>
                            </div>
                        </div>
                        <div id="RequestForms-div-advanced-search-inputs-container">
                            <div class="RequestForms-div-advanced-search-grid-item">
                                <label id="RequestForms-label-advanced-search">First Name:</label>
                                <input id="RequestForms-input-advanced-search-fname" />
                            </div>
                            <div class="RequestForms-div-advanced-search-grid-item">
                                <label id="RequestForms-label-advanced-search">Last Name:</label>
                                <input id="RequestForms-input-advanced-search-lname" />
                            </div>
                            <div class="RequestForms-div-advanced-search-grid-item">
                                <label id="RequestForms-label-advanced-search">Access Id:</label>
                                <input id="RequestForms-input-advanced-search-access-id" />
                            </div>
                            <div class="RequestForms-div-advanced-search-grid-item">
                                <label id="RequestForms-label-advanced-search">Date Signed:</label>
                                <input type="date" id="RequestForms-input-advanced-search-date-signed" />
                            </div>
                            <div class="RequestForms-div-advanced-search-grid-item">
                                <label id="RequestForms-label-advanced-search">Assigned Key:</label>
                                <input id="RequestForms-input-advanced-search-assigned-key" />
                            </div>
                        </div>
                    </div>
                )}
                <div id="RequestForms-div-flex-box">
                    <div id="RequestForms-div-table-container">
                        <table id="RequestForms-table">
                            <tbody>
                                <tr id="RequestForms-tr-header">
                                    <th id="RequestForms-th">Status</th>
                                    <th id="RequestForms-th">First Name</th>
                                    <th id="RequestForms-th">Last Name</th>
                                    <th id="RequestForms-th">Access ID</th>
                                    <th id="RequestForms-th">Date Signed</th>
                                    <th id="RequestForms-th">Assigned Key 1</th>
                                    <th id="RequestForms-th">Assigned Key 2</th>
                                    <th id="RequestForms-th">Assigned Key 3</th>
                                    <th id="RequestForms-th">Assigned Key 4</th>
                                </tr>
                                {data.map((d, i) => ( 
                                    <tr 
                                        id="RequestForms-tr"
                                        key={i} onMouseEnter={() => getImageData(d.form_id)} 
                                        onClick={() => handleRowClick(d)} 
                                    >
                                        <td id="RequestForms-td" style={{ backgroundColor: getStatusColor(d) }}>{getStatus(d)}</td>
                                        <td id="RequestForms-td">{d.first_name}</td>
                                        <td id="RequestForms-td">{d.last_name}</td>
                                        <td id="RequestForms-td">{d.access_id}</td>
                                        <td id="RequestForms-td">{getReadableDateSigned(d)}</td>
                                        <td id="RequestForms-td">{d.assigned_key_1}</td>
                                        <td id="RequestForms-td">{d.assigned_key_2}</td>
                                        <td id="RequestForms-td">{d.assigned_key_3}</td>
                                        <td id="RequestForms-td">{d.assigned_key_4}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div id="RequestForms-div-image-container">
                        {imageData ? (
                            <iframe id="RequestForms-iframe-key-request-form" src={imageData} alt="Key Request Form" />
                        ) : (
                            <h1 id="RequestForms-h1-no-request-form">No PDF associated with this form ID was found.</h1>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default RequestForms;