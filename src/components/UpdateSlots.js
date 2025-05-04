import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../api';

function AdminSlotUpdateForm() {
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [classPrices, setClassPrices] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeError, setTimeError] = useState('');

    const slotParams = useParams();
    const slotId = slotParams.id;

    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in "YYYY-MM-DD" format

    useEffect(() => {
        const fetchSlotDetails = async () => {
            try {
                const response = await fetch(API_URL + `/slots/${slotId}`);
                if (!response.ok) throw new Error('Failed to fetch slot details');
                const data = await response.json();

                setTime(data.time);
                setDate(data.date.split('T')[0]); // Format date for input
                setSelectedSeats(data.selectedSeats || []); // Initialize selectedSeats
                setClassPrices(data.classPrices || []); // Initialize classPrices
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSlotDetails();
    }, [slotId]);

    const handleTimeChange = (value) => {
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] ?(am|pm)$/i;
        setTime(value);

        if (!timeRegex.test(value)) {
            setTimeError('Time must be in the format "hr:min am/pm" (e.g., 02:30 pm).');
        } else {
            setTimeError('');
        }
    };

    const handleClassPriceChange = (index, field, value) => {
        setClassPrices((prevPrices) =>
            prevPrices.map((price, i) =>
                i === index ? { ...price, [field]: value } : price
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (timeError) {
            alert('Please correct the errors in the form before submitting.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + `/slots/${slotId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    time,
                    date,
                    selectedSeats,
                    classPrices,
                }),
            });

            if (!response.ok) throw new Error('Failed to update slot');
            alert('Slot Updated');
            setTime('');
            setDate('');
            setSelectedSeats([]);
            setClassPrices([]);
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div id="admin-slot-update" className="admin-card">
            <div className="admin-title">Update Slot</div>
            <form className="admin-form" onSubmit={handleSubmit}>
                <label htmlFor="admin-slotTimeUpdate">Time:</label>
                <input
                    type="text"
                    id="admin-slotTimeUpdate"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    placeholder="e.g., 02:30 pm"
                    required
                />
                {timeError && <p className="error-text">{timeError}</p>}

                <label htmlFor="admin-slotDateUpdate">Date:</label>
                <input
                    type="date"
                    id="admin-slotDateUpdate"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={currentDate} // Set minimum date to today's date
                    required
                />

                <label htmlFor="admin-slotSelectedSeats">Selected Seats:</label>
                <textarea
                    id="admin-slotSelectedSeats"
                    value={selectedSeats.join(', ')}
                    onChange={(e) =>
                        setSelectedSeats(e.target.value.split(', ').map((seat) => seat.trim()))
                    }
                />

                <div>
                    <h4>Class Prices:</h4>
                    {classPrices.map((classPrice, index) => (
                        <div key={index} className="class-price-group">
                            <label>
                                Class Name:
                                <input
                                    type="text"
                                    value={classPrice.className}
                                    onChange={(e) =>
                                        handleClassPriceChange(index, 'className', e.target.value)
                                    }
                                    required
                                />
                            </label>
                            <label>
                                Class No:
                                <input
                                    type="number"
                                    value={classPrice.classNo}
                                    onChange={(e) =>
                                        handleClassPriceChange(index, 'classNo', parseInt(e.target.value, 10))
                                    }
                                    required
                                />
                            </label>
                            <label>
                                Price:
                                <input
                                    type="number"
                                    value={classPrice.price}
                                    onChange={(e) =>
                                        handleClassPriceChange(index, 'price', parseFloat(e.target.value))
                                    }
                                    required
                                />
                            </label>
                        </div>
                    ))}
                </div>

                <button type="submit">Update Slot</button>
            </form>
        </div>
    );
}

export default AdminSlotUpdateForm;
