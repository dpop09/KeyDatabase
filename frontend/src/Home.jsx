import React, { useEffect, useState } from "react";

function Home() {

    const [data, setData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8081/getall')
       .then(response => response.json())
       .then(data => setData(data))
       .catch(err => console.log(err));
    }, []);

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
        <div id="home-container">
            <div id="table-container">
                <table>
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
                            <tr key={i}>
                                <td>{d.tag_number}</td>
                                <td>{d.core_number}</td>
                                <td>{d.room_number}</td>
                                <td>{d.room_type}</td>
                                <td>{getKeyNumber(d)}</td>
                                <td>{getKeySequence(d)}</td>
                                <td>{d.available ? 'Yes' : 'No'}</td>
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