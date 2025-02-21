import React, { useContext } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function AddUser() {

    // global state variables
    const { accessId, permissions } = useContext(AuthContext)

    // display an unauthorized page if the accessID is not found in the database
    if (permissions !== "Admin") {
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
        const accessId_input = document.getElementById('AddUser-input-access-id').value;
        const permissions_input = document.getElementById('AddUser-select-permissions').value;
        if (!accessId_input || !permissions_input) { // check if all required fields are filled
            alert('Please fill out all required fields.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8081/add-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_access_id: accessId, access_id: accessId_input, permissions: permissions_input }),
            });
            if (response.status === 200) {
                navigate('/users');
            } else if (response.status === 400) {
                alert('User already exists');
            } else {
                alert('Internal Server Error. Please try again later.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <NavBar />
            <div id="AddUser-div-container">
                <h1 id="AddUser-h1-title">Add User</h1>
                <div id="AddUser-div-form-container">
                    <div id="AddUser-div-input-container">
                        <label id="AddUser-label-name">Access ID:</label>
                        <input id="AddUser-input-access-id" type="text" placeholder="ab1234"/>
                    </div>
                    <div id="AddUser-div-input-container">
                        <label id="AddUser-label-permissions">Permissions:</label>
                        <select id="AddUser-select-permissions">
                            <option value="Student Employee">Student Employee</option>
                            <option value="Unauthorized">Unauthorized</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div id="AddUser-div-button-container">
                    <button id="AddUser-button-cancel" onClick={handleCancel}>Cancel</button>
                    <button id="AddUser-button-submit" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </>
    )
}

export default AddUser