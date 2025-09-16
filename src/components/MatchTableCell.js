import React from 'react';
import { TableCell } from '@mui/material';
import config from "../config";

const MatchTableCell = ({ content, isDark }) => {
  return (
    <TableCell
      sx={{
        textAlign: 'center',
        width: '40px',
        height: '30px',
        backgroundColor: isDark 
          ? 'rgba(99, 102, 241, 0.1)' 
          : 'rgba(248, 250, 252, 0.8)',
        color: isDark ? '#4F46E5' : '#374151',
        padding: '4px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        fontSize: '0.85rem',
        fontWeight: 500,
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: isDark 
            ? 'rgba(99, 102, 241, 0.2)' 
            : 'rgba(224, 231, 255, 0.3)',
        }
      }}
    >
      {content}
    </TableCell>
  );
};

export default MatchTableCell;
