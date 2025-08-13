import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Paper, Box, Grid, CssBaseline } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import { Select, MenuItem, FormControl, InputLabel, Autocomplete } from '@mui/material';


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

function AddProject() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    CMS: false,
    CCTV: false,
    MVDS: false,
    "UPS/Solar Charge Controller": false,
    RPS: false,
    "2nd UPS/Solar Charge Controller": false,
    "2nd RPS": false
  });
  const [modemRemoteIP, setModemRemoteIP] = useState('');

  const [manualRemoteIPs, setManualRemoteIPs] = useState({});
  const [makesByDeviceType, setMakesByDeviceType] = useState({});
  const [modelsByDeviceType, setModelsByDeviceType] = useState({});



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

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const next = { ...prev, [section]: !prev[section] };

      setForm(prevForm => {
        const updated = { ...prevForm };

        const defaultValues = {
          "CMS": { "Local IP": "192.168.0.53" },
          "CCTV": { "Local IP": "192.168.0.52" },
          "MVDS": { "Local IP": "192.168.0.50", "Remote Port": "10001" },
          "UPS/Solar Charge Controller": { "Local IP": "192.168.0.54", "Remote Port": "84" },
          "RPS": { "Local IP": "192.168.0.55", "Remote Port": "85" },
          "2nd UPS/Solar Charge Controller": { "Local IP": "192.168.0.56", "Remote Port": "86" },
          "2nd RPS": { "Local IP": "192.168.0.58", "Remote Port": "88" }
        };

        const defaults = defaultValues[section] || {};

        if (!prev[section]) {
          // Expanding: fill in defaults if empty
          if (form.Communication.Device === "Modem" && modemRemoteIP && !manualRemoteIPs[section]) {
            updated[section]["Remote IP"] = modemRemoteIP;
          }

          for (const [field, val] of Object.entries(defaults)) {
            if (!updated[section][field]) {
              updated[section][field] = val;
            }
          }
        } else {
          // Collapsing: clear IPs and ports
          for (const field of Object.keys(defaults)) {
            updated[section][field] = "";
          }

          // Also clear Remote IP if Modem
          if (form.Communication.Device === "Modem") {
            updated[section]["Remote IP"] = "";
          }
        }

        return updated;
      });

      return next;
    });
  };



  


  const alwaysVisibleSections = ["General", "Service Location", "Plans", "Communication"];
  const collapsibleSections = ["CMS", "CCTV", "MVDS", "UPS/Solar Charge Controller", "RPS", "2nd UPS/Solar Charge Controller", "2nd RPS"];
  const customCMSFieldOrder = ["Local IP", "Remote IP", "TMS ID", "Make", "Model" ];

  const getVisibleCommunicationFields = () => {
    const { Device, "Connected To": ConnectedTo } = form.Communication;

    if (Device === "Modem") {
      return ["Local IP", "Remote IP", "Remote Port", "Provider", "Make", "Model", "TSS", "Phone"];
    }

    if (Device === "Wireless Link (Access Point)" && ConnectedTo === "Modem") {
      return ["Local IP", "Remote IP", "Remote Port", "WL Access Point/Client IP", "Provider", "Make", "Model", "TSS", "Phone"];
    }

    if (Device === "Wireless Link (Access Point)" && ConnectedTo === "Router") {
      return ["Local IP", "Remote IP", "WL Access Point/Client IP", "Provider", "Make", "Model"];
    }

    if (Device === "Wireless Link (Client)" && ConnectedTo === "Modem") {
      return ["Local IP", "Remote IP", "Remote Port", "WL Access Point/Client IP", "Provider", "Make", "Model", "TSS", "Phone"];
    }

    if (Device === "Wireless Link (Client)" && ConnectedTo === "Router") {
      return ["Local IP", "Remote IP", "WL Access Point/Client IP", "Provider", "Make", "Model"];
    }

    return [];
  };


  const expandableSections = Object.keys(expandedSections);
  // Define initial form state with all categories
  const [form, setForm] = useState({
    "county": '',
    "General": { "Location": '', "Route": '', "Prefix": '', "Postmile": '', "Suffix": '', "Direction": '', "Latitude": '', "Longitude": '', "Photos Folder Filepath": '', },
    "Service Location": { "Latitude": '', "Longitude": '' },
    "Plans": { "Installation EA #": '', "Installation EA Sheet #": '', "Filepath For Installation EA File": '', "Replacement EA-1 #": '', "Replacement EA-1 Sheet #": '', "Filepath For Replacement EA-1 File": '', "Replacement EA-2 #": '', "Replacement EA-2 Sheet #": '', "Filepath For Replacement EA-2 File": ''
    },
    "Communication": { "Location": '', "Device": '', "Connected To": '', "Local IP": '', "Remote IP": '', "Remote Port": '', "WL Access Point/Client IP": '', "Provider": '', "Make": '', "Model": '', "TSS": '', "Phone": '', },
    "CMS": { "Location": '',"Model": '', "Local IP": '',  "Remote IP": '', "TMS ID": '', "Make": '' },
    "CCTV": { "Location": '', "Local IP": '',  "Remote IP": '', "TMS ID": '', "Make": '', "Model": '', "Remote Port #": '' },
    "MVDS": { "Location": '', "Local IP": '',  "Remote IP": '', "Remote Port": '',  "TMS ID": '',  "Make": '', "Model": ''},
    "UPS/Solar Charge Controller": { "Location": '', "Local IP": '',  "Remote IP": '',  "Remote Port": '', "Make": '', "Model": '' },
    "RPS": { "Location": '', "Local IP": '',  "Remote IP": '', "Remote Port": '', "Make": '', "Model": '', "Outlet 1": '', "Outlet 2": '', "Outlet 3": '', "Outlet 4": '' },
    "2nd UPS/Solar Charge Controller": { "Location": '', "Local IP": '',  "Remote IP": '',  "Remote Port": '', "Make": '', "Model": '' },
    "2nd RPS": { "Location": '', "Local IP": '',  "Remote IP": '', "Remote Port": '', "Make": '', "Model": '', "Outlet 1": '', "Outlet 2": '', "Outlet 3": '', "Outlet 4": ''  },
  });

  // Handle form field changes
  const handleChange = (section, field) => (e) => {
    const value = e.target.value;

    // If Communication → Remote IP is updated and Device is Modem, sync
    if (section === "Communication" && field === "Remote IP" && form.Communication.Device === "Modem") {
      setModemRemoteIP(value);
    }

    // If another section edits Remote IP, mark it as manually set
    if (field === "Remote IP" && section !== "Communication") {
      setManualRemoteIPs(prev => ({ ...prev, [section]: true }));
    }

    // Apply change to form
    setForm(prevForm => ({
      ...prevForm,
      [section]: {
        ...prevForm[section],
        [field]: value
      }
    }));
  };




  const allMakes = [
    ...(makesByDeviceType["UPS"] || []),
    ...(makesByDeviceType["SOLAR"] || []),
    ...(makesByDeviceType["CCTV"] || []),
    ...(makesByDeviceType["RPS"] || []),
    ...(makesByDeviceType["MVDS"] || []),
    ...(makesByDeviceType["CMS"] || [])
  ];

  const allModels = [
    ...(modelsByDeviceType["UPS"] || []),
    ...(modelsByDeviceType["SOLAR"] || []),
    ...(modelsByDeviceType["CCTV"] || []),
    ...(modelsByDeviceType["RPS"] || []),
    ...(modelsByDeviceType["MVDS"] || []),
    ...(modelsByDeviceType["CMS"] || [])
  ];



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cleanCustom = (section) => {
        return Object.entries(form[section])
          .filter(([key]) => key !== "Custom Make" && key !== "Custom Model")
          .map(([_, value]) => value);
      };

      // First, submit any custom makes/models to the backend
      const customEntries = [
        { section: "Communication", type: "models", deviceType: "COMMUNICATION", value: form["Communication"]["Custom Model"] },
        { section: "Communication", type: "makes", deviceType: "COMMUNICATION", value: form["Communication"]["Custom Make"] },
        { section: "CCTV", type: "models", deviceType: "CCTV", value: form["CCTV"]["Custom Model"] },
        { section: "CCTV", type: "makes", deviceType: "CCTV", value: form["CCTV"]["Custom Make"] },
        { section: "CMS", type: "models", deviceType: "CMS", value: form["CMS"]["Custom Model"] },
        { section: "CMS", type: "makes", deviceType: "CMS", value: form["CMS"]["Custom Make"] },
        { section: "MVDS", type: "models", deviceType: "MVDS", value: form["MVDS"]["Custom Model"] },
        { section: "MVDS", type: "makes", deviceType: "MVDS", value: form["MVDS"]["Custom Make"] },
        { section: "RPS", type: "models", deviceType: "RPS", value: form["RPS"]["Custom Model"] },
        { section: "RPS", type: "makes", deviceType: "RPS", value: form["RPS"]["Custom Make"] },
        { section: "UPS/Solar Charge Controller", type: "models", deviceType: "UPS", value: form["UPS/Solar Charge Controller"]["Custom Model"] },
        { section: "UPS/Solar Charge Controller", type: "makes", deviceType: "UPS", value: form["UPS/Solar Charge Controller"]["Custom Make"] },
        { section: "2nd UPS/Solar Charge Controller", type: "models", deviceType: "UPS", value: form["2nd UPS/Solar Charge Controller"]["Custom Model"] },
        { section: "2nd UPS/Solar Charge Controller", type: "makes", deviceType: "UPS", value: form["2nd UPS/Solar Charge Controller"]["Custom Make"] },
        { section: "2nd RPS", type: "models", deviceType: "RPS", value: form["2nd RPS"]["Custom Model"] },
        { section: "2nd RPS", type: "makes", deviceType: "RPS", value: form["2nd RPS"]["Custom Make"] },
      ];

      for (const entry of customEntries) {
        if (entry.value?.trim()) {
          const endpoint = entry.type === "models" ? "/api/models" : "/api/makes";
          await axios.post(`http://10.44.2.198:5000${endpoint}`, {
            deviceType: entry.deviceType,
            [entry.type === "models" ? "newModel" : "newMake"]: entry.value.trim()
          });
        }
      }

      // Then submit the full form
      const flattenedData = [
        ...cleanCustom("General"),
        ...cleanCustom("Service Location"),
        ...cleanCustom("Plans"),
        ...cleanCustom("Communication"),
        ...cleanCustom("CMS"),
        ...cleanCustom("CCTV"),
        ...cleanCustom("MVDS"),
        ...cleanCustom("UPS/Solar Charge Controller"),
        ...cleanCustom("RPS"),
        ...cleanCustom("2nd UPS/Solar Charge Controller"),
        ...cleanCustom("2nd RPS")
      ];

      const response = await axios.post('http://10.44.2.198:5000/api/projects', {
        county: form.county,
        data: flattenedData
      });

      alert(response.data.message);
      navigate('/');
    } catch (err) {
      console.error("Error adding ITS Site:", err);
      setError("Failed to add ITS Site.");
    }
  };



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ 
          padding: 4, 
          marginTop: 6, 
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
              Add ITS Site
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

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControl fullWidth required>
                <InputLabel>County</InputLabel>
                <Select
                  value={form.county}
                  label="County"
                  onChange={(e) => setForm({ ...form, county: e.target.value })}
                 >
                  <MenuItem value="Santa Barbara">Santa Barbara</MenuItem>
                  <MenuItem value="San Luis Obispo">San Luis Obispo</MenuItem>
                  <MenuItem value="Monterey">Monterey</MenuItem>
                  <MenuItem value="Santa Cruz">Santa Cruz</MenuItem>
                  <MenuItem value="San Benito">San Benito</MenuItem>
                </Select>
              </FormControl>


             
              {/* Always visible sections */}
              {alwaysVisibleSections.map(section => (
                <Box key={section} mt={3}>
                  <Typography variant="h6" sx={{ color: caltransDarkBlue }}>
                    {section}
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(form[section]).map(([field, value]) => {

                      if (field === "Location" && section !== "General") return null;
                      if (section === "Communication" && field === "Connected To" && form.Communication.Device === "Modem") {
                        return null;
                      }
                      //Filter Communication fields based on device + connectedTo
                      if (section === "Communication") {
                        const visibleFields = getVisibleCommunicationFields();
                        if (!visibleFields.includes(field) && field !== "Device" && field !== "Connected To") {
                          return null;
                        }
                      }
                      return (
                        <Grid item xs={6} key={field}>
                          {section === "Communication" && field === "Device" ? (
                            <FormControl fullWidth>
                              <InputLabel>Device</InputLabel>
                              <Select
                                value={form.Communication.Device}
                                label="Device"
                                onChange={(e) => {
                                  const selectedDevice = e.target.value;

                                  setForm(prev => ({
                                    ...prev,
                                    Communication: {
                                      ...prev.Communication,
                                      Device: selectedDevice,
                                      ["Connected To"]: "", // Optionally clear this
                                      ["Local IP"]:
                                        selectedDevice === "Modem"
                                          ? "192.168.0.1" //Set default IP here
                                          : prev.Communication["Local IP"],
                                      ["Remote Port"]:
                                        selectedDevice === "Modem"
                                          ? "9191" // Set default IP here
                                          : prev.Communication["Remote Port"],
                                          
                                    }
                                  }));
                                }}
                              >
                                <MenuItem value="">None</MenuItem>
                                <MenuItem value="Modem">Modem</MenuItem>
                                <MenuItem value="Wireless Link (Access Point)">Wireless Link (Access Point)</MenuItem>
                                <MenuItem value="Wireless Link (Client)">Wireless Link (Client)</MenuItem>
                              </Select>

                                </FormControl>
                              ) : section === "Communication" && field === "Connected To" && form.Communication.Device !== "Modem" ? (
                                <FormControl fullWidth>
                                  <InputLabel>Connected To</InputLabel>
                                  <Select
                                    value={form.Communication["Connected To"]}
                                    label="Connected To"
                                    onChange={(e) => {
                                      const connectedTo = e.target.value;

                                      setForm(prev => ({
                                        ...prev,
                                        Communication: {
                                          ...prev.Communication,
                                          ["Connected To"]: connectedTo,
                                          ["Local IP"]:
                                            connectedTo === "Modem"
                                              ? "192.168.0.60"  // Set your default IP here
                                              : prev.Communication["Local IP"]
                                        }
                                      }));
                                    }}
                                  >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="Router">Router</MenuItem>
                                    <MenuItem value="Modem">Modem</MenuItem>
                                  </Select>

                            </FormControl>
                          ) : section === "Communication" && field === "Make" ? (
                            <>
                              <FormControl fullWidth>
                                <InputLabel>Make</InputLabel>
                                <Select
                                  value={(makesByDeviceType["COMMUNICATION"] || []).includes(value) ? value : "Other"}
                                  label="Make"
                                  onChange={(e) => {
                                    const selected = e.target.value;
                                    if (selected === "Other") {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: "",
                                          ["Custom Make"]: ""
                                        }
                                      }));
                                    } else {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: selected,
                                          ["Custom Make"]: ""
                                        }
                                      }));
                                    }
                                  }}
                                >
                                  <MenuItem value=""><em>Select Make</em></MenuItem>
                                  {(makesByDeviceType["COMMUNICATION"] || []).map(make => (
                                    <MenuItem key={make} value={make}>{make}</MenuItem>
                                  ))}
                                  <MenuItem value="Other">Other</MenuItem>
                                </Select>
                              </FormControl>

                              {!((makesByDeviceType["COMMUNICATION"] || []).includes(value)) && (
                                <TextField
                                  fullWidth
                                  label="Enter Custom Make"
                                  value={form[section]["Custom Make"] || ""}
                                  onChange={(e) =>
                                    setForm(prev => ({
                                      ...prev,
                                      [section]: {
                                        ...prev[section],
                                        [field]: e.target.value,
                                        ["Custom Make"]: e.target.value
                                      }
                                    }))
                                  }
                                  sx={{ mt: 2 }}
                                />
                              )}
                            </>
                          ) : section === "Communication" && field === "Model" ? (
                            <>
                              <FormControl fullWidth>
                                <InputLabel>Model</InputLabel>
                                <Select
                                  value={(modelsByDeviceType["COMMUNICATION"] || []).includes(value) ? value : "Other"}
                                  label="Model"
                                  onChange={(e) => {
                                    const selected = e.target.value;
                                    if (selected === "Other") {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: "",
                                          ["Custom Model"]: ""
                                        }
                                      }));
                                    } else {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: selected,
                                          ["Custom Model"]: ""
                                        }
                                      }));
                                    }
                                  }}
                                >
                                  <MenuItem value=""><em>Select Model</em></MenuItem>
                                  {(modelsByDeviceType["COMMUNICATION"] || []).map(model => (
                                    <MenuItem key={model} value={model}>{model}</MenuItem>
                                  ))}
                                  <MenuItem value="Other">Other</MenuItem>
                                </Select>
                              </FormControl>

                              {!((modelsByDeviceType["COMMUNICATION"] || []).includes(value)) && (
                                <TextField
                                  fullWidth
                                  label="Enter Custom Model"
                                  value={form[section]["Custom Model"] || ""}
                                  onChange={(e) =>
                                    setForm(prev => ({
                                      ...prev,
                                      [section]: {
                                        ...prev[section],
                                        [field]: e.target.value,
                                        ["Custom Model"]: e.target.value
                                      }
                                    }))
                                  }
                                  sx={{ mt: 2 }}
                                />
                              )}
                            </>
                          ) : (
                            <TextField
                              fullWidth
                              label={field}
                              value={value}
                              onChange={handleChange(section, field)}
                            />
                          )}
                        </Grid>
                      );
                    })}

                  </Grid>
                </Box>
              ))}


              {/* Collapsible add-on sections */}
              {collapsibleSections.map(section => (
                <Box key={section} mt={3}>
                  <Button onClick={() => toggleSection(section)}>
                    {expandedSections[section] ? `- Hide ${section}` : `+ Add ${section}`}
                  </Button>

                  {expandedSections[section] && (
                    <>
                      <Typography variant="h6">{section}</Typography>
                      <Grid container spacing={2}>
                        {(section === "CMS"
                          ? customCMSFieldOrder.map(field => [field, form[section][field]])
                          : Object.entries(form[section])
                        ).map(([field, value]) => {
                          if (field === "Location") return null;

                          return (
                            <Grid item xs={6} key={field}>
                              {/* Special handling for UPS/Solar Charge Controller sections */}
                              
                              {["UPS/Solar Charge Controller","UPS/Solar Charge Controller", "2nd UPS/Solar Charge Controller"].includes(section) && field === "Make" ? (
                                <>
                                  <Autocomplete
                                    freeSolo
                                    options={[...(makesByDeviceType["UPS"] || []), ...(makesByDeviceType["SOLAR"] || [])]}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Make"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Make" fullWidth />
                                    )}
                                  />

                                </>

                              ) : ["UPS/Solar Charge Controller", "2nd UPS/Solar Charge Controller"].includes(section) && field === "Model" ? (
                                
                                  <>
                                    <Autocomplete
                                      freeSolo
                                      options={[...(modelsByDeviceType["UPS"] || []), ...(modelsByDeviceType["SOLAR"] || [])]}
                                      value={value || ""}
                                      onInputChange={(e, newInput) => {
                                        setForm(prev => ({
                                          ...prev,
                                          [section]: {
                                            ...prev[section],
                                            [field]: newInput,
                                            ["Custom Model"]: newInput
                                          }
                                        }));
                                      }}
                                      renderInput={(params) => (
                                        <TextField {...params} label="Model" fullWidth />
                                      )}
                                    />
                                    
                                </>
                                
                              ) : ["CCTV"].includes(section) && field === "Make" ? (
                                <>
                                  <Autocomplete
                                    freeSolo
                                    options={makesByDeviceType["CCTV"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Make"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Make" fullWidth />
                                    )}
                                  />

                                </>

                              ) : ["CCTV"].includes(section) && field === "Model" ? (
                                
                                  <>
                                    <Autocomplete
                                    freeSolo
                                    options={modelsByDeviceType["CCTV"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Model"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Model" fullWidth />
                                    )}
                                  />

                                </>
                                
                              ) : ["MVDS"].includes(section) && field === "Make" ? (
                                <>
                                  <Autocomplete
                                    freeSolo
                                    options={makesByDeviceType["MVDS"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Make"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Make" fullWidth />
                                    )}
                                  />

                                </>

                              ) : ["MVDS"].includes(section) && field === "Model" ? (
                                
                                  <>
                                    <Autocomplete
                                    freeSolo
                                    options={modelsByDeviceType["MVDS"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Model"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Model" fullWidth />
                                    )}
                                  />

                                </>
                                
                              ) : ["CMS"].includes(section) && field === "Make" ? (
                                <>
                                  <Autocomplete
                                    freeSolo
                                    options={makesByDeviceType["CMS"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Make"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Make" fullWidth />
                                    )}
                                  />

                                </>

                              ) : ["CMS"].includes(section) && field === "Model" ? (
                                
                                  <>
                                    <Autocomplete
                                    freeSolo
                                    options={modelsByDeviceType["CMS"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Model"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Model" fullWidth />
                                    )}
                                  />

                                </>
                                
                              ) : ["RPS", "2nd RPS"].includes(section) && field === "Make" ? (
                                <>
                                  <Autocomplete
                                    freeSolo
                                    options={makesByDeviceType["RPS"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Make"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Make" fullWidth />
                                    )}
                                  />

                                </>

                              ) : ["RPS", "2nd RPS"].includes(section) && field === "Model" ? (
                                
                                  <>
                                    <Autocomplete
                                    freeSolo
                                    options={modelsByDeviceType["RPS"] || []}
                                    value={value || ""}
                                    onInputChange={(e, newInput) => {
                                      setForm(prev => ({
                                        ...prev,
                                        [section]: {
                                          ...prev[section],
                                          [field]: newInput,
                                          ["Custom Model"]: newInput
                                        }
                                      }));
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Model" fullWidth />
                                    )}
                                  />
                                  
                                </>
                                
                              ) : field !== "Custom Make" && field !== "Custom Model" ? (
                                  <TextField
                                    fullWidth
                                    label={field}
                                    value={value}
                                    onChange={handleChange(section, field)}
                                  />
                                ) : null}
                            </Grid>
                          );

                        })}
                      </Grid>
                    </>
                  )}
                </Box>
              ))}



              {error && <Typography color="error">{error}</Typography>}

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  "&:hover": { backgroundColor: caltransDarkBlue }
                }}
              >
                Add ITS Site
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default AddProject;
