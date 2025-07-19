import React, { useEffect } from 'react';
import { TableRow, TableCell, Button } from '@mui/material';
import MatchTableCell from './MatchTableCell';
import config from "../config";

const MatchTableRowDoubles = ({ match, email, handleConfirmScoreClick }) => {
  
  useEffect(() => {
  }, []);

  return (
    <>
    <TableRow>
      <TableCell>{match.player1_fname} / {match.player2_fname}</TableCell>
      <TableCell> vs </TableCell>
      <TableCell>{match.player3_fname} / {match.player4_fname}</TableCell>
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
                  color="secondary"
                  onClick={() => handleConfirmScoreClick({ ...match })}
                  sx={{
                    width: '60px', 
                    height: '30px', 
                    fontSize: '9px',
                    fontWeight: 'bold',
                    backgroundColor: config.theme.secondaryBgColor, 
                    border: 'none',
                    color: config.theme.buttonTextColor, 
                    '&:hover': {
                      backgroundColor: 'transparent', 
                      border: `2px solid ${config.theme.buttonBorderColor}`,
                    },
                  }}
                >
                Confirm score
              </Button>
            ) : (match.winner_confirmed == email && match.loser_confirmed === null) || 
                (match.loser_confirmed == email && match.winner_confirmed === null) ? 
            (
              <Button
                variant="contained"
                sx={{ width: '60px', height: '60px', fontSize: '9px' }}
                disabled
              >
                Pending confirm team 2
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
