import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import NavBar from "./NavBar";

function HistoryLog() {

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

    const [data, setData] = useState([]);
    const [displayAdvancedSearch, setDisplayAdvancedSearch] = useState(false)

    const toggleDisplayAdvancedSearch = () => {
        setDisplayAdvancedSearch(!displayAdvancedSearch)
    }

    const getAllHistory = async () => {
        try {
            const response = await fetch('http://localhost:8081/get-all-history');
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getAllHistory();
    }, []);

    const handleSearch = async (event) => {
        event.preventDefault();
        return
    }

    const handleClearSearch = async (event) => {
        event.preventDefault();
        document.getElementById('HistoryLog-input-search-row').value = null
        getAllHistory();
    }

    const handleAdvancedSearch = async (event) => {
        event.preventDefault();
        return
    }

    const handleClearAdvancedSearch = async (event) => {
        event.preventDefault();
        getAllHistory();
    }

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const getReadableDate = (log) => {
        // Parse the ISO string into a Date object
        const date = new Date(log);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // Using local time; if you want to display UTC instead, use getUTCMonth(), getUTCDate(), etc.
        const month = monthNames[date.getMonth()];
        const day = getOrdinal(date.getDate());
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    }
    const getReadableTime = (log) => {
        // Parse the ISO string into a Date object
        const date = new Date(log);
        // Using local time; if you want UTC time, use getUTCHours(), getUTCMinutes(), etc.
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const period = hours >= 12 ? 'pm' : 'am';
        // Convert from 24-hour (military) format to 12-hour format
        hours = hours % 12 || 12;
        return `${hours}:${minutes}:${seconds}${period}`;
    }

    return (
        <>
            <NavBar />
            <div id="HistoryLog-div-container">
                <div id="HistoryLog-div-top-flex-box">
                    <div id="HistoryLog-div-search-container">
                        <h2>General Search:</h2>
                        <input id="HistoryLog-input-search-row" type="text" placeholder="Search..." onChange={handleSearch} />
                        <button id="HistoryLog-button-clear-search" onClick={handleClearSearch}>Clear</button>
                    </div>
                    <button id="HistoryLog-button-advanced-search" onClick={toggleDisplayAdvancedSearch} />
                </div>
                {displayAdvancedSearch && (
                    <div id="HistoryLog-div-advanced-search">
                        <div id="HistoryLog-div-advanced-search-top">
                            <h2>Advanced Search:</h2>
                            <div id="HistoryLog-div-advanced-search-buttons">
                                <button id="HistoryLog-button-search" onClick={handleAdvancedSearch}>Search</button>
                                <button id="HistoryLog-button-clear-search" onClick={handleClearAdvancedSearch}>Clear</button>
                            </div>
                        </div>
                        <div id="HistoryLog-advanced-search-inputs-container">
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-log-id">Log ID:</label>
                                <input id="HistoryLog-input-advanced-search-log-id" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-access-id">Access ID:</label>
                                <input id="HistoryLog-input-advanced-search-access-id" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-action">Action:</label>
                                <input id="HistoryLog-input-advanced-search-action" />
                            </div>
                            <div class="HistoryLog-div-advanced-search-grid-item">
                                <label for="HistoryLog-input-advanced-search-time">Time:</label>
                                <input id="HistoryLog-input-advanced-search-time" />
                            </div>
                        </div>
                    </div>
                )}
                <div id="HistoryLog-table-container">
                    <table id="HistoryLog-table">
                        <tbody>
                            <tr id="HistoryLog-tr-header">
                                <th id="HistoryLog-th">Log ID</th>
                                <th id="HistoryLog-th">User</th>
                                <th id="HistoryLog-th">Target Type</th>
                                <th id="HistoryLog-th">Target ID</th>
                                <th id="HistoryLog-th">Action Type</th>
                                <th id="HistoryLog-th">Action Details</th>
                                <th id="HistoryLog-th">Date</th>
                                <th id="HistoryLog-th">Time</th>
                            </tr>
                            {data.map((log, i) => (
                                <tr id="HistoryLog-tr" key={i}>
                                    <td id="HistoryLog-td">{log.log_id}</td>
                                    <td id="HistoryLog-td">{log.user}</td>
                                    <td id="HistoryLog-td">{log.target_type}</td>
                                    <td id="HistoryLog-td">{log.target_id}</td>
                                    <td id="HistoryLog-td">{log.action_type}</td>
                                    <td id="HistoryLog-td">{log.log_action}</td>
                                    <td id="HistoryLog-td">{getReadableDate(log.log_time)}</td>
                                    <td id="HistoryLog-td">{getReadableTime(log.log_time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default HistoryLog