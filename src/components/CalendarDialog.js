import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import Calendar from "react-calendar";

const CalendarDialog = ({
  openCalendar,
  isOpponentCalendar,
  setOpenCalendar,
  handleDateChange,
  selectedDate,
  getTileClassName
}) => {
  return (
    <>
      {/* Calendar Dialog */}
      <Dialog open={openCalendar} onClose={() => setOpenCalendar(false)} maxWidth="sm" fullWidth>
        <DialogTitle> {isOpponentCalendar ? "Schedule Match" : "Add Availability"} </DialogTitle>
        <DialogContent>
          <Tab label = {isOpponentCalendar ? "Opponent's Calendar" : "My Calendar"} />
          <Box display="flex" justifyContent="center" mt={2}>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={getTileClassName}
              minDate={new Date()} 
            />
          </Box>
          {/* Legend */}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCalendar(false)} color="secondary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <style>
        {`
          .react-calendar__tile.green-date {
            background-color: #4caf50 !important; 
            color: white;
            border-radius: 50%;
          }
          .react-calendar__tile.purple-yellow-date {
            background: conic-gradient(#bd9531 0deg 180deg, #a3339e 180deg 360deg) !important;
            color: white;
            border-radius: 50%;
          }
          
          .react-calendar__tile.blue-yellow-date {
            background: conic-gradient(blue 0deg 180deg, #bd9531 180deg 360deg) !important;
            color: white;
            border-radius: 50%;
          }
          
          .react-calendar__tile.blue-purple-date {
            background: conic-gradient(blue 0deg 180deg, #a3339e 180deg 360deg) !important;
            color: white;
            border-radius: 50%;            
          }
          .react-calendar__tile.yellow-date {
            background-color: #bd9531 !important; 
            color: white;
            border-radius: 50%;
          }
          .react-calendar__tile.blue-date {
            background-color: blue !important; 
            color: white;
            border-radius: 50%;
          }
          .react-calendar__tile.purple-date {
            background-color: #a3339e !important; 
            color: white;
            border-radius: 50%;
          }
        `}
      </style>
    </>
  );
};

export default CalendarDialog;
