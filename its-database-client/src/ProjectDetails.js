import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import {
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Grid,
  CssBaseline,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { TextField } from '@mui/material';
import { FormControl, Select, MenuItem, Autocomplete } from '@mui/material';



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

// Define categories and their subcategories
const categoryMap = {
  "General": ["Route", "Prefix", "Postmile", "Suffix", "Direction", "Latitude", "Longitude", "Photos"],
  "Service Location": ["Latitude", "Longitude"],
  "Plans": ["Installation EA", "Sheet", "Replacement EA-1", "Sheet", "Replacement EA-2", "Sheet"],
  "Communication": ["Location", "Device", "Connected To", "Local IP", "Remote IP", "Remote Port", "Provider", "Make", "Model", "TSS", "Phone"],
  "CMS": ["Location", "Model", "IP", "TMS ID", "Make"],
  "CCTV": ["Location","Local IP", "Remote IP", "TMS ID", "Make", "Model", "Remote Port"],
  "MVDS": ["Location", "Local IP", "Remote IP", "Remote Port", "TMS ID", "Make", "Model"],
  "UPS": ["Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model"],
  "RPS": [ "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"],
  "2nd UPS": ["Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model"],
  "2nd RPS": ["Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"]
};

// Define subcategories in order
const subCategoryRow = [
  "Location", "Route", "Prefix", "Postmile", "Suffix", "Direction", "Latitude", "Longitude", "Photos",
  "Latitude", "Longitude",
  "Installation EA", "Sheet", "Filepath", "Replacement EA-1", "Sheet",  "Filepath EA-1", "Replacement EA-2", "Sheet",	"Filepath EA-2",
  "Location", "Device", "Connected To", "Local IP", "Remote IP", "Remote Port", "Provider", "Make", "Model", "TSS", "Phone",
  "Location", "Model", "IP", "TMS ID", "Make",
  "Location", "Local IP", "Remote IP", "TMS ID", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "TMS ID", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"
];

const categoryIndices = {
  "General": [0,1,2,3,4,5,6,7,8],
  "Service Location": [9,10],
  "Plans": [11,12,13,14,15,16,17,18,19],
  "Communication": [21,22,23,24,25,26,27,28,29,30,31],
  "CMS": [33,34,35,36, 37],
  "CCTV": [39,40,41,42,43, 44],
  "MVDS": [46,47,48, 49, 50, 51],
  "UPS": [53, 54, 55, 56, 57],
  "RPS": [59,60,61,62, 63, 64, 65, 66, 67],
  "2nd UPS": [68,69,70,71, 72, 73],
  "2nd RPS": [75, 76, 77, 78, 79, 80, 81, 82, 83]
};


function stripPort(ip) {
  if (!ip) return "";
  
// Otherwise, split by colon and return the IP part
  return ip.split(":")[0];
}


function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const county = location.state?.county;
  const navigate = useNavigate();
  const handleBack = () => {
    const fallbackCounty = project?.county || "Unknown";
    const fallbackRoute = project?.data?.[1] || "";
  
    navigate(`/projects/${fallbackCounty}`, {
      state: { county: fallbackCounty, route: fallbackRoute }
    });
  };

  const [makesByDeviceType, setMakesByDeviceType] = useState({});
  const [modelsByDeviceType, setModelsByDeviceType] = useState({});
  
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectIds, setProjectIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [upsLiveData, setUpsLiveData] = useState(null);
  const [upsLiveLoading, setUpsLiveLoading] = useState(false);
  const [upsLiveError, setUpsLiveError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // <-- Editing mode
  const [editedData, setEditedData] = useState([]);  // <-- Editable copy of project.data
  const [upsDeviceType, setUpsDeviceType] = useState(() => {
  const deviceType = project?.data?.[9]?.trim().toLowerCase();
    return deviceType === "solar" ? "Solar Charge Controller" : "UPS";
  });
  const [upsDeviceType2, setUpsDeviceType2] = useState(() => {
  const deviceType = project?.data?.[9]?.trim().toLowerCase();
    return deviceType === "solar" ? "Solar Charge Controller" : "UPS";
  });
  const [lastEditedRemoteIpIndex, setLastEditedRemoteIpIndex] = useState(null);
  const [pendingCustomMakes, setPendingCustomMakes] = useState({});
  const [pendingCustomModels, setPendingCustomModels] = useState({});


  const remoteIpIndexes = [24, 35, 40, 47, 54, 60];


const handleFieldChange = (index, value) => {
  const newData = [...editedData];
  newData[index] = value;
  setEditedData(newData);

  // Track which Remote IP field was last edited
  if (remoteIpIndexes.includes(index)) {
    setLastEditedRemoteIpIndex(index);
  }
};


  const handleSaveChanges = async () => {
  const editedBy = prompt("Enter your name for the log:");
  if (!editedBy || editedBy.trim() === "") {
    alert("Name is required to save changes.");
    return;
  }

  const finalData = [...editedData];

  if (
    lastEditedRemoteIpIndex !== null &&
    project.data?.[21]?.trim().toLowerCase() === "modem"
  ) {
    const ipToSync = finalData[lastEditedRemoteIpIndex]?.trim();

    if (ipToSync && ipToSync !== "") {
      remoteIpIndexes.forEach(index => {
        if (
          index !== lastEditedRemoteIpIndex &&
          finalData[index]?.trim() !== "" &&
          finalData[index]?.trim() !== ipToSync
        ) {
          finalData[index] = ipToSync;
        }
      });
    }
  }

  try {
    // Save any pending custom makes BEFORE updating the project
    for (const [deviceType, newMake] of Object.entries(pendingCustomMakes)) {
      const existing = makesByDeviceType[deviceType] || [];
      if (newMake && !existing.includes(newMake)) {
        try {
          const res = await fetch('http://10.44.2.198:5000/api/makes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceType, newMake })
          });
          const data = await res.json();
          setMakesByDeviceType(data.makesByDeviceType);
        } catch (err) {
          console.error(`Failed to save make "${newMake}" for ${deviceType}`, err);
        }
      }
    }

    for (const [deviceType, newModel] of Object.entries(pendingCustomModels)) {
      const existing = modelsByDeviceType[deviceType] || [];
      if (newModel && !existing.includes(newModel)) {
        try {
          const res = await fetch('http://10.44.2.198:5000/api/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceType, newModel })
          });
          const data = await res.json();
          setModelsByDeviceType(data.modelsByDeviceType);
        } catch (err) {
          console.error(`Failed to save model "${newModel}" for ${deviceType}`, err);
        }
      }
    }
    await axios.put(`http://10.44.2.198:5000/api/project/${id}`, {
      data: finalData,
      editedBy: editedBy.trim()
    });

    setProject(prev => ({ ...prev, data: finalData }));
    setEditedData(finalData);
    setIsEditing(false);
    setLastEditedRemoteIpIndex(null);
    alert('Project updated successfully.');
  } catch (error) {
    console.error('Error updating project:', error);
    alert('Failed to update project.');
  }
};



const deviceOptions = [
  "Modem",
  "Wireless Link (Access Point)",
  "Wireless Link (Client)",
];

const connectedToOptions = [
  "Modem",
  "Router",
];
  
useEffect(() => {
  async function fetchProject() {
    try {
      const projectResponse = await axios.get(`http://10.44.2.198:5000/api/project/${id}`);
      setProject(projectResponse.data);
      setEditedData(projectResponse.data.data.slice()); // initialize editable copy

      setError(null); // Clear error if successfully loaded

    } catch (err) {
      console.error("Error fetching ITS Site details:", err);
      setError(`ITS Site data is missing. Debug Info: ITS Site ID received - ${id}`);
    } finally {
      setLoading(false);
    }
  }

  fetchProject();
}, [id]); 

useEffect(() => {
  async function fetchProjectIds() {
    try {
      const idsResponse = await axios.get('http://10.44.2.198:5000/api/project-ids');
      setProjectIds(idsResponse.data);
    } catch (err) {
      console.error("Error fetching project IDs:", err);
    }
  }

  fetchProjectIds();
}, []); 


useEffect(() => {
  if (isEditing && project?.data?.[9] != null) {
    const deviceType = String(project.data[9]).trim().toLowerCase();
    setUpsDeviceType(
      deviceType === "solar"
        ? "Solar Charge Controller"
        : "UPS"
    );
  }
}, [isEditing, project]);

useEffect(() => {
  if (isEditing && project?.data?.[9] != null) {
    const deviceType = String(project.data[9]).trim().toLowerCase();
    setUpsDeviceType2(
      deviceType === "solar"
        ? "Solar Charge Controller"
        : "UPS"
    );
  }
}, [isEditing, project]);


useEffect(() => {
  async function fetchCountyIfMissing() {
    if (!county) {
      try {
        const response = await axios.get(`http://10.44.2.198:5000/api/project/${id}/county`);
        const fetchedCounty = response.data.county;
        setProject(prev => ({ ...prev, county: fetchedCounty }));
      } catch (err) {
        console.error("Failed to fetch county from ID:", err);
      }
    }
  }

  fetchCountyIfMissing();
}, [id, county]);

  useEffect(() => {
    fetch('http://10.44.2.198:5000/api/makes')
      .then(res => res.json())
      .then(setMakesByDeviceType)
      .catch(err => console.error("Failed to load makes:", err));
  }, []);

  useEffect(() => {
    fetch('http://10.44.2.198:5000/api/models')
      .then(res => res.json())
      .then(setModelsByDeviceType)
      .catch(err => console.error("Failed to load makes:", err));
  }, []);


