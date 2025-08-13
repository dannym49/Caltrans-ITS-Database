import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const SolarDailyDataContext = createContext();

export function SolarDailyDataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [solarDailyDataMap, setSolarDailyDataMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCachedSolarDailyData() {
      setLoading(true);
      try {
        const [cacheRes, projRes] = await Promise.all([
          axios.get("http://10.44.2.198:5000/api/solar-daily-latest"),
          axios.get("http://10.44.2.198:5000/api/projects")
        ]);

        const cachedData = cacheRes.data;
        const allProjects = projRes.data;

        const filtered = allProjects.filter(proj =>
          (String(proj.data?.[9] || "").toLowerCase().includes("solar") ||
           String(proj.data?.[10] || "").toLowerCase().includes("solar"))
        );

        setProjects(filtered);
        setSolarDailyDataMap(cachedData);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    fetchCachedSolarDailyData();
  }, []);

  return (
    <SolarDailyDataContext.Provider value={{ projects, solarDailyDataMap, loading }}>
      {children}
    </SolarDailyDataContext.Provider>
  );
}
