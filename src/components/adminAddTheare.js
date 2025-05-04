import React, { useState } from 'react';
import { API_URL } from '../api';

function AdminTheatres() {
    const [theatreName, setTheatreName] = useState('');
    const [location, setLocation] = useState('');
    const [theatreImglink, setTheatreImglink] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the payload to be sent to the server
        const newTheatre = {
            theatrename: theatreName,
            location: location,
            theatreImglink: theatreImglink,
        };
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL+'/theatres', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTheatre),
            });

            if (!response.ok) {
                throw new Error('Failed to add theatre');
            }

            // Clear form and show success message
            setTheatreName('');
            setLocation('');
            setTheatreImglink('');
            setSuccess('Theatre added successfully!');
            setError(''); // Clear any previous errors
        } catch (err) {
            setError(err.message);
            setSuccess(''); // Clear any success message
        }
    };

    return (
        <div id="admin-theatres" className="admin-card">
            <div className="admin-title">Add Theatre</div>

            <form className="admin-form" onSubmit={handleSubmit}>
                {error && <p className="error" style={{ color: 'black' }}>{error}</p>}
                {success && <p className="success" style={{ color: 'black' }}>{success}</p>}

                <label htmlFor="admin-theatreNameNew">Theatre Name:</label>
                <input
                    type="text"
                    id="admin-theatreNameNew"
                    value={theatreName}
                    onChange={(e) => setTheatreName(e.target.value)}
                    required
                />

                <label htmlFor="admin-theatreLocationNew">Location:</label>
                <input
                    type="text"
                    id="admin-theatreLocationNew"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />

                <label htmlFor="admin-theatreImgLinkNew">Image Link:</label>
                <input
                    type="text"
                    id="admin-theatreImgLinkNew"
                    value={theatreImglink}
                    onChange={(e) => setTheatreImglink(e.target.value)}
                    required
                />

                <button type="submit">Add Theatre</button>
            </form>
        </div>
    );
}

export default AdminTheatres;
