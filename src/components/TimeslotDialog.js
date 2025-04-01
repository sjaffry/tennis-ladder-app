
import React from "react";
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

const TimeslotDialog = ({
  openTimeSlotDialog,
  setOpenTimeSlotDialog,
  isOpponentTab,
  selectedTimeSlots,
  handleTimeSlotChange,
  handleScheduleMatchClick,
  handleSaveAvailability,
  openMessageDialog,
  setOpenMessageDialog,
  selectedDateFormatted,
  match,
  message,
  setMessage,
  handleSendMessage
}) => {
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
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={isOpponentTab ? handleScheduleMatchClick : handleSaveAvailability} color="primary" variant="contained">
            {isOpponentTab ? "Schedule Match" : "Save Availability"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Message Dialog */}
      {match && (
        <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDateFormatted} {match.player1_fname} vs {match.player2_fname}</DialogTitle>
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
