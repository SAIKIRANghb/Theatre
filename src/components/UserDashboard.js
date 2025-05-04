import React, { useState, useEffect } from 'react';
import '../styles/UserProfileDashboard.css';
import { API_URL } from '../api';

// Fetch user data from backend API
const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('token');
    // const response = await fetch(API_URL+'/userdetails'); // Replace with your actual API endpoint
    const response = await fetch(API_URL+'/userdetails', {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      }
  });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Fetch bookings data from backend API
const fetchBookingsData = async () => {
  try {
    // const response = await fetch(API_URL+'/bookingdetails'); // Replace with your actual API endpoint
    const token = localStorage.getItem('token');
    // const response = await fetch(API_URL+'/userdetails'); // Replace with your actual API endpoint
    const response = await fetch(API_URL+'/bookingdetails', {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      }
  });
  console.log(response)
    if (!response.ok) {
      throw new Error('Failed to fetch bookings data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bookings data:', error);
    return [];
  }
};

const UserProfileDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading state to true before fetching data
      try {
        const user = await fetchUserData();
        const bookings = await fetchBookingsData();
        setUserData(user.user);
        setBookings(bookings);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading state to false once data is fetched
      }
    };

    fetchData();
  }, []);

  // Show loading message while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  const ProfileSidebar = () => (
    <div className="profile-sidebar">
      <div className="profile-details">
        <div className="profile-header">
          <div className="profile-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="user-info">
            <h2>{userData ? userData.name : 'Loading...'}</h2>
            <p>{userData ? userData.email : 'Loading...'}</p>
            <span className="user-role">{userData ? userData.role : 'Loading...'}</span>
          </div>
        </div>
        <div className="profile-actions">
          <button className="profile-action-btn">Edit Profile</button>
          <button className="profile-action-btn">Change Password</button>
        </div>
      </div>
    </div>
  );



  const BookingsList = () => (
    <div className="bookings-container">
      <h2 className="bookings-title">My Bookings</h2>
      <div className="bookings-list">
        {bookings.map(booking => (
          <div key={booking._id} className="booking-card">
            <div className="booking-header">
              <h3>{booking.movie.name}</h3>
            </div>
            <div className="booking-details">
              <div className="booking-detail">
                <p>{booking.theatrename}</p>
              </div>
              <div className="booking-detail">
                <p>{booking.date} - {booking.timeSlot}</p>
              </div>
              <div className="booking-detail">
                <p>Seats: {Object.values(booking.selectedSeatCodeMap).join(', ')}</p>
                <p>Total Price: ₹{booking.totalPrice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="th-user-profile">
      <div className="user-profile-dashboard">
        <ProfileSidebar />
        <BookingsList />
      </div>
    </div>
  );
};

export default UserProfileDashboard;
