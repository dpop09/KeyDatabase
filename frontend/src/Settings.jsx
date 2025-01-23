import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function Settings() {

    // global state variables
    const { accessId } = useContext(AuthContext)

    // display an unauthorized page if the accessID is not found in the database
    if (accessId === "Unauthorized") {
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

    const handleSearch = () => {
        return
    }

    const handleClearSearch = () => {
        return
    }

    const handleAddUser = () => {
        navigate('/adduser');
    }

    return (
        <>
            <NavBar />
            <div id="Settings-div-container">
                <div id="Settings-div-top-flex-box">
                    <div id="Settings-div-search-container">
                        <h3>Column:</h3>
                        <select id="Settings-select-column">
                            <option value="first_name">First Name</option>
                            <option value="last_name">Last Name</option>
                            <option value="access_id">Access ID</option>
                            <option value="title">Title</option>
                            <option value="permission">Permissions</option>
                        </select>
                        <h3>Search:</h3>
                        <input id="Settings-input-search-row" type="text" />
                        <button id="Settings-button-search" onClick={handleSearch}>Search</button>
                        <button id="Settings-button-clear-search" onClick={handleClearSearch}>Clear</button>
                    </div>
                    <button id="Settings-button-add-user" onClick={handleAddUser}></button>
                </div>
                <div id="Settings-div-table-container">
                    <table id="Settings-table">
                        <tbody>
                            <tr id="Settings-tr">
                                <th id="Settings-th">First Name</th>
                                <th id="Settings-th">Last Name</th>
                                <th id="Settings-th">Access ID</th>
                                <th id="Settings-th">Title</th>
                                <th id="Settings-th">Permissions</th>
                            </tr>
                            {userData.map((user, i) => (
                                <tr id="Settings-tr" key={i}>
                                    <td id="Settings-td">{user.first_name}</td>
                                    <td id="Settings-td">{user.last_name}</td>
                                    <td id="Settings-td">{user.access_id}</td>
                                    <td id="Settings-td">{user.title}</td>
                                    <td id="Settings-td">{user.permission}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default Settings