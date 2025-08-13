import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Container, Typography, Card, CardContent, Grid, Box, CssBaseline } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
// Caltrans color theme
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
    h6: { fontSize: "1.2rem", fontWeight: 500 },
  },
});

//Define routes for each county
const routesByCounty = {
  "Santa Barbara": ["1", "101", "135", "154", "246"],
  "San Luis Obispo": ["1", "46", "101" ],
  "Monterey": ["1", "68", "101", "183"],
  "Santa Cruz": ["1", "17"],
  "San Benito": ["101", "156"]
};

function RouteSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const county = location.state?.county || "";

  const routes = county === "ALL"
  ? Array.from(new Set(Object.values(routesByCounty).flat())).sort((a, b) => Number(a) - Number(b))
  : (routesByCounty[county] || []).sort((a, b) => Number(a) - Number(b));


  if (!county) {
    // If no county passed in, redirect to counties
    navigate('/counties');
    return null;
  }

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
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>Select a Route </Typography>
          <Box sx={{ width: 48 }} />
        </Box>

        {/* Route Buttons */}
        <Card elevation={3} sx={{ marginTop: 4, padding: 3, borderRadius: "10px", boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              
              {routes.map((route) => (
                <Grid item xs={12} key={route}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate(`/projects/${county}`, { state: { county, route } })}
                    sx={{
                      padding: "12px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      transition: "0.3s",
                      "&:hover": { backgroundColor: caltransDarkBlue }
                    }}
                  >
                    Route {route}
                  </Button>
                </Grid>
              ))}

              <Grid item xs={12} >
                <Button
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate(`/projects/${county}`, { state: { county, route: "ALL" } })}
                  sx={{
                    padding: "12px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: caltransDarkBlue }
                  }}
                >
                  View All Routes
                </Button>
              </Grid>
            </Grid>
            
            


            {/* Back Button */}
            <Box display="flex" justifyContent="center" marginTop={2}>
              <Button 
                onClick={() => navigate('/counties')}
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
                Back to Counties
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default RouteSelect;
