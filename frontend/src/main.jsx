import React from 'react';
import ReactDOM from 'react-dom/client';
import {createTheme, ThemeProvider, CssBaseline} from '@mui/material';
import App from './App.jsx';

const theme=createTheme({direction:'rtl',typography:{fontFamily:'Tahoma, Arial, sans-serif'}});
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ThemeProvider theme={theme}><CssBaseline/><App/></ThemeProvider></React.StrictMode>
);
