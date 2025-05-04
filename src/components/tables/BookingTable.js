import React, { useState, useEffect } from 'react';
import { API_URL } from '../../api';

function BookingTable() {
    const [bookings, setBookings] = useState([]);
    const token = localStorage.getItem('token'); // Get the token from local storage

    // Fetch bookings from backend
    useEffect(() => {
        fetch(API_URL + '/bookings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => setBookings(data))
            .catch(error => console.error('Error fetching bookings:', error));
    }, [token]);

    // Delete a booking
    const deleteBooking = bookingId => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete booking');
                }
                setBookings(bookings.filter(booking => booking._id !== bookingId));
            })
            .catch(error => console.error('Error deleting booking:', error));
    };

    return (
        <div className="admin-bookings-panel">
            <h1>Bookings</h1>
            <table id="admin-bookings-table" className="admin-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Theatre Name</th>
                        <th>Screen No</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking._id}>
                            <td>{booking.userId || 'N/A'}</td>
                            <td>{booking.theatrename}</td>
                            <td>{booking.screenNo}</td>
                            <td>{booking.date}</td>
                            <td>{booking.timeSlot}</td>
                            <td>{booking.totalPrice}</td>
                            <td>
                                <button onClick={() => deleteBooking(booking._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BookingTable;
