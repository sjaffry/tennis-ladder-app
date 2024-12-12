import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  useMediaQuery, 
  useTheme,
  CircularProgress,
  IconButton,
  Paper } from '@mui/material';
import { useNavigate } from "react-router-dom";
Amplify.configure(awsExports);

const AdminPage = ({ signOut, user }) => {
  const user_groups = user.signInUserSession.idToken.payload['cognito:groups']
  const jwtToken = user.signInUserSession.idToken.jwtToken;
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [newEventName, setNewEventName] = useState('');  
  const [events, setEvents] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const App = `/`;

   //  Populate event list by getting events from the database
  useEffect(() => {
  }, []); 
  
  const saveDataToBackend = async (event) => {
    console.log("Saving league to backend:", event.friendly_name);
    try {
      const res = await axios.put('', 
      {
        event_name: event.friendly_name,
        active: event.active,
        auth_token: jwtToken
      },           
      {
        headers: {
          Authorization: jwtToken
        },
      }
    );    
    const responseObj = JSON.parse(res.data.body);
    event.event_url = responseObj.event_url;

    setErrorMsg(null);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg(error.message);
    }

    return event;
  };

  const handleSaveNewData = async () => {
};

const handleNewEventNameChange = (event) => {
};

const handleSetActive = (eventName) => {
  const activatedEvent = (events.find(event => event.friendly_name === eventName));
  activatedEvent.active = 'Y'

};

const handleDeleteEvent = (eventName) => {
  // Delete the event from the backend
  deleteEventFromBackend(eventName);
  // Update the local state to remove the deleted event
  setEvents(events.filter(event => event.friendly_name !== eventName));
};

const deleteEventFromBackend = async (eventName) => {
  console.log("Deleting event from backend:", eventName);
  try {
    const res = await axios.delete('https://x2y5l3x4x4.execute-api.us-west-2.amazonaws.com/Prod', {
      headers: {
        Authorization: jwtToken
      },
      params: {
        event_name: eventName
      }
    });
  } catch (error) {
    console.error(error);
  }
};

const handleCopyUrl = async (friendly_name) => {
  try {
    const event = events.find(event => event.friendly_name === friendly_name);
    await navigator.clipboard.writeText(event.event_url.replace(/['"]+/g, ''));
    alert('URL copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy URL: ', err);
    alert('Failed to copy URL');
  }
};

const launchLadderPage = async (event) => {
  navigate(App);
}

return (
  <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex', bgcolor: 'white', height: '100vh' }}>
      <Button
        variant="contained"
        sx={{ position: 'absolute', top: 2, right: 102, backgroundColor: '#1d2636'}}
        onClick={launchLadderPage}
      >
        Back to Ladder
      </Button>
      <Button
        variant="contained"
        sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#1d2636'}}
        onClick={signOut}
      >
        Logout
      </Button>
      <Box sx={{ width: '80%', p: 2, overflow: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Welcome {user.signInUserSession.idToken.payload.given_name}</Typography>
        <Typography sx={{ mb: 5 }} variant="h5" gutterBottom>Setup League & Matches</Typography>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, width: '50%' }}>
          {pageLoading && <CircularProgress color="inherit"/>}
          <TextField
            label="New league name"
            variant="outlined"
            value={newEventName}
            onChange={handleNewEventNameChange}
            sx={{ flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#1d2636'}}
            onClick={handleCopyUrl}>
            Save
          </Button>
        </Box>        
        <TableContainer component={Paper} sx={{ width: '50%' }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="right">Active?</TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell align="right">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events && events.map((event) => (
                  <TableRow
                    key={event.friendly_name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {event.friendly_name}
                    </TableCell>
                    <TableCell align="right">
                      <Checkbox
                        sx={{
                          color: '#1d2636',
                          '&.Mui-checked': {
                            color: '#1d2636',
                          },
                        }}
                        checked={selectedEvent && selectedEvent.friendly_name === event.friendly_name}
                        onChange={() => handleSetActive(event.friendly_name)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                          sx={{ color: '#1d2636' }}
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopyUrl(event.friendly_name)}
                        >
                          Copy URL
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleDeleteEvent(event.friendly_name)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      </Box>
    </Box>
  </ThemeProvider>
);
}

export default withAuthenticator(AdminPage);

