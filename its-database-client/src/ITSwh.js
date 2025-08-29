import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Button, Container, Typography, Box,
} 

from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import { ITSwhAdd } from './ITSwhAdd';
import { ITSwhTable } from './ITSwhTable';
import axios from "axios";
import ITSwhLog from './ITSwhLog';



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

    
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rowToEdit, setRowToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 

    // Log dialog state & logs
    const [logDialogOpen, setLogDialogOpen] = useState(false);
    const [editLogs, setEditLogs] = useState([]);

    //This funtion will handle saved changes and prompt for editor's name for log purposes
    const handleSaveChanges = async () => {
      const editedBy = prompt("Enter your name for the log:");
      if (!editedBy || editedBy.trim() === "") {
        alert("Name is required to save changes.");
        
        return;
    }
    // Add a log entry (customize action text as needed)
    const timestamp = new Date().toLocaleString();
    setEditLogs(prev => [
      ...prev,
      {
        editedBy,
        timestamp,
        action: "Saved changes to the warehouse inventory.",
      }
    ]);

    setIsEditing(false)

  };

    //Modification log
    const onAdjustQuantity = async (row, delta) => {
      const current = Number(row.quantity) || 0;
      const next = current + delta;
      if (next < 0) return; // prevent negative

      // Optimistic UI update
      setRows(prev =>
        prev.map(r => (r._id === row._id ? { ...r, quantity: next } : r))
      );

      try {
        await axios.put(`http://10.44.2.198:5000/api/itswh/${row._id}`, {
          ITSElement: row.ITSElement,
          manufacturer: row.manufacturer,
          model: row.model,
          location: row.location,
          quantity: next,
        });
      } catch (err) {
        console.error("Failed to update quantity:", err);
        // Rollback on error
        setRows(prev =>
          prev.map(r => (r._id === row._id ? { ...r, quantity: current } : r))
        );
        alert("Failed to update quantity.");
      }
    };

    const handleDeleteRow = async (id) => {
      console.log("Attempting to delete ID:", id); // Display a confirmation dialog
      
      const userConfirmed = window.confirm("Are you sure you want to delete this record?"); // Warning message prompt before deleting
      if (!userConfirmed) return;

      try {
        const response = await axios.delete(`http://10.44.2.198:5000/api/itswh/${id}`); 
        console.log("Delete successful:", response.data);
        setRows(prev => prev.filter(row => row._id !== id));
      } catch (err) {
        console.error("Delete failed:", err.response?.data || err.message);
        alert("Error deleting entry.");
      }
    };

    const handleEditRow = (idx) => {
      setRowToEdit(idx);
      setITSwhAddOpen(true);
    };

    const navigate = useNavigate();

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const { data } = await axios.get(`http://10.44.2.198:5000/api/itswh`);
          if (!cancelled) setRows(data);
        } catch (e) {
          console.error("Failed to load ITSwh items:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []);

  return (

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
                onClick={() => setLogDialogOpen(true)}
                >
                View Log
              </Button>

          {/* Right-aligned Edit/Save Button. When "Edit" is clicked, edit mode enabled and "save" button will appear. */}
            {!isEditing ? (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              ) : (
              <Box display="flex" gap={1}>
                <Button variant="contained" color="primary" onClick={() => setIsEditing(false)}>
                  Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                  Save
                </Button>
              </Box>
              )
            }
        </Box>

        {/* Add Button opens ITSwhAdd Page to enable user to input information into ITS Warehouse*/}
        <div>
          <ITSwhTable rows={rows} isEditing={isEditing} deleteRow={handleDeleteRow} editRow={handleEditRow} onAdjustQuantity={onAdjustQuantity} />
          <button className="btn" onClick={() => setITSwhAddOpen(true)} 
            variant="contained"
            >
            ADD
          </button>

          {/* When "Add" is clicked, opens page to input information and saves information on submit */}
          {ITSwhAddOpen && (
            <ITSwhAdd
              closeITSwhAdd={() => { setITSwhAddOpen(false); setRowToEdit(null); }}
              onSubmit={(saved) => {
                setRows(prev =>
                  rowToEdit === null
                    ? [saved, ...prev]                 
                    : prev.map((r, i) => (i === rowToEdit ? saved : r)) 
                );
              }}
              defaultValue={rowToEdit !== null ? rows[rowToEdit] : null}
            />
          )}
        </div>
        {/* ITSwhLog dialog */}
        <ITSwhLog
          logs={editLogs}
          open={logDialogOpen}
          onClose={() => setLogDialogOpen(false)}
        />
      </Container>
  );
}

export default ITSwh; 