useEffect(() => {
  if (projectIds.length > 0) {
    const idx = projectIds.findIndex(pid => pid === id);
    setCurrentIndex(idx);
  }
}, [id, projectIds]);

  if (loading) return <Container><CircularProgress /></Container>;
  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
        <Box display="flex" justifyContent="flex-start" marginTop={2}>
        <Button 
          onClick={handleBack}
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
          Back to ITS Sites
        </Button>

        </Box>
      </Container>
    );
  }
  if (!project || !project.data) {
    return (
      <Container>
        <Alert severity="error">ITS Site data is missing.</Alert>
        <Box display="flex" justifyContent="flex-start" marginTop={2}>
          <Button 
            onClick={handleBack}
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
            Back to ITS Sites
          </Button>

        </Box>
      </Container>
    );
  }
  const locationValue = project.data[0] || "Unknown Location";
  //  Map subcategories to correct indexes
  const subCategoryIndexTracker = {};
  subCategoryRow.forEach((subCategory, index) => {
    if (!subCategoryIndexTracker[subCategory]) {
      subCategoryIndexTracker[subCategory] = [];
    }
    subCategoryIndexTracker[subCategory].push(index);
  });

  //  Organize project data into categories
  const categorizedData = {};
  Object.entries(categoryMap).forEach(([category, subcategories]) => {
    categorizedData[category] = subcategories.map((subCategory) => {
      const indices = subCategoryIndexTracker[subCategory] || [];
      const valueAtIndex = indices.length ? project.data[indices.shift()] || "" : "";
      return { subCategory, value: valueAtIndex };
    });
  });

  const copyToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("Copied to clipboard!");
  };

  const genLat = project.data[6];  //General Latitude
  const genLong = project.data[7];  //General Longitude
  const servLat = project.data[9];  //Service Latitude
  const servLong = project.data[10];  //Service Longtidue

const categoryAliases = {
  "General": ["General"],
  "Service Location": ["Service Location"],
  "Plans": ["Plans"],
  "Communication": ["Communication"],
  "CMS": ["CMS"],
  "CCTV": ["CCTV"],
  "MVDS": ["MVDS"],
  "UPS": ["UPS", "UPS/Solar Charge Controller"],
  "2nd UPS": ["2nd UPS", "2nd UPS/ Solar Charge Controller"],
  "RPS": ["RPS"],
  "2nd RPS": ["2nd RPS"],
};

  const lastModifiedPerCategory = {};
