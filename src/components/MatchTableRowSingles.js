import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, TableRow, TableCell, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MatchTableCell from './MatchTableCell';
import CalendarDialog from "./CalendarDialog";
import TimeslotDialog from "./TimeslotDialog";
import { fetchPlayerAvailability } from '../App';
import config from "../config";

const MatchTableRowSingles = ({ match, email, handleClickOpen, handleConfirmScoreClick, jwtToken, leagueName, myName }) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);
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
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (openCalendar) {
      const opponent_player_id = match.player1_email === email ? match.player2_id : match.player1_id;
      const opponent_player_email = match.player1_email === email ? match.player2_email : match.player1_email;
      setOpponentPlayerId(opponent_player_id);
      setOpponentPlayerEmail(opponent_player_email);
      fetchPlayerAvailability(jwtToken, opponent_player_email, setPlayerAvailability);
    }
  }, [openCalendar]);

  useEffect(() => {
    // Initialize objects
    const opponentDates = {};

    // Process availability data
    playerAvailability.forEach(({ player_id, available_date, morning, afternoon, evening }) => {
      const availability = { morning: !!morning, afternoon: !!afternoon, evening: !!evening };
      opponentDates[available_date] = availability;
    });
    setOpponentAvailableDates(Object.keys(opponentDates));
    setOpponentTimeSlots(opponentDates);
  }, [playerAvailability]);

  const getTileClassName = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];
    console.log('dateString:', dateString);

    if (selectedTab === 1 && opponentAvailableDates.includes(dateString)) {
      const timeSlots = opponentTimeSlots[dateString];
      console.log('Time slots:', timeSlots);
      
      // Check if all time slots are available
      if (timeSlots.morning && timeSlots.afternoon && timeSlots.evening) {
        console.log('green-date');
        return 'green-date';
      }
      
      // Check combinations of two time slots
      if (timeSlots.morning && timeSlots.afternoon) {
        return 'purple-yellow-date';
      }
      if (timeSlots.afternoon && timeSlots.evening) {
        return 'blue-yellow-date';
      }
      if (timeSlots.morning && timeSlots.evening) {
        return 'blue-purple-date';
      }
      if (timeSlots.morning && !timeSlots.evening && !timeSlots.afternoon) {
        return 'purple-date';
      }
      if (timeSlots.afternoon && !timeSlots.evening && !timeSlots.morning) {
        return 'yellow-date';
      }
      if (timeSlots.evening && !timeSlots.morning && !timeSlots.afternoon) {
        return 'blue-date';
      }
    }

    console.log('returning blank')
    return '';
  };

  const handleDateChange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(date);
    const formattedDate = date.toLocaleString('en-US', { month: 'short' }).toUpperCase() + '-' + String(date.getDate()).padStart(2, '0');
    setSelectedDateFormatted(formattedDate);
    setSelectedTimeSlots(opponentTimeSlots[dateString] || {});
    setOpenTimeSlotDialog(true);
  };

  const handleScheduleMatchClick = () => {
    setOpenMessageDialog(true);
  };

  const handleSendMessage = () => {
    setSendingEmail(true);
    setOpenCalendar(false);
    setOpenTimeSlotDialog(false);
    const url1 = 'https://f6f3hiboo3.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        player_email: email,
        opponent_email: opponentPlayerEmail,
        player_name: myName,
        match_date: selectedDateFormatted,
        league_name: leagueName,
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
      <TableRow>
        <TableCell>{match.player1_fname} {match.player1_lname} {match.p1_rating} {match.player1_id === match.winner_id ? '(winner)' : ''}</TableCell>
        <TableCell> vs </TableCell>
        <TableCell>{match.player2_fname} {match.player2_lname} {match.p2_rating} {match.player2_id === match.winner_id ? '(winner)' : ''}</TableCell>
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
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    onClick={() => handleClickOpen({ ...match })}
                    sx={{
                      width: '60px', 
                      height: '30px', 
                      fontSize: '9px',
                      fontWeight: 'bold',
                      backgroundColor: config.theme.secondaryBgColor, 
                      border: 'none',
                      color: config.theme.buttonTextColor, 
                      '&:hover': {
                        backgroundColor: 'transparent', 
                        border: `2px solid ${config.theme.buttonBorderColor}`,
                      },
                    }}
                  >
                    Add Score
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setOpenCalendar(true)}
                    sx={{
                      width: '60px', 
                      height: '30px', 
                      fontSize: '9px',
                      fontWeight: 'bold',
                      backgroundColor: config.theme.secondaryBgColor,  
                      border: 'none',
                      color: config.theme.buttonTextColor, 
                      '&:hover': {
                        backgroundColor: 'transparent', 
                        border: `2px solid ${config.theme.buttonBorderColor}`,
                      },
                    }}
                  >
                    Setup Match
                  </Button>
                </Box>
              ) : match.entered_by !== email &&
                match.player1_confirmed !== email &&
                match.player2_confirmed !== email ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleConfirmScoreClick({ ...match })}
                  sx={{
                    width: '60px', 
                    height: '30px', 
                    fontSize: '9px',
                    fontWeight: 'bold',
                    backgroundColor: config.theme.secondaryBgColor, 
                    border: 'none',
                    color: config.theme.buttonTextColor, 
                    '&:hover': {
                      backgroundColor: 'transparent', 
                      border: `2px solid ${config.theme.buttonBorderColor}`,
                    },
                  }}
                >
                  Confirm score
                </Button>
              ) : match.player1_confirmed == null || match.player2_confirmed == null ? (
                <Button
                  variant="contained"
                  sx={{ width: '60px', height: '60px', fontSize: '9px' }}
                  disabled
                >
                  Pending confirm player 2
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        </TableCell>
      </TableRow>

      {/* Calendar Dialog */}
      <CalendarDialog
        openCalendar={openCalendar}
        setOpenCalendar={setOpenCalendar}
        isOpponentCalendar={true}
        handleDateChange={handleDateChange}
        selectedDate={selectedDate}
        getTileClassName={getTileClassName}
        isOpponent={true}
      />
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