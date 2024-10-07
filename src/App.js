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
Amplify.configure(awsExports);


const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
  },
});

const App = ({ signOut, user }) => {
  const [selectedTile, setSelectedTile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewDate, setReviewDate] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [externalData, setExternalData] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const business_name = user.signInUserSession.idToken.payload['cognito:groups'];
  const jwtToken = user.signInUserSession.idToken.jwtToken;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));  

  // Call page load API
  useEffect(() => {
  }, []); 

  const handleLeagueClick = async () => {}

  const handleCategoryClick = async (index, category) => {
    setSelectedTile(index);
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
      setSummary(null);
      alert('Session expired! Please refresh the page and try again.');
    });

  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
        {!isMobile && (
          <Button variant="contained" 
            sx={{ 
              position: 'absolute', 
              top: 2, 
              right: 2, 
              backgroundColor: '#1d2636',
              '&:hover': {
                backgroundColor: '#1d2636',
            }}} onClick={signOut}>
            Logout
          </Button>
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
                  backgroundColor: selectedTile === "1" ? '#1d2636' : 'white',
                  color: selectedTile === "1" ? 'white' : '#1d2636',
                  '&:hover': {
                      backgroundColor: selectedTile === "1" ? '#1d2636' : 'white',
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
                  backgroundColor: selectedTile === "2" ? '#1d2636' : 'white',
                  color: selectedTile === "2" ? 'white' : '#1d2636',
                  '&:hover': {
                      backgroundColor: selectedTile === "2" ? '#1d2636' : 'white',
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
                    onClick={() => handleLeagueClick(index, league)}
                >
                    {league}
                </Button>
              );
            })}
          </Box>
          )}
          <Dashboard
            summaryLoading={summaryLoading}
            summary={summary}
            recommendations={recommendations}
            reviewDate={reviewDate}
            jwtToken={jwtToken}
            eventName=''
            reviewCount={reviewCount}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);