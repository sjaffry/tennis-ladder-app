import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, Box, Paper, TextField, Typography, Button, CircularProgress, useMediaQuery, useTheme, Card, CardContent, Grid, Avatar, Chip } from '@mui/material';
import { Link } from "react-router-dom";
import Dashboard from './components/Dashboard';
import foothillslogo from './images/FTSC-logo.jpeg';
import { useNavigate } from "react-router-dom";
import CalendarDialog from "./components/CalendarDialog";
import TimeslotDialog from "./components/TimeslotDialog";
import config from "./config";
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
    // Add more shadows as needed
  ],
});

export const loadLadder = async (league_id, league_type, jwtToken, setLadderData, setPageLoading, setDataLoading, setErrorMsg, setLeagueName) => {
  setPageLoading(true);
  setDataLoading(true);
  const url1 = 'https://ce7l3xzwm3.execute-api.us-west-2.amazonaws.com/Prod';

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
    const lData = response.data["ladder"];
    setLadderData(lData);
    setLeagueName(response.data["league_name"]);
    setPageLoading(false);
    setDataLoading(false);
  })
  .catch(error => {
    console.error('Error:', error);
    setErrorMsg(error.message);
    alert('Session expired! Please refresh the page and try again.');
  });
};

export const fetchPlayerAvailability = async (jwtToken, player_email, setPlayerAvailability) => {

  const url1 = 'https://2ooucvpwb3.execute-api.us-west-2.amazonaws.com/Prod';

  axios.get(url1, {
    params: {
      player_email: player_email
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

const App = ({ signOut, user }) => {
  const [selectedCategoryTile, setSelectedCategoryTile] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [ladderData, setLadderData] = useState(null);
  const [leagueName, setLeagueName] = useState(null);
  const [leagueId, setLeagueId] = useState(null);
  const [leagueType, setLeagueType] = useState(null);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [myAvailableDates, setMyAvailableDates] = useState([]);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState(null);
  const [playerAvailability, setPlayerAvailability] = useState([]);
  const [availabilitySaved, setAvailabilitySaved] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [myTimeSlots, setMyTimeSlots] = useState(false);
  const [recurringFlag, setRecurringFlag] = useState(false);
  const [openTimeSlotDialog, setOpenTimeSlotDialog] = useState(false);
  const user_groups = user.signInUserSession.idToken.payload['cognito:groups'];
  const email = user.signInUserSession.idToken.payload['email'];
  const jwtToken = user.signInUserSession.idToken.jwtToken;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));  
  const AdminPage = `/AdminPage`;
  const navigate = useNavigate();


  // Call page load API
  useEffect(() => {
    if (openCalendar) {
      fetchPlayerAvailability(jwtToken, email, setPlayerAvailability);
    }
  }, [openCalendar]); 

  useEffect(() => {
    if (openCalendar) {
      fetchPlayerAvailability(jwtToken, email, setPlayerAvailability);
    }
  }, [openCalendar, availabilitySaved]);

  useEffect(() => {
    // Initialize objects
    const myDates = {};

    // Process availability data
    playerAvailability.forEach(({ player_id, available_date, morning, afternoon, evening }) => {
      const availability = { morning: !!morning, afternoon: !!afternoon, evening: !!evening };
      myDates[available_date] = availability;
    });

    setMyAvailableDates(Object.keys(myDates));
    setMyTimeSlots(myDates);
  }, [playerAvailability]);

  const handleDateChange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(date);
    const formattedDate = date.toLocaleString('en-US', { month: 'short' }).toUpperCase() + '-' + String(date.getDate()).padStart(2, '0');
    setSelectedDateFormatted(formattedDate);
    setSelectedTimeSlots(myTimeSlots[dateString] || {});
    setOpenTimeSlotDialog(true);
  }

  const handleTimeSlotChange = (event) => {
    setSelectedTimeSlots({
      ...selectedTimeSlots,
      [event.target.name]: event.target.checked,
    });
  };

  const getTileClassName = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];

    if (myAvailableDates.includes(dateString) && !(!myTimeSlots[dateString]['morning'] && !myTimeSlots[dateString]['afternoon'] && !myTimeSlots[dateString]['evening'])) {
      return 'green-date';
    }

    return '';
  };

  const handleClearAvailability = async () => {
    setSelectedTimeSlots({ morning: false, afternoon: false, evening: false });
  };

  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    setAvailabilitySaved(false);
    const dateString = selectedDate.toISOString().split('T')[0];

    const availabilityData = {
      date: dateString,
      morning: selectedTimeSlots.morning,
      afternoon: selectedTimeSlots.afternoon,
      evening: selectedTimeSlots.evening,
      player_email: email,
      recurring_flag: recurringFlag
    };

    const url1 = 'https://lodf29a5ki.execute-api.us-west-2.amazonaws.com/Prod';

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
        setAvailabilitySaved(true);
        setSavingAvailability(false);
      })
      .catch(error => {
        console.error("Error saving availability:", error);
        alert('Error saving availability: ' + error.message);
      });
  };

  const handleLeagueClick = async (index, league_id, league_name, league_type, email) => {
    setSelectedTile(index);
    loadMyMatches(email, league_id, league_type);
    loadLadder(league_id, league_type, jwtToken, setLadderData, setPageLoading, setDataLoading, setErrorMsg, setLeagueName);
    setLeagueName(league_name);
    setLeagueId(league_id);
    setLeagueType(league_type);
  }

  const loadMyMatches = async (email, league_id, league_type) => {
    setPageLoading(true);
    setDataLoading(true);
    const url1 = 'https://f1nvxevu13.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        league_id: league_id,
        league_type: league_type,
        email: email
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const mData = response.data["matchups"];
      setMatchData(mData);
      setPageLoading(false);
      setDataLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      alert('Session expired! Please refresh the page and try again.');
    });
  }

  const handleCategoryClick = async (index, category) => {
    setMatchData(null);
    setLadderData(null);
    setSelectedTile(null);
    setSelectedCategoryTile(index);
    setPageLoading(true);
    const url1 = 'https://q03k4ombrd.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        category: category,
        email: email
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      setExternalData(response.data);
      setPageLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setErrorMsg(error.message);
      alert('Session expired! Please refresh the page and try again.');
    });

  }

  const handleAvailabilityClick = async (index) => {
    setOpenCalendar(true);
    setSelectedCategoryTile(index);
  }

  const launchAdminPage = async (event) => {
    navigate(AdminPage);
  }

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
                FTSC
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  color: '#64748b',
                  mt: -0.5
                }}
              >
                Tennis & Pickleball Leagues
              </Typography>
            </Box>
          </Box>
    
          {/* Right: User info and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', mr: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Welcome back
              </Typography>
              <Typography variant="h6" sx={{ color: '#1e293b', mt: -0.5 }}>
                {user.signInUserSession.idToken.payload.given_name}
              </Typography>
            </Box>
            
            {!isMobile && user_groups.includes('tennis-admin') && (
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
                onClick={launchAdminPage}
              >
                Admin
              </Button>
            )}
            
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
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {errorMsg && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: '#fef2f2', 
              border: '1px solid #fecaca',
              borderRadius: 2,
              color: '#dc2626'
            }}>
              {errorMsg}
            </Box>
          )}
  
          {/* Category Cards */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 4, 
                color: 'white',
                fontWeight: 700,
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Choose Your Activity
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: selectedCategoryTile === "1" 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: selectedCategoryTile === "1" ? '1px solid rgba(242, 235, 235, 0.87)' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: selectedCategoryTile === "1" 
                      ? '0 20px 40px rgba(99, 102, 241, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: selectedCategoryTile === "1" 
                        ? '0 25px 50px rgba(99, 102, 241, 0.5)'
                        : '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                  onClick={() => handleCategoryClick("1", "Tennis")}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      background: selectedCategoryTile === "1" 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '2rem'
                    }}>
                      🎾
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1,
                        color: selectedCategoryTile === "1" ? 'white' : '#1e293b',
                        fontWeight: 600
                      }}
                    >
                      Tennis
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedCategoryTile === "1" ? 'rgba(255, 255, 255, 0.8)' : '#64748b'
                      }}
                    >
                      View tennis leagues and matches
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: selectedCategoryTile === "2" 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: selectedCategoryTile === "2" ? '1px solid rgba(242, 235, 235, 0.87)' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: selectedCategoryTile === "2" 
                      ? '0 20px 40px rgba(99, 102, 241, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: selectedCategoryTile === "2" 
                        ? '0 25px 50px rgba(99, 102, 241, 0.5)'
                        : '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                  onClick={() => handleCategoryClick("2", "Pickleball")}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      background: selectedCategoryTile === "2" 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '2rem'
                    }}>
                      🏓
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1,
                        color: selectedCategoryTile === "2" ? 'white' : '#1e293b',
                        fontWeight: 600
                      }}
                    >
                      Pickleball
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedCategoryTile === "2" ? 'rgba(255, 255, 255, 0.8)' : '#64748b'
                      }}
                    >
                      View pickleball leagues and matches
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: selectedCategoryTile === "3" 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: selectedCategoryTile === "3" ? '1px solid rgba(242, 235, 235, 0.87)' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: selectedCategoryTile === "3" 
                      ? '0 20px 40px rgba(99, 102, 241, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: selectedCategoryTile === "3" 
                        ? '0 25px 50px rgba(99, 102, 241, 0.5)'
                        : '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                  onClick={() => handleAvailabilityClick("3")}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      background: selectedCategoryTile === "3" 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '2rem'
                    }}>
                      📅
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1,
                        color: selectedCategoryTile === "3" ? 'white' : '#1e293b',
                        fontWeight: 600
                      }}
                    >
                      My Availability
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedCategoryTile === "3" ? 'rgba(255, 255, 255, 0.8)' : '#64748b'
                      }}
                    >
                      Manage your playing schedule
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          {/* Loading indicator */}
          {pageLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: 'white' }} size={48} />
            </Box>
          )}
          
          {/* League Cards */}
          {externalData && (
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: 'white',
                  fontWeight: 600,
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                Available Leagues
              </Typography>
              
              <Grid container spacing={3}>
                {externalData["Leagues"].map((league, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: selectedTile === index 
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: selectedTile === index ? '1px solid rgba(242, 235, 235, 0.87)' : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: selectedTile === index 
                          ? '0 20px 40px rgba(99, 102, 241, 0.4)'
                          : '0 8px 32px rgba(0, 0, 0, 0.12)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: selectedTile === index
                            ? '0 25px 50px rgba(99, 102, 241, 0.5)'
                            : '0 12px 40px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                      onClick={() => handleLeagueClick(index, league["league_id"], league["league_name"], league["league_type"], email)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={league["league_type"]}
                            size="small"
                            sx={{
                              background: selectedTile === index 
                                ? 'rgba(255, 255, 255, 0.2)' 
                                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              color: selectedTile === index ? 'white' : 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: selectedTile === index ? 'white' : '#1e293b',
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          {league["league_name"]}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: selectedTile === index ? 'rgba(255, 255, 255, 0.8)' : '#64748b'
                          }}
                        >
                          Click to view matches and standings
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
  
          {/* Dashboard Component - Only show when there's data */}
          {(matchData && matchData.length > 0) || (ladderData && ladderData.length > 0) ? (
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              p: 4,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Dashboard
                matchData={matchData}
                ladderData={ladderData}
                dataLoading={dataLoading}
                jwtToken={jwtToken}
                email={email}
                leagueName={leagueName}
                leagueId={leagueId}
                leagueType={leagueType}
                myFirstName={user.signInUserSession.idToken.payload.given_name}
                myLastName={user.signInUserSession.idToken.payload.family_name}
              />
            </Box>
          ) : null}
          
          {/* Calendar and Timeslot Dialogs */}
          <CalendarDialog
            openCalendar={openCalendar}
            setOpenCalendar={setOpenCalendar}
            handleDateChange={handleDateChange}
            selectedDate={selectedDate}
            getTileClassName={getTileClassName}
          />
          
          <TimeslotDialog
            openTimeSlotDialog={openTimeSlotDialog}
            setOpenTimeSlotDialog={setOpenTimeSlotDialog}
            isOpponentTab={false}
            selectedTimeSlots={selectedTimeSlots}
            handleTimeSlotChange={handleTimeSlotChange}
            handleSaveAvailability={handleSaveAvailability}
            handleClearAvailability={handleClearAvailability}
            selectedDateFormatted={selectedDateFormatted}
            savingAvailability={savingAvailability}
            recurringFlag={recurringFlag}
            setRecurringFlag={setRecurringFlag}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}  

export default withAuthenticator(App);