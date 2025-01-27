import React, { useContext } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function EditUser() {

    // global state variables
    const { permissions, selectedUser } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    const navigate = useNavigate();
    const handleCancel = () => {
        navigate('/users');
    }

    const handleSubmit = async () => {
        try {
            const fname = document.getElementById('EditUser-input-fname').value || document.getElementById('EditUser-input-fname').placeholder;
            const lname = document.getElementById('EditUser-input-lname').value || document.getElementById('EditUser-input-lname').placeholder;
            const access_id = selectedUser.access_id;
            const title = document.getElementById('EditUser-input-title').value || document.getElementById('EditUser-input-title').placeholder;
            const permissions = document.getElementById('EditUser-select-permissions').value;
            if (!fname || !lname || !access_id || !title || !permissions) {
                alert('Please fill in all fields.');
                return;
            }
            const response = await fetch('http://localhost:8081/edit-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fname, lname, access_id, title, permissions }),
            });
            if (response.status === 200) {
                navigate('/users');
            } else {
                alert('Internal Server Error. Please try again later.');
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
                body: JSON.stringify({ access_id: selectedUser.access_id }),
            });
            if (response.status === 200) {
                navigate('/users');
            } else {
                alert('Internal Server Error. Please try again later.');
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
                        <label id="EditUser-label-name">First Name:</label>
                        <input id="EditUser-input-fname" type="text" placeholder={selectedUser.first_name}/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label id="EditUser-label-name">Last Name:</label>
                        <input id="EditUser-input-lname" type="text" placeholder={selectedUser.last_name}/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label id="EditUser-label-name">Access ID:</label>
                        <input id="EditUser-input-access-id" type="text" placeholder={selectedUser.access_id} disabled/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label id="EditUser-label-name">Title:</label>
                        <input id="EditUser-input-title" type="text" placeholder={selectedUser.title}/>
                    </div>
                    <div id="EditUser-div-input-container">
                        <label id="EditUser-label-permissions">Permissions:</label>
                        <select id="EditUser-select-permissions" value={selectedUser.permission}>
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
        </>
    )
}

export default EditUser