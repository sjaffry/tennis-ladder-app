import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TextField, TableRow, TableCell, Button, Box, Chip } from '@mui/material';
import MatchTableCell from './MatchTableCell';
import CalendarDialog from "./CalendarDialog";
import TimeslotDialog from "./TimeslotDialog";
import { fetchPlayerAvailability } from '../App';
import config from "../config";

const MatchTableRowSingles = ({ match, email, handleClickOpen, handleConfirmScoreClick, jwtToken, leagueName, myFirstName, myLastName, setOpenCalendar, openCalendar, sendingEmail, setSendingEmail }) => {
  // Keep existing states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState(null);
  const [opponentPlayerId, setOpponentPlayerId] = useState(null);
  const [opponentPlayerEmail, setOpponentPlayerEmail] = useState(null);
  const [opponentAvailableDates, setOpponentAvailableDates] = useState([]);
  const [playerAvailability, setPlayerAvailability] = useState([]);
  const [openTimeSlotDialog, setOpenTimeSlotDialog] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [opponentTimeSlots, setOpponentTimeSlots] = useState({});
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  
  // Add a local state for calendar dialog control
  const [localOpenCalendar, setLocalOpenCalendar] = useState(false);
  // Add a dialogId to force complete remount
  const [dialogId, setDialogId] = useState(Date.now());

  // Process availability data when it changes
  useEffect(() => {
    // Make sure playerAvailability exists and has data
    if (!playerAvailability || playerAvailability.length === 0) return;
    
    // Initialize objects
    const opponentDates = {};

    // Process availability data
    playerAvailability.forEach(({ available_date, morning, afternoon, evening }) => {
      // Ensure consistent date format
      const formattedDate = available_date.includes('T') 
        ? available_date.split('T')[0] 
        : available_date;
        
      const availability = { 
        morning: Boolean(morning), 
        afternoon: Boolean(afternoon), 
        evening: Boolean(evening) 
      };
      
      opponentDates[formattedDate] = availability;
    });
    
    // Debug - log the processed data once
    console.log('Processed opponent dates:', opponentDates);
    console.log('Available dates:', Object.keys(opponentDates));
    
    setOpponentAvailableDates(Object.keys(opponentDates));
    setOpponentTimeSlots(opponentDates);
  }, [playerAvailability]);

  const getTileClassName = useCallback(({ date }) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Add extra debugging to track the data used for coloring
    if (date.getDate() === 15) { // Only log once per month to reduce noise
      console.log(`getTileClassName checking date ${dateString}`);
      console.log(`Available dates at render time:`, opponentAvailableDates);
    }
    
    // Check if the date is in our available dates
    if (opponentAvailableDates.includes(dateString)) {
      const timeSlots = opponentTimeSlots[dateString];
      
      if (!timeSlots) return '';
      
      // Convert to booleans more explicitly to ensure consistent behavior
      const morning = Boolean(timeSlots.morning === true || timeSlots.morning === 1 || timeSlots.morning === "true" || timeSlots.morning === "1");
      const afternoon = Boolean(timeSlots.afternoon === true || timeSlots.afternoon === 1 || timeSlots.afternoon === "true" || timeSlots.afternoon === "1");
      const evening = Boolean(timeSlots.evening === true || timeSlots.evening === 1 || timeSlots.evening === "true" || timeSlots.evening === "1");
      
      // All time slots available
      if (morning && afternoon && evening) {
        return 'green-date';
      }
      
      // Two time slots available
      if (morning && afternoon && !evening) {
        return 'purple-yellow-date';
      }
      if (afternoon && evening && !morning) {
        return 'blue-yellow-date';
      }
      if (morning && evening && !afternoon) {
        return 'blue-purple-date';
      }
      
      // Single time slot available
      if (morning && !afternoon && !evening) {
        return 'purple-date';
      }
      if (afternoon && !morning && !evening) {
        return 'yellow-date';
      }
      if (evening && !morning && !afternoon) {
        return 'blue-date';
      }
    }
    
    return '';
  }, [opponentAvailableDates, opponentTimeSlots]);

  const handleDateChange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(date);
    const formattedDate = date.toLocaleString('en-US', { month: 'short' }).toUpperCase() + '-' + String(date.getDate()).padStart(2, '0');
    setSelectedDateFormatted(formattedDate);
    setSelectedTimeSlots(opponentTimeSlots[dateString] || {});
    setOpenTimeSlotDialog(true);
  };

  const handleSetupMatchClick = (match) => {
    // Generate a new dialog ID to force complete remount
    setDialogId(Date.now());
    
    // Clear state to prevent data mixing
    setOpponentAvailableDates([]);
    setOpponentTimeSlots({});
    setPlayerAvailability([]);
    
    const opponent_player_id = match.player1_email === email ? match.player2_id : match.player1_id;
    const opponent_player_email = match.player1_email === email ? match.player2_email : match.player1_email;
    
    console.log(`Setting up match with ${opponent_player_email}`);
    
    setOpponentPlayerId(opponent_player_id);
    setOpponentPlayerEmail(opponent_player_email);
    
    // Open local calendar first
    setLocalOpenCalendar(true);
    
    // Fetch data after opening calendar
    fetchPlayerAvailability(jwtToken, opponent_player_email, (availability) => {
      console.log(`Fetched availability for ${opponent_player_email}:`, availability);
      
      if (!availability || availability.length === 0) {
        console.log('No availability data returned');
        return;
      }
      
      setPlayerAvailability(availability);
    });
  };

  // Other handlers remain the same
  const handleScheduleMatchClick = () => {
    setOpenMessageDialog(true);
  };

  const handleSendMessage = () => {
    // Existing send message logic
    setSendingEmail(true);
    setLocalOpenCalendar(false);
    setOpenTimeSlotDialog(false);
    const url1 = 'https://f6f3hiboo3.execute-api.us-west-2.amazonaws.com/Prod';

    // Format opponentPlayerEmail as a list before sending
    const opponentEmails = [opponentPlayerEmail];
    axios.get(url1, {
      params: {
        player_email: email,
        opponent_email: opponentEmails,
        player_first_name: myFirstName,
        player_last_name: myLastName,
        match_date: selectedDateFormatted,
        league_name: leagueName,
        match_type: 'Singles',
        organizer_message: message
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      alert("Email successfully sent to opponent!");
      setOpenMessageDialog(false);
      setSendingEmail(false);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error sending email to reciepients. Please try again!');
    });
  };

  return (
    <>
      <TableRow sx={{ 
        '&:hover': { 
          backgroundColor: 'rgba(224, 231, 255, 0.1)',
          transition: 'background-color 0.2s ease'
        }
      }}>
        {/* Player names with modern styling */}
        <TableCell sx={{ 
          color: '#374151', 
          fontWeight: match.player1_id === match.winner_id ? 700 : 500,
          fontSize: '0.9rem'
        }}>
          {match.player1_fname} {match.player1_lname} 
          {match.p1_rating && (
            <Chip 
              label={match.p1_rating} 
              size="small" 
              sx={{ 
                ml: 1, 
                height: 20, 
                fontSize: '0.7rem',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#4F46E5'
              }} 
            />
          )}
          {match.player1_id === match.winner_id && (
            <Chip 
              label="Winner" 
              size="small" 
              color="success"
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
            />
          )}
        </TableCell>
        <TableCell sx={{ 
          color: '#6B7280', 
          fontWeight: 600,
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          vs
        </TableCell>
        <TableCell sx={{ 
          color: '#374151', 
          fontWeight: match.player2_id === match.winner_id ? 700 : 500,
          fontSize: '0.9rem'
        }}>
          {match.player2_fname} {match.player2_lname} 
          {match.p2_rating && (
            <Chip 
              label={match.p2_rating} 
              size="small" 
              sx={{ 
                ml: 1, 
                height: 20, 
                fontSize: '0.7rem',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#4F46E5'
              }} 
            />
          )}
          {match.player2_id === match.winner_id && (
            <Chip 
              label="Winner" 
              size="small" 
              color="success"
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
            />
          )}
        </TableCell>
        <TableCell>
          <TableRow>
            {["set1_p1", "set1_p2", "set2_p1", "set2_p2", "set3_p1", "set3_p2"].map((setKey, idx) => (
              <MatchTableCell
                key={setKey}
                content={match[setKey]}
                isDark={idx % 2 === 0}
              />
            ))}
            <TableCell>
              {match.entered_by === null ? (
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    onClick={() => handleClickOpen({ ...match })}
                    size="small"
                    sx={{
                      width: 130,
                      height: 32,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      textTransform: 'none',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
                      },
                    }}
                  >
                    Add Score
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleSetupMatchClick(match)}
                    size="small"
                    sx={{
                      width: 130,
                      height: 32,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      color: 'white',
                      textTransform: 'none',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
                      },
                    }}
                  >
                    Setup Match
                  </Button>
                </Box>
              ) : (
                /* Confirm score button logic */
                match.entered_by !== email &&
                match.player1_confirmed !== email &&
                match.player2_confirmed !== email ? (
                <Button
                  variant="contained"
                  onClick={() => handleConfirmScoreClick({ ...match })}
                  size="small"
                  sx={{
                    width: 130,
                    height: 32,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)',
                    },
                  }}
                >
                  Confirm Score
                </Button>
              ) : match.player1_confirmed == null || match.player2_confirmed == null ? (
                <Button
                  variant="outlined"
                  disabled
                  size="small"
                  sx={{
                    width: 130,
                    height: 32,
                    fontSize: '0.7rem',
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: '#D1D5DB',
                    color: '#9CA3AF',
                  }}
                >
                  Pending Confirmation
                </Button>
              ) : null
              )}
            </TableCell>
          </TableRow>
        </TableCell>
      </TableRow>

      {/* Create a new instance of CalendarDialog for each open request */}
      {localOpenCalendar && (
        <CalendarDialog
          key={dialogId} // This forces a complete remount each time
          openCalendar={localOpenCalendar}
          setOpenCalendar={setLocalOpenCalendar}
          isOpponentCalendar={true}
          handleDateChange={handleDateChange}
          selectedDate={selectedDate}
          getTileClassName={getTileClassName}
          isOpponent={true}
          opponentName={match.player1_email === email ? `${match.player2_fname} ${match.player2_lname}` : `${match.player1_fname} ${match.player1_lname}`}
          opponentEmail={opponentPlayerEmail}
        />
      )}
      
      {/* Time Slot Selection Dialog */}
      <TimeslotDialog
        openTimeSlotDialog={openTimeSlotDialog}
        setOpenTimeSlotDialog={setOpenTimeSlotDialog}
        isOpponentTab={true}
        selectedTimeSlots={selectedTimeSlots}
        handleScheduleMatchClick={handleScheduleMatchClick}
        openMessageDialog={openMessageDialog}
        setOpenMessageDialog={setOpenMessageDialog}
        selectedDateFormatted={selectedDateFormatted}
        match={match}
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        sendingEmail={sendingEmail}
      />
    </>
  );
};

export default MatchTableRowSingles;