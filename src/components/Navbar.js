import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css'; // Import the CSS file for Navbar
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API_URL } from '../api';

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [moviesDropdown, setMoviesDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [theatres, setTheatres] = useState([]); // State to hold the list of theatres
  const [isLoggedIn, setLogin] = useState(false); // State for login status

  const { logout } = useAuth();

  // Check login state on initial render
  useEffect(() => {
    const token = localStorage.getItem('token');
    setLogin(!!token); // Set login state based on token presence

    const fetchTheatres = async () => {
      try {
        const response = await fetch(API_URL + '/theatres'); // Replace with your actual API endpoint
        const data = await response.json();
        setTheatres(data);
      } catch (error) {
        console.error('Error fetching theatres:', error);
      }
    };

    fetchTheatres();
  }, []);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
    setMoviesDropdown(false);
    setProfileDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLogin(false);
      localStorage.removeItem('token'); // Clear the token
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="navbar-container">
      <div className="navbar">
        {/* Hamburger Menu */}
        <div className={`hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Logo */}
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/012/657/549/small/illustration-negative-film-reel-roll-tapes-for-movie-cinema-video-logo-vector.jpg"
            alt="Logo"
          />
          <p>XYZ MOVIES</p>
        </div>

        {/* Navigation Menu */}
        <div className={`menu ${menuActive ? 'active' : ''}`}>
          <Link to="/" className="master">
            Home
          </Link>

          {/* Dynamic Theatre Dropdown */}
          <div className="dropdown">
            <div className="master">Theatres</div>
            <div className={`dropdown-content ${moviesDropdown ? 'show' : ''}`}>
              {theatres &&
                theatres.map((theatre) => (
                  <Link key={theatre._id} to={`/${theatre.theatrename}`}>
                    {theatre.theatrename.toUpperCase()}
                  </Link>
                ))}
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="dropdown">
            <div
              className="master"
              onClick={() => setProfileDropdown(!profileDropdown)}
            >
              Login/Profile
            </div>
            <div className={`dropdown-content ${profileDropdown ? 'show' : ''}`}>
              {isLoggedIn ? (
                <>
                  <Link to="/profile">Profile</Link>
                  <Link to="/">Settings</Link>
                  <div style={{display:'flex',justifyContent:'center'}}>
                  <button onClick={handleLogout} style={{padding:'10px',width:'100%',background:'black',color:'white'}} className="logout-button">
                    Logout
                  </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile">
          <Link id="userButton" to={isLoggedIn ? '/profile' : '/login'}>
            {isLoggedIn ? 'Profile' : 'Login'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
