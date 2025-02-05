import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function Users() {

    // global state variables
    const { permissions, setSelectedUser } = useContext(AuthContext)

    // display an unauthorized page if the permissions is not found in the database
    if (permissions === "Unauthorized") {
        return (
            <div id="unauthorized-div-container">
                <h1 id="unauthorized-h1-title">Unauthorized Access</h1>
                <p id="unauthorized-p-subtitle">Contact the building manager to request access.</p>
            </div>
        )
    }

    // component state variables
    const [userData, setUserData] = useState([]);

    const navigate = useNavigate();

    // fetch all user data
    const getAllUserData = async () => {
        try {
            const response = await fetch('http://localhost:8081/get-all-user-data');
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllUserData();
    }, []);

    const handleSearch = async (event) => {
        event.preventDefault();
        const row = document.getElementById('Users-input-search-row').value;
        if (!row) {
            return
        }
        try {
            const response = await fetch('http://localhost:8081/search-user', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ row: row })
            });
            const data = await response.json();
            if (data) { // if the response is successful
                setUserData(data);
            } else { // if the response is unsuccessful
                alert("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearSearch = async (event) => {
        event.preventDefault();
        document.getElementById('Users-input-search-row').value = null
        getAllUserData();
    }

    const handleAddUser = () => {
        if (permissions === "Admin") {
            navigate('/adduser');
        }
        else {
            alert('This action can only be performed by an admin.');
        }
    }

    const handleRowClick = (user) => {
        if (permissions === "Admin") {
            setSelectedUser(user);
            navigate('/edituser');
        } else {
            alert('This action can only be performed by an admin.');
        }
    }

    return (
        <>
            <NavBar />
            <div id="Users-div-container">
                <div id="Users-div-top-flex-box">
                    <div id="Users-div-search-container">
                        <h2>General Search:</h2>
                        <input id="Users-input-search-row" type="text" placeholder="Search..." onChange={handleSearch} />
                        <button id="Users-button-clear-search" onClick={handleClearSearch}>Clear</button>
                    </div>
                    <button id="Users-button-add-user" onClick={handleAddUser}></button>
                </div>
                <div id="Users-div-table-container">
                    <table id="Users-table">
                        <tbody>
                            <tr id="Users-tr">
                                <th id="Users-th">First Name</th>
                                <th id="Users-th">Last Name</th>
                                <th id="Users-th">Access ID</th>
                                <th id="Users-th">Title</th>
                                <th id="Users-th">Permissions</th>
                            </tr>
                            {userData.map((user, i) => (
                                <tr id="Users-tr" key={i} onClick={() => handleRowClick(user)}>
                                    <td id="Users-td">{user.first_name}</td>
                                    <td id="Users-td">{user.last_name}</td>
                                    <td id="Users-td">{user.access_id}</td>
                                    <td id="Users-td">{user.title}</td>
                                    <td id="Users-td">{user.permission}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default Users