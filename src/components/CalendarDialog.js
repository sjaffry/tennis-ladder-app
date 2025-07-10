import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tab, Box, CircularProgress, Typography } from "@mui/material";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './CalendarStyles.css';

const CalendarDialog = ({
  openCalendar,
  isOpponentCalendar,
  setOpenCalendar,
  handleDateChange,
  selectedDate,
  getTileClassName,
  opponentName,
  opponentEmail
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset loading state when dialog opens or closes
  useEffect(() => {
    if (openCalendar) {
      console.log(`Calendar dialog opened for ${opponentName || 'opponent'} (${opponentEmail || 'unknown'})`);
      setIsLoading(true);
      
      // Set a timeout to check if data has loaded
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [openCalendar, opponentName, opponentEmail]);
  
  // Check if we have data to display
  useEffect(() => {
    if (getTileClassName && typeof getTileClassName === 'function') {
      // Test the function with tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // If we get any className back, we have data
      const className = getTileClassName({ date: tomorrow });
      if (className) {
        setIsLoading(false);
      }
    }
  }, [getTileClassName]);

  return (
    <Dialog 
      open={openCalendar} 
      onClose={() => setOpenCalendar(false)} 
      maxWidth="sm" 
      fullWidth
      BackdropProps={{
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
      }}
    >
      <DialogTitle> 
        {isOpponentCalendar ? `Schedule Match with ${opponentName || 'Opponent'}` : "Add Availability"}
      </DialogTitle>
      <DialogContent>
        <Tab label={isOpponentCalendar ? "Opponent's Calendar" : "My Calendar"} />
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
            <Box ml={2}>Loading availability data...</Box>
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Showing availability for {opponentName || 'Opponent'} ({opponentEmail || 'unknown'})
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" mt={2}>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={getTileClassName}
                minDate={new Date()} 
                className="custom-calendar" 
              />
            </Box>
          </>
        )}
        
        {!isLoading && (
          <Box display="flex" alignItems="center" justifyContent="center" mt={2} gap={1} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={16} height={16} bgcolor="#4caf50" borderRadius="50%"/>
              <span>All day</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={16} height={16} bgcolor="#a3339e" borderRadius="50%"/>
              <span>Morning</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={16} height={16} bgcolor="#bd9531" borderRadius="50%"/>
              <span>Afternoon</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={16} height={16} bgcolor="blue" borderRadius="50%"/>
              <span>Evening</span>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenCalendar(false)} color="secondary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarDialog;
