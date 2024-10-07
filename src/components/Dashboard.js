import React, { useState } from 'react';
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
  TableRow
 } from '@mui/material';
import { useNavigate } from "react-router-dom";

const Dashboard = ({
  summaryLoading,
  summary,
  recommendations,
  reviewDate,
  jwtToken,
  eventName,
  reviewCount
}) => {

  const [isDownloading, setIsDownloading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const conversational_qnaPage = `/Conversational_qna`;
  const navigate = useNavigate();

  const handleDownloadClick = async (jwtToken, reviewDate, eventName) => {
    
    setIsDownloading(true);
    var file_prefix = 'transcribe-output/FTSC/';
    var reviewsFileName = 'original-reviews-';

    if (eventName == '') {
       file_prefix += reviewDate+'/combinedreviews.txt';
       reviewsFileName += reviewDate+'.csv'
     } else {
       file_prefix += 'events/'+eventName+'/'+reviewDate+'/combinedreviews.txt';
       reviewsFileName += eventName+'-'+reviewDate+'.csv'
     }

    fetch('https://vead3g93ib.execute-api.us-west-2.amazonaws.com/Prod/?file_prefix='+file_prefix, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then((blob) => {
          // Create a temporary URL for the blob
          const url = window.URL.createObjectURL(blob);
  
          // Create a hidden anchor element to trigger the download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = reviewsFileName;
          document.body.appendChild(a);
  
          // Trigger the click event on the anchor element to start the download
          a.click();
  
          // Clean up the temporary URL and anchor element
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setIsDownloading(false);
        })
        .catch((error) => {
          console.error('Error downloading file:', error);
        });
  };
  
  const handleDigDeeperClick = () => {
    navigate(conversational_qnaPage);
  };

  const playersData = [{'player1_fname': 'Syed', 'player1_lname': 'Jaffry', 'player2_fname': 'Saira', 'player2_lname': 'Jaffry'}, {'player1_fname': 'Syed', 'player1_lname': 'Jaffry', 'player2_fname': 'John', 'player2_lname': 'Jackson'}];
  const ladderData = [{'A': 1},{'A': 1},{'A': 1},{'A': 1},{'A': 1}]
  
  return (
    <Box>
      <Grid container spacing={isMobile ? 1 : 3} mb={6}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderColor: 'black', border: 0.3 }}>
            <Typography variant="h5" gutterBottom>Ladder results</Typography>
            {summaryLoading && <CircularProgress color="inherit"/>}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>Player Name</TableCell>
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
                      <TableCell>1</TableCell>
                      <TableCell>Syed Jaffry</TableCell>
                      <TableCell>6</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>100</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderColor: 'black', border: 0.3 }}>
            <Typography variant="h5" gutterBottom>My matches</Typography>
            {summaryLoading && <CircularProgress color="inherit"/>}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                </TableHead>
                <TableBody>
                  {playersData.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>{player.player1_fname} {player.player1_lname}</TableCell>
                      <TableCell> VS </TableCell>
                      <TableCell>{player.player2_fname} {player.player2_lname}</TableCell>
                      <TableCell>
                        <Button variant="contained" size="small" color="primary">
                        Add score
                      </Button>
                </TableCell> 
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
