import React, { useContext,useEffect, useState } from "react";
import { AuthContext } from './AuthContext'
import { Link, useNavigate } from "react-router-dom";

function Home() {

    const [data, setData] = useState([]);

    const { setKeyData } = useContext(AuthContext)

    const navigate = useNavigate();
    const handleLogout = () => {
        navigate('/')
    }
    const handleCreateKey = () => {
        navigate('/createkey');
    }

    useEffect(() => {
        fetch('http://localhost:8081/getall')
       .then(response => response.json())
       .then(data => setData(data))
       .catch(err => console.log(err));
    }, []);

    const handleSearch = async (event) => {
        event.preventDefault();
        const column = document.getElementById('Home-select-column').value;
        const row = document.getElementById('Home-input-search-row').value;
        if (!column || !row) {
            alert('Please fill both column and row');
            return
        }
        try {
            const response = await fetch('http://localhost:8081/search', { // send a POST request to the backend route
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
    }

    const handleRowClick = (d) => {
        setKeyData(d);
        navigate('/keyinfo');
    }

    const getKeyNumber = (d) => {
        return d.key_number.split('-')[0];
    }

    const getKeySequence = (d) => {
        return d.key_number.split('-')[1];
    }

    const getReadableDateAssigned = (d) => {
        if (!d.date_assigned) {
            return
        }
        // Create a Date object from the ISO date string
        const date = new Date(d.date_assigned);
    
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

    const getReadableDateEdited = (d) => {
        if (!d.date_last_edited) {
            return    
        }
        // Create a Date object from the ISO date string
        const date = new Date(d.date_last_edited);
    
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
        <div id="Home-div-container">
            <div id="Home-div-top-flex-box">
                <div id="Home-div-search-container">
                    <label id="Home-label-search-column">Column:</label>
                    <select id="Home-select-column">
                        <option value="tag_number">Tag Number</option>
                        <option value="core_number">Core Number</option>
                        <option value="room_number">Room Number</option>
                        <option value="room_type">Room Type</option>
                        <option value="key_number">Key Number</option>
                        <option value="key_holder_fname">Key Holder's First Name</option>
                        <option value="key_holder_lname">Key Holder's Last Name</option>
                        <option value="date_assigned">Date Key was Assigned</option>
                        <option value="last_edited_by">Last Edited By</option>
                        <option value="date_last_edited">Date Last Edited</option>
                    </select>
                    <label id="Home-label-search-row">Search:</label>
                    <input id="Home-input-search-row" type="text" />
                    <button id="Home-button-search-row" onClick={handleSearch}>Search</button>
                </div>
                <div id="Home-div-create-key-container">
                    <button id="Home-button-create-key" onClick={handleCreateKey}/>
                    <button id="Home-button-logout" onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <div id="Home-table-container">
                <table id="Home-table-main">
                    <tbody>
                        <tr>
                            <th>Tag Number</th>
                            <th>Core</th>
                            <th>Room Number</th>
                            <th>Room Type</th>
                            <th>Key Number</th>
                            <th>Sequence</th>
                            <th>Avaliable</th>
                            <th>Key Holder First Name</th>
                            <th>Key Holder Last Name</th>
                            <th>Date Key Assigned</th>
                            <th>Comments</th>
                            <th>Lasted Edited By</th>
                            <th>Date Last Edited</th>
                        </tr>
                        {data.map((d, i) => (                 // Maps over the data array to create a table row (<tr>) for each item d in data. The index i is used as a unique key for each row.
                            <tr key={i} onClick={() => handleRowClick(d)}>
                                <td 
                                    id="Home-table-td-tag_number" 
                                    style={{ backgroundColor: d.tag_color || 'transparent' }} // Set background color or default to transparent
                                >{d.tag_number}
                                </td>
                                <td>{d.core_number}</td>
                                <td>{d.room_number}</td>
                                <td>{d.room_type}</td>
                                <td>{getKeyNumber(d)}</td>
                                <td>{getKeySequence(d)}</td>
                                <td 
                                    style={{ backgroundColor: d.available ? 'lightgreen' : 'lightcoral' }}
                                >
                                    {d.available ? 'Yes' : 'No'}
                                </td>
                                <td>{d.key_holder_fname}</td>
                                <td>{d.key_holder_lname}</td>                
                                <td>{getReadableDateAssigned(d)}</td>
                                <td>{d.comments}</td>
                                <td>{d.last_edited_by}</td>
                                <td>{getReadableDateEdited(d)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Home;