if (project?.log?.length > 0) {
  for (const [category, indices] of Object.entries(categoryIndices)) {
    const aliases = categoryAliases[category] || [category];
    for (let i = project.log.length - 1; i >= 0; i--) {
      const log = project.log[i];
      if (!log?.description) continue;

      if (aliases.some(a => log.description.startsWith(`[${a}]`))) {
        lastModifiedPerCategory[category] = log.date;
        break;
      }
    }
  }
}

  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">

        {/* Hero Section */}
        <Box
          sx={{
            background: caltransBlue,
            color: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          {/* Home Button */}
          <Button
            onClick={() => navigate('/')}
            sx={{
              color: "white",
              minWidth: 0,
              padding: 0,
              "&:hover": { color: caltransDarkBlue }
            }}
          >
            <HomeIcon sx={{ fontSize: 36 }} />
          </Button>

          {/* Centered Title */}
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
            ITS Site Details
          </Typography>

          {/* Right-side: Settings button appears only during edit mode */}
          {isEditing ? (
            <Button
              
              sx={{
              color: "white",
              minWidth: 0,
              padding: 0,
              "&:hover": { color: caltransDarkBlue }
            }}
              onClick={() => navigate(`/settings?projectId=${id}`)}
            >
              <SettingsIcon sx={{ fontSize: 36 }} />
            </Button>
          ) : (
            <Box sx={{ width: 35 }} />  
          )}
        </Box>


        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          {/* Left-aligned Log Button */}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate(`/project/${id}/log`)}
          >
            View Log
          </Button>

          {/* Right-aligned Edit/Save Button */}
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
           
              )}
            </Box>

        {/* Location Section - Buttons next to the actual location value */}
      <Box sx={{ 
        background: "#f0f0f0", 
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "30px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
      }}>
      
      {/* Static Title "Location" */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: "bold", 
          color: caltransBlue, 
          textAlign: "center",
          marginBottom: 2
        }}
      >
        Location
      </Typography>

      {/* Previous button-Location text-Next button  */}
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center"
      width="100%"
    >
      <Button
        onClick={() => {
          if (currentIndex !== null) {
            const prevIndex = currentIndex === 0 ? projectIds.length - 1 : currentIndex - 1;
            navigate(`/project/${projectIds[prevIndex]}`, { state: { county, route: location.state?.route } });
          }
        }}
        variant="contained"
        sx={{ width: "150px" }}
      >
        Previous
      </Button>

      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: "bold", 
          color: caltransDarkBlue,
          textAlign: "center",
          flexGrow: 1
        }}
      >
        {locationValue}
      </Typography>

      <Button
        onClick={() => {
          if (currentIndex !== null) {
            const nextIndex = currentIndex === projectIds.length - 1 ? 0 : currentIndex + 1;
            navigate(`/project/${projectIds[nextIndex]}`, { state: { county, route: location.state?.route } });
          }
        }}
        variant="contained"
        sx={{ width: "150px" }}
      >
        Next
      </Button>
    </Box>
    </Box>
        {/* Back Button - Now Below the Blue Header */}
        <Box display="flex" justifyContent="flex-start" marginBottom={2}>
          <Button 
            onClick={handleBack}
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
            Back to ITS Sites
        </Button>

        </Box>
        {/* Data Grid Layout */}
        <Grid container spacing={3}>
          {Object.entries(categorizedData)
            .filter(([category]) => {
              if (isEditing) return true; // Show all categories when editing
            
              const indexRange = categoryIndices[category];
              if (!indexRange) return true;
            
              return indexRange.some(index =>
                project.data[index] && String(project.data[index]).trim() !== ""
              );
            })
            .map(([category], index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={4} sx={{ borderRadius: "10px", boxShadow: 3 }}>
                  <CardContent>
                    <Box textAlign="center" mb={1}>
                    {(category === "UPS" || category === "2nd UPS") ? (
                      isEditing ? (
                        <FormControl fullWidth size="small" variant="standard" sx={{ textAlign: "center" }}>
                          <Select
                            value={category === "UPS" ? upsDeviceType : upsDeviceType2}
                            onChange={(e) => {
                              const selectedType = e.target.value;
                              if (category === "UPS") {
                                setUpsDeviceType(selectedType);
                                handleFieldChange(56, selectedType === "Solar Charge Controller" ? "" : "");
                              } else {
                                setUpsDeviceType2(selectedType);
                                handleFieldChange(72, selectedType === "Solar Charge Controller" ? "" : "");
                              }
                            }}
                            disableUnderline
                            sx={{
                              fontSize: "1.25rem",
                              fontWeight: "bold",
                              color: caltransBlue,
                              textAlign: "center",
                              ".MuiSelect-select": {
                                padding: 0,
                              },
                              "& svg": {
                                top: "calc(50% - 12px)",
                              },
                            }}
                          >
                            <MenuItem value="UPS">{category === "2nd UPS" ? "2nd UPS" : "UPS"}</MenuItem>
                            <MenuItem value="Solar Charge Controller">{category === "2nd UPS" ? "2nd Solar Charge Controller" : "Solar Charge Controller"}</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: caltransBlue }}>
                          {(() => {
                            const rawType = project.data[9];
                            const deviceType = typeof rawType === "string" && rawType.trim().toLowerCase() === "solar"
                              ? "Solar Charge Controller"
                              : "UPS";
                            return category === "2nd UPS" ? `2nd ${deviceType}` : deviceType;
                          })()}
                        </Typography>
                      )
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: caltransBlue }}>
                        {category}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: "gray", fontStyle: "italic" }}>
                      {lastModifiedPerCategory[category] 
                        ? `Last modified: ${lastModifiedPerCategory[category]}`
                        : "Unmodified"}
                    </Typography>

                    </Box>

                        <Box>
                              {/* General */}
                              {category === "General" && (
                                <>  
                                  {isEditing ? (
                                    <>
                                      <Typography variant="body2"><strong>Route:</strong></Typography>
                                      <TextField
                                        value={editedData[1] || ''} onChange={(e) => handleFieldChange(1, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Prefix:</strong></Typography>
                                      <TextField
                                        value={editedData[2] || ''} onChange={(e) => handleFieldChange(2, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Postmile:</strong></Typography>
                                      <TextField
                                        value={editedData[3] || ''} onChange={(e) => handleFieldChange(3, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Suffix:</strong></Typography>
                                      <TextField
                                        value={editedData[4] || ''} onChange={(e) => handleFieldChange(4, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Direction:</strong></Typography>
                                      <TextField
                                        value={editedData[5] || ''} onChange={(e) => handleFieldChange(5, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Latitude:</strong></Typography>
                                      <TextField
                                        value={editedData[6] || ''} onChange={(e) => handleFieldChange(6, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Longitude:</strong></Typography>
                                      <TextField
                                        value={editedData[7] || ''} onChange={(e) => handleFieldChange(7, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Photos:</strong></Typography>
                                      <TextField
                                        value={editedData[8] || ''} onChange={(e) => handleFieldChange(8, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2"><strong>Route: </strong> {project.data[1]}</Typography>
                                      {project.data[2] && (
                                        <Typography variant="body2">
                                          <strong>Prefix: </strong> {project.data[2]}
                                        </Typography>
                                      )}
                                      <Typography variant="body2"><strong>Postmile: </strong> {project.data[3]}</Typography>
                                      {project.data[4] && (
                                        <Typography variant="body2">
                                          <strong>Suffix: </strong> {project.data[4]}
                                        </Typography>
                                      )}
                                      <Typography variant="body2"><strong>Direction: </strong> {project.data[5]}</Typography>
                                      <Typography variant="body2"><strong>Latitude: </strong> {project.data[6]}</Typography>
                                      <Typography variant="body2"><strong>Longitude: </strong> {project.data[7]}</Typography>
                                      <Typography variant="body2">
                                        <strong>Google Maps:</strong> 
                                        <a href={`https://www.google.com/maps?q=${genLat},${genLong}`} target="_blank" rel="noopener noreferrer">
                                          View Location
                                        </a>
                                      </Typography>
                                      <Typography variant="body2"> <strong>Photos: </strong> 
                                        <Button  variant="text" size="small" sx={{ textTransform: "none", padding: 0 }} onClick={() => copyToClipboard(project.data[8])}>
                                          Copy Folder Path
                                        </Button>
                                      </Typography>
                                    </>
                                  )}
                                </>
                              )}
                              {category === "Service Location" && ( 
                                <>  
                                  {isEditing ? (
                                    <>
                                       <Typography variant="body2"><strong>Latitude:</strong></Typography>
                                      <TextField
                                        value={editedData[9] || ''} onChange={(e) => handleFieldChange(9, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                       <Typography variant="body2"><strong>Longitude:</strong></Typography>
                                      <TextField
                                        value={editedData[10] || ''} onChange={(e) => handleFieldChange(10, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      {String(project.data[9] || "").toLowerCase() === "solar" ? (
                                    <>
                                      <Typography variant="body2"><strong>Location Type:</strong> Solar</Typography>
                                    </>
                                  ) : (!isNaN(servLat) && servLat !== "" && !isNaN(servLong) && servLong !== "") ? (
                                    <>
                                      <Typography variant="body2"><strong>Latitude: </strong> {project.data[9]}</Typography>
                                      <Typography variant="body2"><strong>Longitude: </strong> {project.data[10]}</Typography>
                                      <Typography variant="body2">
                                        <strong>Google Maps:</strong>{" "}
                                        <a
                                          href={`https://www.google.com/maps?q=${servLat},${servLong}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ color: "blue", textDecoration: "underline" }}
                                        >
                                          View Location
                                        </a>
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="body2" color="textSecondary">
                                      No service location data available.
                                    </Typography>
                                  )}
                                    </>
                                  )}
                                </>
                              )}

                              {/* Plan Sheet Links */}
                              
                             {category === "Plans" && (() => {const filePathEA1 = typeof project.data[13] === "string" ? project.data[13] : "";
                              const filePathEA2 = typeof project.data[16] === "string" ? project.data[16] : "";
                              const filePathEA3 = typeof project.data[19] === "string" ? project.data[19] : "";

                              return (
                                <>
                                  {/* Installation EA */}
                                  {isEditing ? (
                                    <>
                                      <Typography variant="body2"><strong>Installation EA #:</strong></Typography>
                                      <TextField value={editedData[11] || ""} onChange={(e) => handleFieldChange(11, e.target.value)} fullWidth  size="small"  sx={{ marginBottom: 1 }}
                                      />
                                      <Typography variant="body2"><strong>Installation EA Sheet #:</strong></Typography>
                                      <TextField value={editedData[12] || ""} onChange={(e) => handleFieldChange(12, e.target.value)} fullWidth  size="small"  sx={{ marginBottom: 1 }}
                                      />
                                      <Typography variant="body2"><strong>Filepath For Installation EA File:</strong></Typography>
                                      <TextField 
                                        value={editedData[13] || ""} onChange={(e) => handleFieldChange(13, e.target.value)} fullWidth  size="small"  sx={{ marginBottom: 2 }}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      {project.data[12] && (
                                        <Typography variant="body2">
                                          <strong>Installation EA:</strong>{' '}
                                          <Box
                                            component="span"
                                            onClick={() => {
                                              const fullPath = project.data[13];
                                              const parentPath = fullPath.substring(0, fullPath.lastIndexOf('\\'));
                                              copyToClipboard(parentPath);
                                            }}
                                            sx={{
                                              color: 'blue',
                                              cursor: 'pointer',
                                              textDecoration: 'underline'
                                              
                                            }}
                                          >
                                            {project.data[11]}
                                          </Box>
                                        </Typography>

                                      )}
                                      {project.data[12] && filePathEA1 && (
                                        <Typography variant="body2">
                                          <strong>Sheet:</strong>{" "}
                                          <a
                                            href={`http://10.44.2.198:5000/api/open-file?path=${encodeURIComponent(filePathEA1)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "blue", textDecoration: "underline" }}
                                          >
                                            {project.data[12]}
                                          </a>
                                          {" "}
                                          
                                        </Typography>

                                      )}
                                    </>
                                  )}

                                  {/* Replacement EA-1 */}
                                  {isEditing ? (
                                    <>
                                      <Typography variant="body2"><strong>Replacement EA-1 #:</strong></Typography>
                                      <TextField 
                                        value={editedData[14] || ""}
                                        onChange={(e) => handleFieldChange(14, e.target.value)}
                                        fullWidth 
                                        size="small" 
                                        sx={{ marginBottom: 1 }}
                                      />
                                      <Typography variant="body2"><strong>Replacement EA-1 Sheet #:</strong></Typography>
                                      <TextField value={editedData[15] || ""} onChange={(e) => handleFieldChange(15, e.target.value)} fullWidth  size="small"  sx={{ marginBottom: 1 }}
                                      />
                                      <Typography variant="body2"><strong>Filepath For Replacement EA-1 File:</strong></Typography>
                                      <TextField 
                                        value={editedData[16] || ""}
                                        onChange={(e) => handleFieldChange(16, e.target.value)}
                                        fullWidth 
                                        size="small" 
                                        sx={{ marginBottom: 2 }}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      {project.data[14] && (
                                        <Typography variant="body2">
                                          <strong>Replacement EA-1:</strong>{' '}
                                          <Box
                                            component="span"
                                            onClick={() => {
                                              const fullPath = project.data[16];
                                              const parentPath = fullPath.substring(0, fullPath.lastIndexOf('\\'));
                                              copyToClipboard(parentPath);
                                            }}
                                            sx={{
                                              color: 'blue',
                                              cursor: 'pointer',
                                              textDecoration: 'underline'
                                              
                                            }}
                                          >
                                            {project.data[14]}
                                          </Box>
                                        </Typography>
                                      )}
                                      {project.data[15] && filePathEA2 && (
                                        <Typography variant="body2">
                                          <strong>Sheet:</strong>{" "}
                                          <a
                                            href={`http://10.44.2.198:5000/api/open-file?path=${encodeURIComponent(filePathEA2)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "blue", textDecoration: "underline" }}
                                          >
                                            {project.data[15]}
                                          </a>
                                          {" "}
                                          
                                        </Typography>
                                      )}
                                    </>
                                  )}

                                  {/* EA-2 */}
                                  {isEditing ? (
                                    <>
                                      <Typography variant="body2"><strong>Replacement EA-2 #:</strong></Typography>
                                      <TextField 
                                        value={editedData[17] || ""}
                                        onChange={(e) => handleFieldChange(17, e.target.value)}
                                        fullWidth 
                                        size="small" 
                                        sx={{ marginBottom: 1 }}
                                      />
                                      <Typography variant="body2"><strong>Replacement EA-2 Sheet #:</strong></Typography>
                                      <TextField value={editedData[18] || ""} onChange={(e) => handleFieldChange(18, e.target.value)} fullWidth  size="small"  sx={{ marginBottom: 1 }}
                                      />
                                      <Typography variant="body2"><strong>Filepath For Replacement EA-2 File:</strong></Typography>
                                      <TextField 
                                        value={editedData[19] || ""}
                                        onChange={(e) => handleFieldChange(19, e.target.value)}
                                        fullWidth 
                                        size="small" 
                                        sx={{ marginBottom: 2 }}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      {project.data[17] && (
                                        <Typography variant="body2">
                                          <strong>Replacement EA-2:</strong>{' '}
                                          <Box
                                            component="span"
                                            onClick={() => {
                                              const fullPath = project.data[19];
                                              const parentPath = fullPath.substring(0, fullPath.lastIndexOf('\\'));
                                              copyToClipboard(parentPath);
                                            }}
                                            sx={{
                                              color: 'blue',
                                              cursor: 'pointer',
                                              textDecoration: 'underline'
                                              
                                            }}
                                          >
                                            {project.data[17]}
                                          </Box>
                                        </Typography>
                                      )}
                                      {project.data[18] && filePathEA3 && (
                                        <Typography variant="body2">
                                          <strong>Sheet:</strong>{" "}
                                          <a
                                            href={`http://10.44.2.198:5000/api/open-file?path=${encodeURIComponent(filePathEA3)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "blue", textDecoration: "underline" }}
                                          >
                                            {project.data[18]}
                                          </a>
                                          {" "}
                                          
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                </>
                              );
                            })()}

                              {category === "Communication" && (
                                <>  
                                  {isEditing ? (
                                    <>
                                   
                                    <Typography variant="body2"><strong>Device:</strong></Typography>
                                      <FormControl fullWidth size="small" margin="dense">
                                        <Select
                                          value={editedData[21] || ''}
                                          onChange={(e) => handleFieldChange(21, e.target.value)}
                                          displayEmpty
                                        >
                                          <MenuItem value=""><em>Select Device</em></MenuItem>
                                          {deviceOptions.map((option, index) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>

                                      {/* Conditionally show Connected To */}
                                      {(editedData[21] === "Wireless Link (Access Point)" || editedData[21] === "Wireless Link (Client)") ? (
                                        <>
                                          <Typography variant="body2"><strong>Connected To:</strong></Typography>
                                          <FormControl fullWidth size="small" margin="dense">
                                            <Select
                                              value={editedData[22] || ''}
                                              onChange={(e) => handleFieldChange(22, e.target.value)}
                                              displayEmpty
                                            >
                                              <MenuItem value=""><em>Select Connection</em></MenuItem>
                                              {connectedToOptions.map((option, index) => (
                                                <MenuItem key={index} value={option}>{option}</MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </>
                                      ) : null}

                                    
                                      {(() => {
                                          const type21 = editedData[21]?.trim().toLowerCase();
                                          const type22 = editedData[22]?.trim().toLowerCase();
                                          
                                          if (type21 === "modem") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                              <TextField
                                                value={editedData[23] || ''} onChange={(e) => handleFieldChange(23, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Local Port #: </strong> 9191</Typography>
                                             <Typography variant="body2"><strong>Modem IP:</strong></Typography>
                                              <TextField
                                                value={editedData[24] || ''} onChange={(e) => handleFieldChange(24, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Modem Port #:</strong></Typography>
                                              <TextField
                                                value={editedData[25] || ''} onChange={(e) => handleFieldChange(25, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Provider:</strong></Typography>
                                              <TextField
                                                value={editedData[27] || ''} onChange={(e) => handleFieldChange(27, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Make:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[28] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(28, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["COMMUNICATION"] || []).includes(editedData[28])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[28] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(28, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}

                                              <Typography variant="body2"><strong>Model:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[29] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(29, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                            {/* {!((modelsByDeviceType["COMMUNICATION"] || []).includes(editedData[29])) && (
                                              <TextField
                                                label="Enter Model"
                                                value={editedData[29] || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  handleFieldChange(29, value);
                                                  setPendingCustomModels(prev => ({
                                                    ...prev,
                                                    COMMUNICATION: value   
                                                  }));
                                                }}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                placeholder="Enter custom model"
                                              />
                                            )} */}

                                              <Typography variant="body2"><strong>TSS:</strong></Typography>
                                              <TextField value={editedData[30] || ''} onChange={(e) => handleFieldChange(30, e.target.value)} fullWidth size="small" margin="dense" />
                                              <Typography variant="body2"><strong>Phone:</strong></Typography>
                                              <TextField value={editedData[31] || ''} onChange={(e) => handleFieldChange(31, e.target.value)} fullWidth size="small" margin="dense" />
                                              </>
                                            );
                                          }
                                          if (type21 === "wireless link (access point)" && type22 === "modem") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                              <TextField
                                                value={editedData[23] || ''} onChange={(e) => handleFieldChange(23, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Modem IP:</strong></Typography>
                                              <TextField
                                                value={editedData[24] || ''} onChange={(e) => handleFieldChange(24, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Modem Port #:</strong></Typography>
                                              <TextField
                                                value={editedData[25] || ''} onChange={(e) => handleFieldChange(25, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Wireless Link IP:</strong></Typography>
                                              <TextField
                                                value={editedData[26] || ''} onChange={(e) => handleFieldChange(26, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Wireless Link Port #: </strong> {90}</Typography>
                                              <Typography variant="body2"><strong>Provider:</strong></Typography>
                                              <TextField
                                                value={editedData[27] || ''} onChange={(e) => handleFieldChange(27, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Make:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[28] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(28, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["COMMUNICATION"] || []).includes(editedData[28])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[28] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(28, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}

                                              <Typography variant="body2"><strong>Model:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[29] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(29, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                            {/* {!((modelsByDeviceType["COMMUNICATION"] || []).includes(editedData[29])) && (
                                              <TextField
                                                label="Enter Model"
                                                value={editedData[29] || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  handleFieldChange(29, value);
                                                  setPendingCustomModels(prev => ({
                                                    ...prev,
                                                    COMMUNICATION: value   
                                                  }));
                                                }}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                placeholder="Enter custom model"
                                              />
                                            )} */}
                                              <Typography variant="body2"><strong>TSS:</strong></Typography>
                                              <TextField value={editedData[30] || ''} onChange={(e) => handleFieldChange(30, e.target.value)} fullWidth size="small" margin="dense" />
                                              <Typography variant="body2"><strong>Phone:</strong></Typography>
                                              <TextField value={editedData[31] || ''} onChange={(e) => handleFieldChange(31, e.target.value)} fullWidth size="small" margin="dense" />
                                              </>
                                            );
                                          }
                                          if  (type21 === "wireless link (access point)" && type22 === "router") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                              <TextField
                                                value={editedData[23] || ''} onChange={(e) => handleFieldChange(23, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Router IP:</strong></Typography>
                                              <TextField
                                                value={editedData[24] || ''} onChange={(e) => handleFieldChange(24, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Wireless Link IP:</strong></Typography>
                                              <TextField
                                                value={editedData[26] || ''} onChange={(e) => handleFieldChange(26, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Provider:</strong></Typography>
                                              <TextField
                                                value={editedData[27] || ''} onChange={(e) => handleFieldChange(27, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Make:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[28] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(28, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["COMMUNICATION"] || []).includes(editedData[28])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[28] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(28, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}

                                              <Typography variant="body2"><strong>Model:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[29] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(29, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                            {/* {!((modelsByDeviceType["COMMUNICATION"] || []).includes(editedData[29])) && (
                                              <TextField
                                                label="Enter Model"
                                                value={editedData[29] || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  handleFieldChange(29, value);
                                                  setPendingCustomModels(prev => ({
                                                    ...prev,
                                                    COMMUNICATION: value   
                                                  }));
                                                }}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                placeholder="Enter custom model"
                                              />
                                            )} */}
                                               </>
                                            );
                                          }
                                          if (type21 === "wireless link (client)" && type22 === "router") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                              <TextField
                                                value={editedData[23] || ''} onChange={(e) => handleFieldChange(23, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Router IP:</strong></Typography>
                                              <TextField
                                                value={editedData[24] || ''} onChange={(e) => handleFieldChange(24, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Wireless Link IP:</strong></Typography>
                                              <TextField
                                                value={editedData[26] || ''} onChange={(e) => handleFieldChange(26, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Provider:</strong></Typography>
                                              <TextField
                                                value={editedData[27] || ''} onChange={(e) => handleFieldChange(27, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Make:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[28] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(28, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["COMMUNICATION"] || []).includes(editedData[28])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[28] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(28, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}

                                              <Typography variant="body2"><strong>Model:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                               options={modelsByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[29] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(29, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                            {/* {!((modelsByDeviceType["COMMUNICATION"] || []).includes(editedData[29])) && (
                                              <TextField
                                                label="Enter Model"
                                                value={editedData[29] || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  handleFieldChange(29, value);
                                                  setPendingCustomModels(prev => ({
                                                    ...prev,
                                                    COMMUNICATION: value   
                                                  }));
                                                }}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                placeholder="Enter custom model"
                                              />
                                            )} */}
                                              
                                              </>
                                            );
                                          }
                                          if (type21 === "wireless link (client)" && type22 === "modem") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                              <TextField
                                                value={editedData[23] || ''} onChange={(e) => handleFieldChange(23, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Local Port #: </strong> 443</Typography>
                                              <Typography variant="body2"><strong>Modem IP:</strong></Typography>
                                              <TextField
                                                value={editedData[24] || ''} onChange={(e) => handleFieldChange(24, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Modem Port #: </strong> 9191</Typography>
                                              <Typography variant="body2"><strong>Wireless Link IP:</strong></Typography>
                                              <TextField
                                                value={editedData[24] || ''} onChange={(e) => handleFieldChange(24, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Wireless Link Port:</strong></Typography>
                                              <TextField
                                                value={editedData[25] || ''} onChange={(e) => handleFieldChange(25, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Provider:</strong></Typography>
                                              <TextField
                                                value={editedData[27] || ''} onChange={(e) => handleFieldChange(27, e.target.value)} fullWidth size="small" margin="dense"
                                              />
                                              <Typography variant="body2"><strong>Make:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[28] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(28, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["COMMUNICATION"] || []).includes(editedData[28])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[28] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(28, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}
                                              <Typography variant="body2"><strong>Model:</strong></Typography>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["COMMUNICATION"] || []}
                                                value={editedData[29] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(29, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["COMMUNICATION"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      COMMUNICATION: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                            {/* {!((modelsByDeviceType["COMMUNICATION"] || []).includes(editedData[29])) && (
                                              <TextField
                                                label="Enter Model"
                                                value={editedData[29] || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  handleFieldChange(29, value);
                                                  setPendingCustomModels(prev => ({
                                                    ...prev,
                                                    COMMUNICATION: value   
                                                  }));
                                                }}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                placeholder="Enter custom model"
                                              />
                                            )} */}
                                              <Typography variant="body2"><strong>TSS:</strong></Typography>
                                              <TextField value={editedData[30] || ''} onChange={(e) => handleFieldChange(30, e.target.value)} fullWidth size="small" margin="dense" />
                                              <Typography variant="body2"><strong>Phone:</strong></Typography>
                                              <TextField value={editedData[31] || ''} onChange={(e) => handleFieldChange(31, e.target.value)} fullWidth size="small" margin="dense" />
                                              
                                              </>
                                            );
                                          }
                                          return null;
                                        })()}
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2"><strong>Device: </strong>{project.data[21] }</Typography>
                                      {project.data[22]  && (
                                        <Typography variant="body2"><strong>Connected To: </strong> {project.data[22]}</Typography>
                                      )}
                                      <Typography variant="body2"><strong>Local IP: </strong>{project.data[23] }</Typography>
                                      
                                      
                                      {(() => {
                                          const type21 = project.data[21]?.trim().toLowerCase();
                                          const type22 = project.data[22]?.trim().toLowerCase();
                                          const ip = stripPort(project.data[24]);
                                          const port = project.data[25];
                                          const wlip = project.data[26];
                                          if (type21 === "modem") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local Port #: </strong> 9191</Typography>
                                              <Typography variant="body2">
                                                <strong>Modem IP:</strong>{" "}
                                                <a
                                                  href={`http://${ip}:${port}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                  {`${ip}  `}
                                                </a>
                                              </Typography>
                                              <Typography variant="body2"><strong>Modem Port #: </strong> {project.data[25]}</Typography>
                                              <Typography variant="body2"><strong>Provider: </strong> {project.data[27]}</Typography>
                                              <Typography variant="body2"><strong>Make: </strong> {project.data[28]}</Typography>
                                              <Typography variant="body2"><strong>Model: </strong> {project.data[29]}</Typography>
                                              <Typography variant="body2"><strong>TSS: </strong> {project.data[30]}</Typography>
                                              <Typography variant="body2"><strong>Phone: </strong> {project.data[31]}</Typography>
                                              </>
                                            );
                                          }
                                          if (type21 === "wireless link (access point)" && type22 === "modem") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local Port #: </strong> 9191</Typography>
                                              <Typography variant="body2">
                                                <strong>Modem IP:</strong>{" "}
                                                <a
                                                  href={`http://${ip}:${port}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                  {`${ip}  `}
                                                </a>
                                              </Typography>
                                              <Typography variant="body2"><strong>Modem Port #: </strong> {project.data[25]}</Typography>
                                              <Typography variant="body2">
                                                <strong>Wireless Link IP:</strong>{" "}
                                                <a
                                                  href={`http://${ip}:90`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                  {`${ip}  `}
                                                </a>
                                              </Typography>
                                              <Typography variant="body2"><strong>Wireless Link Port #: </strong> {90}</Typography>
                                              <Typography variant="body2"><strong>Provider: </strong> {project.data[27]}</Typography>
                                              <Typography variant="body2"><strong>Make: </strong> {project.data[28]}</Typography>
                                              <Typography variant="body2"><strong>Model: </strong> {project.data[29]}</Typography>
                                              <Typography variant="body2"><strong>TSS: </strong> {project.data[30]}</Typography>
                                              <Typography variant="body2"><strong>Phone: </strong> {project.data[31]}</Typography>
                                              </>
                                            );
                                          }

                                          if  (type21 === "wireless link (access point)" && type22 === "router") {
                                            return (
                                              <>
                                              <Typography variant="body2">
                                                <strong>Router IP:</strong>{" "}
                                                <a
                                                  href={`https://${stripPort(ip)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                  {stripPort(ip)}
                                                </a>
                                              </Typography>
                                              <Typography variant="body2">
                                                <strong>Wireless Link IP:</strong>{" "}
                                                <a
                                                  href={`https://${stripPort(wlip)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                  {stripPort(wlip)}
                                                </a>
                                              </Typography>
                                              <Typography variant="body2"><strong>Provider: </strong> {project.data[27]}</Typography>
                                              <Typography variant="body2"><strong>Make: </strong> {project.data[28]}</Typography>
                                              <Typography variant="body2"><strong>Model: </strong> {project.data[29]}</Typography>
                                              </>
                                            );
                                          }

                                          if (type21 === "wireless link (client)" && type22 === "router") {
                                            return (
                                              <>
                                              
                                              <Typography variant="body2"><strong>Router IP: </strong> {project.data[24]}</Typography>
                                              <Typography variant="body2">
                                                <strong>Wireless Link Access Point IP:</strong>{" "}
                                                <a
                                                  href={`https://${stripPort(wlip)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                  {stripPort(wlip)}
                                                </a>
                                              </Typography>
                                              <Typography variant="body2"><strong>Provider: </strong> {project.data[27]}</Typography>
                                              <Typography variant="body2"><strong>Make: </strong> {project.data[28]}</Typography>
                                              <Typography variant="body2"><strong>Model: </strong> {project.data[29]}</Typography>
                                              </>
                                            );
                                          }

                                          if (type21 === "wireless link (client)" && type22 === "modem") {
                                            return (
                                              <>
                                              <Typography variant="body2"><strong>Local Port #: </strong> 443</Typography>
                                                <Typography variant="body2">
                                                  <strong>Modem IP:</strong>{" "}
                                                  <a
                                                    href={`http://${ip}:9191`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "blue", textDecoration: "underline" }}
                                                  >
                                                    {`${ip}`}
                                                  </a>
                                                </Typography>
                                                <Typography variant="body2"><strong>Modem Port #: </strong> 9191</Typography>
                                                <Typography variant="body2">
                                                  <strong>Wireless Link IP:</strong>{" "}
                                                  <a
                                                    href={`https://${ip}:${port}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "blue", textDecoration: "underline" }}
                                                  >
                                                    {`${ip}`}
                                                  </a>
                                                </Typography>
                                                <Typography variant="body2"><strong>Wireless Link Port #: </strong> {project.data[25]}</Typography>
                                                <Typography variant="body2"><strong>Provider: </strong> {project.data[27]}</Typography>
                                                <Typography variant="body2"><strong>Make: </strong> {project.data[28]}</Typography>
                                                <Typography variant="body2"><strong>Model: </strong> {project.data[29]}</Typography>
                                                <Typography variant="body2"><strong>TSS: </strong> {project.data[30]}</Typography>
                                                <Typography variant="body2"><strong>Phone: </strong> {project.data[31]}</Typography>
                                              </>
                                            );
                                          }

                                          return null;
                                        })()}
                                    </>
                                  )}
                                </>
                              )}
                              {category === "CMS" && (isEditing || (project.data[35] && String(project.data[35]).trim() !== "")) && (
                                <>  
                                  {isEditing ? (
                                    <>
                                    
                                    <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                      <TextField
                                        value={editedData[34] || ''} onChange={(e) => handleFieldChange(34, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                     <Typography variant="body2"><strong>Remote IP:</strong></Typography>
                                      <TextField
                                        value={editedData[35] || ''} onChange={(e) => handleFieldChange( 35, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>TMS ID:</strong></Typography>
                                      <TextField
                                        value={editedData[36] || ''} onChange={(e) => handleFieldChange(36, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Make:</strong></Typography>
                                      <Autocomplete
                                          freeSolo
                                          options={makesByDeviceType["CMS"] || []}
                                          value={editedData[37] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(37, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingMakes = makesByDeviceType["CMS"] || [];
                                            if (newInputValue && !existingMakes.includes(newInputValue)) {
                                              setPendingCustomMakes(prev => ({
                                                ...prev,
                                                CMS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Make"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter make"
                                            />
                                          )}
                                        />

                                      {/* {!((makesByDeviceType["CMS"] || []).includes(editedData[37])) && (
                                        <TextField
                                          label="Enter Make"
                                          value={editedData[37] || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleFieldChange(37, value);
                                            setPendingCustomMakes(prev => ({
                                              ...prev,
                                              CMS: value   
                                            }));
                                          }}
                                          fullWidth
                                          size="small"
                                          margin="dense"
                                          placeholder="Enter custom make"
                                        />
                                      )} */}

                                      <Typography variant="body2"><strong>Model:</strong></Typography>
                                      
                                      <Autocomplete
                                          freeSolo
                                          options={modelsByDeviceType["CMS"] || []}
                                          value={editedData[33] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(33, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingModels = modelsByDeviceType["CMS"] || [];
                                            if (newInputValue && !existingModels.includes(newInputValue)) {
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                CMS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Model"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter model"
                                            />
                                          )}
                                        />

                                        {/* {!((modelsByDeviceType["CMS"] || []).includes(editedData[33])) && (
                                          <TextField
                                            label="Enter Model"
                                            value={editedData[33] || ''}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              handleFieldChange(33, value);
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                CMS: value   
                                              }));
                                            }}
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            placeholder="Enter custom model"
                                          />
                                        )} */}
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2"><strong>Device Name:</strong> 2070 Controller-CMS Signview</Typography>
                                      <Typography variant="body2"><strong>Local IP:</strong>{project.data[34]}</Typography>
                                      <Typography variant="body2"><strong>Local Port #:</strong> 10001</Typography>
                                      <Typography variant="body2">
                                        <strong>Remote IP:</strong>{" "}
                                        {project.data[35] ? (
                                          String(project.data[33]).startsWith("7") ? (
                                            <a
                                              href={`${
                                                project.data[33] === "700C" || project.data[33] === "720C"
                                                  ? "https"
                                                  : "http"
                                              }://${stripPort(project.data[35])}:8443`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "blue", textDecoration: "underline" }}
                                            >
                                              {stripPort(project.data[35])}
                                            </a>
                                          ) : (
                                            <span style={{ color: "black" }}>
                                              {stripPort(project.data[35])}
                                            </span>
                                          )
                                        ) : (
                                          "N/A"
                                        )}
                                      </Typography>
                                      <Typography variant="body2"> <strong>Remote Port #:</strong>{" "} {String(project.data[33]).startsWith("7") ? "8443" : "10001"}</Typography>
                                      <Typography variant="body2"><strong>TMS ID: </strong> {project.data[36]}</Typography>
                                      <Typography variant="body2"><strong>Make: </strong> {project.data[37]}</Typography>
                                      <Typography variant="body2"><strong>Model: </strong> {project.data[33]}</Typography>
                                      

                                    </>
                                  )}
                                </>
                              )}
                                                            
                              {category === "CCTV" && (isEditing || (project.data[40] && String(project.data[40]).trim() !== "" ))&&  (
                                <>  
                                  {isEditing ? (
                                    <>
                                    
                                    <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                      <TextField
                                        value={editedData[39] || ''} onChange={(e) => handleFieldChange(39, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                     <Typography variant="body2"><strong>Remote IP:</strong></Typography>
                                      <TextField
                                        value={editedData[40] || ''} onChange={(e) => handleFieldChange(40, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Remote Port:</strong></Typography>
                                      <TextField
                                        value={editedData[44] || ''} onChange={(e) => handleFieldChange(44, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                       <Typography variant="body2"><strong>TMS ID:</strong></Typography>
                                      <TextField
                                        value={editedData[41] || ''} onChange={(e) => handleFieldChange(41, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Make:</strong></Typography>
                                      <Autocomplete
                                          freeSolo
                                          options={makesByDeviceType["CCTV"] || []}
                                          value={editedData[42] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(42, newInputValue);
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Make"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter make"
                                            />
                                          )}
                                        />

                                      {/* {!((makesByDeviceType["CCTV"] || []).includes(editedData[42])) && (
                                        <TextField
                                          label="Enter Make"
                                          value={editedData[42] || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleFieldChange(42, value);
                                            setPendingCustomMakes(prev => ({
                                              ...prev,
                                              CCTV: value  
                                            }));
                                          }}
                                          fullWidth
                                          size="small"
                                          margin="dense"
                                          placeholder="Enter custom make"
                                        />
                                      )} */}
                                      <Typography variant="body2"><strong>Model:</strong></Typography>
                                        <Autocomplete
                                          freeSolo
                                          options={modelsByDeviceType["CCTV"] || []}
                                          value={editedData[43] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(43, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingModels = modelsByDeviceType["CCTV"] || [];
                                            if (newInputValue && !existingModels.includes(newInputValue)) {
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                CCTV: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Model"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter model"
                                            />
                                          )}
                                        />


                                        {/* {!((modelsByDeviceType["CCTV"] || []).includes(editedData[43])) && (
                                          <TextField
                                            label="Enter Model"
                                            value={editedData[43] || ''}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              handleFieldChange(43, value);
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                CCTV: value   
                                              }));
                                            }}
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            placeholder="Enter custom model"
                                          />
                                        )} */}
                                      
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2"><strong>Device Name:</strong> Camera-Web</Typography>
                                      <Typography variant="body2"><strong>Local IP:</strong>{project.data[39]}</Typography>
                                      <Typography variant="body2"><strong>Local Port #:</strong> 80</Typography>
                                      <Typography variant="body2">
                                        <strong>Remote IP:</strong>{" "}
                                          {project.data[40] ? (
                                            <a
                                              href={`http://${stripPort(project.data[40])}${project.data[44] ? `:${project.data[44]}` : ''}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "blue", textDecoration: "underline" }}
                                            >
                                              {stripPort(project.data[54])}
                                            </a>
                                          ) : "N/A"}
                                      </Typography>                                      
                                      <Typography variant="body2"><strong>Remote Port #: </strong> {project.data[44]}</Typography>
                                      <Typography variant="body2"><strong>TMS ID: </strong> {project.data[41]}</Typography>
                                      <Typography variant="body2"><strong>Make: </strong> {project.data[42]}</Typography>
                                      <Typography variant="body2"><strong>Model: </strong> {project.data[43]}</Typography>
                                    </>
                                  )}
                                </>
                              )}
                              
                              {category === "MVDS" && (isEditing || (project.data[47] && String(project.data[47]).trim() !== "")) &&  (
                                <>  
                                  {isEditing ? (
                                    <>
                                    
                                    <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                      <TextField
                                        value={editedData[46] || ''} onChange={(e) => handleFieldChange(46, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                     <Typography variant="body2"><strong>Remote IP:</strong></Typography>
                                      <TextField
                                        value={editedData[47] || ''} onChange={(e) => handleFieldChange(47, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Remote Port #:</strong></Typography>
                                      <TextField
                                        value={editedData[48] || ''} onChange={(e) => handleFieldChange(48, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>TMS ID:</strong></Typography>
                                      <TextField
                                        value={editedData[49] || ''} onChange={(e) => handleFieldChange(49, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Make:</strong></Typography>
                                      <Autocomplete
                                          freeSolo
                                          options={makesByDeviceType["MVDS"] || []}
                                          value={editedData[50] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(50, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingMakes = makesByDeviceType["MVDS"] || [];
                                            if (newInputValue && !existingMakes.includes(newInputValue)) {
                                              setPendingCustomMakes(prev => ({
                                                ...prev,
                                                MVDS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Make"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter make"
                                            />
                                          )}
                                        />

                                      {/* {!((makesByDeviceType["MVDS"] || []).includes(editedData[50])) && (
                                        <TextField
                                          label="Enter Make"
                                          value={editedData[50] || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleFieldChange(50, value);
                                            setPendingCustomMakes(prev => ({
                                              ...prev,
                                              MVDS: value  
                                            }));
                                          }}
                                          fullWidth
                                          size="small"
                                          margin="dense"
                                          placeholder="Enter custom make"
                                        />
                                      )} */}
                                      <Typography variant="body2"><strong>Model:</strong></Typography>
                                      <Autocomplete
                                          freeSolo
                                          options={modelsByDeviceType["MVDS"] || []}
                                          value={editedData[51] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(51, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingModels = modelsByDeviceType["MVDS"] || [];
                                            if (newInputValue && !existingModels.includes(newInputValue)) {
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                MVDS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Model"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter model"
                                            />
                                          )}
                                        />
                                        

                                        {/* {!((modelsByDeviceType["MVDS"] || []).includes(editedData[51])) && (
                                          <TextField
                                            label="Enter Model"
                                            value={editedData[51] || ''}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              handleFieldChange(51, value);
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                MVDS: value   
                                              }));
                                            }}
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            placeholder="Enter custom model"
                                          />
                                        )} */}
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2"><strong>Device Name:</strong> MVDS-Data</Typography>
                                      <Typography variant="body2" ><strong>Local IP:</strong> {stripPort(project.data[46])}</Typography>
                                      <Typography variant="body2"><strong>Local Port #:</strong> 10001</Typography>
                                      <Typography variant="body2" ><strong>Remote IP:</strong> {stripPort(project.data[47])}</Typography>
                                      <Typography variant="body2"><strong>Remote Port #: </strong> {project.data[48]}</Typography>
                                      <Typography variant="body2"><strong>TMS ID: </strong> {project.data[49]}</Typography>
                                      <Typography variant="body2"><strong>Make: </strong> {project.data[50]}</Typography>
                                      <Typography variant="body2"><strong>Model: </strong> {project.data[51]}</Typography>
                                    </>
                                  )}
                                </>
                              )}
                              
                              {category === "UPS" && (isEditing || project.data[54] && String(project.data[54]).trim() !== "") && (() => {

                                const deviceTypeField = editedData[9] ?? project.data[9];
                                const isSolar = typeof deviceTypeField === "string" && deviceTypeField.trim().toLowerCase() === "solar";

                              

                                return (
                                  <>
                                    {isEditing ? (
                                      <>
                                        
                                        <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                        <TextField value={editedData[53] || ''} onChange={(e) => handleFieldChange(53, e.target.value)} fullWidth size="small" margin="dense" />

                                        <Typography variant="body2"><strong>Remote IP:</strong></Typography>
                                        <TextField value={editedData[54] || ''} onChange={(e) => handleFieldChange(54, e.target.value)} fullWidth size="small" margin="dense" />
                                        
                                        <Typography variant="body2"><strong>Remote Port #:</strong></Typography>
                                        <TextField value={editedData[55] || ''} onChange={(e) => handleFieldChange(55, e.target.value)} fullWidth size="small" margin="dense" />

                                        <Typography variant="body2"><strong>Make:</strong></Typography>
                                          {upsDeviceType === "UPS" ? (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["UPS"] || []}
                                                value={editedData[56] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(56, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["UPS"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      UPS: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["UPS"] || []).includes(editedData[56])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[56] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(56, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      UPS: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}
                                            </>
                                          ) : (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["SOLAR"] || []}
                                                value={editedData[56] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(56, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["SOLAR"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      SOLAR: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["SOLAR"] || []).includes(editedData[56])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[56] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(56, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      SOLAR: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}
                                            </>
                                          )}

                                       <Typography variant="body2"><strong>Model:</strong></Typography> 
                                           {upsDeviceType === "UPS" ? (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["UPS"] || []}
                                                value={editedData[57] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(57, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["UPS"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      UPS: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                            {/* {!((modelsByDeviceType["UPS"] || []).includes(editedData[57])) && (
                                              <TextField
                                                label="Enter Model"
                                                value={editedData[57] || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  handleFieldChange(57, value);
                                                  setPendingCustomModels(prev => ({
                                                    ...prev,
                                                    UPS: value   
                                                  }));
                                                }}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                placeholder="Enter custom model"
                                              />
                                            )} */}
                                          </>
                                          ) : (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["SOLAR"] || []}
                                                value={editedData[57] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(57, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["SOLAR"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      SOLAR: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                              {/* {!((modelsByDeviceType["SOLAR"] || []).includes(editedData[57])) && (
                                                <TextField
                                                  label="Enter Model"
                                                  value={editedData[57] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(57, value);
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      SOLAR: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom model"
                                                />
                                              )} */}
                                            </>
                                          )} 

                                      </>
                                    ) : (
                                      <>
                                        <Typography variant="body2"><strong>Device Name:</strong> {isSolar ? "Solar Charge Controller-Web" : "UPS"}</Typography>
                                        <Typography variant="body2"><strong>Local IP:</strong> {project.data[53]}</Typography>
                                        <Typography variant="body2"><strong>Local Port #:</strong> 80</Typography>
                                        <Typography variant="body2">
                                          <strong>Remote IP:</strong>{" "}
                                          {project.data[54] ? (
                                            <a
                                              href={`http://${stripPort(project.data[54])}${project.data[55] ? `:${project.data[55]}` : ''}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "blue", textDecoration: "underline" }}
                                            >
                                              {stripPort(project.data[54])}
                                            </a>
                                          ) : "N/A"}
                                        </Typography>
                                        <Typography variant="body2"><strong>Remote Port #:</strong> {project.data[55]}</Typography>
                                        <Typography variant="body2"><strong>Make:</strong> {project.data[56]}</Typography>
                                        <Typography variant="body2"><strong>Model:</strong> {project.data[57]}</Typography>
                                      </>
                                    )}
                                  </>
                                );
                              })()}

                              {category === "RPS" && (isEditing || (project.data[60] && String(project.data[60]).trim() !== "")) && (


                                <>  
                                  {isEditing ? (
                                    <>
                                    
                                    <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                      <TextField
                                        value={editedData[59] || ''} onChange={(e) => handleFieldChange(59, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Remote IP:</strong></Typography>
                                      <TextField
                                        value={editedData[60] || ''} onChange={(e) => handleFieldChange(60, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Remote Port #:</strong></Typography>
                                      <TextField
                                        value={editedData[61] || ''} onChange={(e) => handleFieldChange(61, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Make:</strong></Typography>
                                      <Autocomplete
                                          freeSolo
                                          options={makesByDeviceType["RPS"] || []}
                                          value={editedData[62] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(62, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingMakes = makesByDeviceType["RPS"] || [];
                                            if (newInputValue && !existingMakes.includes(newInputValue)) {
                                              setPendingCustomMakes(prev => ({
                                                ...prev,
                                                RPS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Make"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter make"
                                            />
                                          )}
                                        />

                                      {/* {!((makesByDeviceType["RPS"] || []).includes(editedData[62])) && (
                                        <TextField
                                          label="Enter Make"
                                          value={editedData[62] || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleFieldChange(62, value);
                                            setPendingCustomMakes(prev => ({
                                              ...prev,
                                              RPS: value  
                                            }));
                                          }}
                                          fullWidth
                                          size="small"
                                          margin="dense"
                                          placeholder="Enter custom make"
                                        />
                                      )} */}
                                      <Typography variant="body2"><strong>Model:</strong></Typography>
                                      <Autocomplete
                                          freeSolo
                                          options={modelsByDeviceType["RPS"] || []}
                                          value={editedData[63] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(63, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingModels = modelsByDeviceType["RPS"] || [];
                                            if (newInputValue && !existingModels.includes(newInputValue)) {
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                RPS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Model"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter model"
                                            />
                                          )}
                                        />

                                        {/* {!((modelsByDeviceType["RPS"] || []).includes(editedData[63])) && (
                                          <TextField
                                            label="Enter Model"
                                            value={editedData[63] || ''}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              handleFieldChange(63, value);
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                RPS: value   
                                              }));
                                            }}
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            placeholder="Enter custom model"
                                          />
                                        )} */}
                                      <Typography variant="body2"><strong>Outlet 1:</strong></Typography>
                                      <TextField
                                        value={editedData[64] || ''} onChange={(e) => handleFieldChange(64, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Outlet 2:</strong></Typography>
                                      <TextField
                                        value={editedData[65] || ''} onChange={(e) => handleFieldChange(65, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Outlet 3:</strong></Typography>
                                      <TextField
                                        value={editedData[66] || ''} onChange={(e) => handleFieldChange(66, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Outlet 4:</strong></Typography>
                                      <TextField
                                        value={editedData[67] || ''} onChange={(e) => handleFieldChange(67, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2"><strong>Device Name:</strong> Remote Power Swtitch</Typography>
                                      <Typography variant="body2"><strong>Local IP:</strong>{project.data[59]}</Typography>
                                      <Typography variant="body2"><strong>Local Port #:</strong> 80</Typography>
                                      <Typography variant="body2">
                                          <strong>Remote IP:</strong>{" "}
                                          {project.data[60] ? (
                                            <a
                                              href={`http://${stripPort(project.data[60])}${project.data[61] ? `:${project.data[61]}` : ''}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "blue", textDecoration: "underline" }}
                                            >
                                              {stripPort(project.data[60])}
                                            </a>
                                          ) : "N/A"}
                                        </Typography>
                                      <Typography variant="body2"><strong>Remote Port #: </strong> {project.data[61]}</Typography>
                                      <Typography variant="body2"><strong>Make: </strong> {project.data[62]}</Typography>
                                      <Typography variant="body2"><strong>Model: </strong> {project.data[63]}</Typography>
                                      {project.data[64] && !String(project.data[64]).toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 1: </strong> {project.data[64]}</Typography>
                                      )}

                                      {project.data[65] && !String(project.data[65]).toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 2: </strong> {project.data[65]}</Typography>
                                      )}

                                      {project.data[66] && !String(project.data[66]).toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 3: </strong> {project.data[66]}</Typography>
                                      )}

                                      {project.data[67] && !String(project.data[67]).toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 4: </strong> {project.data[67]}</Typography>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              
                              {category === "2nd UPS" && (isEditing || project.data[70] && String(project.data[70]).trim() !== "") && (() => {
                                const deviceTypeField = editedData[9] ?? project.data[9];
                                const isSolar = typeof deviceTypeField === "string" && deviceTypeField.trim().toLowerCase() === "solar";

                                if (!isEditing && !(project.data[68] || project.data[69])) return null;

                                return (
                                  <>
                                    {isEditing ? (
                                      <>
                                        
                                        <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                        <TextField value={editedData[69] || ''} onChange={(e) => handleFieldChange(69, e.target.value)} fullWidth size="small" margin="dense" />

                                        <Typography variant="body2"><strong>Remote IP:</strong></Typography>
                                        <TextField value={editedData[70] || ''} onChange={(e) => handleFieldChange(70, e.target.value)} fullWidth size="small" margin="dense" />
                                        
                                        <Typography variant="body2"><strong>Remote Port #:</strong></Typography>
                                        <TextField value={editedData[71] || ''} onChange={(e) => handleFieldChange(71, e.target.value)} fullWidth size="small" margin="dense" />

                                        <Typography variant="body2"><strong>Make:</strong></Typography>
                                          {upsDeviceType2 === "UPS" ? (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["UPS"] || []}
                                                value={editedData[72] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(72, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["UPS"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      UPS: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["UPS"] || []).includes(editedData[72])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[72] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(72, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      UPS: value  
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}
                                            </>
                                          ) : (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={makesByDeviceType["SOLAR"] || []}
                                                value={editedData[72] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(72, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingMakes = makesByDeviceType["SOLAR"] || [];
                                                  if (newInputValue && !existingMakes.includes(newInputValue)) {
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      SOLAR: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Make"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter make"
                                                  />
                                                )}
                                              />

                                              {/* {!((makesByDeviceType["SOLAR"] || []).includes(editedData[72])) && (
                                                <TextField
                                                  label="Enter Make"
                                                  value={editedData[72] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(56, value);
                                                    setPendingCustomMakes(prev => ({
                                                      ...prev,
                                                      SOLAR: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom make"
                                                />
                                              )} */}
                                            </>
                                          )}
                                          
                                          <Typography variant="body2"><strong>Model:</strong></Typography> 
                                           {upsDeviceType2 === "UPS" ? (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["UPS"] || []}
                                                value={editedData[73] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(73, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["UPS"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      UPS: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                            {/* {!((modelsByDeviceType["UPS"] || []).includes(editedData[73])) && (
                                              <TextField
                                                label="Enter Model"
                                                value={editedData[73] || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  handleFieldChange(73, value);
                                                  setPendingCustomModels(prev => ({
                                                    ...prev,
                                                    UPS: value   
                                                  }));
                                                }}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                placeholder="Enter custom model"
                                              />
                                            )} */}
                                          </>
                                          ) : (
                                            <>
                                              <Autocomplete
                                                freeSolo
                                                options={modelsByDeviceType["SOLAR"] || []}
                                                value={editedData[73] || ""}
                                                onInputChange={(event, newInputValue) => {
                                                  handleFieldChange(73, newInputValue);

                                                  // Check if new input is not already in the model list
                                                  const existingModels = modelsByDeviceType["SOLAR"] || [];
                                                  if (newInputValue && !existingModels.includes(newInputValue)) {
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      SOLAR: newInputValue
                                                    }));
                                                  }
                                                }}
                                                renderInput={(params) => (
                                                  <TextField
                                                    {...params}
                                                    label="Model"
                                                    fullWidth
                                                    size="small"
                                                    margin="dense"
                                                    placeholder="Select or enter model"
                                                  />
                                                )}
                                              />

                                              {/* {!((modelsByDeviceType["SOLAR"] || []).includes(editedData[73])) && (
                                                <TextField
                                                  label="Enter Model"
                                                  value={editedData[73] || ''}
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleFieldChange(73, value);
                                                    setPendingCustomModels(prev => ({
                                                      ...prev,
                                                      SOLAR: value   
                                                    }));
                                                  }}
                                                  fullWidth
                                                  size="small"
                                                  margin="dense"
                                                  placeholder="Enter custom model"
                                                />
                                              )} */}
                                            </>
                                          )}
                                      </>
                                    ) : (
                                      <>
                                        <Typography variant="body2"><strong>Device Name:</strong> {isSolar ? "Solar Charge Controller-Web" : "UPS"}</Typography>
                                        <Typography variant="body2"><strong>Local IP:</strong> {project.data[69]}</Typography>
                                        <Typography variant="body2"><strong>Local Port #:</strong> 80</Typography>
                                        <Typography variant="body2">
                                          <strong>Remote IP:</strong>{" "}
                                          {project.data[70] ? (
                                            <a
                                              href={`http://${stripPort(project.data[70])}${project.data[71] ? `:${project.data[71]}` : ''}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "blue", textDecoration: "underline" }}
                                            >
                                              {stripPort(project.data[70])}
                                            </a>
                                          ) : "N/A"}
                                        </Typography>
                                        <Typography variant="body2"><strong>Remote Port #:</strong> {project.data[71]}</Typography>
                                        <Typography variant="body2"><strong>Make:</strong> {project.data[72]}</Typography>
                                        <Typography variant="body2"><strong>Model:</strong> {project.data[73]}</Typography>
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                              
                              {category === "2nd RPS" && (isEditing || (project.data[76] && String(project.data[76]).trim() !== "")) && (
                                <>  
                                  {isEditing ? (
                                    <>
                                    
                                    <Typography variant="body2"><strong>Local IP:</strong></Typography>
                                      <TextField
                                        value={editedData[75] || ''} onChange={(e) => handleFieldChange(75, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Remote IP:</strong></Typography>
                                      <TextField
                                        value={editedData[76] || ''} onChange={(e) => handleFieldChange(76, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Remote Port #:</strong></Typography>
                                      <TextField
                                        value={editedData[77] || ''} onChange={(e) => handleFieldChange(77, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Make:</strong></Typography>
                                      <Autocomplete
                                          freeSolo
                                          options={makesByDeviceType["RPS"] || []}
                                          value={editedData[78] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(78, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingMakes = makesByDeviceType["RPS"] || [];
                                            if (newInputValue && !existingMakes.includes(newInputValue)) {
                                              setPendingCustomMakes(prev => ({
                                                ...prev,
                                                RPS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Make"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter make"
                                            />
                                          )}
                                        />

                                      {/* {!((makesByDeviceType["RPS"] || []).includes(editedData[78])) && (
                                        <TextField
                                          label="Enter Make"
                                          value={editedData[78] || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleFieldChange(78, value);
                                            setPendingCustomMakes(prev => ({
                                              ...prev,
                                              RPS: value   
                                            }));
                                          }}
                                          fullWidth
                                          size="small"
                                          margin="dense"
                                          placeholder="Enter custom make"
                                        />
                                      )} */}
                                        <Typography variant="body2"><strong>Model:</strong></Typography>
                                        <Autocomplete
                                          freeSolo
                                          options={modelsByDeviceType["RPS"] || []}
                                          value={editedData[79] || ""}
                                          onInputChange={(event, newInputValue) => {
                                            handleFieldChange(79, newInputValue);

                                            // Check if new input is not already in the model list
                                            const existingModels = modelsByDeviceType["RPS"] || [];
                                            if (newInputValue && !existingModels.includes(newInputValue)) {
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                RPS: newInputValue
                                              }));
                                            }
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Model"
                                              fullWidth
                                              size="small"
                                              margin="dense"
                                              placeholder="Select or enter model"
                                            />
                                          )}
                                        />
                                        {/* {!((modelsByDeviceType["RPS"] || []).includes(editedData[79])) && (
                                          <TextField
                                            label="Enter Model"
                                            value={editedData[79] || ''}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              handleFieldChange(79, value);
                                              setPendingCustomModels(prev => ({
                                                ...prev,
                                                RPS: value   
                                              }));
                                            }}
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            placeholder="Enter custom model"
                                          />
                                        )} */}
                                      <Typography variant="body2"><strong>Outlet 1:</strong></Typography>
                                      <TextField
                                        value={editedData[80] || ''} onChange={(e) => handleFieldChange(80, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Outlet 2:</strong></Typography>
                                      <TextField
                                        value={editedData[81] || ''} onChange={(e) => handleFieldChange(81, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Outlet 3:</strong></Typography>
                                      <TextField
                                        value={editedData[82] || ''} onChange={(e) => handleFieldChange(82, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                      <Typography variant="body2"><strong>Outlet 4:</strong></Typography>
                                      <TextField
                                        value={editedData[83] || ''} onChange={(e) => handleFieldChange(83, e.target.value)} fullWidth size="small" margin="dense"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2"><strong>Device Name:</strong> Remote Power Swtitch</Typography>
                                      <Typography variant="body2"><strong>Local IP:</strong>{project.data[75]}</Typography>
                                      <Typography variant="body2"><strong>Local Port #:</strong> 80</Typography>
                                      <Typography variant="body2">
                                          <strong>Remote IP:</strong>{" "}
                                          {project.data[76] ? (
                                            <a
                                              href={`http://${stripPort(project.data[76])}${project.data[77] ? `:${project.data[77]}` : ''}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "blue", textDecoration: "underline" }}
                                            >
                                              {stripPort(project.data[76])}
                                            </a>
                                          ) : "N/A"}
                                        </Typography>                                      
                                      <Typography variant="body2"><strong>Remote Port #: </strong> {project.data[77]}</Typography>
                                      <Typography variant="body2"><strong>Make: </strong> {project.data[78]}</Typography>
                                      <Typography variant="body2"><strong>Model: </strong> {project.data[79]}</Typography>
                                      {project.data[80] && !project.data[80].toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 1: </strong> {project.data[80]}</Typography>
                                      )}

                                      {project.data[81] && !project.data[81].toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 2: </strong> {project.data[81]}</Typography>
                                      )}

                                      {project.data[82] && !project.data[82].toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 3: </strong> {project.data[82]}</Typography>
                                      )}

                                      {project.data[83] && !project.data[83].toLowerCase().includes('empty') && (
                                        <Typography variant="body2"><strong>Outlet 4: </strong> {project.data[83]}</Typography>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              
                              
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
      </Container>
    </ThemeProvider>
  );

}

export default ProjectDetails;
