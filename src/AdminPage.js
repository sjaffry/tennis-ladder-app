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
  const [editLeague, setEditLeague] = useState(false);
  const [newLeagueAdded, setNewLeagueAdded] = useState(false);
  const [leagueId, setLeagueId] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [leagueType, setLeagueType] = useState('');
  const [leagueData, setLeagueData] = useState([]);

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
    const url1 = 'https://5jvbv6vy1j.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const leagues = response.data["leagues"];
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
    
    const url1 = 'https://qawpduxn85.execute-api.us-west-2.amazonaws.com/Prod';
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
    const url1 = 'https://qawpduxn85.execute-api.us-west-2.amazonaws.com/Prod';
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
        <Button
          variant="contained"
          sx={{ position: 'absolute', top: 2, right: 102, backgroundColor: '#1d2636' }}
          onClick={() => navigate('/')}
        >
          Back to Ladder
        </Button>
        <Button
          variant="contained"
          sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#1d2636' }}
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
            <Button variant="contained" sx={{ backgroundColor: '#1d2636' }} onClick={handleCreateClick}>
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
                      sx={{ color: '#1d2636' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(league)}
                      sx={{ color: '#1d2636' }}
                    >
                      <DeleteIcon />
                    </IconButton>
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
      </Box>
    </ThemeProvider>
  );
};

export default withAuthenticator(AdminPage);
