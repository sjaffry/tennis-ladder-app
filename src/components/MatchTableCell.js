import React from 'react';
import { TableCell } from '@mui/material';

const MatchTableCell = ({ content, isDark }) => {
  return (
    <TableCell
      sx={{
        textAlign: 'center',
        width: '40px',
        height: '30px',
        backgroundColor: isDark ? '#6dad8b' : 'white',
        color: isDark ? 'white' : 'black',
        padding: '4px',
        border: '1px solid #6dad8b'
      }}
    >
      {content}
    </TableCell>
  );
};

export default MatchTableCell;
