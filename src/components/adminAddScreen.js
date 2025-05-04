import React, { useState, useEffect } from 'react';
import { API_URL } from '../api';

const AdminScreens = () => {
    const [screenNo, setScreenNo] = useState('');
    const [numRows, setNumRows] = useState('');
    const [seatsPerRow, setSeatsPerRow] = useState('');
    const [theatreId, setTheatreId] = useState('');
    const [classInfo, setClassInfo] = useState([{ classNo: '', className: '' }]);
    const [theatreMap, setTheatreMap] = useState({});
    const [error, setError] = useState('');

    // Fetch theatres on component mount
    useEffect(() => {
        const fetchTheatres = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(API_URL+'/theatres', {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                if (!response.ok) throw new Error('Failed to fetch theatres');
                const data = await response.json();
                const map = {};
                data.forEach(theatre => {
                    map[theatre._id] = theatre.theatrename;
                });
                setTheatreMap(map);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchTheatres();
    }, []);

    // Handle changes for class info
    const handleClassInfoChange = (index, field, value) => {
        const updatedClassInfo = [...classInfo];
        updatedClassInfo[index][field] = value;
        setClassInfo(updatedClassInfo);
    };

    const addClassInfo = () => {
        setClassInfo([...classInfo, { classNo: '', className: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Generate validSeats based on numRows and seatsPerRow
        const validSeats = [];
        for (let row = 0; row < numRows; row++) {
            for (let seat = 0; seat < seatsPerRow; seat++) {
                validSeats.push(`${row}-${seat}`);
            }
        }

        const screenData = {
            screenNo,
            classInfo,
            dim: { NumRows: numRows, SeatsPerRow: seatsPerRow },
            theatreId: theatreId,
            validSeats, // Add the generated validSeats to the screenData
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL+'/screens', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(screenData),
            });

            if (!response.ok) throw new Error('Failed to add screen');

            // Clear form after successful submission
            setScreenNo('');
            setNumRows('');
            setSeatsPerRow('');
            setTheatreId('');
            setClassInfo([{ classNo: '', className: '' }]);
            alert('Screen added successfully!');
        } catch (error) {
            console.error('Error adding screen:', error);
            alert('Failed to add screen: ' + error.message);
        }
    };

    return (
        <div id="admin-screens" className="admin-card">
            <div className="admin-title">Add Screen</div>
            <form className="admin-form" onSubmit={handleSubmit}>
                <label htmlFor="admin-screenNoNew">Screen Number:</label>
                <input
                    type="number"
                    id="admin-screenNoNew"
                    value={screenNo}
                    onChange={(e) => setScreenNo(e.target.value)}
                    required
                />

                <label htmlFor="admin-numRowsNew">Number of Rows:</label>
                <input
                    type="number"
                    id="admin-numRowsNew"
                    value={numRows}
                    onChange={(e) => setNumRows(e.target.value)}
                    required
                />

                <label htmlFor="admin-seatsPerRowNew">Seats Per Row:</label>
                <input
                    type="number"
                    id="admin-seatsPerRowNew"
                    value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(e.target.value)}
                    required
                />

                <label htmlFor="admin-theatreIdNew">Theatre:</label>
                <select
                    id="admin-theatreIdNew"
                    value={theatreId}
                    onChange={(e) => setTheatreId(e.target.value)}
                    required
                >
                    <option value="">Select a theatre</option>
                    {Object.keys(theatreMap).map(id => (
                        <option key={id} value={id}>
                            {theatreMap[id]}
                        </option>
                    ))}
                </select>

                {classInfo && classInfo.map((info, index) => (
                    <div key={index}>
                        <label htmlFor={`classNo-${index}`}>Class Number:</label>
                        <input
                            type="number"
                            id={`classNo-${index}`}
                            value={info.classNo}
                            onChange={(e) => handleClassInfoChange(index, 'classNo', e.target.value)}
                            required
                        />

                        <label htmlFor={`className-${index}`}>Class Name:</label>
                        <input
                            type="text"
                            id={`className-${index}`}
                            value={info.className}
                            onChange={(e) => handleClassInfoChange(index, 'className', e.target.value)}
                            required
                        />
                    </div>
                ))}

                <button type="button" onClick={addClassInfo}>
                    Add Class Info
                </button>

                <button type="submit">Add Screen</button>
            </form>
        </div>
    );
};

export default AdminScreens;
