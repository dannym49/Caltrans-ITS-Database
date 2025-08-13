//Place imports at the very top of the page
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import {//MUI imports
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


//Add to file to use common theme for ITS Database
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
  },
});

function ExampleFunction(){
    //place react hooks here
    //example  const [description, setDescription] = useState('');
    //in this example description is the state variable, it holds the current value for that piece of state
    // and setDescription is the state setter function, its a special function returned by useState to update the sate variable
    // useState is the React Hook Call, it is used to add features, like state, to a functional component, in this example the useState sets the initial
    //value of the state variable to an empty string.
    // Another useState setting could be useState([]), which sets the initial value to an empty array

    //place functions and other helper code here


    return( //place desired page UI contents here,everything inside this return is what gets rendered to the screen
        //list of MUI components https://mui.com/material-ui/all-components

        //ThemeProvider uses the theme across the entire page
        <ThemeProvider theme={theme}> 
            <Container maxWidth="md">
                 {/* 
                    Container:
                    - Provides a responsive fixed-width layout wrapper.
                    - Centers its contents horizontally by default.
                    - The "maxWidth" prop sets the maximum width for the content area.
                        "md" means it will use the 'medium' breakpoint width from MUI's theme.
                    */}
                <Box>
                    {/* 
                        Box:
                        - A versatile wrapper component that renders a <div> by default.
                        - Supports the 'sx' prop for styling (margin, padding, colors, flex, etc.).
                        - Useful for layout, spacing, and grouping content.
                        */}
                    <Typography>
                        {/* 
                        Typography:
                        - Renders text with Material-UI's theme-based styles.
                        - Can be customized with the "variant" prop (e.g., 'h1', 'body1', 'subtitle1') to match
                            semantic HTML and apply consistent font sizes/weights.
                        - Useful for headings, paragraphs, labels, and any text content.
                        */}
                        
                    </Typography>
                </Box>
            </Container>
            
        </ThemeProvider>
        
    );
}

export default ExampleFunction; //Makes your component or function available for other files to import and use.



