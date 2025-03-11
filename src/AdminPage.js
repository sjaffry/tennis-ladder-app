import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  ThemeProvider,
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  useTheme,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
Amplify.configure(awsExports);

const AdminPage = ({ signOut, user }) => {
  const user_groups = user.signInUserSession.idToken.payload['cognito:groups'];
  const jwtToken = user.signInUserSession.idToken.jwtToken;
  const theme = useTheme();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const [newEventName, setNewEventName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addPlayersDialogOpen, setAddPlayersDialogOpen] = useState(false);
  const [playerData, setPlayerData] = useState([]);
  const [editLeague, setEditLeague] = useState(false);
  const [newLeagueAdded, setNewLeagueAdded] = useState(false);
  const [leagueId, setLeagueId] = useState('');
  const [leagueIdForAddPlayers, setLeagueIdForAddPlayers] = useState('');
  const [leagueTypeForAddPlayers, setLeagueTypeForAddPlayers] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [leagueType, setLeagueType] = useState('');
  const [leagueData, setLeagueData] = useState([]);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [leagueMatches, setLeagueMatches] = useState('');
  const [leagueMatchesDialogOpen, setLeagueMatchesDialogOpen] = useState(false);
  const [savedPlayers, setSavedPlayers] = useState(null);
  const [leagueTypeForSetupMatches, setLeagueTypeForSetupMatches] = useState('');
  const [leagueIdForSetupMatches, setLeagueIdForSetupMatches] = useState('');

  // Load data on component mount
  useEffect(() => {
    getLeaguesFromDB();
  }, []);

  useEffect(() => {
    getLeaguesFromDB();
  }, [newLeagueAdded]);

  useEffect(() => {
    if (editLeague) {
      setDialogOpen(true);
    }
  }, [editLeague]);

  const handleNewEventNameChange = (event) => {
    setNewEventName(event.target.value);
  };

  const getLeaguesFromDB = () => {
    // fetching leagues
    const url1 = 'https://lt9y1cwocf.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const leagues = response.data["Leagues"];
      setLeagueData(leagues);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      alert('Session expired! Please refresh the page and try again.');
    });
  }

  const handleCreateClick = () => {
    if (newEventName) {
      setLeagueName(newEventName);

      // Ensure that all other variables are reset to blank. We don't want previously edited
      // values to be added into the new league
      setLeagueId('');
      setCategory('');
      setLeagueType('');
      setEndDate('');
      setDialogOpen(true);
    }
    else {
      alert('Please enter the league name first')
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditLeague(false);
  };

  const handleEdit = (league) => {
    setLeagueId(league.league_id);
    setLeagueName(league.league_name);
    setCategory(league.category);
    setLeagueType(league.league_type);
    setEndDate(league.end_date);
    setEditLeague(true);
  };

  const handleDelete = (league) => {
    const userConfirmed = window.confirm(`Delete the league: ${league.league_name}?`);

    if (!userConfirmed) {
      // User canceled the delete operation
      return;
    }
    
    const url1 = 'https://rg0ce6nxv3.execute-api.us-west-2.amazonaws.com/Prod';
    setNewLeagueAdded(false);

    axios.delete(url1, {
      headers: {
        Authorization: jwtToken,
      },
      params: {
        league_id: league.league_id,
      },
    })
      .then(response => {
        // Handle success
        setDialogOpen(false);
        setEditLeague(false);
        setNewLeagueAdded(true);
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Cannot save new league: ' + error.message);
      });    
  };

  const handleSave = () => {
    // Logic to save the league data
    const url1 = 'https://rg0ce6nxv3.execute-api.us-west-2.amazonaws.com/Prod';
    setNewLeagueAdded(false);

    axios.put(
      url1,
      {
        league_id: leagueId,
        league_name: leagueName,
        end_date: endDate,
        category: category,
        league_type: leagueType,
      },
      {
        headers: {
          Authorization: jwtToken,
        },
      }
    )
      .then(response => {
        // Handle success
        setDialogOpen(false);
        setEditLeague(false);
        setNewLeagueAdded(true);
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Cannot save new league: ' + error.message);
      });
  };  

  const handleAddPlayers = (league_id, league_type) => {
    setLeagueIdForAddPlayers(league_id);
    setLeagueTypeForAddPlayers(league_type);
    // Open dialog to upload CSV
    setAddPlayersDialogOpen(true);

    const url1 = 'https://5oyljtufgj.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        league_id: league_id,
        league_type: league_type
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const players = response.data["players"];
      setPlayerData(players);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      alert('Session expired! Please refresh the page and try again.');
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1); // Skip the header row

      const parsedData = rows.map((row) => {
        const [firstName, middleName, lastName, email, gender, usta_rating] = row.split(',').map((col) => col.trim());
        return { firstName, middleName, lastName, email, gender, usta_rating };
      });

      setPlayerData(parsedData);
    };

    reader.readAsText(file);
  };

  const handleSavePlayers = () => {
    console.log('Players saved:', playerData);

    const url1 = 'https://9yyvdaov8c.execute-api.us-west-2.amazonaws.com/Prod';

    axios.put(
      url1,
      {
        player_data: playerData,
        league_id: leagueIdForAddPlayers
      },
      {
        headers: {
          Authorization: jwtToken,
        },
      }
    )
      .then(response => {
        // Handle success
        setSavedPlayers(response.data);
        setResponseDialogOpen(true);
        setAddPlayersDialogOpen(false);
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Cannot save new league: ' + error.message);
      });
  };

  const setupMatches = (matchData) => {
    console.log('setting up matches');

    const url1 = 'https://yfpd6gmpih.execute-api.us-west-2.amazonaws.com/Prod';

    axios.put(
      url1,
      {
        match_data: matchData
      },
      {
        headers: {
          Authorization: jwtToken,
        },
      }
    )
      .then(response => {
        // Handle success
        const matches = response.data["matchups"];
        setLeagueMatches(matches);
        setResponseDialogOpen(false);
        alert("Matches have been setup!");
        handleViewMatches(leagueIdForAddPlayers, leagueTypeForAddPlayers)
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Cannot setup matches: ' + error.message);
      });
  }

  const handleViewMatches = (league_id, league_type) => {
    setLeagueMatchesDialogOpen(true);
    const url1 = 'https://2aj7vd0evc.execute-api.us-west-2.amazonaws.com/Prod';
    setLeagueIdForSetupMatches(league_id);
    setLeagueTypeForSetupMatches(league_type);

    axios.get(url1, {
      params: {
        league_id: league_id,
        league_type: league_type
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const matches = response.data["matchups"];
      setLeagueMatches(matches);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      alert('Session expired! Please refresh the page and try again.');
    });

  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
        <Button
          variant="contained"
          sx={{ position: 'absolute', top: 2, right: 102, backgroundColor: '#20633f' }}
          onClick={() => navigate('/')}
        >
          Back to Ladder
        </Button>
        <Button
          variant="contained"
          sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#20633f' }}
          onClick={signOut}
        >
          Logout
        </Button>
        <Box sx={{ width: '80%', p: 2, overflow: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Welcome {user.signInUserSession.idToken.payload.given_name}
          </Typography>
          <Typography sx={{ mb: 5 }} variant="h5" gutterBottom>
            Setup League & Matches
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, width: '50%' }}>
            <TextField
              label="New league name"
              variant="outlined"
              value={newEventName}
              onChange={handleNewEventNameChange}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" sx={{ backgroundColor: '#20633f' }} onClick={handleCreateClick}>
              Create
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>League Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>League Type</strong></TableCell>
                <TableCell><strong>End Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leagueData.map((league) => (
                <TableRow key={league.league_id}>
                  <TableCell>{league.league_name}</TableCell>
                  <TableCell>{league.category}</TableCell>
                  <TableCell>{league.league_type}</TableCell>
                  <TableCell>{league.end_date}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(league)}
                      sx={{ color: '#20633f' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(league)}
                      sx={{ color: '#20633f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                  <Button variant="contained" sx={{ backgroundColor: '#20633f', marginRight: 1 }} onClick={() => handleAddPlayers(league.league_id, league.league_type)}>
                    Add players
                  </Button>
                  <Button variant="contained" sx={{ backgroundColor: '#20633f' }} onClick={() => handleViewMatches(league.league_id, league.league_type)}>
                    View Matches
                  </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>

        {/* Dialog for league creation */}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Create/Edit League</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="League Name"
              variant="outlined"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
            <TextField
              label="Category"
              select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
            >
              <MenuItem value="Tennis">Tennis</MenuItem>
              <MenuItem value="Pickleball">Pickleball</MenuItem>
            </TextField>
            <TextField
              label="League Type"
              select
              value={leagueType}
              onChange={(e) => setLeagueType(e.target.value)}
              fullWidth
            >
              <MenuItem value="Singles">Singles</MenuItem>
              <MenuItem value="Doubles">Doubles</MenuItem>
              <MenuItem value="Mix doubles">Mix doubles</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for Adding Players */}
        <Dialog open={addPlayersDialogOpen} onClose={() => setAddPlayersDialogOpen(false)}>
          <DialogTitle>Confirm or upload players to create matches</DialogTitle>
          <DialogContent>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>First Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Middle Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Last Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Email</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Gender</strong>
                    </TableCell>
                    <TableCell>
                      <strong>USTA rating</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {playerData.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>{player.firstName}</TableCell>
                      <TableCell>{player.middleName}</TableCell>
                      <TableCell>{player.lastName}</TableCell>
                      <TableCell>{player.email}</TableCell>
                      <TableCell>{player.gender}</TableCell>
                      <TableCell>{player.usta_rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddPlayersDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSavePlayers}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Dialog to display add Players response */}
        {savedPlayers && (
        <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)}>
          <DialogTitle>Registered players</DialogTitle>
          <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>First Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Last Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell>
                      <strong>League Name</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedPlayers.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>{player.first_name}</TableCell>
                      <TableCell>{player.last_name}</TableCell>
                      <TableCell>{player.status}</TableCell>
                      <TableCell>{player.league_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResponseDialogOpen(false)}>Close</Button>
            <Button onClick={() => setupMatches(savedPlayers)}>Setup matches</Button>
          </DialogActions>
        </Dialog>
        )}

        {/* Dialog to display league matches */}
        {leagueMatches && (
        <Dialog open={leagueMatchesDialogOpen} onClose={() => setLeagueMatchesDialogOpen(false)}>
          <DialogTitle>Matches</DialogTitle>
          <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                  <TableCell>
                      <strong>Match number</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Player 1</strong>
                    </TableCell>
                    <TableCell>
                      <strong></strong>
                    </TableCell>
                    <TableCell>
                      <strong>Player 2</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leagueMatches.map((match, index) => (
                    <TableRow key={index}>
                      <TableCell>{index+1}</TableCell>
                      <TableCell>{match.player1_name}</TableCell>
                      <TableCell>vs</TableCell>
                      <TableCell>{match.player2_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLeagueMatchesDialogOpen(false)}>Close</Button>
            {leagueMatches.length === 0 && (
              <Button onClick={() => handleAddPlayers(leagueIdForSetupMatches, leagueTypeForSetupMatches)}>Setup Matches</Button>
            )}
          </DialogActions>
        </Dialog>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default withAuthenticator(AdminPage);
