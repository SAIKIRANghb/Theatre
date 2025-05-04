import React, { Fragment, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, AdminRoute } from './ProtectedRoute';
import Login from './components/Login';
import Navbar from './components/Navbar';
import MovieSlider from './components/MovieSlider';
import Footer from './components/Footer';
import Theatres from './components/Theatres';
import './App.css';
import Booking from './components/Booking';
import AdminApp from './components/adminApp';
import MoviePage from './components/MoviePage';
import { API_URL } from './api';
import Register from './components/Register';
import UserProfileDashboard from './components/UserDashboard';

const App = () => {
  const [theatres, setTheatres] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchAllTheatres = async () => {
      try {
        const response = await fetch(API_URL+'/theatres');
        const data = await response.json();
        setTheatres(data);
      } catch (error) {
        console.error('Error fetching all theatres:', error);
      }
    };
    fetchAllTheatres();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isProfileRoute = location.pathname === '/profile';  // Check if the route is /profile

  return (
    <div className='Thbody'>
      {/* Conditionally render Navbar and Footer only if it's not the /profile route */}
      {!isAdminRoute && !isProfileRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/*" element={<AdminApp />} />
        </Route>

        {/* Protected Routes */}
        {theatres && theatres.map(theatre => (
          <Fragment key={theatre._id}>
            <Route 
              path={`/${theatre.theatrename}`} 
              element={<Theatres theatre={theatre.theatrename} />} 
            />
            <Route 
              path={`/${theatre.theatrename}/:movieId/:screen/:timings`} 
              element={<Booking theatre={theatre.theatrename} theatreId={theatre._id} />} 
            />
            <Route 
              path={`/${theatre.theatrename}/:movieId`} 
              element={<MoviePage theatre={theatre.theatrename} />} 
            />
          </Fragment>
        ))}

        {/* Protected Route for User Profile */}
        <Route element={<ProtectedRoute />}>
          <Route 
            path="/profile" 
            element={<div className='th-user-profile'><UserProfileDashboard /></div>} 
          />
        </Route>

        {/* Public Home Route */}
        <Route path="/" element={<MovieSlider />} />

        {/* 404 Route */}
        <Route 
          path="/*" 
          element={
            <div style={{
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              height:'100vh'
            }}>
              <h1>PAGE NOT FOUND</h1>
            </div>
          } 
        />
      </Routes>

      {/* Conditionally render Footer only if it's not the /profile route */}
      {!isAdminRoute && !isProfileRoute && <Footer />}
    </div>
  );
};

const Main = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default Main;
