import React, { useContext } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { SolarDailyDataContext } from './SolarDailyDataContext'; // Adjust the path

const caltransBlue = "#005A9C";
const caltransDarkBlue = "#003F67";

const getLast14Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }));
  }
  return days.reverse();
};

const labels = ['Vbmin', 'Absorption', 'Float'];

const labelDisplayMap = {
  Vbmin: 'Vbmin (V)',
  Absorption: 'Absorption (Sec)',
  Float: 'Float (Sec)'
};


const getCellColor = (label, value, floatValue = null) => {
  const num = parseFloat(value);
  const floatNum = parseFloat(floatValue);

  if (isNaN(num)) return 'inherit';

  if (label.includes('Vbmin')) {
    if (num >= 12.0) return '#d0f0c0';
    if (num >= 11.0) return '#fff3cd';
    return '#f8d7da';
  }

  if (label.includes('Absorption')) {
    if (num >= 9001) return '#d0f0c0';
    if (num >= 3600 && !isNaN(floatNum) && floatNum > 0) return '#d0f0c0';
    if (num >= 3600) return '#fff3cd';
    return '#f8d7da';
  }

  if (label.includes('Float')) {
    if (num >= 3600) return '#d0f0c0';
    if (num >= 900) return '#fff3cd';
    return '#f8d7da';
  }

  return 'inherit';
};

function SolarDailyMetrics() {
  const { projects, solarDailyDataMap, loading } = useContext(SolarDailyDataContext);
  const navigate = useNavigate();
  const dates = getLast14Days();

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
        <Button
          onClick={() => navigate('/')}
          sx={{ color: "white", textTransform: "none", "&:hover": { color: caltransDarkBlue } }}
        >
          <HomeIcon sx={{ fontSize: 36 }} />
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
          Solar Controller Daily Metrics (Last 14 Days)
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button
          onClick={() => navigate(-1)}
          sx={{ color: caltransBlue, fontSize: "16px", fontWeight: "bold", textTransform: "none", display: "flex", alignItems: "center", "&:hover": { color: caltransDarkBlue } }}
          startIcon={<ArrowBackIcon />}
        >
          Back to Options
        </Button>
      </Box>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
        {Object.values(solarDailyDataMap).some(data => data?.lastUpdated) && (
          <Typography variant="body2" color="textSecondary">
            Last Updated: {
              new Date(
                Object.values(solarDailyDataMap)
                  .filter(data => data?.lastUpdated)
                  .map(data => new Date(data.lastUpdated))
                  .sort((a, b) => b - a)[0] // most recent
              ).toLocaleString()
            }
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '97vh', overflow: 'auto', position: 'relative' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 3, fontWeight: 'bold' }}>
                  Location and Route
                </TableCell>
                <TableCell rowSpan={2} sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white', fontWeight: 'bold', minWidth: 120 }}>
                  Metric
                </TableCell>
                {dates.map((date, i) => (
                  <TableCell key={i} align="center" sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white' }}>
                    <strong>{date}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedByCounty).map(([countyName, countyProjects], countyIdx) => (
                <React.Fragment key={countyIdx}>
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={dates.length + 2}
                      sx={{
                        position: 'sticky',
                        top: 56, // adjust depending on your TableHead row height
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

                  {countyProjects.map((site, siteIdx) => {
                    const metrics = solarDailyDataMap[site._id] || { Vbmin: [], Absorption: [], Float: [], HourMeter: [] };

                  const parseHourMeter = (hm) => {
                    const match = hm.match(/(?:(\d+)y)?(?:(\d+)d)?(?:(\d+)h)?/);
                    if (!match) return -Infinity;
                    const [, y = 0, d = 0, h = 0] = match.map(Number);
                    return (y * 365 * 24) + (d * 24) + h;
                  };

                  let latestIndex = 0;
                  if (Array.isArray(metrics.HourMeter) && metrics.HourMeter.length > 0) {
                    latestIndex = metrics.HourMeter.reduce((maxIdx, currVal, currIdx, arr) => {
                      return parseHourMeter(currVal) > parseHourMeter(arr[maxIdx]) ? currIdx : maxIdx;
                    }, 0);
                  }

                    return labels.map((label, labelIdx) => (
                      <TableRow key={`${siteIdx}-${label}`}>
                        {labelIdx === 0 && (
                          <TableCell rowSpan={3}>
                            <a
                              href={`/project/${site._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none', color: caltransBlue, fontWeight: 'bold' }}
                            >
                              {site.data?.[0] || 'Unnamed Site'}
                            </a>
                            <br />
                            Route: {site.data?.[1] || 'N/A'}
                          </TableCell>
                        )}
                        <TableCell align="left" sx={{ fontStyle: 'italic' }}>
                          {labelDisplayMap[label] || label}
                        </TableCell>
                        {Array.from({ length: 14 }, (_, i) => {
                          const val = metrics?.[label]?.[latestIndex + i];
                          const floatVal = metrics?.Float?.[latestIndex + i];
                          return (
                            <TableCell
                              key={i}
                              align="center"
                              sx={{ backgroundColor: getCellColor(label, val, floatVal), fontWeight: 'bold' }}
                            >
                              {val || '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ));
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

export default SolarDailyMetrics;
