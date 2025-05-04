import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/UpdateForm.css';

const GeneralizedUpdateForm = ({ endpoint, initialData, inputTypes, next }) => {
    const { id } = useParams(); // Get the ID from the URL params
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState(initialData);
    const [error, setError] = useState('');

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${endpoint}/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setFormData(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, [endpoint, id]);

    // Handle input change for the main form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle input change for the cast array
    const handleCastChange = (index, field, value) => {
        const updatedCast = [...formData.cast];
        updatedCast[index][field] = value;
        setFormData(prev => ({
            ...prev,
            cast: updatedCast
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${endpoint}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update data');
            }

            navigate(`/admin/${next}`); // Redirect after updating
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="generalized-update-form">
            <h1>Update Data</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                {Object.keys(initialData).map((key) => {
                    // Skip fields ending with 'Id'
                    if (key.endsWith('Id')) {
                        return null; // Don't render input for this field
                    }
                    
                    // Handle cast array fields
                    if (key === 'cast' && Array.isArray(formData.cast)) {
                        return (
                            <div key={key}>
                                <h3>Cast:</h3>
                                {formData.cast && formData.cast.map((member, index) => (
                                    <div key={index} className="cast-member">
                                        <input
                                            type="text"
                                            placeholder="Actor Name"
                                            value={member.name || ''}
                                            onChange={(e) => handleCastChange(index, 'name', e.target.value)}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Actor Image URL"
                                            value={member.img || ''}
                                            onChange={(e) => handleCastChange(index, 'img', e.target.value)}
                                            required
                                        />
                                        {/* Optionally display the _id if you need it for reference */}
                                        <input
                                            type="hidden"
                                            name="_id"
                                            value={member._id || ''}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    return (
                        <div key={key}>
                            <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                            <input
                                type={inputTypes[key] || 'text'} // Default to text if type not specified
                                name={key}
                                value={formData[key] || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    );
                })}
                <button type="submit">Update</button>
            </form>
        </div>
    );
};

export default GeneralizedUpdateForm;
