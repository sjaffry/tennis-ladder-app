import React from 'react';
import { TableCell } from '@mui/material';

const MatchTableCell = ({ content, isDark }) => {
  return (
    <TableCell
      sx={{
        textAlign: 'center',
        width: '40px',
        height: '30px',
        backgroundColor: isDark ? '#20633f' : 'white',
        color: isDark ? 'white' : 'black',
        padding: '4px',
        border: '1px solid black',
      }}
    >
      {content}
    </TableCell>
  );
};

export default MatchTableCell;
