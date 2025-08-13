import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, TextField, Box, Paper, CssBaseline, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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

function UploadExcel() {
  const [file, setFile] = useState(null);
  const [county, setCounty] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !county) {
      alert("Please select a file and enter a county.");
      return;
    }
  
    const uploadedBy = prompt("Enter your name for the upload log:");
    if (!uploadedBy || uploadedBy.trim() === "") {
      alert("Upload canceled: name is required.");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('county', county);
    formData.append('uploadedBy', uploadedBy.trim());
  
    try {
      const response = await axios.post('http://10.44.2.198:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file");
    }
  };
  

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
              Upload Excel File
            </Typography>
          </Box>

          {/* Back Button */}
          <Box display="flex" justifyContent="flex-start" mb={2}>
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
              Back to Upload Selection
            </Button>
          </Box>

          {/* Input Fields */}
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="county-label">Enter County Name</InputLabel>
            <Select
              labelId="county-label"
              value={county}
              label="Enter County Name"
              onChange={(e) => setCounty(e.target.value)}
            >
              <MenuItem value=""><em>Select County</em></MenuItem>
              <MenuItem value="Monterey">Monterey</MenuItem>
              <MenuItem value="San Benito">San Benito</MenuItem>
              <MenuItem value="San Luis Obispo">San Luis Obispo</MenuItem>
              <MenuItem value="Santa Barbara">Santa Barbara</MenuItem>
              <MenuItem value="Santa Cruz">Santa Cruz</MenuItem>
            </Select>
          </FormControl>
          <Box mt={2} mb={2}>
            <input 
              type="file" 
              onChange={handleFileChange} 
              style={{ display: 'block', margin: 'auto' }}
            />
          </Box>

          {/* Upload Button */}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpload} 
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { backgroundColor: caltransDarkBlue }
            }}
          >
            Upload
          </Button>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default UploadExcel;
