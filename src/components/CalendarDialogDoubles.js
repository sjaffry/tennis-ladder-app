import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
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
  const [showAvailablePlayers, setShowAvailablePlayers] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  
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

  // New function to handle date click
  const handleDateClick = (date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Only show dialog if this is a date where a match is possible
    if (currentUserDates.includes(dateString) && availabilityMap[dateString] >= 3) {
      const availablePlayersList = [];
      
      // Add current user
      if (allPlayersAvailability.currentUser) {
        availablePlayersList.push({
          id: 'current',
          name: `${allPlayersAvailability.currentUser.first_name} ${allPlayersAvailability.currentUser.last_name} (You)`,
        });
      }
      
      // Add other available players for this date
      Object.keys(allPlayersAvailability).forEach(playerId => {
        if (playerId === 'currentUser') return;
        
        const playerAvailability = allPlayersAvailability[playerId].availability;
        const isAvailable = playerAvailability.some(avail => avail.date === dateString);
        
        if (isAvailable) {
          availablePlayersList.push({
            id: playerId,
            name: `${allPlayersAvailability[playerId].first_name} ${allPlayersAvailability[playerId].last_name}`,
          });
        }
      });
      
      setAvailablePlayers(availablePlayersList);
      setSelectedDateString(dateString);
      setShowAvailablePlayers(true);
    } else {
      // If not enough players available, just call the original handleDateChange
      handleDateChange(date);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
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
            onChange={handleDateClick}
            value={selectedDate}
            tileClassName={getTileClassName}
            minDate={new Date()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCalendarClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* New Dialog to show available players */}
      <Dialog 
        open={showAvailablePlayers} 
        onClose={() => setShowAvailablePlayers(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Available Players for {formatDateForDisplay(selectedDateString)}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            The following players are available on this date:
          </Typography>
          <List>
            {availablePlayers.map((player, index) => (
              <React.Fragment key={player.id}>
                <ListItem>
                  <ListItemText primary={player.name} />
                </ListItem>
                {index < availablePlayers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Contact these players to set up a match.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDateChange(new Date(selectedDateString))}>
            Schedule Match
          </Button>
          <Button onClick={() => setShowAvailablePlayers(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarDialogDoubles;