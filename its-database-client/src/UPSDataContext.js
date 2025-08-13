import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const UPSDataContext = createContext();

export function UPSDataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [upsDataMap, setUpsDataMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCachedUPSData() {
      setLoading(true);
      try {
        const [cacheRes, projRes] = await Promise.all([
          axios.get("http://10.44.2.198:5000/api/ups-latest"),
          axios.get("http://10.44.2.198:5000/api/projects")
        ]);

        const cachedData = cacheRes.data;
        const allProjects = projRes.data;

        const filtered = allProjects.filter(proj => {
          const make = (proj.data?.[56] || '').toLowerCase();
          return make.includes("intellipower") || make.includes("apc");
        });

        setProjects(filtered);
        setUpsDataMap(cachedData);
      } catch (err) {
      } finally {
        setLoading(false);
      }
  }

  fetchCachedUPSData();
}, []);

  return (
    <UPSDataContext.Provider value={{ projects, upsDataMap, loading }}>
      {children}
    </UPSDataContext.Provider>
  );
}
