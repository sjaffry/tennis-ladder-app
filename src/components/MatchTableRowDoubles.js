import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, TableRow, TableCell, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MatchTableCell from './MatchTableCell';
import config from "../config";

const MatchTableRowDoubles = ({ match, email, handleDoublesScoreClickOpen, handleConfirmScoreClick, jwtToken, leagueName, myName, setOpenDoublesCalendar, openDoublesCalendar }) => {
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
  const [allPlayersAvailability, setAllPlayersAvailability] = useState({});

  useEffect(() => {
  }, []);

  const getTileClassName = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];

    if (selectedTab === 1 && opponentAvailableDates.includes(dateString)) {
      return 'green-date';
    }

    return '';
  };

  return (
    <>
    <TableRow>
      <TableCell>{match.player1_fname} / {match.player2_fname}</TableCell>
      <TableCell> vs </TableCell>
      <TableCell>{match.player3_fname} / {match.player4_fname}</TableCell>
      <TableCell>
        <TableRow>
          {["set1_t1", "set1_t2", "set2_t1", "set2_t2", "set3_t1", "set3_t2"].map((setKey, idx) => (
            <MatchTableCell
              key={setKey}
              content={match[setKey]}
              isDark={idx % 2 === 0}
            />
          ))}
          <TableCell>
          {match.entered_by !== email &&
              (match.winner_confirmed !== email && match.loser_confirmed !== email) ? (
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
            ) : (match.winner_confirmed == email && match.loser_confirmed === null) || 
                (match.loser_confirmed == email && match.winner_confirmed === null) ? 
            (
              <Button
                variant="contained"
                sx={{ width: '60px', height: '60px', fontSize: '9px' }}
                disabled
              >
                Pending confirm team 2
              </Button>
            ) : null}
          </TableCell>
        </TableRow>
      </TableCell>
    </TableRow>

    </>
  );
};

export default MatchTableRowDoubles;
