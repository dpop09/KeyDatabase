import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function RequestForms() {

    const [data, setData] = useState([]);
    const [imageData, setImageData] = useState(null);

    const { setRequestFormData } = useContext(AuthContext)

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
        const column = document.getElementById('RequestForms-select-column').value;
        const row = document.getElementById('RequestForms-input-search-row').value;
        if (!column || !row) { // if the column or row is empty
            alert('Please enter a column and row to search.');
            return
        }
        try {
            const response = await fetch('http://localhost:8081/search-request-form', { // send a POST request to the backend route
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ column: column, row: row })
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
        return
    }

    const handleClearSearch = async (event) => {
        event.preventDefault();
        getAllRequestForms();
    }

    const handleRowClick = (d) => {
        setRequestFormData(d);
        navigate('/editrequestform');
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
            <div id="RequestForms-div-container">
                <div id="RequestForms-div-top-flex-box">
                    <div id="RequestForms-div-search-container">
                        <h3>Column:</h3>
                        <select id="RequestForms-select-column">
                            <option value="first_name">First Name</option>
                            <option value="last_name">Last Name</option>
                            <option value="access_id">Access ID</option>
                            <option value="date_signed">Date Signed</option>
                            <option value="assigned_key_1">Assigned Key 1</option>
                            <option value="assigned_key_2">Assigned Key 2</option>
                            <option value="assigned_key_3">Assigned Key 3</option>
                            <option value="assigned_key_4">Assigned Key 4</option>
                        </select>
                        <h3>Search:</h3>
                        <input id="RequestForms-input-search-row" type="text" />
                        <button id="RequestForms-button-search" onClick={handleSearch}>Search</button>
                        <button id="RequestForms-button-clear-search" onClick={handleClearSearch}>Clear</button>
                    </div>
                    <button id="RequestForms-button-add-form" onClick={handleAddRequestForm}/>
                </div>
                <div id="RequestForms-div-flex-box">
                    <div id="RequestForms-div-table-container">
                        <table id="RequestForms-table">
                            <tbody>
                                <tr id="RequestForms-tr-header">
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