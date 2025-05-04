import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ScreenUpdateForm.css';

const ScreenUpdateForm = ({ endpoint, initialData, next }) => {
    const { id } = useParams(); // Get the screen ID from the URL params
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialData);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${endpoint}/${id}`);
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();
                setFormData(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, [endpoint, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClassChange = (index, field, value) => {
        const updatedClassInfo = formData.classInfo.map((cls, i) =>
            i === index ? { ...cls, [field]: value } : cls
        );
        setFormData((prev) => ({ ...prev, classInfo: updatedClassInfo }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json' ,
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to update data');
            navigate(`/admin/${next}`);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="screen-update-form">
            <h1>Update Screen</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Screen No:</label>
                    <input
                        type="number"
                        name="screenNo"
                        value={formData.screenNo || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                {formData.classInfo && formData.classInfo.map((cls, index) => (
                    <div key={index}>
                        <label>Class No {index + 1}:</label>
                        <input
                            type="number"
                            value={cls.classNo || ''}
                            onChange={(e) => handleClassChange(index, 'classNo', e.target.value)}
                            required
                        />
                        <label>Class Name:</label>
                        <input
                            type="text"
                            value={cls.className || ''}
                            onChange={(e) => handleClassChange(index, 'className', e.target.value)}
                            required
                        />
                    </div>
                ))}

                <div>
                    <label>Number of Rows:</label>
                    <input
                        type="number"
                        name="dim.NumRows"
                        value={formData.dim?.NumRows || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Seats per Row:</label>
                    <input
                        type="number"
                        name="dim.SeatsPerRow"
                        value={formData.dim?.SeatsPerRow || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Valid Seats:</label>
                    <textarea
                        name="validSeats"
                        value={formData.validSeats.join(', ') || ''}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, validSeats: e.target.value.split(', ') }))
                        }
                    />
                </div>

                <button type="submit">Update</button>
            </form>
        </div>
    );
};

export default ScreenUpdateForm;
