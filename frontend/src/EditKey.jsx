import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function EditKey() {

    // global state variables
    const { permissions, keyData, setKeyData } = useContext(AuthContext);

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    const [requestForms, setRequestForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [pdfData, setPdfData] = useState(null);

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
    }, []);

    const handleSelectForm = (form) => {
        if (selectedForm === form) { // if the form is already selected
            setSelectedForm(null); // deselect the form
            return;
        }
        setSelectedForm(form); // else select the form
    }

    const displayDateAssigned = keyData.date_assigned 
        ? new Date(keyData.date_assigned).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }) 
        : "";

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

    const handleSubmitEdit = async (event) => {
        event.preventDefault();
        const tag_number = document.getElementById('EditKey-input-tag_number').value || document.getElementById('EditKey-input-tag_number').placeholder;
        const tag_color = document.getElementById('EditKey-input-tag_color').value || document.getElementById('EditKey-input-tag_color').placeholder;
        const core_number = document.getElementById('EditKey-input-core_number').value || document.getElementById('EditKey-input-core_number').placeholder;
        const room_number = document.getElementById('EditKey-input-room_number').value || document.getElementById('EditKey-input-room_number').placeholder;
        const room_type = document.getElementById('EditKey-input-room_type').value || document.getElementById('EditKey-input-room_type').placeholder;
        const key_number = document.getElementById('EditKey-input-key_number').value || document.getElementById('EditKey-input-key_number').placeholder;
        const key_holder_fname = document.getElementById('EditKey-input-key_holder_fname').value || document.getElementById('EditKey-input-key_holder_fname').placeholder;
        const key_holder_lname = document.getElementById('EditKey-input-key_holder_lname').value || document.getElementById('EditKey-input-key_holder_lname').placeholder;
        const key_holder_access_id = document.getElementById('EditKey-input-key_holder_access_id').value || document.getElementById('EditKey-input-key_holder_access_id').placeholder;
        const date_assigned = document.getElementById('EditKey-input-date_assigned').value || document.getElementById('EditKey-input-date_assigned').placeholder;
        const comments = document.getElementById('EditKey-textarea-comments').value || document.getElementById('EditKey-textarea-comments').placeholder;
        // get value of the selected radio button
        const assigned_key_value = document.querySelector('input[name="assignedKey"]:checked');
        const assigned_key = assigned_key_value ? assigned_key_value.value : null;
        if (!tag_number || !tag_color || !core_number || !room_number || !room_type || !key_number ) { // check if any of the core key fields are empty
            alert("Please fill out all required fields.");
            return
        }
        if (selectedForm != null && assigned_key == null) { // if a form is selected and the assigned key is not selected, show an alert
            alert("Please select an assigned key.");
            return
        }
        try {
            const response = await fetch('http://localhost:8081/edit-key', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    tag_number: tag_number,
                    tag_color: tag_color,
                    core_number: core_number,
                    room_number: room_number,
                    room_type: room_type,
                    key_number: key_number,
                    key_holder_fname: key_holder_fname,
                    key_holder_lname: key_holder_lname,
                    key_holder_access_id: key_holder_access_id,
                    date_assigned: date_assigned,
                    comments: comments,
                    old_form_id: keyData.form_id != null ? keyData.form_id : null, // if there is a form already associated with the key, send its form_id, else send null
                    new_form_id: selectedForm != null ? selectedForm.form_id : null, // if a form is selected, send its form_id, else send null
                    assigned_key: assigned_key
                })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setKeyData(data); // update the key data before navigating to the key info page
                navigate('/keyinfo');
            } else { // if the response is unsuccessful
                console.log("Internal Server Error. Please try again later.");
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
                    key_number: keyData.key_number,
                    form_id: keyData.form_id != null ? keyData.form_id : null // if there is a form associated with the key, send its form_id, else send null
                })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setKeyData(data); // update the key data before navigating to the key info page
                navigate('/keyinfo');
            } else { // if the response is unsuccessful
                console.log("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteKey = async (event) => {
        if (permissions !== "Admin") {
            alert("This action can only be performed by an admin.");
            return
        }
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/delete-key', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ key_number: keyData.key_number, form_id: keyData.form_id != null ? keyData.form_id : null })
            })
            if (response.ok) { // if the response is successful
                navigate('/keys');
            } else { // if the response is unsuccessful
                console.log("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearchForm = async (event) => {
        event.preventDefault();
        const column = document.getElementById('EditKey-select-assign-form-search').value;
        const row = document.getElementById('EditKey-input-assign-form-search').value;
        if (!column || !row) {
            alert("Please fill out all required fields.");
            return
        }
        try {
            const response = await fetch('http://localhost:8081/search-request-form', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ column, row })
            })
            if (response.ok) { // if the response is successful
                const data = await response.json();
                setRequestForms(data);
            } else { // if the response is unsuccessful
                console.log("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearSearch = async (event) => {
        event.preventDefault();
        getKeyRequestForms();
    }

    const getReadableDateSigned = (d) => {
        if (!d.date_signed) {
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
                                disabled={permissions !== "Admin"} 
                                className={permissions === "Admin" ? "admin-input" : "non-admin-input"}
                            />
                        </div>
                    </div>
                    <div id="EditKey-div-form-container">
                        <div id="EditKey-div-row-flex-box-title">
                            <h2>EDIT KEY HOLDER</h2>
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Key Holder's First Name:</h3>
                            <input type="text" id="EditKey-input-key_holder_fname" placeholder={keyData.key_holder_fname} />
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>Key Holder's Last Name:</h3>
                            <input type="text" id="EditKey-input-key_holder_lname" placeholder={keyData.key_holder_lname} />
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Key Holder's Access ID:</h3>
                            <input type="text" id="EditKey-input-key_holder_access_id" placeholder={keyData.key_holder_access_id} />
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>Date Assigned:</h3>
                            <input type="text" id="EditKey-input-date_assigned" placeholder={displayDateAssigned} />
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Comments:</h3>
                            <textarea id="EditKey-textarea-comments" rows="6" cols="5" placeholder={keyData.comments} />
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
                                <div id="EditKey-div-assign-form-search-column">
                                    <h3>Column:</h3>
                                    <select id="EditKey-select-assign-form-search">
                                        <option value="first_name">First Name</option>
                                        <option value="last_name">Last Name</option>
                                        <option value="access_id">Access ID</option>
                                        <option value="date_signed">Date Signed</option>
                                        <option value="assigned_key_1">Assigned Key 1</option>
                                        <option value="assigned_key_2">Assigned Key 2</option>
                                        <option value="assigned_key_3">Assigned Key 3</option>
                                        <option value="assigned_key_4">Assigned Key 4</option>
                                    </select>
                                </div>
                                <div id="EditKey-div-assign-form-search-row">
                                    <h3>Search:</h3>
                                    <input type="text" id="EditKey-input-assign-form-search" placeholder="Search..."/>
                                </div>
                                <button id="EditKey-button-assign-form-search" onClick={handleSearchForm}>Search</button>
                                <button id="EditKey-button-assign-form-clear-search" onClick={handleClearSearch}>Clear</button>
                            </div>
                            <div id="EditKey-div-table-container">
                                <table id="EditKey-table">
                                    <tbody>
                                        <tr id="EditKey-tr-header">
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
                        <button id="EditKey-button-remove-key" onClick={handleDeleteKey} disabled={false}>Delete Key</button>
                    </div>
                </div>
                <div id="EditKey-div-button-container">
                    <button id="EditKey-button-cancel" onClick={handleCancel}>Cancel</button>
                    <button id="EditKey-button-submit" onClick={handleSubmitEdit}>Submit</button>
                </div>
            </div>
        </> 
    )  
}

export default EditKey