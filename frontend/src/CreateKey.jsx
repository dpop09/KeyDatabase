import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function CreateKey() {

    // global state variables
    const { permissions } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    // state variables to hold all of the request forms and the selected form
    const [requestForms, setRequestForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    // state variable to hold PDF data
    const [pdfData, setPdfData] = useState(null);

    // navigation back to the keys page
    const navigate = useNavigate();
    const handleCancel = () => {
        navigate('/keys');
    }

    // function to get all of the request forms
    const getKeyRequestForms = async () => {
        fetch('http://localhost:8081/get-all-key-request-forms')
        .then(response => response.json())
        .then(data => setRequestForms(data))
        .catch(err => console.log(err));
    }

    useEffect(() => { // load all of the request forms on page load
        getKeyRequestForms();
    }, []);

    // function to store the selected form in the state variable
    const handleSelectForm = (form) => { 
        if (selectedForm === form) { // if the form is already selected
            setSelectedForm(null); // deselect the form
            return;
        }
        setSelectedForm(form); // else select the form
    }

    // function to get the PDF data from the server
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

    // function to create a new key
    const handleCreateKey = async (event) => {
        event.preventDefault();
        // get values from the input fields
        const tag_number = document.getElementById('CreateKey-input-tag_number').value;
        const tag_color = document.getElementById('CreateKey-input-tag_color').value;
        const core_number = document.getElementById('CreateKey-input-core_number').value;
        const room_number = document.getElementById('CreateKey-input-room_number').value;
        const room_type = document.getElementById('CreateKey-input-room_type').value;
        const key_number = document.getElementById('CreateKey-input-key_number').value;
        const key_holder_fname = document.getElementById('CreateKey-input-key_holder_fname').value;
        const key_holder_lname = document.getElementById('CreateKey-input-key_holder_lname').value;
        const key_holder_access_id = document.getElementById('CreateKey-input-key_holder_access_id').value;
        const date_assigned = document.getElementById('CreateKey-input-date_assigned').value;
        const comments = document.getElementById('CreateKey-textarea-comments').value;
        // get value of the selected radio button
        const assigned_key_value = document.querySelector('input[name="assignedKey"]:checked');
        const assigned_key = assigned_key_value ? assigned_key_value.value : null; // if no radio button is selected, assigned_key will be null
        if (!tag_number || !tag_color || !core_number || !room_number || !room_type || !key_number ) { // check if any of the core key fields are empty
            alert("Please fill out all required fields.");
            return
        }
        if (selectedForm != null && assigned_key == null) { // if a form is selected and the assigned key is not selected, show an alert
            alert("Please select an assigned key.");
            return
        }
        try {
            const response = await fetch('http://localhost:8081/create-key', { // send a POST request to the backend route
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
                    new_form_id: selectedForm != null ? selectedForm.form_id : null, // if a form is selected, send its form_id, else send null
                    assigned_key: assigned_key
                })
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

    // function to search for a request form
    const handleSearchForm = async (event) => {
        event.preventDefault();
        // get values from the input fields
        const column = document.getElementById('CreateKey-select-assign-form-search').value;
        const row = document.getElementById('CreateKey-input-assign-form-search').value;
        // if any of the input fields are empty, show an alert
        if (!column || !row) {
            alert("Please fill out all required fields.");
            return
        }
        // send a POST request to the backend route
        try {
            const response = await fetch('http://localhost:8081/search-request-form', {
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

    // function to clear the search
    const handleClearSearch = async (event) => {
        event.preventDefault();
        getKeyRequestForms();
    }

    // function to get the readable signed date
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

    return (
        <>
            <NavBar />
            <div id="CreateKey-div-container">
                <div id="CreateKey-div-top-container">
                    <div id="CreateKey-div-form-container">
                        <div id="CreateKey-div-row-flex-box-title">
                            <h2>KEY INFO</h2>
                        </div>
                        <div id="CreateKey-div-row-flex-box">
                            <h3>*Tag Number:</h3>
                            <input type="text" id="CreateKey-input-tag_number" />
                        </div>
                        <div id ="CreateKey-div-row-flex-box-even">
                            <h3>*Tag Color:</h3>
                            <input type="text" id="CreateKey-input-tag_color" />
                        </div>
                        <div id="CreateKey-div-row-flex-box">
                            <h3>*Core Number:</h3>
                            <input type="text" id="CreateKey-input-core_number" />
                        </div>
                        <div id="CreateKey-div-row-flex-box-even">
                            <h3>*Room Number:</h3>
                            <input type="text" id="CreateKey-input-room_number" />
                        </div>
                        <div id="CreateKey-div-row-flex-box">
                            <h3>*Room Type:</h3>
                            <input type="text" id="CreateKey-input-room_type" />
                        </div>
                        <div id="CreateKey-div-row-flex-box-even">
                            <h3>*Key Number:</h3>
                            <input type="text" id="CreateKey-input-key_number" />
                        </div>
                    </div>
                    <div id="CreateKey-div-form-container-2">
                        <div id="CreateKey-div-row-flex-box-title">
                            <h2>KEY HOLDER</h2>
                        </div>
                        <div id="CreateKey-div-row-flex-box">
                            <h3>Key Holder's First Name:</h3>
                            <input type="text" id="CreateKey-input-key_holder_fname" />
                        </div>
                        <div id="CreateKey-div-row-flex-box-even">
                            <h3>Key Holder's Last Name:</h3>
                            <input type="text" id="CreateKey-input-key_holder_lname" />
                        </div>
                        <div id="CreateKey-div-row-flex-box">
                            <h3>Key Holder's Access ID:</h3>
                            <input type="text" id="CreateKey-input-key_holder_access_id" />
                        </div>
                        <div id="CreateKey-div-row-flex-box-even">
                            <h3>Date Assigned:</h3>
                            <input type="date" id="CreateKey-input-date_assigned" />
                        </div>
                        <div id="CreateKey-div-row-flex-box">
                            <h3>Comments:</h3>
                            <textarea id="CreateKey-textarea-comments" rows="5" cols="5" />
                        </div>
                    </div>
                </div>
                <div id="CreateKey-div-assign-form-container">
                    <div id="CreateKey-div-assign-form-title">
                        <h2>ASSIGN REQUEST FORM TO KEY</h2>
                    </div>
                    <div id="CreateKey-div-assgin-form-lower-container">
                        <div id="CreateKey-div-assign-form-table-container">
                            <div id="CreateKey-div-assign-form-search">
                                <div id="CreateKey-div-assign-form-search-column">
                                    <h3>Column:</h3>
                                    <select id="CreateKey-select-assign-form-search">
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
                                <div id="CreateKey-div-assign-form-search-row">
                                    <h3>Search:</h3>
                                    <input type="text" id="CreateKey-input-assign-form-search" placeholder="Search..."/>
                                </div>
                                <button id="CreateKey-button-assign-form-search" onClick={handleSearchForm}>Search</button>
                                <button id="CreateKey-button-assign-form-clear-search" onClick={handleClearSearch}>Clear</button>
                            </div>
                            <div id="CreateKey-div-table-container">
                                <table id="CreateKey-table">
                                    <tbody>
                                        <tr id="CreateKey-tr-header">
                                            <th id="CreateKey-th">First Name</th>
                                            <th id="CreateKey-th">Last Name</th>
                                            <th id="CreateKey-th">Access ID</th>
                                            <th id="CreateKey-th">Date Signed</th>
                                            <th id="CreateKey-th">Assigned Key 1</th>
                                            <th id="CreateKey-th">Assigned Key 2</th>
                                            <th id="CreateKey-th">Assigned Key 3</th>
                                            <th id="CreateKey-th">Assigned Key 4</th>
                                        </tr>
                                        {requestForms.map((d, i) => ( /* display each request form */
                                            <tr
                                                id="CreateKey-tr" 
                                                key={i} 
                                                onMouseOver={() => getPdfData(d.form_id)} 
                                                onClick={() => handleSelectForm(d)}
                                                className={selectedForm && selectedForm.form_id === d.form_id ? 'selected-form' : ''}
                                            >
                                                <td id="CreateKey-td">{d.first_name}</td>
                                                <td id="CreateKey-td">{d.last_name}</td>
                                                <td id="CreateKey-td">{d.access_id}</td>
                                                <td id="CreateKey-td">{getReadableDateSigned(d)}</td>
                                                <td id="CreateKey-td">{d.assigned_key_1}</td>
                                                <td id="CreateKey-td">{d.assigned_key_2}</td>
                                                <td id="CreateKey-td">{d.assigned_key_3}</td>
                                                <td id="CreateKey-td">{d.assigned_key_4}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div id="CreateKey-div-selected-form-container">
                                <div id="CreateKey-div-assign-form-title">
                                    <h2>SELECTED FORM</h2>
                                </div>
                                {selectedForm ? ( // if a form is selected
                                    <>
                                        <div id="CreateKey-div-selected-form-row-even">
                                            <h3>First Name:</h3>
                                            <h3>{selectedForm.first_name}</h3>
                                        </div>
                                        <div id="CreateKey-div-selected-form-row">
                                            <h3>Last Name:</h3>
                                            <h3>{selectedForm.last_name}</h3>
                                        </div>
                                        <div id="CreateKey-div-selected-form-row-even">
                                            <h3>Access ID:</h3>
                                            <h3>{selectedForm.access_id}</h3>
                                        </div>
                                        <div id="CreateKey-div-selected-form-row">
                                            <h3>Date Signed:</h3>
                                            <h3>{getReadableDateSigned(selectedForm)}</h3>
                                        </div>
                                        <div id="CreateKey-div-selected-form-row-even">    
                                            <h3>Assigned Key 1:</h3>
                                            <h3>{selectedForm.assigned_key_1}</h3>
                                        </div>
                                        <div id="CreateKey-div-selected-form-row">    
                                            <h3>Assigned Key 2:</h3>
                                            <h3>{selectedForm.assigned_key_2}</h3>
                                        </div>
                                        <div id="CreateKey-div-selected-form-row-even">    
                                            <h3>Assigned Key 3:</h3>
                                            <h3>{selectedForm.assigned_key_3}</h3>
                                        </div>
                                        <div id="CreateKey-div-selected-form-row-bottom">    
                                            <h3>Assigned Key 4:</h3>
                                            <h3>{selectedForm.assigned_key_4}</h3>
                                        </div>
                                        <div>
                                            <h2>Select column this key should be assigned to:</h2>
                                            <form id="CreateKey-form-assigned-key">
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
                                ) : ( // if no form is selected
                                    <h3>Click on a form to select it.</h3>
                                )}
                            </div>
                        </div>
                        <div id="CreateKey-div-request-form-container">
                            {pdfData ? ( /* display the request form */
                                <iframe id="CreateKey-iframe-key-request-form" src={pdfData} alt="Key Request Form" />
                            ) : ( /* display a message if no request form is selected */
                                <h1 id="CreateKey-h1-no-request-form">Assign a request form to this key.</h1>
                            )}
                        </div>
                    </div>
                </div>
                <div id="CreateKey-div-button-container">
                    <button id="CreateKey-button-cancel" onClick={handleCancel}>Cancel</button>
                    <button id="CreateKey-button-submit" onClick={handleCreateKey}>Submit</button>
                </div>
            </div>
        </> 
    )  
}

export default CreateKey