import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography, 
  CircularProgress, 
  TextField, 
  Box, 
  Checkbox, 
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid
} from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarDialogDoubles.css';
import axios from 'axios';

const CalendarDialogDoubles = ({ 
  openCalendar, 
  setOpenCalendar, 
  handleDateChange, 
  selectedDate, 
  allPlayersAvailability,
  sendingEmail,
  setSendingEmail,
  email,
  jwtToken,
  leagueName
}) => {
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [currentUserDates, setCurrentUserDates] = useState([]);
  const [showAvailablePlayers, setShowAvailablePlayers] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [openDoublesMessageDialog, setOpenDoublesMessageDialog] = useState(false);
  const [doublesMessage, setDoublesMessage] = useState('');
  
  // Process player availability data when it changes
  useEffect(() => {
    if (!allPlayersAvailability || Object.keys(allPlayersAvailability).length === 0) {
      return;
    }
    
    const dateCountMap = {};
    let userDates = [];
    
    // Collect the current user's available dates
    if (allPlayersAvailability.currentUser) {
      userDates = allPlayersAvailability.currentUser.availability.map(date => date.date);
      setCurrentUserDates(userDates);
    }
    
    // Count how many players are available on each date
    Object.keys(allPlayersAvailability).forEach(playerId => {
      if (playerId === 'currentUser') return; // Skip current user when counting others

      const playerDates = allPlayersAvailability[playerId].availability.map(date => date.date);
      
      playerDates.forEach(date => {
        if (!dateCountMap[date]) {
          dateCountMap[date] = 1;
        } else {
          dateCountMap[date]++;
        }
      });
    });
    
    setAvailabilityMap(dateCountMap);
  }, [allPlayersAvailability]);
  
  // Determine tile class based on availability
  const getTileClassName = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];
    const classes = [];
    
    // Add class if the current user is available on this date
    if (currentUserDates.includes(dateString)) {
      classes.push('user-available');
    }
    
    // Add class if at least 3 other players are available on this date
    if (availabilityMap[dateString] >= 3 && currentUserDates.includes(dateString)) {
      classes.push('match-possible');
    }
    
    return classes.join(' ');
  };
  
  const handleCalendarClose = () => {
    setOpenCalendar(false);
  };

  // New function to handle date click
  const handleDateClick = (date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Only show dialog if this is a date where a match is possible
    if (currentUserDates.includes(dateString) && availabilityMap[dateString] >= 3) {
      const availablePlayersList = [];
      
      // Add current user
      if (allPlayersAvailability.currentUser) {
        availablePlayersList.push({
          id: 'current',
          name: `${allPlayersAvailability.currentUser.first_name} ${allPlayersAvailability.currentUser.last_name} (You)`,
        });
      }
      
      // Add other available players for this date
      Object.keys(allPlayersAvailability).forEach(playerId => {
        if (playerId === 'currentUser') return;
        
        const playerAvailability = allPlayersAvailability[playerId].availability;
        const isAvailable = playerAvailability.some(avail => avail.date === dateString);
        
        if (isAvailable) {
          availablePlayersList.push({
            id: playerId,
            name: `${allPlayersAvailability[playerId].first_name} ${allPlayersAvailability[playerId].last_name}`,
          });
        }
      });
      
      setAvailablePlayers(availablePlayersList);
      // Auto-select the current user
      const currentUser = availablePlayersList.find(player => player.id === 'current');
      setSelectedPlayers(currentUser ? [currentUser] : []);
      setSelectedDateString(dateString);
      setShowAvailablePlayers(true);
    } else {
      // If not enough players available, just call the original handleDateChange
      handleDateChange(date);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSendDoublesMessage = async () => {
    if (!doublesMessage.trim()) {
      alert('Please enter a message before sending.');
      return;
    }
    
    // Extract email addresses of selected players
    const selectedPlayerEmails = selectedPlayers.map(player => {
      if (player.id === 'current') {
        // Get current user's email
        return allPlayersAvailability.currentUser?.email || 'Current user email not found';
      } else {
        // Get other player's email
        return allPlayersAvailability[player.id]?.email || 'Email not found';
      }
    });
    
    setSendingEmail(true);
    const url = 'https://7vhzcxuhc8.execute-api.us-west-2.amazonaws.com/Prod';

    // Filter out current user's email from selectedPlayerEmails
    const opponentEmails = selectedPlayerEmails.filter(email => 
      email !== allPlayersAvailability.currentUser?.email
    );

    axios.get(url, {
      params: {
      player_email: email,
      opponent_email: opponentEmails,
      player_first_name: `${allPlayersAvailability.currentUser?.first_name || ''}`,
      player_last_name: `${allPlayersAvailability.currentUser?.last_name || ''}`,
      match_date: selectedDateString,
      league_name: leagueName,
      match_type: 'Doubles',
      organizer_message: doublesMessage
      },
      headers: {
      Authorization: jwtToken
      }
    })
    .then(response => {
      alert("Email successfully sent to opponent!");
      setSendingEmail(false);
      setOpenDoublesMessageDialog(false);
      setDoublesMessage('');
      setShowAvailablePlayers(false);
      setOpenCalendar(false);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error sending email to reciepients. Please try again!');
    });
  };

  const handleScheduleDoublesMatch = (date) => {
    setOpenDoublesMessageDialog(true);
  };

  // Handle player selection for doubles match
  const handlePlayerSelection = (player, isChecked) => {
    // Don't allow deselecting the current user
    if (player.id === 'current') return;
    
    if (isChecked) {
      if (selectedPlayers.length < 4) { // 1 current user + 3 others = 4 total
        setSelectedPlayers([...selectedPlayers, player]);
      }
    } else {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    }
  };

  // Check if player is selected
  const isPlayerSelected = (playerId) => {
    return selectedPlayers.some(p => p.id === playerId);
  };

  return (
    <>
      <Dialog 
        open={openCalendar} 
        onClose={handleCalendarClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxWidth: '600px',
          }
        }}
        BackdropProps={{
          sx: { 
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          textAlign: 'center',
          pb: 2,
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
        }}>
          🎾 Select Date for Doubles Match
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              color: '#374151', 
              fontWeight: 600, 
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              Availability Legend
            </Typography>
            <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
              <Chip
                icon={<Box width={12} height={12} bgcolor="#10b981" borderRadius="50%" />}
                label="Your Availability"
                variant="outlined"
                sx={{
                  borderColor: '#10b981',
                  color: '#047857',
                  fontWeight: 500,
                  '& .MuiChip-icon': { ml: 1 }
                }}
              />
              <Chip
                icon={<Box width={12} height={12} bgcolor="#6366f1" borderRadius="50%" />}
                label="Match Possible (3+ Players)"
                variant="outlined"
                sx={{
                  borderColor: '#6366f1',
                  color: '#4f46e5',
                  fontWeight: 500,
                  '& .MuiChip-icon': { ml: 1 }
                }}
              />
            </Box>
          </Box>
          
          <Card sx={{ 
            background: 'rgba(248, 250, 252, 0.5)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="center">
                <Calendar
                  onChange={handleDateClick}
                  value={selectedDate}
                  tileClassName={getTileClassName}
                  minDate={new Date()}
                  className="custom-calendar modern-calendar"
                />
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'center' }}>
          <Button 
            onClick={handleCalendarClose}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Close Calendar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Player Selection Dialog */}
      <Dialog 
        open={showAvailablePlayers} 
        onClose={() => setShowAvailablePlayers(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          }
        }}
        BackdropProps={{
          sx: { 
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          textAlign: 'center',
          pb: 2,
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
        }}>
          🎾 Available Players for {formatDateForDisplay(selectedDateString)}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
              Select 3 Additional Players
            </Typography>
            <Chip 
              label={`Selected: ${selectedPlayers.length - 1}/3 additional players`}
              sx={{
                background: selectedPlayers.length === 4 
                  ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            />
          </Box>
          
          <Grid container spacing={2}>
            {availablePlayers.map((player, index) => (
              <Grid item xs={12} sm={6} key={player.id}>
                <Card sx={{
                  background: isPlayerSelected(player.id) 
                    ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                    : 'rgba(248, 250, 252, 0.8)',
                  border: isPlayerSelected(player.id) 
                    ? 'none' 
                    : '1px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  cursor: player.id !== 'current' ? 'pointer' : 'default',
                  '&:hover': player.id !== 'current' ? {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                  } : {},
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: isPlayerSelected(player.id) ? 'rgba(255, 255, 255, 0.2)' : '#6366f1',
                        width: 40,
                        height: 40,
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}>
                        {player.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600,
                          color: isPlayerSelected(player.id) ? 'white' : '#1e293b',
                          fontSize: '0.95rem'
                        }}>
                          {player.name}
                        </Typography>
                        {player.id === 'current' && (
                          <Chip 
                            label="Team Captain" 
                            size="small" 
                            sx={{ 
                              mt: 0.5,
                              backgroundColor: isPlayerSelected(player.id) ? 'rgba(255, 255, 255, 0.3)' : '#fbbf24',
                              color: isPlayerSelected(player.id) ? 'white' : '#92400e',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }} 
                          />
                        )}
                      </Box>
                      <Checkbox
                        checked={isPlayerSelected(player.id)}
                        onChange={(e) => handlePlayerSelection(player, e.target.checked)}
                        disabled={
                          player.id === 'current' || 
                          (!isPlayerSelected(player.id) && selectedPlayers.length >= 4)
                        }
                        sx={{
                          color: isPlayerSelected(player.id) ? 'white' : '#6366f1',
                          '&.Mui-checked': {
                            color: isPlayerSelected(player.id) ? 'white' : '#10b981',
                          },
                          '&.Mui-disabled': {
                            color: isPlayerSelected(player.id) ? 'rgba(255, 255, 255, 0.5)' : '#d1d5db',
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowAvailablePlayers(false)}
            sx={{
              borderRadius: 3,
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
            onClick={() => handleScheduleDoublesMatch(new Date(selectedDateString))}
            disabled={selectedPlayers.length !== 4}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: selectedPlayers.length === 4 
                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
              color: selectedPlayers.length === 4 ? 'white' : '#9ca3af',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: selectedPlayers.length === 4 ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
              '&:hover': selectedPlayers.length === 4 ? {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.5)',
                transform: 'translateY(-1px)',
              } : {},
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Schedule Match
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modern Message Dialog */}
      <Dialog 
        open={openDoublesMessageDialog} 
        onClose={() => setOpenDoublesMessageDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          }
        }}
        BackdropProps={{
          sx: { 
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          textAlign: 'center',
          pb: 2,
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
        }}>
          🎾 Doubles Match for {formatDateForDisplay(selectedDateString)}
        </DialogTitle>
        
        {sendingEmail && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        )}
        
        <DialogContent sx={{ p: 4 }}>
          {/* Selected Players Card */}
          <Card sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: '#374151', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                👥 Selected Players
              </Typography>
              <Grid container spacing={2}>
                {selectedPlayers.map((player, index) => (
                  <Grid item xs={12} sm={6} key={player.id}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(226, 232, 240, 0.3)'
                    }}>
                      <Avatar sx={{ 
                        bgcolor: player.id === 'current' ? '#fbbf24' : '#6366f1',
                        width: 36,
                        height: 36,
                        fontSize: '1rem',
                        fontWeight: 600
                      }}>
                        {player.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {player.name}
                        </Typography>
                        {player.id === 'current' && (
                          <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 500 }}>
                            Captain
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
          
          {/* Message Input */}
          <Card sx={{ 
            background: 'rgba(248, 250, 252, 0.5)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: '#374151', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                💬 Match Message
              </Typography>
              <TextField
                label="Enter your message to the team"
                multiline
                fullWidth
                rows={4}
                value={doublesMessage}
                onChange={(e) => setDoublesMessage(e.target.value)}
                variant="outlined"
                placeholder="e.g., Looking forward to our doubles match! Let's meet 15 minutes early to warm up..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.8)',
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6366f1',
                  },
                }}
              />
            </CardContent>
          </Card>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, gap: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenDoublesMessageDialog(false)} 
            sx={{
              borderRadius: 3,
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
            onClick={handleSendDoublesMessage} 
            disabled={!doublesMessage.trim() || sendingEmail}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: doublesMessage.trim() && !sendingEmail
                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
              color: doublesMessage.trim() && !sendingEmail ? 'white' : '#9ca3af',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: doublesMessage.trim() && !sendingEmail ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
              '&:hover': doublesMessage.trim() && !sendingEmail ? {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.5)',
                transform: 'translateY(-1px)',
              } : {},
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {sendingEmail ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarDialogDoubles;