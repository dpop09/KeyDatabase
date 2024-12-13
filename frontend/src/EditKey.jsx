import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function EditKey() {

    const [requestForms, setRequestForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [pdfData, setPdfData] = useState(null);

    const { keyData } = useContext(AuthContext);

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
        setSelectedForm(form);
    }

    const displayDateAssigned = keyData.date_assigned 
        ? new Date(keyData.date_assigned).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }) 
        : "";

    const getPdfData = async (form_id) => {
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
        if (!tag_number || !tag_color || !core_number || !room_number || !room_type || !key_number ) {// check if any of the key fields are empty
            alert("Please fill out all required fields.");
            return
        }
        if (key_holder_fname || key_holder_lname || key_holder_access_id || date_assigned) { // check if any of the key holder fields are empty
            if (!key_holder_fname || !key_holder_lname || !key_holder_access_id || !date_assigned) {
                alert("If you want to edit or add a key holder to this key, you must fill out all of the required fields.");
                return
            }
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
                    form_id: selectedForm.form_id
                })
            })
            if (response.ok) { // if the response is successful
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
                body: JSON.stringify({ key_number: keyData.key_number })
            })
            if (response.ok) { // if the response is successful
                navigate('/keyinfo');
            } else { // if the response is unsuccessful
                console.log("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteKey = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/delete-key', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ key_number: keyData.key_number })
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

    return (
        <>
            <NavBar />
            <div id="EditKey-div-container">
                <div id="EditKey-div-flex-box">
                    <div id="EditKey-form-container">
                        <div id="EditKey-div-row-flex-box-title">
                            <h2>EDIT KEY *BLOCKED* </h2>
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Tag Number:</h3>
                            <input type="text" id="EditKey-input-tag_number" placeholder={keyData.tag_number} disabled/>
                        </div>
                        <div id ="EditKey-div-row-flex-box-even">
                            <h3>Tag Color:</h3>
                            <input type="text" id="EditKey-input-tag_color" placeholder={keyData.tag_color} disabled/>
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Core Number:</h3>
                            <input type="text" id="EditKey-input-core_number" placeholder={keyData.core_number} disabled />
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>Room Number:</h3>
                            <input type="text" id="EditKey-input-room_number" placeholder={keyData.room_number} disabled />
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Room Type:</h3>
                            <input type="text" id="EditKey-input-room_type" placeholder={keyData.room_type} disabled />
                        </div>
                        <div id="EditKey-div-row-flex-box-even">
                            <h3>Key Number:</h3>
                            <input type="text" id="EditKey-input-key_number" placeholder={keyData.key_number} disabled />
                        </div>
                    </div>
                    <div id="EditKey-form-container">
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
                <div id="EditKey-div-flex-box">
                    <form id="EditKey-form-container">
                        <div id="EditKey-div-row-flex-box-title">
                            <h2>ASSIGN REQUEST FORM TO KEY</h2>
                        </div>
                        <div id="EditKey-div-table-container">
                            <table id="EditKey-table">
                                <tbody>
                                    <tr>
                                        <th>Form ID</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Access ID</th>
                                        <th>Date Signed</th>
                                        <th>Assigned Key Number</th>
                                    </tr>
                                    {requestForms.map((d, i) => ( 
                                        <tr 
                                            key={i} 
                                            onMouseOver={() => getPdfData(d.form_id)} 
                                            onClick={() => handleSelectForm(d)}
                                            className={selectedForm && selectedForm.form_id === d.form_id ? 'selected-form' : ''}
                                        >
                                            <td>{d.form_id}</td>
                                            <td>{d.first_name}</td>
                                            <td>{d.last_name}</td>
                                            <td>{d.access_id}</td>
                                            <td>{d.date_signed}</td>
                                            <td>{d.assigned_key_number}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div id="EditKey-div-row-flex-box">
                            <h3>Selected Form</h3>
                            {selectedForm ? (
                                <div id="EditKey-div-selected-form">
                                    <h3>Form ID: {selectedForm.form_id}</h3>
                                    <h3>First Name: {selectedForm.first_name}</h3>
                                    <h3>Last Name: {selectedForm.last_name}</h3>
                                    <h3>Access ID: {selectedForm.access_id}</h3>
                                    <h3>Date Signed: {selectedForm.date_signed}</h3>
                                    <h3>Assigned Key Number: {selectedForm.assigned_key_number}</h3>
                                </div>
                            ) : (
                                <h3>No form selected.</h3>
                            )}
                        </div>
                    </form>
                    <div id="EditKey-div-request-form-container">
                        {pdfData ? (
                            <iframe id="EditKey-iframe-key-request-form" src={pdfData} alt="Key Request Form" />
                        ) : (
                            <h1 id="EditKey-h1-no-request-form">Assign a request form to this key.</h1>
                        )}
                    </div>
                </div>
                <div id="EditKey-div-quick-actions">
                    <div id="EditKey-div-row-flex-box-title">
                        <h2>QUICK ACTIONS</h2>
                    </div>
                    <div id="EditKey-div-row-flex-box">
                        <h3>REMOVE HOLDER AND SUBMIT:</h3>
                        <button id="EditKey-button-remove-holder" onClick={handleRemoveHolder}>Remove Holder</button>
                    </div>
                    <div id="EditKey-div-row-flex-box-even">
                        <h3>DELETE KEY:</h3>
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