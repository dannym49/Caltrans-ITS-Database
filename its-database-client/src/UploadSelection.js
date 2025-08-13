import React from 'react';
import { Container, Button, Typography, Box, Paper, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';

// Define the Caltrans color theme
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

function UploadSelection() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ 
          padding: 4, 
          marginTop: 6, 
          textAlign: 'center', 
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          justifyContent: "space-between"
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} gap={2}>
  <Button
    onClick={() => navigate('/')}
    sx={{
      color: caltransDarkBlue,
      textTransform: "none",
      minWidth: 0,
      p: 0
    }}
  >
    <HomeIcon sx={{ fontSize: 36 }} />
  </Button>
  <Typography variant="h4" sx={{ 
      color: caltransBlue, 
      flexGrow: 1, 
      textAlign: "center", 
      marginRight: "36px" // offsets space taken by home icon
    }}>
    Choose Upload Method
  </Typography>
</Box>

          {/* Back Button */}
          <Box display="flex" justifyContent="flex-start" mb={3}>
            <Button 
              onClick={() => navigate(-1)}
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

          {/* Upload Options */}
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ fontWeight: "bold", textTransform: "none" }}
              onClick={() => navigate('/upload-excel')}
            >
              Upload from Excel
            </Button>

            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth 
              sx={{ fontWeight: "bold", textTransform: "none" }}
              onClick={() => navigate('/add-project')}
            >
              Add Manually
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default UploadSelection;
