import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, TableRow, TableCell, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import MatchTableCell from './MatchTableCell';

const MatchTableRowSingles = ({ match, email, handleClickOpen, handleConfirmScoreClick, jwtToken, leagueName, myName }) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [opponentPlayerId, setOpponentPlayerId] = useState(null);
  const [opponentPlayerEmail, setOpponentPlayerEmail] = useState(null);
  const [myAvailableDates, setMyAvailableDates] = useState([]);
  const [opponentAvailableDates, setOpponentAvailableDates] = useState([]);
  const [playerAvailability, setPlayerAvailability] = useState([]);
  const [openTimeSlotDialog, setOpenTimeSlotDialog] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [isOpponentTab, setIsOpponentTab] = useState(false);
  const [opponentTimeSlots, setOpponentTimeSlots] = useState({});
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (openCalendar) {
      fetchAvailableDates();
    }
  }, [openCalendar]);

  useEffect(() => {
    // Initialize objects
    const myDates = {};
    const opponentDates = {};

    // Process availability data
    playerAvailability.forEach(({ player_id, available_date, morning, afternoon, evening }) => {
      const availability = { morning: !!morning, afternoon: !!afternoon, evening: !!evening };

      if (player_id === myPlayerId) {
        myDates[available_date] = availability;
      } else if (player_id === opponentPlayerId) {
        opponentDates[available_date] = availability;
      }
    });

    setMyAvailableDates(Object.keys(myDates));
    setOpponentAvailableDates(Object.keys(opponentDates));
    setOpponentTimeSlots(opponentDates);
  }, [playerAvailability]);

  const fetchAvailableDates = async () => {

    // Logged in user's email is the variable "email". So we do this test to identify the correct player id of logged in user
    const my_player_id = match.player1_email === email ? match.player1_id : match.player2_id;
    const opponent_player_id = match.player1_email === email ? match.player2_id : match.player1_id;
    const opponent_player_email = match.player1_email === email ? match.player2_email : match.player1_email;
    setMyPlayerId(my_player_id);
    setOpponentPlayerId(opponent_player_id);
    setOpponentPlayerEmail(opponent_player_email);

    const url1 = 'https://r8jma7j64l.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        player_id: my_player_id,
        opponent_id: opponent_player_id
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const availability_data = response.data["Availability"];
      setPlayerAvailability(availability_data);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Session expired! Please refresh the page and try again.');
    });
  };

  const getTileClassName = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];

    if (selectedTab === 0 && myAvailableDates.includes(dateString)) {
      return 'green-date';
    }

    if (selectedTab === 1 && opponentAvailableDates.includes(dateString)) {
      return 'green-date';
    }

    return '';
  };

  const handleDateChange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(date);
    setIsOpponentTab(selectedTab === 1);

    if (selectedTab === 0 || (selectedTab === 1 && opponentAvailableDates.includes(dateString))) {
      if (selectedTab === 1 && opponentAvailableDates.includes(dateString)) {
        setSelectedTimeSlots(opponentTimeSlots[dateString] || {});
      } else {
        setSelectedTimeSlots({ morning: false, afternoon: false, evening: false });
      }
      setOpenTimeSlotDialog(true);
    } else {
      setSelectedTimeSlots({ morning: false, afternoon: false, evening: false });
      setOpenTimeSlotDialog(true);
    }
  };

  const handleTimeSlotChange = (event) => {
    setSelectedTimeSlots({
      ...selectedTimeSlots,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSaveAvailability = async () => {
    const dateString = selectedDate.toISOString().split('T')[0];

    const availabilityData = {
      date: dateString,
      morning: selectedTimeSlots.morning,
      afternoon: selectedTimeSlots.afternoon,
      evening: selectedTimeSlots.evening,
      player_id: myPlayerId
    };

    const url1 = 'https://m2uxaou13f.execute-api.us-west-2.amazonaws.com/Prod';

    axios.put(
      url1,
      {
        availability_data: availabilityData
      },
      {
        headers: {
          Authorization: jwtToken,
        },
      }
    )
      .then(response => {
        // Handle success
        console.log("Availability saved successfully!");
        setOpenTimeSlotDialog(false);
      })
      .catch(error => {
        console.error("Error saving availability:", error);
        alert('Cannot save new league: ' + error.message);
      });
  };

  const handleScheduleMatchClick = () => {
    setOpenMessageDialog(true);
  };

  const handleSendMessage = () => {
    setOpenMessageDialog(false);
    setOpenCalendar(false);
    setOpenTimeSlotDialog(false);
    const url1 = 'https://7vhzcxuhc8.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        player_email: email,
        opponent_email: opponentPlayerEmail,
        player_name: myName,
        match_date: '2004-01-01',
        league_name: leagueName,
        organizer_message: message
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      alert("Email successfully sent to opponent!");
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error sending email to reciepients. Please try again!');
    });
  };

  return (
    <>
      <TableRow>
        <TableCell>{match.player1_fname} {match.player1_lname}</TableCell>
        <TableCell> vs </TableCell>
        <TableCell>{match.player2_fname} {match.player2_lname}</TableCell>
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
                    color="primary"
                    onClick={() => handleClickOpen({ ...match })}
                    sx={{ width: '60px', height: '30px', fontSize: '9px' }}
                  >
                    Add Score
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setOpenCalendar(true)}
                    sx={{ width: '60px', height: '30px', fontSize: '9px' }}
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
                  sx={{ width: '60px', height: '30px', fontSize: '9px' }}
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
      <Dialog open={openCalendar} onClose={() => setOpenCalendar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Setup Match - Choose an Available Date</DialogTitle>
        <DialogContent>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} centered>
            <Tab label="My Calendar" />
            <Tab label="Opponent's Calendar" />
          </Tabs>

          <Box display="flex" justifyContent="center" mt={2}>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={getTileClassName}
              minDate={new Date()} 
            />
          </Box>
          {/* Legend */}
          <Box display="flex" alignItems="center" justifyContent="center" mt={2} gap={1}>
            <Box width={16} height={16} bgcolor="#4caf50" borderRadius="50%" />
            <span>Available</span>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCalendar(false)} color="secondary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Slot Selection Dialog */}
      <Dialog open={openTimeSlotDialog} onClose={() => setOpenTimeSlotDialog(false)}>
        <DialogTitle>{isOpponentTab ? "Schedule Match" : "Select Time Slot"}</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox name="morning" checked={selectedTimeSlots.morning || false} onChange={handleTimeSlotChange} disabled={isOpponentTab} />}
              label="Morning"
            />
            <FormControlLabel
              control={<Checkbox name="afternoon" checked={selectedTimeSlots.afternoon || false} onChange={handleTimeSlotChange} disabled={isOpponentTab} />}
              label="Afternoon"
            />
            <FormControlLabel
              control={<Checkbox name="evening" checked={selectedTimeSlots.evening || false} onChange={handleTimeSlotChange} disabled={isOpponentTab} />}
              label="Evening"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={isOpponentTab ? handleScheduleMatchClick : handleSaveAvailability} color="primary" variant="contained">
            {isOpponentTab ? "Schedule Match" : "Save Availability"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Message Dialog */}
      <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{match.player1_fname} vs {match.player2_fname}</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter your message"
            multiline
            fullWidth
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)} color="secondary" variant="contained">
            Cancel
          </Button>
          <Button onClick={handleSendMessage} color="primary" variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
      <style>
        {`
          .react-calendar__tile.green-date {
            background-color: #4caf50 !important; 
            color: white;
            border-radius: 50%;
          }
        `}
      </style>
    </>
  );
};

export default MatchTableRowSingles;