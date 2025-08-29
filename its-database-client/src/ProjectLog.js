import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Button,
  Typography,
  TextField,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material';

function ProjectLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState([]);
  const [editedBy, setEditedBy] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});
  const toggleDate = (date) => {
  setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
};



  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLog();
  }, [id]);
    
  const groupLogsByDate = (logArray) => {
    return logArray.reduce((acc, entry) => {
      const date = new Date(entry.date).toLocaleDateString(); // Group by full date only
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {});
  };

  const fetchLog = async () => {
    try {
      const res = await axios.get(`http://10.44.2.198:5000/api/project/${id}/log`);
      setLog(res.data.log || []);
    } catch (err) {
      alert("Failed to load log.");
    }
  };

  const handleAddLog = async () => {
    if (!editedBy.trim() || !description.trim()) {
      alert("Both 'Edited By' and 'Description' are required.");
      return;
    }

    try {
      await axios.post(`http://10.44.2.198:5000/api/project/${id}/log`, {
        editedBy,
        description
      });
      setEditedBy('');
      setDescription('');
      fetchLog();
    } catch {
      alert("Failed to add log entry.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>ITS Site Edit Log</Typography>
  
      <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
        {log.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No log entries yet.
        </Typography>
          ) : (
            <>
              {Object.entries(groupLogsByDate(log)).map(([date, entries]) => (
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
                        {entries.map((entry, i) => (
                          <TableRow key={i}>
                            <TableCell>{new Date(entry.date).toLocaleTimeString()}</TableCell>
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

          </Paper>
      
          <Box display="flex" justifyContent="space-between" mb={3}>
      <Button variant="contained" onClick={() => navigate(-1)}>
        Back
      </Button>
      
    </Box>

    {isAdding && (
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <TextField
          label="Edited By"
          value={editedBy}
          onChange={e => setEditedBy(e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={handleAddLog}>Submit</Button>
          <Button variant="outlined" color="secondary" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </Box>
      </Box>
    )}

    </Container>
  );
}

export default ProjectLog;
