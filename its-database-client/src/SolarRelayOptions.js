import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  CssBaseline
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';

// Define Caltrans Color Theme
const caltransBlue = "#005A9C"; // Primary color
const caltransDarkBlue = "#003F67"; // Hover color

// Theme Configuration
const theme = createTheme({
  palette: {
    primary: { main: caltransBlue },
    secondary: { main: caltransDarkBlue },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h4: { fontWeight: "bold" },
    h6: { fontSize: "1.2rem", fontWeight: 500 },
  },
});

// Options for Solar Data Pages
const options = [
  { label: "View Live Data", path: "/solar-live" },
  { label: "View Daily Metrics", path: "/solar-daily" }
];

function SolarRelaySelect() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        {/* Hero Section */}
        <Box sx={{
          background: caltransBlue,
          color: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          marginBottom: "10px",
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
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
            Solar Charge Controller
          </Typography>
          <Box sx={{ width: 48 }} />
        </Box>

        {/* Card with Option Buttons */}
        <Card elevation={3} sx={{ marginTop: 4, padding: 3, borderRadius: "10px", boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              {options.map((option) => (
                <Grid item xs={12} key={option.label}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(option.path)}
                    sx={{
                      padding: "12px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      transition: "0.3s",
                      "&:hover": { backgroundColor: caltransDarkBlue }
                    }}
                  >
                    {option.label}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Back Button */}
            <Box display="flex" justifyContent="center" marginTop={3}>
              <Button
                onClick={() => navigate('/')}
                sx={{
                  color: caltransBlue,
                  fontSize: "16px",
                  fontWeight: "bold",
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { color: caltransDarkBlue }
                }}
                startIcon={<ArrowBackIcon />}
              >
                Back to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default SolarRelaySelect;
