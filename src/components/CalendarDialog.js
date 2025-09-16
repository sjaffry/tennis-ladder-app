import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Tab, 
  Box, 
  CircularProgress, 
  Typography,
  Chip,
  Card,
  CardContent
} from "@mui/material";
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
        {isOpponentCalendar ? `Schedule Match with ${opponentName || 'Opponent'}` : "Manage Your Availability"}
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Chip 
            label={isOpponentCalendar ? "Opponent's Calendar" : "My Calendar"}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              height: 'auto',
            }}
          />
        </Box>
        
        {isLoading ? (
          <Card sx={{ 
            background: 'rgba(248, 250, 252, 0.8)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            borderRadius: 3,
            boxShadow: 'none'
          }}>
            <CardContent>
              <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px" gap={2}>
                <CircularProgress sx={{ color: '#6366f1' }} size={48} />
                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Loading availability data...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
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
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileClassName={getTileClassName}
                  minDate={new Date()} 
                  className="custom-calendar modern-calendar"
                />
              </Box>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && (
          <Box sx={{ mt: 4 }}>
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
                icon={<Box width={12} height={12} bgcolor="#4caf50" borderRadius="50%" />}
                label="All Day"
                variant="outlined"
                sx={{
                  borderColor: '#4caf50',
                  color: '#2e7d32',
                  fontWeight: 500,
                  '& .MuiChip-icon': { ml: 1 }
                }}
              />
              <Chip
                icon={<Box width={12} height={12} bgcolor="#a3339e" borderRadius="50%" />}
                label="Morning"
                variant="outlined"
                sx={{
                  borderColor: '#a3339e',
                  color: '#7b1fa2',
                  fontWeight: 500,
                  '& .MuiChip-icon': { ml: 1 }
                }}
              />
              <Chip
                icon={<Box width={12} height={12} bgcolor="#bd9531" borderRadius="50%" />}
                label="Afternoon"
                variant="outlined"
                sx={{
                  borderColor: '#bd9531',
                  color: '#f57c00',
                  fontWeight: 500,
                  '& .MuiChip-icon': { ml: 1 }
                }}
              />
              <Chip
                icon={<Box width={12} height={12} bgcolor="#2196f3" borderRadius="50%" />}
                label="Evening"
                variant="outlined"
                sx={{
                  borderColor: '#2196f3',
                  color: '#1976d2',
                  fontWeight: 500,
                  '& .MuiChip-icon': { ml: 1 }
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'center' }}>
        <Button 
          onClick={() => setOpenCalendar(false)} 
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
  );
};

export default CalendarDialog;
