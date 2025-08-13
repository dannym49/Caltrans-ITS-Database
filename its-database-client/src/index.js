import React from 'react';
import ReactDOM from 'react-dom/client';  // Correct import for React 18
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Projects from './Projects';
import ProjectDetails from './ProjectDetails';
import UploadSelection from './UploadSelection';  // Import selection page
import AddProject from './AddProject';
import CountySelect from './CountySelect'; // Import county selection page
import UploadExcel from './UploadExcel';
import RouteSelect from './RouteSelect'; 
import ProjectLog from './ProjectLog';
import SolarRelayOptions from './SolarRelayOptions';
import SolarLiveData from './SolarLiveData';
import SolarDailyMetrics from './SolarDailyMetrics';
import UpsLiveData from './UpsLiveData'; 
import RecentModifications from './RecentModifications';
import { UPSDataProvider } from './UPSDataContext';
import { SolarDataProvider } from './SolarDataContext';
import { SolarDailyDataProvider } from './SolarDailyDataContext';
import ITSwh from './ITSwh'; 
import SettingsPage from './SettingsPage'; 

// Get the root element
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <SolarDataProvider>
    <UPSDataProvider>
      <SolarDailyDataProvider>
     
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/counties" element={<CountySelect />} />
          <Route path="/routes" element={<RouteSelect />} />
          <Route path="/projects/:county" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/project/:id/log" element={<ProjectLog />} />
          <Route path="/solar-relay-select" element={<SolarRelayOptions />} /> 
          <Route path="/solar-live" element={<SolarLiveData />} /> 
          <Route path="/solar-daily" element={<SolarDailyMetrics />} /> 
          <Route path="/upload" element={<UploadSelection />} />
          <Route path="/upload-excel" element={<UploadExcel />} />
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/ups-live" element={<UpsLiveData />} />
          <Route path="/recent-modifications" element={<RecentModifications />} />
          <Route path="/ITSwh" element={<ITSwh />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes> 
      </Router>
    </SolarDailyDataProvider>
  </UPSDataProvider>
</SolarDataProvider> 
);

