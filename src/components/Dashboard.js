import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
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
  DialogActions
 } from '@mui/material';
import { useNavigate } from "react-router-dom";

const Dashboard = ({
  matchData: initialMatchData,
  ladderData,
  dataLoading,
  jwtToken,
  email
}) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);  // To control dialog open/close
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

  useEffect(() => {
    setMatchData(initialMatchData);
  }, [initialMatchData]);

  useEffect(() => {
    if (open && isFormDataChanged) {
      handleSubmitScore();
    }
  }, [formData, open, isFormDataChanged]);

  useEffect(() => {
    if (isScoreConfirmed) {
      handleSubmitScore();
    }
  }, [formData, isScoreConfirmed]);

  useEffect(() => {
  }, [matchDataChanged]);
  
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
  

  const handleClose = () => {
    setOpen(false);
    setSelectedMatch(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateWinner = (formData, player1_id, player2_id) => {
    // Keep track of the sets won by each player
    let player1SetsWon = 0;
    let player2SetsWon = 0;
  
    // Parse each set score and determine the winner
    const sets = [
      { player1: formData.player1_set1, player2: formData.player2_set1 },
      { player1: formData.player1_set2, player2: formData.player2_set2 },
      { player1: formData.player1_set3, player2: formData.player2_set3 }
    ];
  
    sets.forEach((set) => {
      const player1Score = parseInt(set.player1, 10);
      const player2Score = parseInt(set.player2, 10);
  
      if (player1Score > player2Score) {
        player1SetsWon += 1;
      } else if (player2Score > player1Score) {
        player2SetsWon += 1;
      }
    });
  
    let winnerId = null;
    let loserId = null;
    if (player1SetsWon > player2SetsWon) {
      winnerId = player1_id;
      loserId = player2_id;
      
    } else if (player2SetsWon > player1SetsWon) {
      winnerId = player2_id;
      loserId = player1_id;
    }
    
    return { winnerId, loserId };
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
      player2_confirmed: (prevFormData.player2_confirmed == email ? email : null)
    }));

    setIsFormDataChanged(true);
  };

  const handleSubmitScore = async () => {
    const url = 'https://24kq9qsqak.execute-api.us-west-2.amazonaws.com/Prod';
  
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
      setOpen(false);
      alert('Score added successfully');
      const jsonResponse = await response.json(); // Parse response JSON once

      // Access Match_data directly if jsonResponse.body is already parsed
      const responseBody = typeof jsonResponse.body === 'string'
        ? JSON.parse(jsonResponse.body)
        : jsonResponse.body;

      const updatedMatchData = responseBody.Match_data;

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
      );

      // Forcing the button next to the score to update
      setMatchDataChanged(prev => !prev);

    } else {
      alert('Error adding score');
    }
  };
  
  const handleConfirmScoreClick = async (match) => {
    setSelectedMatch(match);

    setFormData({
      player1_set1: match.set1_p1,
      player1_set2: match.set2_p1,
      player1_set3: match.set3_p1,
      player2_set1: match.set1_p2,
      player2_set2: match.set2_p2,
      player2_set3: match.set3_p2,
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      league_id: match.league_id,
      winner_id: match.winner_id,
      loser_id: match.loser_id,
      entered_by: match.entered_by,
      player1_confirmed: (match.player1_email == email ? email: match.player1_confirmed),
      player2_confirmed: (match.player2_email == email ? email: match.player2_confirmed)
    });
  
    setIsScoreConfirmed(true);
  } 

  return (
    <Box>
      <Grid container spacing={isMobile ? 1 : 3} mb={6}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderColor: 'black', border: 0.3 }}>
            <Typography variant="h5" gutterBottom>Ladder results</Typography>
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
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderColor: 'black', border: 0.3 }}>
            <Typography variant="h5" gutterBottom>My matches</Typography>
            {dataLoading && <CircularProgress color="inherit"/>}
            {matchData && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                </TableHead>
                <TableBody>
                  {matchData.map((match, index) => (
                    <TableRow key={index}>
                      <TableCell>{match.player1_fname} {match.player1_lname}</TableCell>
                      <TableCell> vs </TableCell>
                      <TableCell>{match.player2_fname} {match.player2_lname}</TableCell>
                      <TableCell>
                        <TableRow>
                          <TableCell 
                                sx={{ 
                                  textAlign: 'center',
                                  width: '40px', 
                                  height: '30px',
                                  backgroundColor: '#454746', 
                                  color: 'white', 
                                  padding: '4px',
                                  border: '1px solid black'
                                }}>
                          {match.set1_p1}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              textAlign: 'center',
                              width: '40px', 
                              height: '30px',
                              backgroundColor: '#454746', 
                              color: 'white', 
                              padding: '4px',
                              border: '1px solid black'
                            }}>
                          {match.set1_p2}
                          </TableCell>
                          <TableCell 
                            sx={{
                              textAlign: 'center', 
                              width: '40px', 
                              height: '30px',
                              backgroundColor: 'white', 
                              color: 'black', 
                              padding: '4px',
                              border: '1px solid black'
                            }}>
                          {match.set2_p1}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              textAlign: 'center',
                              width: '40px', 
                              height: '30px',
                              backgroundColor: 'white', 
                              color: 'black', 
                              padding: '4px',
                              border: '1px solid black'
                            }}>
                          {match.set2_p2}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              textAlign: 'center',
                              width: '40px', 
                              height: '30px',
                              backgroundColor: '#454746', 
                              color: 'white', 
                              padding: '4px',
                              border: '1px solid black'
                            }}>
                          {match.set3_p1}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              textAlign: 'center',
                              width: '40px', 
                              height: '30px',
                              backgroundColor: '#454746', 
                              color: 'white', 
                              padding: '4px',
                              border: '1px solid black'
                            }}>
                          {match.set3_p2}
                          </TableCell>
                          <TableCell>
                            {match.entered_by === null ? (
                              <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => handleClickOpen({...match})}
                                sx={{ width: '60px', height: '30px', fontSize: '9px' }}>
                                Add score
                              </Button>
                            ) : (match.entered_by !== email && (match.player1_confirmed !== email && match.player2_confirmed !== email)) ? (
                              <Button 
                                variant="contained" 
                                color="secondary"
                                onClick={() => handleConfirmScoreClick({...match})}
                                sx={{ width: '60px', height: '30px', fontSize: '9px' }}>
                                Confirm score
                              </Button>
                            ) : (match.player1_confirmed == null || match.player2_confirmed == null) ? (
                              <Button 
                                variant="contained" 
                                sx={{ width: '60px', height: '60px', fontSize: '9px' }}
                                disabled
                                >
                                Pending confirm player 2
                              </Button>
                            ) : null
                            }
                          </TableCell>
                        </TableRow>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      {/* Dialog (popup window) for adding score */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Match Score</DialogTitle>
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
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddScoreClick} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
