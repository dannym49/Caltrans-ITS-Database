import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import {
  Button, Container, Typography, Box,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
} 

from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import { ITSwhAdd } from './ITSwhAdd';
import { ITSwhTable } from './ITSwhTable';


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

function ITSwh() {
    const [ITSwhAddOpen, setITSwhAddOpen] = useState(false);

    const [rows, setRows] = useState([
      {ITSElement: "test", manufacturer: "test", model: "test", location: "test", quantity: "test",}
    ]);

    const [rowToEdit, setRowToEdit] = useState(null);

    const handleDeleteRow = (targetIndex) => {
      setRows(rows.filter((_, idx) => idx !== targetIndex));
    };

    const handleEditRow = (idx) => {
      setRowToEdit(idx);

      setModalOpen(true);
    };

    const handleSubmit = (newRow) => {
      rowToEdit === null
        ? setRows([...rows, newRow])
        : setRows(
            rows.map((currRow, idx) => {
              if (idx !== rowToEdit) return currRow;

              return newRow;
            })
          );
    };

    const navigate = useNavigate();

  return (

      //Overall Header for Page with Home Icon & back to home arrow
     <Container>
        <Box sx={{ //Creates box for ITS Warehouse header
          background: caltransBlue,
          color: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>

          {/* Home Button*/}
          <Button onClick={() => navigate('/')} sx={{ color: "white" }}> 
            <HomeIcon sx={{ fontSize: 36 }} />
          </Button>

          {/*Name of Page*/}
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
            ITS Warehouse
          </Typography>
          <Box sx={{ width: 48 }} />
        </Box>

        {/* Back Arrow Icon and Back to Home navigation Button*/}
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{
            color: caltransBlue,
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            "&:hover": { color: caltransDarkBlue }
          }}>
            Back to Home
          </Button>
        </Box>

        {/* Space to balance layout */}
         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* Left-aligned Log Button */}
              <Button 
                variant="contained" 
                color="primary" 
                //onClick={() => navigate(`/project/${id}/log`)}
                >
                View Log
              </Button>
        
            {/* Right-aligned Edit/Save Button */}
              <Button 
                variant="contained" 
                color="primary">
                Edit
              </Button>
          </Box>

        {/* Page for when you click on "Add" button to input information into ITS Warehouse*/}
        <div>
          <ITSwhTable rows={rows} deleteRow={handleDeleteRow} editRow={handleEditRow} />
          <button className="btn" onClick={() => setITSwhAddOpen(true)} 
            variant="contained">
            ADD
          </button>
          {ITSwhAddOpen && ( 
            <ITSwhAdd 
              closeITSwhAdd={() => {
                setITSwhAddOpen(false);
                setRowToEdit(null);
              }}
              onSubmit={handleSubmit}
              defaultValue={rowToEdit !== null && rows[rowToEdit]}
            />
            )}
        </div>
      </Container>
  );
}

export default ITSwh;