import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Modal, Box } from '@mui/material';

function EditKey() {

    // global state variables
    const { accessId, permissions, keyData, setKeyData } = useContext(AuthContext);

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
    const [showEmailModal, setShowEmailModal] = useState(false);

    const [requestForms, setRequestForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [pdfData, setPdfData] = useState(null);
    const [recipientAccessId, setRecipientAccessId] = useState(null)
    const [dateAssigned, setDateAssigned] = useState(() => {
        const rawDate = keyData.date_assigned;
        if (rawDate && rawDate !== "0000-00-00" && !isNaN(new Date(rawDate).getTime())) { // if there is a date_assigned provided
            return new Date(rawDate).toISOString().split('T')[0]; // set the useState to a string version of it
        }
        return ''; // else make the useState an empty string
    });

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
    const handleEmailModalClose = () => {
        setShowEmailModal(false);
        navigate('/keyinfo')
    }
    const handleEmailModalShow = () => setShowEmailModal(true);

    const navigate = useNavigate();
    const handleCancel = () => {
        navigate('/keyinfo');
    }

    const getKeyRequestForms = async () => {
        fetch('http://localhost:8081/get-all-key-request-forms')
        .then(response => response.json())
        .then(data => setRequestForms(data))
        .catch(err => console.log(err));
    }

    useEffect(() => {
        getKeyRequestForms();
    }, [])

    useEffect(() => {
        const rawDate = keyData.date_assigned;
        if (rawDate && rawDate !== "0000-00-00" && !isNaN(new Date(rawDate).getTime())) {
            setDateAssigned(new Date(rawDate).toISOString().split('T')[0]);
        } else {
            setDateAssigned('');
        }
    }, [keyData.date_assigned]);

    const handleSelectForm = (form) => {
        if (selectedForm === form) { // if the form is already selected
            setSelectedForm(null); // deselect the form
            return;
        }
        setSelectedForm(form); // else select the form
    }

    const getPdfData = async (form_id) => {
        if (selectedForm != null) // if a form is already selected, do nothing
            return;
        if (pdfData && pdfData.form_id === form_id) 
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
                setPdfData(data.image_data);
            } else {
                console.log('Internal Server Error. Please try again later.'); // log an error message
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Helper function to check if a date is valid
    const isValidDate = (date) => {
        const parsed = new Date(date);
        return date && date !== "0000-00-00" && !isNaN(parsed.getTime());
    };

    const handleSubmitEdit = async (event) => {
        event.preventDefault();
        const tag_number = (document.getElementById('EditKey-input-tag_number').value) ? 
                            {value: document.getElementById('EditKey-input-tag_number').value.trim(), edit_flag: true} : 
                            {value: document.getElementById('EditKey-input-tag_number').placeholder, edit_flag: false};
        const tag_color = (document.getElementById('EditKey-input-tag_color').value) ?
                            {value: document.getElementById('EditKey-input-tag_color').value.trim(), edit_flag: true} :
                            {value: document.getElementById('EditKey-input-tag_color').placeholder, edit_flag: false};
        const core_number = (document.getElementById('EditKey-input-core_number').value) ?
                            {value: document.getElementById('EditKey-input-core_number').value.trim(), edit_flag: true} :
                            {value: document.getElementById('EditKey-input-core_number').placeholder, edit_flag: false};
        const room_number = (document.getElementById('EditKey-input-room_number').value) ? 
                            {value: document.getElementById('EditKey-input-room_number').value.trim(), edit_flag: true} :
                            {value: document.getElementById('EditKey-input-room_number').placeholder, edit_flag: false};
        const room_type = (document.getElementById('EditKey-input-room_type').value) ?
                            {value: document.getElementById('EditKey-input-room_type').value.trim(), edit_flag: true} :
                            {value: document.getElementById('EditKey-input-room_type').placeholder, edit_flag: false};
        const key_number = (document.getElementById('EditKey-input-key_number').value) ?
                            {value: document.getElementById('EditKey-input-key_number').value.trim(), edit_flag: true} :
                            {value: document.getElementById('EditKey-input-key_number').placeholder, edit_flag: false};
        const key_holder_fname = (document.getElementById('EditKey-input-key_holder_fname').value) ?
                            {value: document.getElementById('EditKey-input-key_holder_fname').value, edit_flag: true} :
                            {value: document.getElementById('EditKey-input-key_holder_fname').placeholder, edit_flag: false};
        const key_holder_lname = (document.getElementById('EditKey-input-key_holder_lname').value) ?
                            {value: document.getElementById('EditKey-input-key_holder_lname').value, edit_flag: true} :
                            {value: document.getElementById('EditKey-input-key_holder_lname').placeholder, edit_flag: false};
        const key_holder_access_id = (document.getElementById('EditKey-input-key_holder_access_id').value) ?
                            {value: document.getElementById('EditKey-input-key_holder_access_id').value, edit_flag: true} :
                            {value: document.getElementById('EditKey-input-key_holder_access_id').placeholder, edit_flag: false};
        const inputDateValue = document.getElementById('EditKey-input-date_assigned').value;
        // Get the default date string if keyData.date_assigned is valid, or empty string otherwise
        const defaultDate = isValidDate(keyData.date_assigned)
            ? new Date(keyData.date_assigned).toISOString().split('T')[0]
            : '';
        const date_assigned = (inputDateValue !== defaultDate) ?
                            {value: inputDateValue, edit_flag: true} :
                            {value: keyData.date_assigned, edit_flag: false};
        const comments = (document.getElementById('EditKey-textarea-comments').value) ?
                            {value: document.getElementById('EditKey-textarea-comments').value, edit_flag: true} :
                            {value: document.getElementById('EditKey-textarea-comments').placeholder, edit_flag: false};
        const request_form = {assigned_column: (document.querySelector('input[name="assignedKey"]:checked')) ? (document.querySelector('input[name="assignedKey"]:checked')).value : null,
                            old_form_id: (keyData.form_id != null) ? keyData.form_id : null,
                            new_form_id: (selectedForm != null) ? selectedForm.form_id : null};
        if (!tag_number.value || !tag_color.value || !core_number.value || !room_number.value || !room_type.value || !key_number.value ) { // check if any of the core key fields are empty
            setErrorMessage("Please fill out all required fields.");
            handleModalShow();
            return
        }
        if (selectedForm != null && request_form.assigned_column == null) { // if a form is selected and the assigned key is not selected, show an alert
            setErrorMessage("Please select a column this key should be assigned to.");
            handleModalShow();
            return
        }
        // check if no edits were made
        if (!tag_number.edit_flag && !tag_color.edit_flag && !core_number.edit_flag && !room_number.edit_flag && 
            !room_type.edit_flag && !key_number.edit_flag && !key_holder_fname.edit_flag && !key_holder_lname.edit_flag &&
            !key_holder_access_id.edit_flag && !date_assigned.edit_flag && !comments.edit_flag && request_form.new_form_id === null) {
            setErrorMessage("No edits have been made.");
            handleModalShow();
            return   
        }
        try {
            const response = await fetch('http://localhost:8081/edit-key', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    access_id: accessId,
                    tag_number,
                    tag_color,
                    core_number,
                    room_number,
                    room_type,
                    key_number,
                    key_holder_fname,
                    key_holder_lname,
                    key_holder_access_id,
                    date_assigned,
                    comments,
                    request_form
                })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setKeyData(data); // update the key data before navigating to the key info page
                const email_flag = checkToSendKeyPickupEmail(key_holder_access_id.value, key_holder_fname.value, key_holder_lname.value, date_assigned.value);
                if (!email_flag) { // if conditions don't meet to send an email, then we navigate back to the keyinfo page
                    navigate('/keyinfo');
                }
            } else { // if the response is unsuccessful
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRemoveHolder = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/remove-key-holder', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ 
                    access_id: accessId,
                    key_number: keyData.key_number,
                    form_id: keyData.form_id != null ? keyData.form_id : null // if there is a form associated with the key, send its form_id, else send null
                })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setKeyData(data); // update the key data before navigating to the key info page
                navigate('/keyinfo');
            } else { // if the response is unsuccessful
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteKey = async () => {
        try {
            const response = await fetch('http://localhost:8081/delete-key', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ 
                    access_id: accessId, 
                    key_number: keyData.key_number, 
                    form_id: keyData.form_id != null ? keyData.form_id : null 
                })
            })
            if (response.ok) { // if the response is successful
                handleConfirmationModalClose();
                navigate('/keys');
            } else { // if the response is unsuccessful
                handleConfirmationModalClose();
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearchForm = async (event) => {
        event.preventDefault();
        const row = document.getElementById('EditKey-input-assign-form-search').value;
        if (!row) {
            return
        }
        try {
            const response = await fetch('http://localhost:8081/search-request-form', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ row })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setRequestForms(data);
            } else { // if the response is unsuccessful
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearSearch = async (event) => {
        event.preventDefault();
        document.getElementById('EditKey-input-assign-form-search').value = null
        getKeyRequestForms();
    }

    const getInfoFromAccessId = async () => {
        const input_access_id = document.getElementById('EditKey-input-key_holder_access_id').value
        // regular expression to match exactly 2 letters followed by 4 digits
        const regex = /^[A-Za-z]{2}\d{4}$/;
        // check if input_access_id matches the pattern
        if (!regex.test(input_access_id)) {
            // clear the inputs if the input access id doesn't follow format
            document.getElementById('EditKey-input-key_holder_fname').value = null;
            document.getElementById('EditKey-input-key_holder_lname').value = null;
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
                document.getElementById('EditKey-input-key_holder_fname').value = data.first_name;
                document.getElementById('EditKey-input-key_holder_lname').value = data.last_name;
            } else { // if the response is unsuccessful
                console.log("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
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
        } else if (!hasValidDate && hasAssignedKey) { 
            return "Awaitng Signature"; // has at least one key assigned but is not signed
        }
        return "Unknown"; // Fallback case
    };

    const getStatusColor = (d) => {
        const hasValidDate = d.date_signed && d.date_signed !== '0000-00-00';
        const hasAssignedKey = d.assigned_key_1 || d.assigned_key_2 || d.assigned_key_3 || d.assigned_key_4;
    
        if (!hasValidDate && !hasAssignedKey) {
            return "orange"; // Pending
        } else if (hasValidDate && !hasAssignedKey) {
            return "lightcoral"; // Idle
        } else if (hasValidDate && hasAssignedKey) {
            return "lightgreen"; // Active
        } else if (!hasValidDate && hasAssignedKey) { // has at least one key assigned but is not signed
            return "gold"; // awaiting signature
        }
        return "grey"; // Default case
    };

    const checkToSendKeyPickupEmail = (access_id, first_name, last_name, date_assigned) => {
        if (selectedForm == null || !access_id || !first_name || !last_name || !date_assigned) {
            return false;
        }
        if (selectedForm.date_signed === '0000-00-00' && 
            selectedForm.access_id === access_id && 
            selectedForm.first_name === first_name && 
            selectedForm.last_name === last_name) {
            setRecipientAccessId(access_id);
            handleEmailModalShow();
            return true
        }
        return false
    }

    const handleSendKeyPickupEmail = async (access_id) => {
        if (recipientAccessId === null) {
            return;
        }
        try {
            const response = await fetch('http://localhost:8081/send-email', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ access_id : recipientAccessId })
            })
            if (response.ok) { // if the response is successful
                handleEmailModalClose();
                navigate('/keyinfo')
            } else { // if the response is unsuccessful
                setErrorMessage("Internal Server Error. Please try again later.");
                handleModalShow();
            }
        } catch (error) {
            setErrorMessage("Internal Server Error. Please try again later.");
            handleModalShow();
        }
    }

    return (
        <>
            <NavBar />
            <div id="EditKey-div-container">
                <div id="EditKey-div-top-container">
                    <div id="EditKey-div-form-container">
                        <div id="EditKey-div-row-flex-box-title">
                            <h2>EDIT KEY INFO</h2>
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>*Tag Number:</h3>
                            <input 
                                type="text" 
                                id="EditKey-input-tag_number" 
                                placeholder={keyData.tag_number} 
                                disabled={permissions !== "Admin"} 
                                className={permissions === "Admin" ? "admin-input" : "non-admin-input"}
                            />
                        </div>
                        <div id ="EditKey-div-row-flex-box-even">
                            <h3>*Tag Color:</h3>
                            <input 
                                type="text" 
                                id="EditKey-input-tag_color" 
                                placeholder={keyData.tag_color} 
                                disabled={permissions !== "Admin"} 
                                className={permissions === "Admin" ? "admin-input" : "non-admin-input"}
                            />
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>*Core Number:</h3>
                            <input 
                                type="text" 
                                id="EditKey-input-core_number" 
                                placeholder={keyData.core_number} 
                                disabled={permissions !== "Admin"} 
                                className={permissions === "Admin" ? "admin-input" : "non-admin-input"}
                            />
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>*Room Number:</h3>
                            <input 
                                type="text" 
                                id="EditKey-input-room_number" 
                                placeholder={keyData.room_number} 
                                disabled={permissions !== "Admin"} 
                                className={permissions === "Admin" ? "admin-input" : "non-admin-input"}
                            />
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>*Room Type:</h3>
                            <input 
                                type="text" 
                                id="EditKey-input-room_type" 
                                placeholder={keyData.room_type} 
                                disabled={permissions !== "Admin"} 
                                className={permissions === "Admin" ? "admin-input" : "non-admin-input"}
                            />
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>*Key Number:</h3>
                            <input 
                                type="text" 
                                id="EditKey-input-key_number" 
                                placeholder={keyData.key_number} 
                                disabled={true} 
                                className={"non-admin-input"}
                            />
                        </div>
                    </div>
                    <div id="EditKey-div-form-container-2">
                        <div id="EditKey-div-row-flex-box-title">
                            <h2>EDIT KEY HOLDER</h2>
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Access ID:</h3>
                            <input type="text" id="EditKey-input-key_holder_access_id" placeholder={keyData.key_holder_access_id} onChange={getInfoFromAccessId}/>
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>First Name:</h3>
                            <input type="text" id="EditKey-input-key_holder_fname" placeholder={keyData.key_holder_fname} />
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Last Name:</h3>
                            <input type="text" id="EditKey-input-key_holder_lname" placeholder={keyData.key_holder_lname} />
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>Date Assigned:</h3>
                            <input
                                type="date"
                                id="EditKey-input-date_assigned"
                                value={dateAssigned}
                                onChange={(e) => setDateAssigned(e.target.value)}
                            />
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Comments:</h3>
                            <textarea id="EditKey-textarea-comments" rows="5" cols="5" placeholder={keyData.comments} />
                        </div>
                    </div>
                </div>
                <div id="EditKey-div-assign-form-container">
                    <div id="EditKey-div-assign-form-title">
                        <h2>ASSIGN REQUEST FORM TO KEY</h2>
                    </div>
                    <div id="EditKey-div-assgin-form-lower-container">
                        <div id="EditKey-div-assign-form-table-container">
                            <div id="EditKey-div-assign-form-search">
                                <h3>Search:</h3>
                                <input type="text" id="EditKey-input-assign-form-search" placeholder="Search..." onChange={handleSearchForm} />
                                <div id="EditKey-div-search-buttons">
                                    <button id="EditKey-button-assign-form-clear-search" onClick={handleClearSearch}>Clear</button>
                                </div>
                            </div>
                            <div id="EditKey-div-table-container">
                                <table id="EditKey-table">
                                    <tbody>
                                        <tr id="EditKey-tr-header">
                                            <th id="EditKey-th">Status</th>
                                            <th id="EditKey-th">First Name</th>
                                            <th id="EditKey-th">Last Name</th>
                                            <th id="EditKey-th">Access ID</th>
                                            <th id="EditKey-th">Date Signed</th>
                                            <th id="EditKey-th">Assigned Key 1</th>
                                            <th id="EditKey-th">Assigned Key 2</th>
                                            <th id="EditKey-th">Assigned Key 3</th>
                                            <th id="EditKey-th">Assigned Key 4</th>
                                        </tr>
                                        {requestForms.map((d, i) => ( 
                                            <tr
                                                id="EditKey-tr" 
                                                key={i} 
                                                onMouseOver={() => getPdfData(d.form_id)} 
                                                onClick={() => handleSelectForm(d)}
                                                className={selectedForm && selectedForm.form_id === d.form_id ? 'selected-form' : ''}
                                            >
                                                <td id="EditKey-td" style={{ backgroundColor: getStatusColor(d) }}>{getStatus(d)}</td>
                                                <td id="EditKey-td">{d.first_name}</td>
                                                <td id="EditKey-td">{d.last_name}</td>
                                                <td id="EditKey-td">{d.access_id}</td>
                                                <td id="EditKey-td">{getReadableDateSigned(d)}</td>
                                                <td id="EditKey-td">{d.assigned_key_1}</td>
                                                <td id="EditKey-td">{d.assigned_key_2}</td>
                                                <td id="EditKey-td">{d.assigned_key_3}</td>
                                                <td id="EditKey-td">{d.assigned_key_4}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div id="EditKey-div-selected-form-container">
                                <div id="EditKey-div-assign-form-title">
                                    <h2>SELECTED FORM</h2>
                                </div>
                                {selectedForm ? (
                                    <>
                                        <div id="EditKey-div-selected-form-row-even">
                                            <h3>First Name:</h3>
                                            <h3>{selectedForm.first_name}</h3>
                                        </div>
                                        <div id="EditKey-div-selected-form-row">
                                            <h3>Last Name:</h3>
                                            <h3>{selectedForm.last_name}</h3>
                                        </div>
                                        <div id="EditKey-div-selected-form-row-even">
                                            <h3>Access ID:</h3>
                                            <h3>{selectedForm.access_id}</h3>
                                        </div>
                                        <div id="EditKey-div-selected-form-row">
                                            <h3>Date Signed:</h3>
                                            <h3>{getReadableDateSigned(selectedForm)}</h3>
                                        </div>
                                        <div id="EditKey-div-selected-form-row-even">    
                                            <h3>Assigned Key 1:</h3>
                                            <h3>{selectedForm.assigned_key_1}</h3>
                                        </div>
                                        <div id="EditKey-div-selected-form-row">    
                                            <h3>Assigned Key 2:</h3>
                                            <h3>{selectedForm.assigned_key_2}</h3>
                                        </div>
                                        <div id="EditKey-div-selected-form-row-even">    
                                            <h3>Assigned Key 3:</h3>
                                            <h3>{selectedForm.assigned_key_3}</h3>
                                        </div>
                                        <div id="EditKey-div-selected-form-row-bottom">    
                                            <h3>Assigned Key 4:</h3>
                                            <h3>{selectedForm.assigned_key_4}</h3>
                                        </div>
                                        <div>
                                            <h2>Select which column key {keyData.key_number} should be assigned to:</h2>
                                            <form id="EditKey-form-assigned-key">
                                                <label>
                                                    <input type="radio" name="assignedKey" value="assigned_key_1" />
                                                    Assigned Key 1
                                                </label>
                                                <label>
                                                    <input type="radio" name="assignedKey" value="assigned_key_2" />
                                                    Assigned Key 2
                                                </label>
                                                <label>
                                                    <input type="radio" name="assignedKey" value="assigned_key_3" />
                                                    Assigned Key 3
                                                </label>
                                                <label>
                                                    <input type="radio" name="assignedKey" value="assigned_key_4" />
                                                    Assigned Key 4
                                                </label>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <h3>Click on a form to select it.</h3>
                                )}
                            </div>
                        </div>
                        <div id="EditKey-div-request-form-container">
                            {pdfData ? (
                                <iframe id="EditKey-iframe-key-request-form" src={pdfData} alt="Key Request Form" />
                            ) : (
                                <h1 id="EditKey-h1-no-request-form">Assign a request form to this key.</h1>
                            )}
                        </div>
                    </div>
                </div>
                <div id="EditKey-div-quick-actions-container">
                    <div id="EditKey-div-quick-actions-title">
                        <h2>QUICK ACTIONS</h2>
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <h3>Remove Holder:</h3>
                        <button id="EditKey-button-remove-holder" onClick={handleRemoveHolder}>Remove Holder</button>
                    </div>
                    <div id="EditKey-div-row-flex-box-even">
                        <h3>Delete Key:</h3>
                        <button id="EditKey-button-remove-key" onClick={handleConfirmationModalShow}>Delete Key</button>
                    </div>
                </div>
                <div id="EditKey-div-button-container">
                    <button id="EditKey-button-cancel" onClick={handleCancel}>Cancel</button>
                    <button id="EditKey-button-submit" onClick={handleSubmitEdit}>Submit</button>
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
                    <h2>Are you sure you'd like to delete key {keyData.key_number}?</h2>
                    <div id="Modal-div-buttons">
                        <button id="Modal-button-close" onClick={handleConfirmationModalClose}>Cancel</button>
                        <button id="Modal-button-confirm" onClick={handleDeleteKey}>Delete</button>
                    </div>
                </Box>
            </Modal>
            <Modal open={showEmailModal} onClose={handleEmailModalClose}>
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
                    <p>The system has detected that this person is awaiting a key and it is ready for pickup. Would you like to send a notification email?</p>
                    <div id="Modal-div-buttons">
                        <button id="Modal-button-close" onClick={handleEmailModalClose}>No</button>
                        <button id="Modal-button-send" onClick={handleSendKeyPickupEmail}>Send</button>
                    </div>
                </Box>
            </Modal>
        </> 
    )  
}

export default EditKey