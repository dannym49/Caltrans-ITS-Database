import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import axios from 'axios';
import { 
  Button, Container, Typography, TextField, InputAdornment, IconButton, 
  MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert, 
  Grid, Card, CardContent, CardActions, Box, CssBaseline 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';


// Define category indexes in the project data
const categoryIndexes = {
  "CMS": [33,34,35,36, 37],
  "CCTV": [39,40,41,42,43, 44],
  "MVDS": [46,47,48, 49, 50, 51],
  "UPS": [53, 54, 55, 56, 57],
  "RPS": [59,60,61,62, 63, 64, 65, 66, 67],
  "2nd UPS": [68,69,70,71, 72, 73],
  "2nd RPS": [75, 76, 77, 78, 79, 80, 81, 82, 83]
};

// Define subcategories for filtering
const subCategoryRow = [
  "Location", "Route", "Prefix", "Postmile", "Suffix", "Direction", "Latitude", "Longitude", "Photos",
  "Latitude", "Longitude",
  "Installation EA", "Sheet", "Filepath", "Replacement EA-1", "Sheet",  "Filepath EA-1", "Replacement EA-2", "Sheet",	"Filepath EA-2",
  "Location", "Device", "Connected To", "Local IP", "Remote IP", "Remote Port", "Provider", "Make", "Model", "TSS", "Phone",
  "Location", "Model", "IP", "TMS ID", "Manufacturer",
  "Location", "Local IP", "Remote IP", "TMS ID", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "TMS ID", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model",
  "Location", "Local IP", "Remote IP", "Remote Port", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"
];

// Remove duplicate subcategories for dropdown
const uniqueSubCategories = [...new Set(subCategoryRow)];

// Define Caltrans Color Theme
const caltransBlue = "#005A9C"; 
const caltransDarkBlue = "#003F67"; 

function Projects() {
  const { county } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]); // Allow multiple category selections
  const [selectedSubCategory, setSelectedSubCategory] = useState(""); // Subcategory filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const route = location.state?.route || null;
  

  useEffect(() => {
    const endpoint = county === "ALL"
  ? `http://10.44.2.198:5000/api/projects`
  : `http://10.44.2.198:5000/api/projects/${county}`;

axios.get(endpoint)
      .then(response => {
        let allProjects = response.data;
  
        if (route && route !== "ALL") {
          allProjects = allProjects.filter(project => 
            project.data[1]?.toString() === route.toString()
          );
        }
  
        setProjects(allProjects);
        setFilteredProjects(allProjects);
        setError(allProjects.length === 0 ? "No ITS Sites found for this county and route." : null);
        setLoading(false);
      })
      .catch(() => {
        setError("No ITS Sites found for this county.");
        setLoading(false);
      });
  }, [county, route]);

  // Apply Filtering Logic
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
        // If a specific subcategory is selected, filter within that subcategory
        if (selectedSubCategory) {
            const subCategoryIndexes = subCategoryRow.reduce((acc, colName, index) => {
                if (colName === selectedSubCategory) acc.push(index);
                return acc;
            }, []);

            filtered = filtered.filter(project => 
                subCategoryIndexes.some(index => 
                    project.data[index] && project.data[index].toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            // If no subcategory is selected, search across all fields
            filtered = filtered.filter(project => 
                project.data.some(value => 
                    value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }

    // Apply category filtering (CMS, CCTV, etc.)
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(project => {
        return selectedFilters.every(filter => {
          if (filter === "Solar") {
            const val9 = String(project.data[9] || "").toLowerCase();
            const val10 = String(project.data[10] || "").toLowerCase();
            return val9.includes("solar") || val10.includes("solar");
          } else {
            const indexes = categoryIndexes[filter];
            return indexes?.some(index =>
              project.data[index] && project.data[index] !== ""
            );
          }
        });
      });
    }

    if (selectedFilters.includes("UPS")) {
      filtered = filtered.filter(project =>
        categoryIndexes["UPS"].some(index =>
          project.data[index] && project.data[index] !== ""
        ) &&
        (!project.data[9]?.toString().toLowerCase().includes("solar") &&
        !project.data[10]?.toString().toLowerCase().includes("solar"))
      );
    }

    if (selectedFilters.includes("Solar")) {
      filtered = filtered.filter(project =>
        project.data[9]?.toString().toLowerCase().includes("solar") ||
        project.data[10]?.toString().toLowerCase().includes("solar")
      );
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedFilters, selectedSubCategory, projects]);

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedSubCategory("");
    setSelectedFilters([]);
    setFilteredProjects(projects);
  };

  // const handleFilterClick = (filter) => {
  //   setSelectedFilters(prevFilters => 
  //     prevFilters.includes(filter) 
  //       ? prevFilters.filter(f => f !== filter) // Remove filter if already selected
  //       : [...prevFilters, filter] // Add filter if not selected
  //   );
  // };

  const handleFilterClick = (filter) => {
    if (filter === "UPS") {
      setSelectedFilters(prev => {
        const updated = prev.includes(filter)
          ? prev.filter(f => f !== filter)
          : [...prev, filter];

        // Remove "Solar" if selecting UPS to prevent overlap
        return updated.filter(f => f !== "Solar");
      });
    } else if (filter === "Solar") {
      setSelectedFilters(prev => {
        const updated = prev.includes(filter)
          ? prev.filter(f => f !== filter)
          : [...prev, filter];

        // Remove "UPS" if selecting Solar to prevent overlap
        return updated.filter(f => f !== "UPS");
      });
    } else {
      setSelectedFilters(prev => 
        prev.includes(filter) 
          ? prev.filter(f => f !== filter)
          : [...prev, filter]
      );
    }
  };


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

  if (loading) return <Container><CircularProgress /></Container>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ paddingBottom: "40px" }}>

        {/* Hero Section */}
        <Box sx={{
          background: caltransBlue,
          color: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <Button
            onClick={() => navigate('/')}
            sx={{
              color: "white",
              textTransform: "none",
              "&:hover": { color: caltransDarkBlue }
            }}
          >
            <HomeIcon sx={{ fontSize: 36 }} />
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center" }}>
            {county === "ALL" && route === "ALL" && "All ITS Sites"}
            {county !== "ALL" && route === "ALL" && `ITS Sites in ${county} County`}
            {county === "ALL" && route !== "ALL" && `All ITS Sites on Route ${route}`}
            {county !== "ALL" && route !== "ALL" && `ITS Sites in ${county} County on Route ${route}`}
          </Typography>

          <Box sx={{ width: 48 }} />
        </Box>

        {/* Search and Filters */}
        <Box display="flex" alignItems="center" gap={2} mt={3} mb={2}>
          <TextField
            label="Search ITS Sites"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch}><ClearIcon /></IconButton>
                </InputAdornment>
              )
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Subcategory</InputLabel>
            <Select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {uniqueSubCategories.map((subcategory, index) => (
                <MenuItem key={index} value={subcategory}>{subcategory}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Multiple Category Filter Buttons */}
        <Box textAlign="center" marginBottom="20px">
          {Object.keys(categoryIndexes).map((filter) => (
            <Button 
              key={filter} 
              variant={selectedFilters.includes(filter) ? "contained" : "outlined"} 
              color="primary" 
              onClick={() => handleFilterClick(filter)} 
              sx={{ 
                margin: "8px", 
                padding: "10px 20px", 
                borderRadius: "20px", 
                fontWeight: "bold" 
              }}
            >
              {filter}
            </Button>
          ))}
          {/* Add Solar filter button manually */}
          <Button 
            variant={selectedFilters.includes("Solar") ? "contained" : "outlined"} 
            color="primary" 
            onClick={() => handleFilterClick("Solar")} 
            sx={{ 
              margin: "8px", 
              padding: "10px 20px", 
              borderRadius: "20px", 
              fontWeight: "bold" 
            }}
          >
            Solar
          </Button>
        </Box>


        {/* Search Results Count */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {filteredProjects.length} ITS Site{filteredProjects.length !== 1 ? "s" : ""} found
        </Typography>
        {/* Back to County Selection - Moved to Top Left */}
        <Box display="flex" justifyContent="flex-start" marginBottom={2}>
                  <Button 
                    onClick={() => navigate('/routes', { state: { county } })}

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
                    Back to Route Selection
                  </Button>
                </Box>
        {/* Project Cards */}
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="black">
                    Route {project.data[1]} -  {project.data[0]}
                    
                  </Typography>
                  <Typography variant="body2" color="grey">
                    {project.data[5] || "Unknown"}  Postmile {project.data[3] || "Unknown"}
                    </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="primary" fullWidth onClick={() => navigate(`/project/${project._id}`, { state: { county, route } })}
>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Container>
    </ThemeProvider>
  );
}

export default Projects;
