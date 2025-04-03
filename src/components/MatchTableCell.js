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
        backgroundColor: isDark ? config.theme.scoreBgColor : config.theme.secondaryBgColor,
        color: isDark ? config.theme.secondaryBgColor : 'black',
        padding: '4px',
        border: `1px solid ${config.theme.scoreBgColor}`
      }}
    >
      {content}
    </TableCell>
  );
};

export default MatchTableCell;
