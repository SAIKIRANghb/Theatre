import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';

function ScreenTable() {
    const [screens, setScreens] = useState([]);  // State to hold the screens data
    const [theatreIdMap, setTheatreIdMap] = useState({});  // Map for theatreId --> theatrename
    const navigate = useNavigate();  // For navigation

    // Fetch theatres to build the id --> name map
    useEffect(() => {
        const fetchTheatres = async () => {
            try {
                const response = await fetch(API_URL+'/theatres'); // Fetch the theatres from API
                if (!response.ok) {
                    throw new Error('Failed to fetch theatres');
                }
                const theatres = await response.json();
                // Create a map of theatre IDs to theatre names
                const theatreMap = {};
                theatres.forEach(theatre => {
                    theatreMap[theatre._id] = theatre.theatrename;
                });
                setTheatreIdMap(theatreMap);  // Store the map in state
            } catch (error) {
                console.error('Error fetching theatres:', error);
            }
        };

        fetchTheatres();
    }, []);  // Fetch theatres once on component mount

    // Fetch screens from backend
    useEffect(() => {
        const fetchScreens = async () => {
            try {
                const response = await fetch(API_URL+'/screens');  // Fetch the screens from API
                if (!response.ok) {
                    throw new Error('Failed to fetch screens');
                }
                const screens = await response.json();
                setScreens(screens);  // Store the screens in state
            } catch (error) {
                console.error('Error fetching screens:', error);
            }
        };

        fetchScreens();  // Call the fetch function on component mount
    }, []);

    // Handle delete screen
    const handleDelete = async (screenId) => {
        if (window.confirm("Are you sure you want to delete this screen?")) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL+`/screens/${screenId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete screen');
            }
            // Remove the deleted screen from the state
            setScreens(prevScreens => prevScreens.filter(screen => screen._id !== screenId));
        } catch (error) {
            console.error('Error deleting screen:', error);
        }
    }
    };

    return (
        <div className="admin-screens-panel">
            <h1>Screens</h1>
            <button 
                className="admin-add-btn" 
                onClick={() => navigate('/admin/screens/add')}
            >
                Add New Screen
            </button>
            <table id="admin-screens-table" className="admin-table">
                <thead>
                    <tr>
                        <th>Theatre</th>
                        <th>Screen No</th>
                        <th>Actions</th>  {/* New column for buttons */}
                    </tr>
                </thead>
                <tbody>
                    {screens.map(screen => (
                        <tr key={screen._id}>
                            <td>
                                {theatreIdMap[screen.theatre] || 'Unknown Theatre'}  {/* Map theatre ID to name */}
                            </td>
                            <td>{screen.screenNo}</td>
                            <td>
                                <button 
                                    className="admin-update-btn" 
                                    onClick={() => navigate(`/admin/screens/update/${screen._id}`)}
                                >
                                    Update
                                </button>
                                <button 
                                    className="admin-delete-btn" 
                                    onClick={() => handleDelete(screen._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ScreenTable;
