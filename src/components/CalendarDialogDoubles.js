import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Divider, Typography, CircularProgress, TextField, Box, Checkbox, FormControlLabel } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarDialogDoubles.css';
import axios from 'axios';

const CalendarDialogDoubles = ({ 
  openCalendar, 
  setOpenCalendar, 
  handleDateChange, 
  selectedDate, 
  allPlayersAvailability,
  sendingEmail,
  setSendingEmail,
  email,
  jwtToken,
  leagueName
}) => {
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [currentUserDates, setCurrentUserDates] = useState([]);
  const [showAvailablePlayers, setShowAvailablePlayers] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [openDoublesMessageDialog, setOpenDoublesMessageDialog] = useState(false);
  const [doublesMessage, setDoublesMessage] = useState('');
  
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
      // Auto-select the current user
      const currentUser = availablePlayersList.find(player => player.id === 'current');
      setSelectedPlayers(currentUser ? [currentUser] : []);
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

  const handleSendDoublesMessage = async () => {
    if (!doublesMessage.trim()) {
      alert('Please enter a message before sending.');
      return;
    }
    
    // Extract email addresses of selected players
    const selectedPlayerEmails = selectedPlayers.map(player => {
      if (player.id === 'current') {
        // Get current user's email
        return allPlayersAvailability.currentUser?.email || 'Current user email not found';
      } else {
        // Get other player's email
        return allPlayersAvailability[player.id]?.email || 'Email not found';
      }
    });
    
    setSendingEmail(true);
    const url = 'https://7vhzcxuhc8.execute-api.us-west-2.amazonaws.com/Prod';

    // Filter out current user's email from selectedPlayerEmails
    const opponentEmails = selectedPlayerEmails.filter(email => 
      email !== allPlayersAvailability.currentUser?.email
    );

    axios.get(url, {
      params: {
      player_email: email,
      opponent_email: opponentEmails,
      player_first_name: `${allPlayersAvailability.currentUser?.first_name || ''}`,
      player_last_name: `${allPlayersAvailability.currentUser?.last_name || ''}`,
      match_date: selectedDateString,
      league_name: leagueName,
      match_type: 'Doubles',
      organizer_message: doublesMessage
      },
      headers: {
      Authorization: jwtToken
      }
    })
    .then(response => {
      alert("Email successfully sent to opponent!");
      setSendingEmail(false);
      setOpenDoublesMessageDialog(false);
      setDoublesMessage('');
      setShowAvailablePlayers(false);
      setOpenCalendar(false);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error sending email to reciepients. Please try again!');
    });
  };

  const handleScheduleDoublesMatch = (date) => {
    setOpenDoublesMessageDialog(true);
  };

  // Handle player selection for doubles match
  const handlePlayerSelection = (player, isChecked) => {
    // Don't allow deselecting the current user
    if (player.id === 'current') return;
    
    if (isChecked) {
      if (selectedPlayers.length < 4) { // 1 current user + 3 others = 4 total
        setSelectedPlayers([...selectedPlayers, player]);
      }
    } else {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    }
  };

  // Check if player is selected
  const isPlayerSelected = (playerId) => {
    return selectedPlayers.some(p => p.id === playerId);
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
            Select 3 additional players to join you for the doubles match:
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Selected: {selectedPlayers.length - 1}/3 additional players
          </Typography>
          <List>
            {availablePlayers.map((player, index) => (
              <React.Fragment key={player.id}>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPlayerSelected(player.id)}
                        onChange={(e) => handlePlayerSelection(player, e.target.checked)}
                        disabled={
                          player.id === 'current' || // Current user is always selected and disabled
                          (!isPlayerSelected(player.id) && selectedPlayers.length >= 4) // Disable others when 4 are selected
                        }
                      />
                    }
                    label={player.name}
                  />
                </ListItem>
                {index < availablePlayers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleScheduleDoublesMatch(new Date(selectedDateString))}
            disabled={selectedPlayers.length !== 4}
          >
            Schedule Match
          </Button>
          <Button onClick={() => setShowAvailablePlayers(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Message Dialog */}
      <Dialog open={openDoublesMessageDialog} onClose={() => setOpenDoublesMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Doubles match for {formatDateForDisplay(selectedDateString)}</DialogTitle>
        {sendingEmail && <CircularProgress color="inherit" />}    
        <DialogContent>
          {/* Show available players in the message dialog */}
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Selected Players:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedPlayers.map(player => player.name).join(', ')}
            </Typography>
          </Box>
          
          <TextField
            label="Enter your message"
            multiline
            fullWidth
            rows={4}
            value={doublesMessage}
            onChange={(e) => setDoublesMessage(e.target.value)}
            variant="outlined"
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDoublesMessageDialog(false)} color="secondary" variant="contained">
            Cancel
          </Button>
          <Button onClick={handleSendDoublesMessage} color="primary" variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarDialogDoubles;