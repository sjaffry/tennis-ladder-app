import React from "react";
import { CircularProgress, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

const TimeslotDialog = ({
  openTimeSlotDialog,
  setOpenTimeSlotDialog,
  isOpponentTab,
  selectedTimeSlots,
  handleTimeSlotChange,
  handleScheduleMatchClick,
  handleSaveAvailability,
  handleClearAvailability,
  openMessageDialog,
  setOpenMessageDialog,
  selectedDateFormatted,
  match,
  message,
  setMessage,
  handleSendMessage,
  savingAvailability,
  sendingEmail,
  recurringFlag,
  setRecurringFlag
}) => {
  
  const handleRecurringChange = (event) => {
    setRecurringFlag(event.target.checked);
  };

  // Check if any time slot is selected
  const hasTimeSlotSelected = selectedTimeSlots.morning || selectedTimeSlots.afternoon || selectedTimeSlots.evening;

  // Enhanced clear handler that also clears recurring flag
  const handleClearWithRecurring = () => {
    handleClearAvailability();
    setRecurringFlag(false);
  };

  return (
    <>
      {/* Time Slot Selection Dialog */}
      <Dialog open={openTimeSlotDialog} onClose={() => setOpenTimeSlotDialog(false)}>
        <DialogTitle>{isOpponentTab ? "Schedule Match" : "Select Time Slot"}</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox name="morning" checked={selectedTimeSlots.morning || false} onChange={handleTimeSlotChange} disabled={isOpponentTab} />}
              label="Morning"
            />
            <FormControlLabel
              control={<Checkbox name="afternoon" checked={selectedTimeSlots.afternoon || false} onChange={handleTimeSlotChange} disabled={isOpponentTab} />}
              label="Afternoon"
            />
            <FormControlLabel
              control={<Checkbox name="evening" checked={selectedTimeSlots.evening || false} onChange={handleTimeSlotChange} disabled={isOpponentTab} />}
              label="Evening"
            />
            {!isOpponentTab && (
              <FormControlLabel
                control={
                  <Checkbox 
                    name="recurring" 
                    checked={recurringFlag || false} 
                    onChange={handleRecurringChange}
                    disabled={!hasTimeSlotSelected}
                  />
                }
                label="Recurring weekly"
              />
            )}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          {savingAvailability && <CircularProgress color="inherit" />}
          <Button onClick={isOpponentTab ? handleScheduleMatchClick : handleSaveAvailability} color="primary" variant="contained">
            {isOpponentTab ? "Schedule Match" : "Save"}
          </Button>
          {!isOpponentTab && (
            <Button onClick={handleClearWithRecurring} color="primary" variant="contained">
            Clear
          </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Message Dialog */}
      {match && (
        <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDateFormatted} {match.player1_fname} vs {match.player2_fname}</DialogTitle>
        {sendingEmail && <CircularProgress color="inherit" />}    
            <DialogContent>
            <TextField
                label="Enter your message"
                multiline
                fullWidth
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                margin="dense"
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setOpenMessageDialog(false)} color="secondary" variant="contained">
                Cancel
            </Button>
            <Button onClick={handleSendMessage} color="primary" variant="contained">
                Send
            </Button>
            </DialogActions>
        </Dialog>
      )}
    </>
 );
};

export default TimeslotDialog;
