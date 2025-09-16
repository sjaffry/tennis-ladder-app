import React, { useEffect } from 'react';
import { TableRow, TableCell, Button, Chip, Box } from '@mui/material';
import MatchTableCell from './MatchTableCell';
import config from "../config";

const MatchTableRowDoubles = ({ match, email, handleConfirmScoreClick }) => {
  
  useEffect(() => {
  }, []);

  return (
    <>
    <TableRow sx={{ 
      '&:hover': { 
        backgroundColor: 'rgba(224, 231, 255, 0.1)',
        transition: 'background-color 0.2s ease'
      }
    }}>
      {/* Team 1 with modern styling */}
      <TableCell sx={{ 
        color: '#374151', 
        fontWeight: 500,
        fontSize: '0.9rem'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {match.player1_fname} / {match.player2_fname}
          {(match.team1_id === match.winner_id) && (
            <Chip 
              label="Winners" 
              size="small" 
              color="success"
              sx={{ height: 20, fontSize: '0.7rem' }} 
            />
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ 
        color: '#6B7280', 
        fontWeight: 600,
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        vs
      </TableCell>
      {/* Team 2 with modern styling */}
      <TableCell sx={{ 
        color: '#374151', 
        fontWeight: 500,
        fontSize: '0.9rem'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {match.player3_fname} / {match.player4_fname}
          {(match.team2_id === match.winner_id) && (
            <Chip 
              label="Winners" 
              size="small" 
              color="success"
              sx={{ height: 20, fontSize: '0.7rem' }} 
            />
          )}
        </Box>
      </TableCell>
      <TableCell>
        <TableRow>
          {["set1_t1", "set1_t2", "set2_t1", "set2_t2", "set3_t1", "set3_t2"].map((setKey, idx) => (
            <MatchTableCell
              key={setKey}
              content={match[setKey]}
              isDark={idx % 2 === 0}
            />
          ))}
          <TableCell>
          {match.entered_by !== email &&
              (match.winner_confirmed !== email && match.loser_confirmed !== email) ? (
                <Button
                  variant="contained"
                  onClick={() => handleConfirmScoreClick({ ...match })}
                  size="small"
                  sx={{
                    minWidth: 80,
                    height: 32,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)',
                    },
                  }}
                >
                Confirm Score
              </Button>
            ) : (match.winner_confirmed == email && match.loser_confirmed === null) || 
                (match.loser_confirmed == email && match.winner_confirmed === null) ? 
            (
              <Button
                variant="outlined"
                disabled
                size="small"
                sx={{
                  minWidth: 80,
                  height: 32,
                  fontSize: '0.7rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#D1D5DB',
                  color: '#9CA3AF',
                }}
              >
                Pending Confirmation
              </Button>
            ) : null}
          </TableCell>
        </TableRow>
      </TableCell>
    </TableRow>

    </>
  );
};

export default MatchTableRowDoubles;
