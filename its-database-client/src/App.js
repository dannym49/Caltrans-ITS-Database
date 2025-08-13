import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import './App.css'; // Optional styling

// Define Caltrans Color Theme
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
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        {/* Header with Logo & Title */}
        <Box
          sx={{
            background: caltransBlue,
            color: "white",
            padding: "20px",
            textAlign: "center",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px"
          }}
        >
          <img src="/Caltrans Logo.png" alt="Caltrans Logo" style={{ height: "50px" }} />
          <Typography variant="h4">Caltrans D5 ITS Database Web Server</Typography>
        </Box>

        

        {/* Centered Buttons */}
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5} gap={3}>
          <Link to="/counties" style={{ textDecoration: "none", width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: "18px", fontWeight: "bold", padding: "12px", borderRadius: "10px" }}
            >
              View ITS Sites
            </Button>
          </Link>

          <a
            href="https://www.google.com/maps/d/u/0/embed?mid=1CzbqNyxSL1PsQcpKlQSJAsMczXuCo-8&ehbc=2E312F"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: "18px", fontWeight: "bold", padding: "12px", borderRadius: "10px" }}
            >
              ITS Sites Map
            </Button>
          </a>
          <Link to="/solar-relay-select" style={{ textDecoration: "none", width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: "18px", fontWeight: "bold", padding: "12px", borderRadius: "10px" }}
            >
              Solar Charge Controller Relay
            </Button>
          </Link>
          <Link to="/ups-live" style={{ textDecoration: "none", width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: "18px", fontWeight: "bold", padding: "12px", borderRadius: "10px" }}
            >
              UPS Relay
            </Button>
          </Link>
             <Link to="/ITSwh" style={{ textDecoration: "none", width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: "18px", fontWeight: "bold", padding: "12px", borderRadius: "10px" }}
            >
              ITS Warehouse
            </Button>
          </Link>
          <Link to="/upload" style={{ textDecoration: "none", width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: "18px", fontWeight: "bold", padding: "12px", borderRadius: "10px" }}
            >
              Upload Data
            </Button>
          </Link>
        </Box>
        {/*  Latest Modification Section */}
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: "bold", color: caltransDarkBlue }}>
            <Link
              to="/recent-modifications"
              style={{ color: caltransBlue, textDecoration: "underline" }}
            >
              View All Modifications
            </Link>
          </Typography>
        </Box>

      </Container>
    </ThemeProvider>
  );
}

export default App;
