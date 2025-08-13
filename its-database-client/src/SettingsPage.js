import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";

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

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();
  const [modelsByDevice, setModelsByDevice] = useState({});
  const [editModelState, setEditModelState] = useState({}); // { deviceType: { oldModel: newModel } }

  useEffect(() => {
    const fetchModels = async () => {
      try {
        
        const res = await axios.get("http://10.44.2.198:5000/api/models");
        setModelsByDevice(res.data);
      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };

    fetchModels();
  }, []);

  const handleDeleteModel = async (deviceType, modelToDelete) => {
    try {
      await axios.delete("http://10.44.2.198:5000/api/models", {
        data: { deviceType, modelToDelete },
      });
      setModelsByDevice(prev => ({
        ...prev,
        [deviceType]: prev[deviceType].filter(m => m !== modelToDelete),
      }));
      alert(`Model "${modelToDelete}" deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete model:", err);
      alert("Error deleting model.");
    }
  };

  const handleRenameModel = async (deviceType, oldModel) => {
    const newModel = editModelState[deviceType]?.[oldModel];
    if (!newModel || newModel === oldModel) return;

    try {
      await axios.put("http://10.44.2.198:5000/api/models", { deviceType, oldModel, newModel });
      setModelsByDevice(prev => ({
        ...prev,
        [deviceType]: prev[deviceType].map(m => (m === oldModel ? newModel : m)),
      }));
      setEditModelState(prev => {
        const updated = { ...prev };
        delete updated[deviceType]?.[oldModel];
        return updated;
      });
      alert(`Model renamed from "${oldModel}" to "${newModel}".`);
    } catch (err) {
      console.error("Failed to rename model:", err);
      alert("Error renaming model.");
    }
  };


  const handleModelEditChange = (deviceType, model, value) => {
    setEditModelState(prev => ({
      ...prev,
      [deviceType]: { ...(prev[deviceType] || {}), [model]: value },
    }));
  };

  
  const [makesByDevice, setMakesByDevice] = useState({});
  const [editMakeState, setEditMakeState] = useState({});

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        
        const res = await axios.get("http://10.44.2.198:5000/api/makes");
        setMakesByDevice(res.data);
      } catch (err) {
        console.error("Failed to fetch make:", err);
      }
    };

    fetchMakes();
  }, []);

  const handleDeleteMake = async (deviceType, makeToDelete) => {
    try {
      await axios.delete("http://10.44.2.198:5000/api/makes", {
        data: { deviceType, makeToDelete },
      });
      setMakesByDevice(prev => ({
        ...prev,
        [deviceType]: prev[deviceType].filter(m => m !== makeToDelete),
      }));
      alert(`Make "${makeToDelete}" deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete make:", err);
      alert("Error deleting make.");
    }
  };

  const handleRenameMake = async (deviceType, oldMake) => {
    const newMake = editMakeState[deviceType]?.[oldMake];
    if (!newMake || newMake === oldMake) return;

    try {
      await axios.put("http://10.44.2.198:5000/api/makes", { deviceType, oldMake, newMake });
      setMakesByDevice(prev => ({
        ...prev,
        [deviceType]: prev[deviceType].map(m => (m === oldMake ? newMake : m)),
      }));
      setEditMakeState(prev => {
        const updated = { ...prev };
        delete updated[deviceType]?.[oldMake];
        return updated;
      });
      alert(`Make renamed from "${oldMake}" to "${newMake}".`);
    } catch (err) {
      console.error("Failed to rename make:", err);
      alert("Error renaming make.");
    }
  };


  const handleMakeEditChange = (deviceType, make, value) => {
    setEditMakeState(prev => ({
      ...prev,
      [deviceType]: { ...(prev[deviceType] || {}), [make]: value },
    }));
  };

  const handleDeleteSite = async () => {
    if (!window.confirm("Are you sure you want to delete this Site? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://10.44.2.198:5000/api/project/${projectId}`);
      alert("ITS Site deleted successfully.");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete ITS Site:", error);
      alert("An error occurred while trying to delete the ITS Site.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {/* Hero */}
        <Box
          sx={{
            background: caltransBlue,
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            marginTop: "20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => navigate("/")} sx={{ color: "white", "&:hover": { color: caltransDarkBlue } }}>
            <HomeIcon sx={{ fontSize: 30 }} />
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
            ITS Site Settings
          </Typography>
          <Box sx={{ width: 35 }} />
        </Box>

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
              "&:hover": { color: caltransDarkBlue },
            }}
            startIcon={<ArrowBackIcon />}
          >
            Back to Site details
          </Button>
        </Box>

        {/* Editable Device Models */}
        <Box sx={{ p: 4 }}>
          

          <Typography variant="h6" gutterBottom>
            Device Makes
          </Typography>

          {Object.entries(makesByDevice).map(([deviceType, makes]) => (
            <Accordion key={deviceType} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography >{deviceType}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {makes.map((make) => (
                  <Box key={make} display="flex" alignItems="center" mb={1} gap={1}>
                    <TextField
                      size="small"
                      value={editMakeState[deviceType]?.[make] ?? make}
                      onChange={(e) => handleMakeEditChange(deviceType, make, e.target.value)}
                    />
                    <IconButton
                      onClick={() => handleRenameMake(deviceType, make)}
                      color="primary"
                      title="Save rename"
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteMake(deviceType, make)}
                      color="error"
                      title="Delete make"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
          

        </Box>
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Device Models
          </Typography>

          {Object.entries(modelsByDevice).map(([deviceType, models]) => (
            <Accordion key={deviceType} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography >{deviceType}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {models.map((model) => (
                  <Box key={model} display="flex" alignItems="center" mb={1} gap={1}>
                    <TextField
                      size="small"
                      value={editModelState[deviceType]?.[model] ?? model}
                      onChange={(e) => handleModelEditChange(deviceType, model, e.target.value)}
                    />
                    <IconButton
                      onClick={() => handleRenameModel(deviceType, model)}
                      color="primary"
                      title="Save rename"
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteModel(deviceType, model)}
                      color="error"
                      title="Delete model"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
          

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSite}
            startIcon={<DeleteIcon />}
            sx={{ mt: 4 }}
          >
            Delete ITS Site
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SettingsPage;
