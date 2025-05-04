import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { API_URL } from '../../api';

function TheatreTable() {
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize the navigate function
    const [success, setSuccess] = useState('');

    // Fetch theatres from backend
    useEffect(() => {
        const fetchTheatres = async () => {
            try {
                const response = await fetch(API_URL+'/theatres'); // Adjust the API endpoint as needed
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTheatres(data);
            } catch (error) {
                setError(error.message);
                console.error('Error fetching theatres:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchTheatres();
    }, []);

    // Handle theatre deletion
    const handleDelete = async (theatreId) => {
        if (window.confirm("Are you sure you want to delete this theatre?")) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL+`/theatres/${theatreId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete the theatre');
            }
            // Update state to remove deleted theatre
            setTheatres(theatres.filter(theatre => theatre._id !== theatreId));
            setSuccess(`Deleted Successfully!`)
        } catch (error) {
            setError(error.message);
            console.error('Error deleting theatre:', error);
        }
    }
    };

    // Handle theatre update navigation
    const handleUpdate = (theatreId) => {
        navigate(`/admin/theatres/update/${theatreId}`); // Navigate to the update form
    };

    // Handle adding a new theatre
    const handleAddTheatre = () => {
        navigate('/admin/theatres/add'); // Navigate to the add theatre form
    };

    return (
        <div className="admin-theatres-panel">
            <h1>Theatres</h1>
            <button className="add-theatre-button" onClick={handleAddTheatre}>
                Add Theatre
            </button> {/* Add Theatre Button */}
            {success && <p>{success}</p>}
            {loading ? (
                <p>Loading theatres...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
            ) : (
                
                <table id="admin-theatres-table" className="admin-table">
                    <thead>
                        <tr>
                            <th>Theatre Name</th>
                            <th>Location</th>
                            <th>Actions</th> {/* New Actions Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {theatres && theatres.map(theatre => (
                            <tr key={theatre._id}>
                                <td>{theatre.theatrename}</td>
                                <td>{theatre.location}</td>
                                <td>
                                    <button onClick={() => handleUpdate(theatre._id)}>Update</button>
                                    <button onClick={() => handleDelete(theatre._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TheatreTable;
