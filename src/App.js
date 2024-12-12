import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, Box, Paper, TextField, Typography, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { Link } from "react-router-dom";
import Dashboard from './components/Dashboard';
import foothillslogo from './images/FTSC-logo.jpeg';
import { useNavigate } from "react-router-dom";
Amplify.configure(awsExports);


const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
  },
});

const App = ({ signOut, user }) => {
  const [selectedCategoryTile, setSelectedCategoryTile] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [ladderData, setLadderData] = useState(null);
  const user_groups = user.signInUserSession.idToken.payload['cognito:groups'];
  const email = user.signInUserSession.idToken.payload['email'];
  const jwtToken = user.signInUserSession.idToken.jwtToken;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));  
  const AdminPage = `/AdminPage`;
  const navigate = useNavigate();


  // Call page load API
  useEffect(() => {
  }, []); 

  const handleLeagueClick = async (index, league_id, league_type, email) => {
    setSelectedTile(index);
    loadMyMatches(email, league_id, league_type);
    loadLadder(league_id);
  }

  const loadMyMatches = async (email, league_id, league_type) => {
    setPageLoading(true);
    setDataLoading(true);
    const url1 = 'https://35t1hlnog6.execute-api.us-west-2.amazonaws.com/Prod';

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

  const loadLadder = async (league_id) => {
    setPageLoading(true);
    setDataLoading(true);
    const url1 = 'https://30q2ey80ni.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        league_id: league_id
      },
      headers: {
        Authorization: jwtToken
      }
    })
    .then(response => {
      const lData = response.data["ladder"];
      setLadderData(lData);
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
    const url1 = 'https://35qu1lc1ie.execute-api.us-west-2.amazonaws.com/Prod';

    axios.get(url1, {
      params: {
        category: category
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

  const launchAdminPage = async (event) => {
    navigate(AdminPage);
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
        {!isMobile && (
          <Box sx={{ position: 'absolute', top: 2, right: 2, display: 'flex', alignItems: 'center' }}>
            {user_groups.includes('tennis-admin') && (
              <Button
                variant="contained"
                sx={{
                  minWidth: 100,
                  height: 40,
                  marginRight: 1,
                  backgroundColor: '#1d2636',
                  '&:hover': {
                    backgroundColor: '#1d2636',
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
                minWidth: 100,
                height: 40,
                backgroundColor: '#1d2636',
                '&:hover': {
                  backgroundColor: '#1d2636',
                },
              }}
              onClick={signOut}
            >
              Logout
            </Button>
          </Box>
        )}
        <Box sx={{ width: '100%', p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <img src={foothillslogo} alt="Logo" style={{ width: '150px', height: 'auto' }} />
          </Box>
          <Typography variant="h4" gutterBottom sx={{}}>
              Tennis & Pickleball Leagues
            </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
          {errorMsg && (
          <p style={{ color: 'red' }}>{errorMsg}</p>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 6 }}>
            <Button
              key="1"
              variant="contained"
              sx={{
                  width: '30%',
                  p: 2,
                  m: 0.5,
                  backgroundColor: selectedCategoryTile === "1" ? '#1d2636' : 'white',
                  color: selectedCategoryTile === "1" ? 'white' : '#1d2636',
                  '&:hover': {
                      backgroundColor: selectedCategoryTile === "1" ? '#1d2636' : 'white',
                  },
              }}
              onClick={() => handleCategoryClick("1", "Tennis")}
              >
              Tennis    
            </Button>
            <Button
              key="2"
              variant="contained"
              sx={{
                  width: '30%',
                  p: 2,
                  m: 0.5,
                  backgroundColor: selectedCategoryTile === "2" ? '#1d2636' : 'white',
                  color: selectedCategoryTile === "2" ? 'white' : '#1d2636',
                  '&:hover': {
                      backgroundColor: selectedCategoryTile === "2" ? '#1d2636' : 'white',
                  },
              }}
              onClick={() => handleCategoryClick("2", "Pickleball")}
              >
              Pickleball    
            </Button>
          </Box>
          {pageLoading && <CircularProgress color="inherit"/>}
          {externalData && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 6 }}>
            {externalData["Leagues"].map((league, index) => {
              return (
                <Button
                    key={index}
                    variant="contained"
                    sx={{
                        width: '30%',
                        p: 2,
                        m: 0.5,
                        backgroundColor: selectedTile === index ? '#1d2636' : 'white',
                        color: selectedTile === index ? 'white' : '#1d2636',
                        '&:hover': {
                            backgroundColor: selectedTile === index ? '#1d2636' : 'white',
                        },
                    }}
                    onClick={() => handleLeagueClick(index, league["league_id"], league["league_type"], email)}
                >
                    {league["league_name"]}
                </Button>
              );
            })}
          </Box>
          )}
          <Dashboard
            matchData={matchData}
            ladderData={ladderData}
            dataLoading={dataLoading}
            jwtToken={jwtToken}
            email={email}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);