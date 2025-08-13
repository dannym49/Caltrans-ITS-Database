import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  CssBaseline,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';

const caltransBlue = "#005A9C";
const caltransDarkBlue = "#003F67";

const theme = createTheme({
  palette: {
    primary: { main: caltransBlue },
    secondary: { main: caltransDarkBlue },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h4: { fontWeight: "bold" },
    body1: { fontSize: "1rem" },
  },
});

function RecentModifications() {
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://10.44.2.198:5000/api/recent')
      .then(res => {
        const grouped = groupByMonthYear(res.data);
        setModifications(grouped);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch recent modifications", err);
        setLoading(false);
      });
  }, []);

  const groupByMonthYear = (data) => {
    const grouped = {};
    data.forEach(mod => {
      const date = new Date(mod.date);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(mod);
    });
    return grouped;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{
        background: caltransBlue,
        color: "white",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        margin: "20px auto",
        maxWidth: "800px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Button
          onClick={() => navigate('/')}
          sx={{
            color: "white",
            textTransform: "none",
            "&:hover": { color: caltransDarkBlue }
          }}
        >
          <HomeIcon sx={{ fontSize: 36 }} />
        </Button>
        <Typography variant="h4" sx={{ color: "white" }}> Project Modifications
        </Typography>
        <Box width="48px" />
      </Box>

      <Box p={4} maxWidth="800px" margin="0 auto">
        {loading ? (
          <CircularProgress />
        ) : Object.keys(modifications).length === 0 ? (
          <Typography>No modifications found.</Typography>
        ) : (
          Object.entries(modifications).map(([monthYear, mods]) => (
            <Accordion key={monthYear} defaultCollapsed>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{monthYear}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {mods.map((mod, i) => (
                  <Box key={i} mb={2}>
                    <Link
                      to={`/project/${mod.projectId}`}
                      style={{ color: caltransBlue, textDecoration: "underline" }}
                    >
                      {mod.location}
                    </Link>{" "}
                    — Last updated on {new Date(mod.date).toLocaleDateString('en-US')}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </ThemeProvider>
  );
}

export default RecentModifications;
