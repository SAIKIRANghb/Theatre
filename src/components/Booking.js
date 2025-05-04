import { useState, useEffect } from "react";
import '../styles/Booking.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from "../api";

// Declare the seat code map globally
let seatCodeMap = {}; // This will map seat IDs like '0-2' to human-readable seat codes like 'A1'

const MovieSeatBooking = (props) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [unavailableSeats, setUnavailableSeats] = useState([]);
  const [validSeats, setValidSeats] = useState([]);
  const [rows, setRows] = useState(0);
  const [seatsPerRow, setSeatsPerRow] = useState(0);
  const [classInfo, setClassInfo] = useState([]);
  const [classPrices, setClassPrices] = useState([]);
  const [theatreName, setTheatreName] = useState('');
  const [movieName, setMovieName] = useState('');
  const [timings, setTimings] = useState('');
  const [slot, setSlot] = useState('');
  const [date, setDate] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const movieParam = useParams();
  const [screenNo,setScreenNo] = useState('');
  const screenId = movieParam.screen;
  const [isBookingRoute, setIsBookingRoute] = useState(true);

  // Find class price for a specific row
  const findClassPriceForRow = (rowIndex) => {
    // Sort classPrices in ascending order of classNo
    const sortedClassPrices = [...classPrices].sort((a, b) => a.classNo - b.classNo);
    
    // Find the appropriate class price for the row
    for (let i = 0; i < sortedClassPrices.length; i++) {
      const currentClass = sortedClassPrices[i];
      const nextClass = sortedClassPrices[i + 1];
      
      // If it's the last class or the row is within this class's range
      if (
        i === sortedClassPrices.length - 1 && rowIndex >= currentClass.classNo
      ) {
        return currentClass.price;
      }
      
      // Check if row is within the current class range but before the next class
      if (
        rowIndex >= currentClass.classNo && 
        (!nextClass || rowIndex < nextClass.classNo)
      ) {
        return currentClass.price;
      }
    }
    
    // Fallback to 0 if no price found
    return 0;
  };

  // Fetching screen data from the database
  useEffect(() => {
    const fetchScreenData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL+`/screens/${screenId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (data) {
          setScreenNo(data.screenNo);
          const token = localStorage.getItem('token');
          const theatreRes = await fetch(API_URL+`/theatres/${data.theatre}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const theatreData = await theatreRes.json();
          setTheatreName(theatreData.theatreName)
          
          if (!theatreRes.ok || !theatreData || props.theatre !== theatreData.theatrename) {
            setIsBookingRoute(false);
            navigate('/*');
            return;
          }

          const movieRes = await fetch(API_URL+`/movies/${movieParam.movieId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const movieData = await movieRes.json();
          
          if (!movieRes.ok || !movieData) {
            setIsBookingRoute(false);
            navigate('/*');
            return;
          }

          const time = movieParam.timings?.split('+')[0] || '';
          const dateValue = movieParam.timings?.split('+')[1] || '';

          const slotRes = await fetch(API_URL+`/slotsQuery/?movieId=${movieData?._id}&theatreId=${theatreData?._id}&screenId=${data?._id}&time=${time}&date=${dateValue}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const slotsData = await slotRes.json();

          if (!slotsData || slotsData.length === 0) {
            setIsBookingRoute(false);
            navigate('/*');
            return;
          }

          setUnavailableSeats(slotsData?.[0]?.selectedSeats || []);
          setSlot(slotsData?.[0]?.time || '');
          setDate(slotsData?.[0]?.date?.split('T')[0] || '');
          setClassPrices(slotsData?.[0]?.classPrices || []);

          setTheatreName(theatreData?.theatrename || '');
          setMovieName(movieData?.title || '');
          setValidSeats(data?.validSeats || []);
          setRows(data?.dim?.NumRows || 0);
          setSeatsPerRow(data?.dim?.SeatsPerRow || 0);
          setClassInfo(data?.classInfo || []);
        } else {
          setIsBookingRoute(false);
          navigate('/*');
        }

      } catch (error) {
        console.error('Error fetching screen data:', error);
      }
    };

    fetchScreenData();
  }, [screenId, props.theatreId]);

  const toggleSeat = (rowIndex, seatIndex) => {
    const seatId = `${rowIndex}-${seatIndex}`;
  
    if (validSeats && validSeats.includes(seatId) && unavailableSeats && !unavailableSeats.includes(seatId)) {
      setSelectedSeats(prevSeats =>
        prevSeats.includes(seatId)
          ? prevSeats.filter(id => id !== seatId)
          : [...prevSeats, seatId]
      );
    }
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const rowIndex = parseInt(seatId.split('-')[0]);
      const rowPrice = findClassPriceForRow(rowIndex);
      return total + rowPrice;
    }, 0);
  };

  const handleBooking = async () => {
    const currentScreenId = screenId;
  
    const selectedSeatCodeMap = {};
    selectedSeats.forEach(seatId => {
      selectedSeatCodeMap[seatId] = seatCodeMap[seatId];
    });
  
    const bookingData = {
      movieId: movieParam.movieId,
      theatreId: props.theatreId,
      screenId: currentScreenId,
      screenNo: screenNo,
      date: date,
      timeSlot: slot,
      selectedSeats: selectedSeats,
      selectedSeatCodeMap,
      totalPrice: calculateTotalPrice(),
      theatrename: theatreName
    };
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch( API_URL+ '/book', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log('Booking successful:', result);
        alert('Booking successful');
        window.location.reload();
      } else {
        alert('Booking failed: '+ result.message);
        console.error('Booking failed:', result.message);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error booking seats:', error);
    }
  };
  

  // Rendering seats dynamically
  const renderSeats = () => {
    let seatMap = [];
    let currentClassName = null;
    let currentClassPrice = null;

    for (let i = 0; i < rows; i++) {
      let row = [];
      let validSeatCounter = 0;

      // Find the price for this row's class
      const rowPrice = findClassPriceForRow(i);

      // Find the class info for this row
      const classInfoEntry = classInfo?.find(classEntry => 
        classEntry.classNo === i
      );

      // Check if we need to add a new class heading
      if (classInfoEntry && 
          (currentClassName !== classInfoEntry.className || 
           currentClassPrice !== rowPrice)) {
        // Add class name display
        seatMap.push(
          <div key={`class-display-${i}`} className="class-display">
            <h2>{classInfoEntry.className} - ₹{rowPrice} per ticket</h2>
          </div>
        );
        
        currentClassName = classInfoEntry.className;
        currentClassPrice = rowPrice;
      }

      for (let j = 0; j < seatsPerRow; j++) {
        const seatId = `${i}-${j}`;
        const isValid = validSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);
        const isUnavailable = unavailableSeats.includes(seatId);

        if (isValid) {
          validSeatCounter++;
          const seatCode = `${String.fromCharCode(65 + i)}${validSeatCounter}`;
          seatCodeMap[seatId] = seatCode;

          row.push(
            <button
              key={seatId}
              className={`seat ${isSelected ? 'selected' : isUnavailable ? 'unavailable' : ''}`}
              onClick={() => toggleSeat(i, j)}
              disabled={isUnavailable}
            >
              {seatCode}
            </button>
          );
        } else {
          row.push(
            <div key={seatId} className="seat placeholder"></div>
          );
        }
      }

      seatMap.push(
        <div key={i} className={`row row-${i} ${classInfoEntry ? classInfoEntry.classType : ''}`}>
          {row}
        </div>
      );
    }

    return seatMap;
  };

  return (
    <div className="movie-booking-card">
      <header className="card-header">
        <h1 className="card-title">{props.theatre.toUpperCase()} Seat Booking <p style={{ color: 'white' }}>{movieName}</p></h1>
        <p className="card-description">Choose your seats.</p>
      </header>
      <main className="card-content">
        <div className="screen-container">
          <div className="screen">
            <span>Screen {screenNo} - {date} / {slot}</span>
          </div>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unavailable"></div>
            <span>Unavailable</span>
          </div>
        </div>
        <div className="theaterX">
          <div className="seating-layout">
            {renderSeats()}
          </div>
        </div>
        <h1 style={{ textAlign: 'center', backgroundColor: '#01cad1c9', borderRadius: '0 0 150px 150px' }}>Screen this way</h1>
      </main>
      <footer className="card-footer">
        <div className="info">
          <span className="info-icon">🎟️</span>
          <span>Selected Seats: {selectedSeats.length}</span>
        </div>
        <div className="info">
          <span>Total Price: ₹{calculateTotalPrice()}</span>
        </div>
        <div className="actions">
          <button className="cancel-button" onClick={() => setSelectedSeats([])}>Clear</button>
          <button className="book-button" onClick={handleBooking}>Book</button>
        </div>
      </footer>
    </div>
  );
}

export default MovieSeatBooking;



