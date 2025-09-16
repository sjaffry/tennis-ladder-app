import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { loadLadder } from './App';
import foothillslogo from './images/FTSC-logo.jpeg';
import config from "./config";
import {
  ThemeProvider,
  createTheme,
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
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
Amplify.configure(awsExports);

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Modern indigo
    },
    secondary: {
      main: '#8b5cf6', // Purple accent
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
    '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
    '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
    '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  ],
});

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
  const [leagueAdminEmail, setLeagueAdminEmail] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [leagueType, setLeagueType] = useState('');
  const [leagueData, setLeagueData] = useState([]);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [leagueMatches, setLeagueMatches] = useState([]);
  const [leagueMatchesDialogOpen, setLeagueMatchesDialogOpen] = useState(false);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [leagueTypeForSetupMatches, setLeagueTypeForSetupMatches] = useState('');
  const [leagueIdForSetupMatches, setLeagueIdForSetupMatches] = useState('');
  const [ladderData, setLadderData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [viewLadderDialogOpen, setViewLadderDialogOpen] = useState(false);
  const [viewScoresDialogOpen, setViewScoresDialogOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [addingPlayers, setAddingPlayers] = useState(false);
  const [leagueScores, setLeagueScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageToPlayers, setMessageToPlayers] = useState('');
  const [selectedMatches, setSelectedMatches] = useState(null);

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
      setLeagueAdminEmail('');
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
    setLeagueAdminEmail(league.league_admin_email);
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
        alert('Cannot delete league. Are there players and matches associated? ' + error.message);
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
        league_admin_email: leagueAdminEmail,
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
  
    const expectedHeaders = ['first name', 'middle name', 'last name', 'email', 'gender'];
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
  
      if (lines.length < 2) {
        alert('Invalid file format: file must include headers and at least one row of data.');
        return;
      }
  
      // Remove double quotes from each line
      const sanitizedLines = lines.map(line => line.replace(/"/g, ''));
  
      // Normalize headers to lowercase and trim spaces
      const headerRow = sanitizedLines[0].split(',').map(h => h.trim().toLowerCase());
  
      const headerIndices = {};
      const missingHeaders = [];
  
      // Map expected headers to their indices in the CSV
      expectedHeaders.forEach((header) => {
        const index = headerRow.indexOf(header);
        if (index === -1) {
          missingHeaders.push(header);
        } else {
          headerIndices[header] = index;
        }
      });

      // Check if all expected headers are present
      if (missingHeaders.length > 0) {
        alert(`Invalid file format: missing required column(s): ${missingHeaders.join(', ')}`);
        return;
      }
  
      const dataRows = sanitizedLines.slice(1);
      const parsedData = dataRows.map((row) => {
        const columns = row.split(',').map(col => col.trim());
        console.log('Columns:', columns); // Debugging: Check parsed columns
        return {
          firstName: columns[headerIndices['first name']],
          middleName: columns[headerIndices['middle name']],
          lastName: columns[headerIndices['last name']],
          email: columns[headerIndices['email']],
          gender: columns[headerIndices['gender']],
          usta_rating: columns[headerIndices['usta_rating']] || '', // Optional field
        };
      });

      setPlayerData(parsedData);
    };
  
    reader.readAsText(file);
  };  

  const handleSavePlayers = () => {
    console.log('Players saved:', playerData);
    setAddingPlayers(true);

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
        setAddingPlayers(false);
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

  const handleViewLadder = (league_id, league_type) => {
    loadLadder(league_id, league_type, jwtToken, setLadderData, setPageLoading, setDataLoading, setErrorMsg, setLeagueName);
    setViewLadderDialogOpen(true);
  };

  const handleViewScores = (league_id, league_type) => {
    setViewScoresDialogOpen(true); 
    setScoresLoading(true);   
    const url1 = 'https://3diiyndzv8.execute-api.us-west-2.amazonaws.com/Prod';

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
      const scores = response.data["Scores"];
      setLeagueScores(scores);
      setLeagueName(response.data["League_name"]);
      setScoresLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      alert('Session expired! Please refresh the page and try again.');
    });
  }

  const handleSendToPlayers = (league_matches, league_name, league_admin_email) => {
    setSelectedMatches({
      matches: league_matches,
      league_name: league_name,
      league_admin_email: league_admin_email
    });
    setMessageDialogOpen(true);
  };

  const handleSendMessage = () => {
    console.log('Sending league matches to all players');
    setEmailSending(true);
    setMessageDialogOpen(false);

    const url1 = 'https://igxke5au2k.execute-api.us-west-2.amazonaws.com/Prod';

    axios.put(
      url1,
      {
        matches: selectedMatches.matches,
        league_name: selectedMatches.league_name,
        league_admin_email: selectedMatches.league_admin_email,
        message: messageToPlayers
      },
      {
        headers: {
          Authorization: jwtToken,
        },
      }
    )
      .then(response => {
        alert("Email successfully sent to all players!")
        setLeagueMatchesDialogOpen(false);
        setEmailSending(false);
        setMessageToPlayers('');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error sending email: ' + error.message);
      });
  };

  const generateLadderHTML = (ladderData, leagueName) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${leagueName} - Ladder Standings</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          h1 {
            color:#282222;
            text-align: center;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 15px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
          }
          th, td {
            padding: 12px 15px;
            text-align: center;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: ${config.theme.primaryBgColor};
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          tr:hover {
            background-color: #f2f2f2;
          }
          .timestamp {
            text-align: center;
            color: #666;
            font-size: 0.8em;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>${leagueName} - Ladder Standings</h1>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player Name</th>
              <th>Matches</th>
              <th>Points</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Win %</th>
            </tr>
          </thead>
          <tbody>
            ${ladderData.map(ladder => `
              <tr>
                <td>${ladder.rank}</td>
                <td>${ladder.first_name} ${ladder.last_name}</td>
                <td>${ladder.matches}</td>
                <td>${ladder.points}</td>
                <td>${ladder.wins}</td>
                <td>${ladder.losses}</td>
                <td>${ladder.win_rate ?? '0.00'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
      </body>
      </html>
    `;
    return htmlContent;
  };

  const handleExportLadder = () => {
    const htmlContent = generateLadderHTML(ladderData, leagueName);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${leagueName.replace(/\s+/g, '_')}_ladder.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modern Header */}
        <Box sx={{ 
          width: '100%', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          py: 2, 
          px: 4, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Left: Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={foothillslogo}
              alt="Logo"
              sx={{ 
                width: 56, 
                height: 56, 
                mr: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />
            <Box>
              <Typography 
                variant="h5"
                sx={{ 
                  fontWeight: 700, 
                  color: '#1e293b',
                  letterSpacing: '-0.025em'
                }}
              >
                Admin Panel
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  color: '#64748b',
                  mt: -0.5
                }}
              >
                League & Match Management
              </Typography>
            </Box>
          </Box>
    
          {/* Right: User info and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', mr: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Admin
              </Typography>
              <Typography variant="h6" sx={{ color: '#1e293b', mt: -0.5 }}>
                {user.signInUserSession.idToken.payload.given_name}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1,
                border: '2px solid #e2e8f0',
                color: '#475569',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  border: '2px solid #6366f1',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                  color: '#6366f1',
                },
              }}
              onClick={() => navigate('/')}
            >
              Back to Ladder
            </Button>
            
            <Button
              variant="contained"
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                },
              }}
              onClick={signOut}
            >
              Logout
            </Button>
          </Box>
        </Box>
        {/* Main Content */}
        <Box sx={{ 
          flex: 1, 
          p: 4, 
          overflow: 'auto',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2, 
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            Welcome {user.signInUserSession.idToken.payload.given_name}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 6, 
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            Setup League & Matches
          </Typography>

          {/* Create New League Card */}
          <Card sx={{ 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1e293b', fontWeight: 600 }}>
                Create New League
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  label="New league name"
                  variant="outlined"
                  value={newEventName}
                  onChange={handleNewEventNameChange}
                  sx={{ 
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
                      boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                    },
                  }} 
                  onClick={handleCreateClick}
                >
                  Create League
                </Button>
              </Box>
            </CardContent>
          </Card>
          {/* Leagues Table Card */}
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                  Existing Leagues
                </Typography>
              </Box>
              
              <TableContainer>
                <Table sx={{ 
                  '& .MuiTableHead-root': {
                    backgroundColor: '#f8fafc',
                  },
                  '& .MuiTableCell-head': {
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  },
                  '& .MuiTableRow-root:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.04)',
                  },
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>League Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>League Type</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                      <TableCell align="center">Management</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leagueData.map((league) => (
                      <TableRow key={league.league_id}>
                        <TableCell sx={{ fontWeight: 500 }}>{league.league_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={league.category} 
                            size="small" 
                            sx={{ 
                              backgroundColor: league.category === 'Tennis' ? '#dbeafe' : '#f3e8ff',
                              color: league.category === 'Tennis' ? '#1e40af' : '#7c3aed',
                              fontWeight: 500
                            }} 
                          />
                        </TableCell>
                        <TableCell>{league.league_type}</TableCell>
                        <TableCell>{league.end_date}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleEdit(league)}
                            sx={{ 
                              color: '#6366f1', 
                              mr: 1,
                              '&:hover': { 
                                backgroundColor: 'rgba(99, 102, 241, 0.1)' 
                              } 
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(league)}
                            sx={{ 
                              color: '#ef4444',
                              '&:hover': { 
                                backgroundColor: 'rgba(239, 68, 68, 0.1)' 
                              } 
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              sx={{ 
                                minWidth: 'auto', 
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                '&:hover': {
                                  border: '1px solid #6366f1',
                                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                  color: '#6366f1',
                                },
                              }} 
                              onClick={() => handleAddPlayers(league.league_id, league.league_type)}
                            >
                              Add Players
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              sx={{ 
                                minWidth: 'auto', 
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                '&:hover': {
                                  border: '1px solid #10b981',
                                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                  color: '#10b981',
                                },
                              }} 
                              onClick={() => handleViewMatches(league.league_id, league.league_type)}
                            >
                              View Matches
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              sx={{ 
                                minWidth: 'auto', 
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                '&:hover': {
                                  border: '1px solid #f59e0b',
                                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                  color: '#f59e0b',
                                },
                              }} 
                              onClick={() => handleViewLadder(league.league_id, league.league_type)}
                            >
                              View Ladder
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              sx={{ 
                                minWidth: 'auto', 
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                '&:hover': {
                                  border: '1px solid #8b5cf6',
                                  backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                  color: '#8b5cf6',
                                },
                              }} 
                              onClick={() => handleViewScores(league.league_id, league.league_type)}
                            >
                              View Scores
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Modern Dialog for league creation */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleDialogClose}
          PaperProps={{
            sx: {
              borderRadius: 4,
              minWidth: 500,
              maxWidth: 600,
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#1e293b',
            borderBottom: '1px solid #e2e8f0',
            pb: 2
          }}>
            {editLeague ? 'Edit League' : 'Create League'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField
                label="League Name"
                variant="outlined"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                    },
                  },
                }}
              />
              <TextField
                label="League Admin Email"
                variant="outlined"
                value={leagueAdminEmail}
                onChange={(e) => setLeagueAdminEmail(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                    },
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                    },
                  },
                }}
              />
              <TextField
                label="Category"
                select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                    },
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                    },
                  },
                }}
              >
                <MenuItem value="Singles">Singles</MenuItem>
                <MenuItem value="Doubles">Doubles</MenuItem>
                <MenuItem value="Mix doubles">Mix doubles</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
            <Button 
              onClick={handleDialogClose}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                color: '#64748b',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(100, 116, 139, 0.1)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSave}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                },
              }}
            >
              {editLeague ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modern Dialog for Adding Players */}
        <Dialog 
          open={addPlayersDialogOpen} 
          onClose={() => setAddPlayersDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              maxHeight: '80vh',
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#1e293b',
            borderBottom: '1px solid #e2e8f0',
            pb: 2
          }}>
            Add Players to League
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {addingPlayers && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
              </Box>
            )}
            
            <Box sx={{ 
              mb: 3, 
              p: 3, 
              border: '2px dashed #e2e8f0', 
              borderRadius: 2,
              textAlign: 'center',
              '&:hover': {
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.02)',
              }
            }}>
              <Typography variant="body1" sx={{ mb: 2, color: '#64748b' }}>
                Upload CSV file with player information
              </Typography>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
            </Box>
            
            {playerData.length > 0 && (
              <Card sx={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: 3
              }}>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          First Name
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          Middle Name
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          Last Name
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          Gender
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          USTA Rating
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {playerData.map((player, index) => (
                        <TableRow 
                          key={index}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.04)',
                            },
                          }}
                        >
                          <TableCell>{player.firstName}</TableCell>
                          <TableCell>{player.middleName}</TableCell>
                          <TableCell>{player.lastName}</TableCell>
                          <TableCell>{player.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={player.gender} 
                              size="small" 
                              sx={{ 
                                backgroundColor: player.gender === 'M' ? '#dbeafe' : '#fce7f3',
                                color: player.gender === 'M' ? '#1e40af' : '#be185d',
                                fontWeight: 500
                              }} 
                            />
                          </TableCell>
                          <TableCell>{player.usta_rating}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddPlayersDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSavePlayers}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog to view scores */}
        {leagueScores && (
        <Dialog open={viewScoresDialogOpen} onClose={() => setViewScoresDialogOpen(false)}>
          <DialogTitle>All scores for {leagueName}</DialogTitle>
          <DialogContent>
            {scoresLoading && <CircularProgress color="inherit"/>}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Player 1</strong>
                    </TableCell>
                    <TableCell>
                      <strong></strong>
                    </TableCell>
                    <TableCell>
                      <strong>Player 2</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Score</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Winner</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leagueScores.map((score, index) => (
                    <TableRow key={index}>
                      <TableCell>{score.player1_name}</TableCell>
                      <TableCell>vs</TableCell>
                      <TableCell>{score.player2_name}</TableCell>
                      <TableCell>{score.set1_p1}-{score.set1_p2} {score.set2_p1}-{score.set2_p2} {score.set3_p1}-{score.set3_p2}</TableCell>
                      <TableCell>{score.winner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewScoresDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        )}

     {/* Dialog to view league ladder */}
     <Dialog open={viewLadderDialogOpen} onClose={() => setViewLadderDialogOpen(false)}>
          <DialogTitle>{leagueName} Ladder</DialogTitle>
          <DialogContent>
            {dataLoading && <CircularProgress color="inherit"/>}
            {ladderData && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Player Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Matches</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Points</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Wins</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Losses</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Win %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ladderData.map((ladder, index) => (
                    <TableRow 
                      key={index}
                      sx={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}
                    >
                      <TableCell sx={{textAlign: 'center'}}>{ladder.rank}</TableCell>
                      <TableCell sx={{textAlign: 'center'}}>{ladder.first_name} {ladder.last_name}</TableCell>
                      <TableCell sx={{textAlign: 'center'}}>{ladder.matches}</TableCell>
                      <TableCell sx={{textAlign: 'center'}}>{ladder.points}</TableCell>
                      <TableCell sx={{textAlign: 'center'}}>{ladder.wins}</TableCell>
                      <TableCell sx={{textAlign: 'center'}}>{ladder.losses}</TableCell>
                      <TableCell sx={{textAlign: 'center'}}>{ladder.win_rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportLadder} 
              sx={{ 
                backgroundColor: config.theme.secondaryBgColor,
                color: config.theme.buttonTextColor,
                '&:hover': {
                  backgroundColor: config.theme.buttonHoverBgColor,
                },
              }}
            >
              Export as HTML
            </Button>
            <Button onClick={() => setViewLadderDialogOpen(false)}>Close</Button>
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
          {emailSending && <CircularProgress color="inherit"/>}
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
            {leagueMatches.length > 0 && (
              <Button onClick={() => handleSendToPlayers(leagueMatches,leagueMatches[0].league_name, leagueMatches[0].league_admin_email)}>Send to players</Button>
            )}
          </DialogActions>
        </Dialog>
        )}

        {/* Dialog to send message */}
        <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)}>
          <DialogTitle>Send Message to Players</DialogTitle>
          <DialogContent>
            <TextField
              label="Message"
              multiline
              rows={4}
              value={messageToPlayers}
              onChange={(e) => setMessageToPlayers(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage}>Send</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default withAuthenticator(AdminPage);
