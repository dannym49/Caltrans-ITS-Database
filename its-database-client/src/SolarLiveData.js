import React, { useContext } from 'react';
import { SolarDataContext } from './SolarDataContext'; // Adjust path as needed
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

function stripPort(ip) {
  if (!ip) return "";
  return ip.split(":")[0];
}

const parseMetric = (value) => {
  if (!value) return NaN;
  return parseFloat(value.replace(/[^\d.-]/g, ''));
};

const getBatteryVoltageColor = (value) => {
  const voltage = parseMetric(value);
  if (isNaN(voltage)) return 'gray';
  if (voltage >= 12.6 && voltage <= 15.0) return '#d0f0c0';
  if (voltage >= 12.0 && voltage < 12.6) return '#fff3cd';
  return '#f8d7da';
};

const getLoadVoltageColor = (value) => {
  const voltage = parseMetric(value);
  if (isNaN(voltage)) return 'gray';
  if (voltage >= 12.6 && voltage <= 15.0) return '#d0f0c0';
  if (voltage >= 12.0 && voltage < 12.6) return '#fff3cd';
  return '#f8d7da';
};

const getLoadStateColor = (value) => {
  const state = (value || "").toLowerCase();
  if (state === 'load on') return '#d0f0c0';
  if (state === 'load off') return '#f8d7da';
  return 'gray';
};

function SolarLiveData() {
  const { projects, solarDataMap, loading } = useContext(SolarDataContext);
  const navigate = useNavigate();
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
          Solar Charge Controller Live Data
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
          Back to Options
        </Button>
      </Box>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
        {Object.values(solarDataMap).some(data => data?.lastUpdated) && (
          <Typography variant="body2" color="textSecondary">
            Last Updated: {
              new Date(
                Object.values(solarDataMap)
                  .filter(data => data?.lastUpdated)
                  .map(data => new Date(data.lastUpdated))
                  .sort((a, b) => b - a)[0] // most recent
              ).toLocaleString([], {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          </Typography>
        )}
      </Box>

      {projects.length === 0 ? (
        <Box textAlign="center" mt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{
          maxHeight: '97vh',           // enable vertical scroll
          overflow: 'auto',            // enable scrollbars
          
        }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Route</strong></TableCell>
                <TableCell><strong>Charge State</strong></TableCell>
                <TableCell><strong>Battery Voltage</strong></TableCell>
                <TableCell><strong>Charge Current</strong></TableCell>
                <TableCell><strong>Array Voltage</strong></TableCell>
                <TableCell><strong>Sweep Pmax</strong></TableCell>
                <TableCell><strong>Load State</strong></TableCell>
                <TableCell><strong>Load Voltage</strong></TableCell>
                <TableCell><strong>Load Current</strong></TableCell>
                <TableCell><strong>Battery Temperature</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedByCounty).map(([countyName, countyProjects], countyIdx) => (
                <React.Fragment key={countyIdx}>
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={11}
                      sx={{
                        position: 'sticky',
                        top: 79, // or 72 if needed
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
                      solar: solarDataMap[proj._id] || {}
                    };

                    return (
                      <TableRow key={`${countyName}-${idx}`}>
                        <TableCell>
                          <a
                            href={`/project/${site.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: caltransBlue, fontWeight: 'bold' }}
                          >
                            {site.name}
                          </a>
                        </TableCell>
                        <TableCell>{site.route || 'N/A'}</TableCell>
                        {site.solar.error ? (
                          <TableCell colSpan={9} style={{ color: 'red' }}>{site.solar.error}</TableCell>
                        ) : (
                          <>
                            <TableCell>{site.solar.chargeState || 'N/A'}</TableCell>
                            <TableCell sx={{ backgroundColor: getBatteryVoltageColor(site.solar.batteryVoltage) }}>
                              {site.solar.batteryVoltage || 'N/A'}
                            </TableCell>
                            <TableCell>{site.solar.chargeCurrent || 'N/A'}</TableCell>
                            <TableCell>{site.solar.arrayVoltage || 'N/A'}</TableCell>
                            <TableCell>{site.solar.sweepPMax || 'N/A'}</TableCell>
                            <TableCell sx={{ backgroundColor: getLoadStateColor(site.solar.loadState) }}>
                              {site.solar.loadState || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ backgroundColor: getLoadVoltageColor(site.solar.loadVoltage) }}>
                              {site.solar.loadVoltage || 'N/A'}
                            </TableCell>
                            <TableCell>{site.solar.loadCurrent || 'N/A'}</TableCell>
                            <TableCell>{site.solar.batteryTemp || 'N/A'}</TableCell>
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

export default SolarLiveData;


