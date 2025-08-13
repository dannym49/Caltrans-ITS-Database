// UPSLiveData.jsx
import React, { useContext } from 'react';
import { UPSDataContext } from './UPSDataContext'; // adjust the path as needed
import {
  Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Box, Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';


const caltransBlue = "#005A9C";
const caltransDarkBlue = "#003F67";

// function stripPort(ip) {
//   if (!ip) return "";
//   return ip.split(":")[0];
// }

// async function runWithConcurrencyLimit(tasks, limit = 5, signal) {
//   const results = [];
//   const executing = [];

//   for (const task of tasks) {
//     if (signal?.aborted) {
//       console.warn("Aborted before task started. Skipping remaining tasks.");
//       break;
//     }

//     const p = task();
//     results.push(p);

//     const e = p.then(() => executing.splice(executing.indexOf(e), 1));
//     executing.push(e);

//     if (executing.length >= limit) {
//       await Promise.race(executing);
//     }
//   }

//   return Promise.all(results);
// }

function UPSLiveData() {
  const { projects, upsDataMap, loading } = useContext(UPSDataContext);
  const navigate = useNavigate();


  const getVoltageColor = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'gray';
    if (num >= 115) return '#d0f0c0';
    if (num >= 105 && num < 115) return '#fff3cd';
    return 'red';
  };

  const getBatteryColor = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'gray';
    if (num >= 80) return '#d0f0c0';
    if (num >= 40) return '#fff3cd';
    return 'red';
  };

  const groupedByCounty = projects.reduce((acc, proj) => {
    const county = proj.county || "Unknown County";
    if (!acc[county]) acc[county] = [];
    acc[county].push(proj);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ paddingBottom: "10px" }}>
      <Box sx={{
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
        <Button onClick={() => navigate('/')} sx={{ color: "white" }}>
          <HomeIcon sx={{ fontSize: 36 }} />
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
          UPS Live Data
        </Typography>
        <Box sx={{ width: 48 }} />
      </Box>
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
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
        {Object.values(upsDataMap).some(data => data?.lastUpdated) && (
          <Typography variant="body2" color="textSecondary">
            Last Updated: {
              new Date(
                Object.values(upsDataMap)
                  .filter(data => data?.lastUpdated)
                  .map(data => new Date(data.lastUpdated))
                  .sort((a, b) => b - a)[0] // most recent
              ).toLocaleString()
            }
          </Typography>
        )}
      </Box>

      {projects.length === 0 ? (
        <Box textAlign="center" mt={6}><CircularProgress /></Box>
      ) : (
        
        <TableContainer component={Paper} sx={{ maxHeight: '97vh', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Route</strong></TableCell>
                <TableCell><strong>Input Voltage</strong></TableCell>
                <TableCell><strong>Remaining Time</strong></TableCell>
                <TableCell><strong>Battery Capacity (%)</strong></TableCell>
                <TableCell><strong>Time on Battery</strong></TableCell>
                <TableCell><strong>Output Voltage</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedByCounty).map(([countyName, countyProjects], countyIdx) => (
                <React.Fragment key={countyIdx}>
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={7}
                      sx={{
                        position: 'sticky',
                        top: 52, // if county header becomes off, adjust this value as needed
                        backgroundColor: '#f5f5f5',
                        zIndex: 1,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        borderTop: '2px solid #ccc',
                        paddingTop: '12px',
                        paddingBottom: '12px'
                      }}
                    >
                      {countyName} County
                    </TableCell>
                  </TableRow>
                  {countyProjects.map((proj, idx) => {
                    const site = {
                      id: proj._id,
                      name: proj.data[0],
                      route: proj.data[1],
                      make: (proj.data[56] || '').toLowerCase(),
                      data: upsDataMap[proj._id] || {}
                    };

                    return (
                      <TableRow key={`${countyName}-${idx}`}>
                        <TableCell>
                          <a
                            href={`/project/${site.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: '#005A9C', fontWeight: 'bold' }}
                          >
                            {site.name}
                          </a>
                        </TableCell>
                        <TableCell>{site.route || 'N/A'}</TableCell>
                        {site.data.error ? (
                          <TableCell colSpan={5} style={{ color: 'red' }}>
                            {typeof site.data.error === 'string'
                              ? site.data.error
                              : JSON.stringify(site.data.error)}
                          </TableCell>
                        ) : site.make.includes("intellipower") ? (
                          <>
                            <TableCell sx={{ backgroundColor: getVoltageColor(site.data.inputVoltage) }}>
                              {site.data.inputVoltage || 'N/A'}
                            </TableCell>
                            <TableCell>{site.data.estimatedBatteryTimeRemaining || 'N/A'}</TableCell>
                            <TableCell sx={{ backgroundColor: getBatteryColor(site.data.batteryCapacity) }}>
                              {site.data.batteryCapacity || 'N/A'}
                            </TableCell>
                            <TableCell>{site.data.timeOnBattery || 'N/A'}</TableCell>
                            <TableCell sx={{ backgroundColor: getVoltageColor(site.data.outputVoltage) }}>
                              {site.data.outputVoltage || 'N/A'}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell sx={{ backgroundColor: getVoltageColor(site.data.inputVoltage) }}>
                              {site.data.inputVoltage?.split("V")[0].trim() || 'N/A'}
                            </TableCell>
                            <TableCell>{site.data.runtimeRemaining || 'N/A'}</TableCell>
                            <TableCell sx={{ backgroundColor: getBatteryColor(site.data.batteryCapacity) }}>
                              {site.data.batteryCapacity || 'N/A'}
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell sx={{ backgroundColor: getVoltageColor(site.data.outputVoltage) }}>
                              {site.data.outputVoltage?.split("V")[0].trim() || 'N/A'}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default UPSLiveData;
