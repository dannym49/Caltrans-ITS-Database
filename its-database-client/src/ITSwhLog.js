import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';

function ITSwhLog({ logs, open, onClose }) {
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDate = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const groupLogsByDate = (logArray) => {
    return logArray.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {});
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        padding: 3,
        borderRadius: 2,
        boxShadow: 4,
        zIndex: 9999,
        maxHeight: "80vh",
        overflowY: "auto",
        minWidth: "600px",
        width: "90%",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Change Log
      </Typography>

      {logs.length === 0 ? (
        <Typography>No changes logged yet.</Typography>
      ) : (
        <>
          {Object.entries(groupLogsByDate(logs)).map(([date, entries]) => (
            <Box key={date} sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => toggleDate(date)}
                sx={{ mb: 1, textTransform: "none", justifyContent: "flex-start" }}
              >
                {expandedDates[date] ? `▼ ${date}` : `▶ ${date}`}
              </Button>

              {expandedDates[date] && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Time</strong></TableCell>
                      <TableCell><strong>Edited By</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(entry.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>{entry.editedBy}</TableCell>
                        <TableCell>
                          <pre style={{ margin: 0 }}>{entry.description}</pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          ))}
        </>
      )}

      <Box mt={2}>
        <Button variant="contained" onClick={onClose}>
          Close Log
        </Button>
      </Box>
    </Box>
  );
}

export default ITSwhLog;