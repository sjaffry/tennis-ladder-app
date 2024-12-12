import React from 'react';
import { TableRow, TableCell, Button } from '@mui/material';
import MatchTableCell from './MatchTableCell';

const MatchTableRowSingles = ({ match, email, handleClickOpen, handleConfirmScoreClick }) => {
  return (
    <TableRow>
      <TableCell>{match.player1_fname} {match.player1_lname}</TableCell>
      <TableCell> vs </TableCell>
      <TableCell>{match.player2_fname} {match.player2_lname}</TableCell>
      <TableCell>
        <TableRow>
          {["set1_p1", "set1_p2", "set2_p1", "set2_p2", "set3_p1", "set3_p2"].map((setKey, idx) => (
            <MatchTableCell
              key={setKey}
              content={match[setKey]}
              isDark={idx % 2 === 0}
            />
          ))}
          <TableCell>
            {match.entered_by === null ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleClickOpen({ ...match })}
                sx={{ width: '60px', height: '30px', fontSize: '9px' }}
              >
                Add score
              </Button>
            ) : match.entered_by !== email &&
              match.player1_confirmed !== email &&
              match.player2_confirmed !== email ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleConfirmScoreClick({ ...match })}
                sx={{ width: '60px', height: '30px', fontSize: '9px' }}
              >
                Confirm score
              </Button>
            ) : match.player1_confirmed == null || match.player2_confirmed == null ? (
              <Button
                variant="contained"
                sx={{ width: '60px', height: '60px', fontSize: '9px' }}
                disabled
              >
                Pending confirm player 2
              </Button>
            ) : null}
          </TableCell>
        </TableRow>
      </TableCell>
    </TableRow>
  );
};

export default MatchTableRowSingles;
