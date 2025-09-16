import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MatchTableRowSingles from './MatchTableRowSingles';
import MatchTableRowDoubles from './MatchTableRowDoubles';
import CalendarDialogDoubles from './CalendarDialogDoubles'; // Import the new component
import config from "../config";
import axios from 'axios';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  CircularProgress, 
  Grid, 
  useMediaQuery, 
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate } from "react-router-dom";

// Modern theme configuration
const modernTheme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
    },
    secondary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1F2937',
    },
    h5: {
      fontWeight: 600,
      color: '#374151',
    },
    h6: {
      fontWeight: 600,
      color: '#4B5563',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
});

const Dashboard = ({
  matchData: initialMatchData,
  ladderData,
  dataLoading,
  jwtToken,
  email,
  leagueName,
  leagueId,
  leagueType,
  myFirstName,
  myLastName
}) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const ladderRef = useRef(null);

  const [open, setOpen] = useState(false);  // To control dialog open/close
  const [openCalendar, setOpenCalendar] = useState(false); // To control calendar dialog
  const [openDoublesCalendar, setOpenDoublesCalendar] = useState(false); // To control doubles calendar dialog
  const [doublesScoreOpen, setDoublesScoreOpen] = useState(false); // To control doubles score dialog
  const [addingScore, setAddingScore] = useState(false); // To control loading state
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchData, setMatchData] = useState([]);
  const [matchDataChanged, setMatchDataChanged] = useState(false);
  const [isFormDataChanged, setIsFormDataChanged] = useState(false);
  const [isScoreConfirmed, setIsScoreConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    player1_set1: '',
    player1_set2: '',
    player1_set3: '',
    player2_set1: '',
    player2_set2: '',
    player2_set3: '',
    player1_id: '',
    player2_id: '',
    winner_id: '',
    loser_id: '',
    league_id: '',
    entered_by: '',
    player1_confirmed: '',
    player2_confirmed: ''
  });

  // Add state for team players
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [selectedTeam1Player1, setSelectedTeam1Player1] = useState('');
  const [selectedTeam1Player2, setSelectedTeam1Player2] = useState('');
  const [selectedTeam2Player1, setSelectedTeam2Player1] = useState('');
  const [selectedTeam2Player2, setSelectedTeam2Player2] = useState('');

  // Add state for all players' availability
  const [allPlayersAvailability, setAllPlayersAvailability] = useState({});
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);


  useEffect(() => {
    setMatchData(initialMatchData);
  }, [initialMatchData]);

  useEffect(() => {
    if (open && isFormDataChanged) {
      handleSubmitScore();
    }
  }, [formData, open, isFormDataChanged]);

  useEffect(() => {
    if (doublesScoreOpen && isFormDataChanged) {
      handleSubmitScore();
    }
  }, [formData, doublesScoreOpen, isFormDataChanged]);

  useEffect(() => {
    if (isScoreConfirmed) {
      handleSubmitScore();
    }
  }, [formData, isScoreConfirmed]);

  useEffect(() => {
  }, [matchDataChanged]);

  const scrollToLadder = () => {
    ladderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to fetch all players' availability - fix the return value
  const fetchAllPlayersAvailability = async (leagueId) => {
    try {
      // const to hold yesterday's date in the format yyyy-mm-dd
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);  // Subtract 1 day
      const formattedDate = yesterday.toISOString().split('T')[0];

      // Use await with axios instead of mixing with .then()
      const response = await axios.get(
        `https://e85cod6odh.execute-api.us-west-2.amazonaws.com/Prod`,
        {
          params: {
            league_id: leagueId,
            yest_date: formattedDate
          },
          headers: {
            'Authorization': jwtToken
          }
        }
      );

      const data = response.data;
      // Format the data with the current user identified separately
      const formattedData = {};
    
      // First, find the current user and add their data
      const currentUserData = data.find(player => player.email === email);
      if (currentUserData) {
        formattedData.currentUser = {
          availability: currentUserData.availability,
          first_name: currentUserData.first_name,
          last_name: currentUserData.last_name,
          email: currentUserData.email
        };
      }
    
      // Add all other players
      data.forEach(player => {
        if (player.email !== email) {
          formattedData[player.player_id] = {
            availability: player.availability,
            first_name: player.first_name,
            last_name: player.last_name,
            email: player.email
          };
        }
      });

      return formattedData;
    } catch (error) {
      console.error('Error fetching all players availability:', error);
      return {}; // Return empty object on error
    }
  };

  // Function to handle opening the dialog for adding singles score 
  const handleClickOpen = (match) => {
    setSelectedMatch(match);

    setFormData({
      player1_set1: match.set1_p1 || '',
      player1_set2: match.set2_p1 || '',
      player1_set3: match.set3_p1 || '',
      player2_set1: match.set1_p2 || '',
      player2_set2: match.set2_p2 || '',
      player2_set3: match.set3_p2 || '',
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      league_id: match.league_id,
      entered_by: email,
      player1_confirmed: (match.player1_email == email ? email: ''),
      player2_confirmed: (match.player2_email == email ? email: '')
    });
  
    setIsFormDataChanged(false);
    setOpen(true);
  };
  
  // Function to handle opening the dialog for adding doubles score
  const handleDoublesScoreClickOpen = () => {

    // Set form data as before
    setFormData({
      league_id: leagueId,
      entered_by: email
    });

    // Properly append query parameter to the URL
    const url = `https://zlbsw7395m.execute-api.us-west-2.amazonaws.com/Prod?league_id=${leagueId}`;
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': jwtToken,
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.team_players) {
        const players = data.team_players.map(player => ({
          id: player.player_id,
          name: `${player.first_name} ${player.last_name}`
        }));
        setTeamPlayers(players);
      } else {
        console.error('No team players found in response');
      }
    })
    .catch(error => {
      console.error('Error fetching team players:', error);
      alert('Error fetching team players. Please try again later.');
    });

    setIsFormDataChanged(false);
    setDoublesScoreOpen(true);
  };
  
    // Handle player selection changes
  const handlePlayerChange = (event) => {
    const { name, value } = event.target;
    
    switch(name) {
      case 'team1player1':
        setSelectedTeam1Player1(value);
        setFormData((prevFormData) => ({
          ...prevFormData,
          team1_player1_id: value // Update formData with selected player ID
        }));
        break;
      case 'team1player2':
        setSelectedTeam1Player2(value);
        setFormData((prevFormData) => ({
          ...prevFormData,
          team1_player2_id: value // Update formData with selected player ID
        }));
        break;
      case 'team2player1':
        setSelectedTeam2Player1(value);
        setFormData((prevFormData) => ({
          ...prevFormData,
          team2_player1_id: value // Update formData with selected player ID
        }));
        break;
      case 'team2player2':
        setSelectedTeam2Player2(value);
        setFormData((prevFormData) => ({
          ...prevFormData,
          team2_player2_id: value // Update formData with selected player ID
        }));
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDoublesScoreOpen(false);
    setSelectedMatch(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateWinner = (formData, player1_id, player2_id, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id) => {
    // Determine if this is a doubles match
    const isDoubles = team1_player1_id !== undefined && team1_player2_id !== undefined;
    
    // Keep track of the sets won by each player/team
    let team1SetsWon = 0;
    let team2SetsWon = 0;

    // Parse each set score and determine the winner
    let sets;
    
    if (isDoubles) {
      // Use team scores for doubles
      sets = [
        { team1: formData.team1_set1, team2: formData.team2_set1 },
        { team1: formData.team1_set2, team2: formData.team2_set2 },
        { team1: formData.team1_set3, team2: formData.team2_set3 }
      ];
      
      sets.forEach((set) => {
        const team1Score = parseInt(set.team1, 10);
        const team2Score = parseInt(set.team2, 10);

        if (!isNaN(team1Score) && !isNaN(team2Score)) {
          if (team1Score > team2Score) {
            team1SetsWon += 1;
          } else if (team2Score > team1Score) {
            team2SetsWon += 1;
          }
        }
      });
    } else {
      // Use player scores for singles
      sets = [
        { player1: formData.player1_set1, player2: formData.player2_set1 },
        { player1: formData.player1_set2, player2: formData.player2_set2 },
        { player1: formData.player1_set3, player2: formData.player2_set3 }
      ];
      
      sets.forEach((set) => {
        const player1Score = parseInt(set.player1, 10);
        const player2Score = parseInt(set.player2, 10);

        if (!isNaN(player1Score) && !isNaN(player2Score)) {
          if (player1Score > player2Score) {
            team1SetsWon += 1;
          } else if (player2Score > player1Score) {
            team2SetsWon += 1;
          }
        }
      });
    }

    // For singles: return winner_id and loser_id
    // For doubles: return arrays of winner_ids and loser_ids
    if (isDoubles) {
      let winnerIds = [];
      let loserIds = [];
      
      if (team1SetsWon > team2SetsWon) {
        winnerIds = [team1_player1_id, team1_player2_id];
        loserIds = [team2_player1_id, team2_player2_id];
      } else if (team2SetsWon > team1SetsWon) {
        winnerIds = [team2_player1_id, team2_player2_id];
        loserIds = [team1_player1_id, team1_player2_id];
      }
      
      return { winnerIds, loserIds };
    } else {
      let winnerId = null;
      let loserId = null;
      
      if (team1SetsWon > team2SetsWon) {
        winnerId = player1_id;
        loserId = player2_id;
      } else if (team2SetsWon > team1SetsWon) {
        winnerId = player2_id;
        loserId = player1_id;
      }
      
      return { winnerId, loserId };
    }
  };   
  
  const handleAddScoreClick = async () => {
    
    const { winnerId, loserId } = calculateWinner(
      formData,
      `${selectedMatch.player1_id}`,
      `${selectedMatch.player2_id}`
    );

    setFormData((prevFormData) => ({
      ...prevFormData,
      winner_id: winnerId,
      loser_id: loserId,
      player1_confirmed: (prevFormData.player1_confirmed == email ? email : null),
      player2_confirmed: (prevFormData.player2_confirmed == email ? email : null),
      match_type: selectedMatch.type,
      match_id: selectedMatch.match_id,
    }));

    setIsFormDataChanged(true);
  };


  // Update the handleDoublesAddScoreClick to include selected players
  const handleDoublesAddScoreClick = async () => {

    console.log("calculating winners")
 
    const { winnerIds, loserIds } = calculateWinner(
      formData,
      null,
      null,
      selectedTeam1Player1,
      selectedTeam1Player2,
      selectedTeam2Player1,
      selectedTeam2Player2
    );
    
    setFormData((prevFormData) => ({
      ...prevFormData,
      winner_ids: winnerIds,
      loser_ids: loserIds,
      match_type: "doubles"
    }));
    
    console.log("value of DoublesClickOpen", doublesScoreOpen);
    setIsFormDataChanged(true);
  };

  const handleSubmitScore = async () => {
    const url = 'https://m4nit5u1x3.execute-api.us-west-2.amazonaws.com/Prod';
    
    setAddingScore(true);
    // Perform the API call with updatedFormData
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': jwtToken,
      },
      body: JSON.stringify(formData),
    });
  
    if (response.ok) {
      setAddingScore(false);
      setOpen(false);
      setDoublesScoreOpen(false);
      const jsonResponse = await response.json(); // Parse response JSON once

      // Access Match_data directly if jsonResponse.body is already parsed
      const responseBody = typeof jsonResponse.body === 'string'
        ? JSON.parse(jsonResponse.body)
        : jsonResponse.body;

      const updatedMatchData = responseBody.Match_data;

      // Check if this is a new match or updating an existing one
      if (leagueType && leagueType.toLowerCase().includes('doubles')) {
        if (formData.match_id) {
          // This is an existing match - update it
          setMatchData(prevMatchData =>
            prevMatchData.map(match => {
              if (match.match_id === formData.match_id) {
                return {
                  ...match,
                  set1_t1: updatedMatchData.set1_t1,
                  set2_t1: updatedMatchData.set2_t1,
                  set3_t1: updatedMatchData.set3_t1,
                  set1_t2: updatedMatchData.set1_t2,
                  set2_t2: updatedMatchData.set2_t2,
                  set3_t2: updatedMatchData.set3_t2,
                  winner_confirmed: updatedMatchData.winner_confirmed,
                  loser_confirmed: updatedMatchData.loser_confirmed
                };
              }
              return match;
            })
          );
        } else {
          // This is a new match - add it
          setMatchData(prevMatchData => [
            ...prevMatchData,
            {
              ...updatedMatchData,
              type: 'doubles'
            }
          ]);
        }
      } else {
        // Singles match logic (unchanged)
        setMatchData((prevMatchData) =>
          prevMatchData.map((match) =>
            match.player1_id === selectedMatch.player1_id &&
            match.player2_id === selectedMatch.player2_id &&
            match.league_id === selectedMatch.league_id
              ? {
                  ...match,
                  set1_p1: updatedMatchData.set1_p1,
                  set1_p2: updatedMatchData.set1_p2,
                  set2_p1: updatedMatchData.set2_p1,
                  set2_p2: updatedMatchData.set2_p2,
                  set3_p1: updatedMatchData.set3_p1,
                  set3_p2: updatedMatchData.set3_p2,
                  player1_confirmed: updatedMatchData.player1_confirmed,
                  player2_confirmed: updatedMatchData.player2_confirmed
                }
              : match
          )
      )};

      alert('Score added successfully');
      // Forcing the button next to the score to update
      setMatchDataChanged(prev => !prev);
      setIsScoreConfirmed(false);
    } else {
      alert('Error adding score');
    }
  };
  
  const handleConfirmScoreClick = async (match) => {
    setSelectedMatch(match);

    if (match.type === "singles") {
      setFormData({
        player1_set1: match.set1_p1,
        player1_set2: match.set2_p1,
        player1_set3: match.set3_p1,
        player2_set1: match.set1_p2,
        player2_set2: match.set2_p2,
        player2_set3: match.set3_p2,
        player1_id: match.player1_id,
        player2_id: match.player2_id,
        match_id: match.match_id,
        match_type: match.type,
        league_id: match.league_id,
        winner_id: match.winner_id,
        loser_id: match.loser_id,
        entered_by: match.entered_by,
        player1_confirmed: (match.player1_email == email ? email: match.player1_confirmed),
        player2_confirmed: (match.player2_email == email ? email: match.player2_confirmed)
      });
    } else if (match.type === "doubles") {
      setFormData({
        match_id: match.match_id,
        league_id: match.league_id,
        match_type: match.type,
        winner_ids: [match.winner1_id, match.winner2_id],
        loser_ids: [match.loser1_id, match.loser2_id],
        entered_by: match.entered_by,
        team1_set1: match.set1_t1,
        team1_set2: match.set2_t1,
        team1_set3: match.set3_t1,
        team2_set1: match.set1_t2,
        team2_set2: match.set2_t2,
        team2_set3: match.set3_t2,
        winner_confirmed: (match.player_id == match.winner1_id || match.player_id == match.winner2_id ? email : match.winner_confirmed),
        loser_confirmed: (match.player_id == match.loser1_id || match.player_id == match.loser2_id ? email : match.loser_confirmed)
      });
    }

    setIsScoreConfirmed(true);
  } 

  // Handle the "Setup New Match" button click
  const handleSetupNewMatch = async () => {
    setFetchingAvailability(true);
    
    try {
      // Call fetchAllPlayersAvailability to get data
      const availabilityData = await fetchAllPlayersAvailability(leagueId);

      // Open the calendar dialog
      setOpenDoublesCalendar(true);
      setAllPlayersAvailability(availabilityData);
      console.log('Player availability data loaded:', availabilityData);
      
    } catch (error) {
      console.error('Error setting up new match:', error);
      alert('Failed to load player availability. Please try again.');
    } finally {
      setFetchingAvailability(false);
    }
  };

  // Handle date selection in the calendar
  const handleDateChange = (date) => {
    // Handle the selected date
    console.log("Selected date:", date);
    
    // You might want to store the selected date in state
    // and do something with it, like open a time slot selection dialog
  };

  return (
    <ThemeProvider theme={modernTheme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: { xs: 1, sm: 2 } // Much smaller padding to maximize card width
      }}>
        <Grid container spacing={isMobile ? 1 : 2} mb={3}>
          {/* Mobile-only View Ladder button */}
          {isMobile && matchData && matchData.length > 0 && ladderData && ladderData.length > 0 && (
            <Grid item xs={12}>
              <Button 
                variant="contained"
                fullWidth
                onClick={scrollToLadder}
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                View Ladder Results
              </Button>
            </Grid>
          )}

          {/* My Matches Card - Full width always to prevent horizontal scrolling */}
          {matchData && matchData.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ 
                height: 'fit-content',
                boxShadow: 3,
                width: '100%',
                maxWidth: '100%',
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 700,
                    color: '#1F2937',
                    mb: 3
                  }}>
                    My Matches
                  </Typography>
                  
                  {/* Action buttons for doubles leagues */}
                  {leagueType && leagueType.toLowerCase().includes('doubles') && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        onClick={() => handleDoublesScoreClickOpen()}
                        sx={{ flex: { xs: '1 1 100%', sm: 1 }, minWidth: 140 }}
                      >
                        Add New Score
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSetupNewMatch}
                        disabled={fetchingAvailability}
                        sx={{ flex: { xs: '1 1 100%', sm: 1 }, minWidth: 140 }}
                      >
                        {fetchingAvailability ? 'Loading...' : 'Setup New Match'}
                      </Button>
                    </Box>
                  )}
                  
                  {dataLoading && <CircularProgress color="primary" sx={{ mb: 2 }} />}
                  
                  {/* Remove nested card and make table fill entire width */}
                  <Box sx={{ 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    overflow: 'auto',
                    width: '100%'
                  }}>
                    <TableContainer sx={{ width: '100%' }}>
                      <Table size="small" sx={{ minWidth: '100%' }}>
                        <TableHead>
                        </TableHead>
                        <TableBody>
                          {matchData.map((match, index) =>
                            match.type === "doubles" ? (
                              <React.Fragment key={index}>
                                <MatchTableRowDoubles
                                  match={match}
                                  email={email}
                                  handleConfirmScoreClick={handleConfirmScoreClick}
                                />
                              </React.Fragment>
                            ) : (
                              <MatchTableRowSingles
                                key={index}
                                match={match}
                                email={email}
                                handleClickOpen={handleClickOpen}
                                handleConfirmScoreClick={handleConfirmScoreClick}
                                jwtToken={jwtToken}
                                leagueName={leagueName}
                                myFirstName={myFirstName}
                                myLastName={myLastName}
                                setOpenCalendar={setOpenCalendar}
                                openCalendar={openCalendar}
                                sendingEmail={sendingEmail}
                                setSendingEmail={setSendingEmail}
                              />
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Ladder Results Card - Full width always to prevent horizontal scrolling */}
          {ladderData && ladderData.length > 0 && (
            <Grid item xs={12} ref={ladderRef}>
              <Card sx={{ 
                height: 'fit-content',
                boxShadow: 3,
                width: '100%',
                maxWidth: '100%',
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 700,
                    color: '#1F2937',
                    mb: 3
                  }}>
                    Ladder Results
                  </Typography>
                  
                  {dataLoading && <CircularProgress color="primary" sx={{ mb: 2 }} />}
                  
                  {/* Remove nested card and make table fill entire width */}
                  <Box sx={{ 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    overflow: 'auto',
                    width: '100%'
                  }}>
                    <TableContainer sx={{ width: '100%' }}>
                      <Table size="small" sx={{ minWidth: '100%' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              textAlign: 'center',
                              width: '10%'
                            }}>
                              Rank
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              textAlign: 'center',
                              width: '25%'
                            }}>
                              Player
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              textAlign: 'center',
                              width: '15%'
                            }}>
                              Matches
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              textAlign: 'center',
                              width: '15%'
                            }}>
                              Points
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              textAlign: 'center',
                              width: '10%'
                            }}>
                              Wins
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              textAlign: 'center',
                              width: '12%'
                            }}>
                              Losses
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              textAlign: 'center',
                              width: '13%'
                            }}>
                              Win %
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ladderData.map((ladder, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                backgroundColor: index % 2 === 0 ? 'rgba(249, 250, 251, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(224, 231, 255, 0.3)',
                                  transition: 'background-color 0.2s ease'
                                }
                              }}
                            >
                              <TableCell sx={{ textAlign: 'center', color: '#374151', fontWeight: 500 }}>
                                {ladder.rank}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center', color: '#374151', fontWeight: 500 }}>
                                {ladder.first_name} {ladder.last_name}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center', color: '#374151' }}>
                                {ladder.matches}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center', color: '#374151' }}>
                                {ladder.points}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center', color: '#374151' }}>
                                {ladder.wins}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center', color: '#374151' }}>
                                {ladder.losses}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center', color: '#374151' }}>
                                {ladder.win_rate ?? '0.00'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      {/* Dialog (popup window) for adding singles score */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: '#1F2937',
          borderBottom: '1px solid #E5E7EB',
          pb: 2
        }}>
          Add Match Score
        </DialogTitle>
        {addingScore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress color="primary"/>
          </Box>
        )}
        <DialogContent>
          {selectedMatch && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell> {/* Empty cell for alignment */}
                  <TableCell align="center">Set 1</TableCell>
                  <TableCell align="center">Set 2</TableCell>
                  <TableCell align="center">Set 3</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="center"><strong>{selectedMatch.player1_fname} {selectedMatch.player1_lname}</strong></TableCell>
                  <TableCell align="center">
                    <TextField
                      name="player1_set1"
                      value={formData.player1_set1}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}  // Single-digit score
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="player1_set2"
                      value={formData.player1_set2}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="player1_set3"
                      value={formData.player1_set3}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center"><strong>{selectedMatch.player2_fname} {selectedMatch.player2_lname}</strong></TableCell>
                  <TableCell align="center">
                    <TextField
                      name="player2_set1"
                      value={formData.player2_set1}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="player2_set2"
                      value={formData.player2_set2}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="player2_set3"
                      value={formData.player2_set3}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            sx={{ 
              borderColor: '#D1D5DB',
              color: '#6B7280',
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: 'rgba(243, 244, 246, 0.5)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddScoreClick} 
            variant="contained"
            sx={{ 
              minWidth: 100
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog (popup window) for adding doubles score */}
      <Dialog open={doublesScoreOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: '#1F2937',
          borderBottom: '1px solid #E5E7EB',
          pb: 2
        }}>
          Add Doubles Match Score
        </DialogTitle>
        {addingScore && <CircularProgress color="inherit"/>}
        <DialogContent>
          {/* Team Selection Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Team 1</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="team1-player1-label">Player 1</InputLabel>
                  <Select
                    labelId="team1-player1-label"
                    name="team1player1"
                    value={selectedTeam1Player1}
                    onChange={handlePlayerChange}
                    label="Player 1"
                  >
                    {teamPlayers.map(player => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="team1-player2-label">Player 2</InputLabel>
                  <Select
                    labelId="team1-player2-label"
                    name="team1player2"
                    value={selectedTeam1Player2}
                    onChange={handlePlayerChange}
                    label="Player 2"
                  >
                    {teamPlayers.map(player => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Team 2</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="team2-player1-label">Player 1</InputLabel>
                  <Select
                    labelId="team2-player1-label"
                    name="team2player1"
                    value={selectedTeam2Player1}
                    onChange={handlePlayerChange}
                    label="Player 1"
                  >
                    {teamPlayers.map(player => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="team2-player2-label">Player 2</InputLabel>
                  <Select
                    labelId="team2-player2-label"
                    name="team2player2"
                    value={selectedTeam2Player2}
                    onChange={handlePlayerChange}
                    label="Player 2"
                  >
                    {teamPlayers.map(player => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Score input section */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">Set 1</TableCell>
                  <TableCell align="center">Set 2</TableCell>
                  <TableCell align="center">Set 3</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="center">
                    <strong>
                      {teamPlayers.find(p => p.id === selectedTeam1Player1)?.name || 'Player 1'} / 
                      {teamPlayers.find(p => p.id === selectedTeam1Player2)?.name || 'Player 2'}
                    </strong>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="team1_set1"
                      value={formData.team1_set1}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="team1_set2"
                      value={formData.team1_set2}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="team1_set3"
                      value={formData.team1_set3}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center">
                    <strong>
                      {teamPlayers.find(p => p.id === selectedTeam2Player1)?.name || 'Player 1'} / 
                      {teamPlayers.find(p => p.id === selectedTeam2Player2)?.name || 'Player 2'}
                    </strong>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="team2_set1"
                      value={formData.team2_set1}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="team2_set2"
                      value={formData.team2_set2}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      name="team2_set3"
                      value={formData.team2_set3}
                      onChange={handleInputChange}
                      type="text"
                      inputProps={{ maxLength: 1 }}
                      sx={{ width: '40px' }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            sx={{ 
              borderColor: '#D1D5DB',
              color: '#6B7280',
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: 'rgba(243, 244, 246, 0.5)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDoublesAddScoreClick} 
            variant="contained"
            sx={{ 
              minWidth: 100
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add the CalendarDialogDoubles component */}
      <CalendarDialogDoubles
        openCalendar={openDoublesCalendar}
        setOpenCalendar={setOpenDoublesCalendar}
        handleDateChange={handleDateChange}
        selectedDate={null} // Or use a state variable if you track the selected date
        allPlayersAvailability={allPlayersAvailability}
        sendingEmail={sendingEmail}
        setSendingEmail={setSendingEmail}
        email={email}
        leagueName={leagueName}
        jwtToken={jwtToken}
      />
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
