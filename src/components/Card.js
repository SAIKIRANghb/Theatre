import React from 'react';
import { Link } from 'react-router-dom';
const Card = ({movie,theatreName,movieId}) => {
  const { imgSrc, title, genre, theatre} = movie;
    return (
      <div className="box">
        <img src={imgSrc} alt={title} />
        <h3>{title}</h3>
        <p>{genre}</p>
        <Link to={`/${theatreName}/${movieId}`} className="card-link">
          Book Now
        </Link>
      </div>
    );
};

export default Card;
