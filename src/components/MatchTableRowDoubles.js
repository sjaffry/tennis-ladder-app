import React from 'react';
import { TableRow, TableCell, Button } from '@mui/material';
import MatchTableCell from './MatchTableCell';

const MatchTableRowDoubles = ({ match, email, handleClickOpen, handleConfirmScoreClick }) => {
  return (
    <TableRow>
      <TableCell>{match.player1_fname} {match.player2_fname}</TableCell>
      <TableCell> vs </TableCell>
      <TableCell>{match.player3_fname} {match.player4_fname}</TableCell>
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
              match.team1_confirmed !== email &&
              match.team2_confirmed !== email ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleConfirmScoreClick({ ...match })}
                sx={{ width: '60px', height: '30px', fontSize: '9px' }}
              >
                Confirm score
              </Button>
            ) : match.team1_confirmed == null || match.team2_confirmed == null ? (
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
  );
};

export default MatchTableRowDoubles;
