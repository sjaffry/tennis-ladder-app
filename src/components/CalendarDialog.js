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
          <Box display="flex" alignItems="center" justifyContent="center" mt={2} gap={1}>
            <Box width={16} height={16} bgcolor="#4caf50" borderRadius="50%" />
            <span>Available</span>
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
        `}
      </style>
    </>
  );
};

export default CalendarDialog;
