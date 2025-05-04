import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../styles/MovieSlider.css';
import { API_URL } from '../api';

const TheatreSelection = () => {
  const [theatres, setTheatres] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchTheatres = async () => {
      try {
        const response = await fetch(API_URL+'/theatres');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTheatres(data);
      } catch (error) {
        console.error('Failed to fetch theatres:', error);
      }
    };
    fetchTheatres();
  }, []);

  return (
    <div className="theatre-container">
      <h1 style={{ textAlign: 'center',background:'black',padding:'10px',borderRadius:'10px'}}>OUR THEATRES</h1>
      <div className="theatre-grid">
        {theatres.map((theatre) => (
          <Link 
            key={theatre._id} 
            to={`/${theatre.theatrename}`} // Dynamic URL based on theatrename
            className="theatre-card"
          >
            <div className="theatre-card-image-wrapper">
              <img 
                src={theatre.theatreImglink} 
                alt={theatre.theatrename}
                className="theatre-card-image"
              />
              <div className="theatre-card-content">
                <h2>{theatre.theatrename}</h2>
                <p>Location: {theatre.location}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TheatreSelection;
