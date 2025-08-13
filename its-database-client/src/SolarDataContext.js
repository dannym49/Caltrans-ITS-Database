import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const SolarDataContext = createContext();

export function SolarDataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [solarDataMap, setSolarDataMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCachedSolarData() {
      setLoading(true);
      try {
        const [cacheRes, projRes] = await Promise.all([
          axios.get("http://10.44.2.198:5000/api/solar-latest"),
          axios.get("http://10.44.2.198:5000/api/projects")
        ]);

        const cachedData = cacheRes.data;
        const allProjects = projRes.data;

        const filtered = allProjects.filter(proj =>
          (String(proj.data?.[9] || "").toLowerCase().includes("solar") ||
          String(proj.data?.[10] || "").toLowerCase().includes("solar")) 
        );

        setProjects(filtered);
        setSolarDataMap(cachedData);
      } catch (err) {
        console.error("Error fetching cached solar data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCachedSolarData();
  }, []);

  return (
    <SolarDataContext.Provider value={{ projects, solarDataMap, loading }}>
      {children}
    </SolarDataContext.Provider>
  );
}
