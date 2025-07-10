import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarDialogDoubles.css';

const CalendarDialogDoubles = ({ 
  openCalendar, 
  setOpenCalendar, 
  handleDateChange, 
  selectedDate, 
  allPlayersAvailability
}) => {
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [currentUserDates, setCurrentUserDates] = useState([]);
  
  // Process player availability data when it changes
  useEffect(() => {

    if (!allPlayersAvailability || Object.keys(allPlayersAvailability).length === 0) {
      return;
    }
    
    const dateCountMap = {};
    let userDates = [];
    
    // Collect the current user's available dates
    if (allPlayersAvailability.currentUser) {
      userDates = allPlayersAvailability.currentUser.availability.map(date => date.date);
      setCurrentUserDates(userDates);
    }
    
    // Count how many players are available on each date
    Object.keys(allPlayersAvailability).forEach(playerId => {
      if (playerId === 'currentUser') return; // Skip current user when counting others

      const playerDates = allPlayersAvailability[playerId].availability.map(date => date.date);
      
      playerDates.forEach(date => {
        if (!dateCountMap[date]) {
          dateCountMap[date] = 1;
        } else {
          dateCountMap[date]++;
        }
      });
    });
    
    setAvailabilityMap(dateCountMap);
  }, [allPlayersAvailability]);
  
  // Determine tile class based on availability
  const getTileClassName = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];
    const classes = [];
    
    // Add class if the current user is available on this date
    if (currentUserDates.includes(dateString)) {
      classes.push('user-available');
    }
    
    // Add class if at least 3 other players are available on this date
    if (availabilityMap[dateString] >= 3 && currentUserDates.includes(dateString)) {
      classes.push('match-possible');
    }
    
    return classes.join(' ');
  };
  
  const handleCalendarClose = () => {
    setOpenCalendar(false);
  };

  return (
    <Dialog open={openCalendar} onClose={handleCalendarClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select a Date for Match</DialogTitle>
      <DialogContent>
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="color-box user-available"></div>
            <span>Your availability</span>
          </div>
          <div className="legend-item">
            <div className="color-box match-possible"></div>
            <span>Match possible (3+ players available)</span>
          </div>
        </div>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={getTileClassName}
          minDate={new Date()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCalendarClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarDialogDoubles;