import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import { API_URL } from '../../api';

function SlotTable() {
    const [slots, setSlots] = useState([]);
    const [movies, setMovies] = useState({});
    const [theatres, setTheatres] = useState({});
    const [screens, setScreens] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate(); // Correctly initialize useNavigate

    useEffect(() => {
        const fetchMovies = async () => {
            const response = await fetch(API_URL+'/movies');
            if (!response.ok) throw new Error('Failed to fetch movies');
            const data = await response.json();
            const movieMap = {};
            data.forEach(movie => {
                movieMap[movie._id] = movie.title;
            });
            setMovies(movieMap);
        };

        const fetchTheatres = async () => {
            const response = await fetch(API_URL+'/theatres');
            if (!response.ok) throw new Error('Failed to fetch theatres');
            const data = await response.json();
            const theatreMap = {};
            data.forEach(theatre => {
                theatreMap[theatre._id] = theatre.theatrename;
            });
            setTheatres(theatreMap);
        };

        const fetchScreens = async () => {
            const response = await fetch(API_URL+'/screens');
            if (!response.ok) throw new Error('Failed to fetch screens');
            const data = await response.json();
            const screenMap = {};
            data.forEach(screen => {
                screenMap[screen._id] = screen.screenNo;
            });
            setScreens(screenMap);
        };

        const fetchSlots = async () => {
            try {
                const response = await fetch(API_URL+'/slots');
                if (!response.ok) throw new Error('Failed to fetch slots');
                const data = await response.json();
                setSlots(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchData = async () => {
            await Promise.all([fetchMovies(), fetchTheatres(), fetchScreens(), fetchSlots()]);
        };

        fetchData().catch(error => setError(error.message));
    }, []);

    const handleDeleteSlot = async (id) => {
        if (window.confirm("Are you sure you want to delete this slot?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(API_URL+`/slots/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) throw new Error('Failed to delete slot');
                setSlots(slots.filter(slot => slot._id !== id));
            } catch (error) {
                setError(error.message);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error fetching data: {error}</div>;
    }

    return (
        <div className="admin-slots-panel">
            <h1>Slots</h1>
            <button onClick={() => navigate('/admin/slots/add')}>Add Slot</button>
            <table id="admin-slots-table" className="admin-table">
                <thead>
                    <tr>
                        <th>Theatre</th>
                        <th>Screen</th>
                        <th>Movie</th>
                        <th>Time</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {slots.length > 0 ? (
                        slots.map(slot => (
                            <tr key={slot._id}>
                                <td>{theatres[slot.theatre] || 'N/A'}</td>
                                <td>{screens[slot.screen] || 'N/A'}</td>
                                <td>{movies[slot.movie] || 'N/A'}</td>
                                <td>{slot.time}</td>
                                <td>{new Date(slot.date).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => navigate(`/admin/slots/update/${slot._id}`)}>Update</button>
                                    <button onClick={() => handleDeleteSlot(slot._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No slots available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SlotTable;
