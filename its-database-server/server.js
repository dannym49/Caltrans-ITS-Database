require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');
const { exec } = require("child_process");
const path = require("path");
const fs = require('fs'); 
const axios = require('axios');
const snmp = require('net-snmp'); 
const http = require('http');
const net = require('net');
const puppeteer = require('puppeteer-core');
const { fork } = require('child_process');
const enqueue = require('./scraperQueue');

const DEFAULT_MAKES = {
  COMMUNICATION: ["RV50X", "IBR900", "5AC Gen 2", "800 Series"],
  CMS: ["SolarMax", "McCain", "LEDstar"],
  CCTV: ["Pelco Sarix Enhanced", "Pelco Spectra Enhanced", "Axis", "Sidewinder", "Bosch", "CohuHd"],
  MVDS: ["Wavetronix Smart Sensor"],
  UPS: ["APC", "Intellipower"],
  SOLAR: ["Morningstar"],
  RPS: ["Ambery"]
};

const MakeList = require('./makeList');

const DEFAULT_MODELS = {
  COMMUNICATION: ["CradlePoint", "Cisco", "Ubiquiti", "Sierra Wireless"],
  CMS: ["500", "520", "700C"],
  CCTV: ["IXE53", "D6230L", "Q6225-LE PTZ Camera", "D7230L", "MIC IP Starlight 7100i", "MIC inteox 7100i", "D6230", "SW720P H.264 HD", "4260HD", "4221-1000-0000" ],
  MVDS: ["HD", "XP20"],
  UPS: ["Smart-UPS 750", "SMT750C", "FA10449", "FA10434", "800" ],
  SOLAR: ["Prostar MPPT", "Prostar PWM"],
  RPS: ["IP-P2", "IP-P3", "IP-P4"]
};

const ModelList = require('./modelList');

const os = require('os');
const { startBackgroundScraping, getCachedUPS, getCachedSolar, getCachedSolarDaily } = require('./scrapeManager');


const agent = new http.Agent({ keepAlive: false });
startBackgroundScraping();
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());

setInterval(() => {
  const tempDir = os.tmpdir();
  const entries = fs.readdirSync(tempDir);

  for (const entry of entries) {
    const fullPath = path.join(tempDir, entry);

    try {
      const stat = fs.statSync(fullPath);

      
      if (stat.isDirectory() && entry.startsWith('puppeteer_')) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        
      }

      
      if (stat.isFile() && entry.endsWith('.tmp')) {
        fs.unlinkSync(fullPath);
        
      }
    } catch (err) {
      
    }
  }
}, 120000); 

setInterval(() => {
  const tempDir = os.tmpdir();
  const entries = fs.readdirSync(tempDir);

  for (const entry of entries) {
    const fullPath = path.join(tempDir, entry);

    try {
      const stat = fs.statSync(fullPath);

      
      if (stat.isDirectory() && entry.startsWith('edge_BITS')) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        
      }

     
      if (stat.isFile() && entry.endsWith('.tmp')) {
        fs.unlinkSync(fullPath);
        
      }
    } catch (err) {
      
    }
  }
}, 120000); 





// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Define a Flexible Schema for Projects
const ProjectSchema = new mongoose.Schema({
  county: String,  // Store county name for filtering
  data: Object,     // Store project data dynamically
  log: [
    {
      date: String,
      editedBy: String,
      description: String
    }
  ]
  
}, { strict: false });

const Project = mongoose.model('Project', ProjectSchema);


app.get('/api/ups-latest', (req, res) => res.json(getCachedUPS()));
app.get('/api/solar-latest', (req, res) => res.json(getCachedSolar()));
app.get('/api/solar-daily-latest', (req, res) => res.json(getCachedSolarDaily()));

app.get('/api/debug-makes', async (req, res) => {
  const doc = await MakeList.findOne({ type: 'deviceMakes' });
  res.json(doc);
});

// API to Add a Single Project Manually
app.post('/api/projects', async (req, res) => {
  try {
    const { county, data } = req.body;
    
    
    if (!county || !data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "County and site data are required." });
    }

    const newProject = new Project({ county, data });
    await newProject.save();

    console.log(`New site added for ${county}`);
    res.json({ message: "Site added successfully!", project: newProject });

  } catch (error) {
    console.error("Error adding site:", error);
    res.status(500).json({ error: "Failed to add site." });
  }
});

//  API to Fetch All Projects for a County
app.get('/api/projects/:county', async (req, res) => {
  enqueue(
    () => Project.find({ county: req.params.county }),
    `Fetch Projects (${req.params.county})`,
    true 
  )
    .then(projects => res.json(projects))
    .catch(error => {
      console.error("Fetch Failed:", error);
      res.status(500).json({ error: "Failed to fetch sites." });
    });
});


// API to Fetch a Single Project by ID
app.get('/api/project/:id', (req, res) => {
  enqueue(() => Project.findById(req.params.id), `Project-${req.params.id}`, true) 
    .then(project => {
      if (!project) return res.status(404).json({ error: "Site not found" });
      res.json(project);
    })
    .catch(error => {
      console.error("Site fetch failed:", error);
      res.status(500).json({ error: "Failed to fetch site." });
    });
});


app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    const county = req.body.county ? req.body.county.trim() : "Unknown";

    const workbook = xlsx.read(file.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (!sheetData || sheetData.length < 3) {
      return res.status(400).json({ error: "Excel must have at least 3 rows (headers + data)" });
    }

    const dataRows = sheetData.slice(2).filter(row => row.some(cell => cell !== ""));

    const headers = sheetData[1];
    const routeIndex = headers.findIndex(h => typeof h === 'string' && h.toLowerCase().includes("route"));
    const postmileIndex = headers.findIndex(h => typeof h === 'string' && h.toLowerCase().includes("postmile"));

    if (routeIndex === -1 || postmileIndex === -1) {
      return res.status(400).json({ error: "Excel must include 'Route' and 'Postmile' headers." });
    }

    let updated = 0, inserted = 0;

    for (const row of dataRows) {
      const route = String(row[routeIndex] ?? "").trim().toLowerCase();
      const postmile = String(row[postmileIndex] ?? "").trim().toLowerCase();
      const name = String(row[0] ?? "").trim().toLowerCase(); // index 0 = Name

      if (!route || !postmile) continue;

     

      const existing = await Project.aggregate([
        { $match: { county } },
        {
          $addFields: {
            routeValue: {
              $toLower: {
                $trim: { input: { $toString: { $arrayElemAt: ["$data", routeIndex] } } }
              }
            },
            postmileValue: {
              $toLower: {
                $trim: { input: { $toString: { $arrayElemAt: ["$data", postmileIndex] } } }
              }
            },
            nameValue: {
              $toLower: {
                $trim: { input: { $toString: { $arrayElemAt: ["$data", 0] } } }  
              }
            }
          }
        },
        {
          $match: {
            routeValue: route,
            postmileValue: postmile,
            nameValue: name
          }
        },
        { $limit: 1 }
      ]);


      if (existing.length > 0) {
        const existingProject = await Project.findById(existing[0]._id);
        const oldData = existingProject.data || [];
        const newData = row;

        const isDifferent = oldData.some((val, i) => String(val ?? "") !== String(newData[i] ?? ""));
        if (isDifferent) {
          const changes = [];
          const uploadedBy = req.body.uploadedBy || "Unknown";
        
          
          const fieldMappings = [
            ["General", ["Location", "Route", "Prefix", "Postmile", "Suffix", "Direction", "Latitude", "Longitude", "Photos Folder Filepath"]],
            ["Service Location", ["Latitude", "Longitude"]],
            ["Plans", ["Installation EA", "Sheet", "Installation Filepath", "Replacement EA-1", "Sheet", "Filepath EA-1", "Replacement EA-2", "Sheet", "Filepath EA-2"]],
            ["Communication", ["Location", "Device", "Connected To", "Local IP", "Remote IP", "Remote Port #", "WL Access Point/Client IP", "Provider", "Make", "Model", "TSS", "Phone"]],
            ["CMS", ["Location", "Model", "Local IP", "Remote IP",  "TMS ID", "Manufacturer"]],
            ["CCTV", ["Location", "Local IP", "Remote IP", "TMS ID", "Make", "Model", "Remote Port #"]],
            ["MVDS", ["Location", "Local IP", "Remote IP", "Remote Port #", "TMSID", "Make", "Model"]],
            ["UPS", ["Location", "Local IP", "Remote IP", "Remote Port #", "Make", "Model"]],
            ["RPS", ["Location", "Local IP", "Remote IP",  "Remote Port #", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"]],
            ["2nd UPS", ["Location", "Local IP", "Remote IP", "Make", "Model"]],
            ["2nd RPS", ["Location", "Local IP", "Remote IP", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"]]
          ];
        
          const indexMap = {};
          let idx = 0;
          for (const [category, labels] of fieldMappings) {
            for (const label of labels) {
              indexMap[idx++] = { category, label };
            }
          }
        
          for (let i = 0; i < newData.length; i++) {
            const oldVal = oldData[i] ?? "";
            const newVal = newData[i] ?? "";
            if (oldVal !== newVal) {
              const mapping = indexMap[i];
              const label = mapping ? `[${mapping.category}] ${mapping.label}` : `Field [${i}]`;
              changes.push(`${label} changed from "${oldVal}" to "${newVal}"`);
            }
          }
        
          if (changes.length > 0) {
            const logEntry = {
              date: new Date().toLocaleString(),
              editedBy: uploadedBy,
              description: changes.join("\n")
            };
            existingProject.log = [...(existingProject.log || []), logEntry];
          }
        
          existingProject.data = newData;
          await existingProject.save();
          updated++;
         
        }
        
      } else {
        const newProject = new Project({ county, data: row });
        await newProject.save();
        inserted++;
        
      }
    }

    res.json({ message: `Upload completed: ${updated} updated, ${inserted} new.` });

  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ error: "Upload processing failed." });
  }
});



app.get('/api/open-file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).send('File path is required');

  const resolvedPath = path.resolve(filePath);
  const taskName = `Open File (${path.basename(resolvedPath)})`;

  enqueue(
    () =>
      new Promise((resolve, reject) => {
        res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(resolvedPath) + '"');

        req.on('aborted', () => {
          console.warn('Request aborted by client.');
        });

        res.sendFile(resolvedPath, (err) => {
          if (err) {
            if (err.code === 'ECONNABORTED') {
              console.warn('File sending aborted by client. Not a server error.');
              resolve(); 
              return;
            }
            if (!res.headersSent) {
              console.error('Error sending file:', err);
              res.status(500).send('Failed to open file.');
            } else {
              console.error('Error sending file after headers already sent:', err);
            }
            reject(err);
          } else {
            resolve();
          }
        });
      }),
    taskName,
    true 
  ).catch((err) => {
    if (!res.headersSent) {
      res.status(500).send('Failed to process file.');
    }
  });
});



app.get('/api/project-ids', (req, res) => {
  enqueue(
    async () => {
      const projects = await Project.find({}, '_id').sort({ _id: 1 });
      return projects.map(p => p._id.toString());
    },
    'Fetch Project IDs',
    true 
  )
    .then(ids => res.json(ids))
    .catch(error => {
      console.error('Error fetching project IDs:', error);
      res.status(500).json({ error: 'Failed to fetch project IDs.' });
    });
});


app.get('/api/project/:id/log', (req, res) => {
  enqueue(
    async () => {
      const project = await Project.findById(req.params.id);
      if (!project) {
        throw { status: 404, message: 'Project not found' };
      }
      return project.log || [];
    },
    `Fetch Log (${req.params.id})`,
    true // High priority
  )
    .then(log => res.json({ log }))
    .catch(err => {
      if (err.status === 404) {
        res.status(404).json({ error: err.message });
      } else {
        console.error('Error fetching log:', err);
        res.status(500).json({ error: 'Failed to fetch log.' });
      }
    });
});


app.put("/api/project/:id", (req, res) => {
  enqueue(
    async () => {
      const { id } = req.params;
      const updatedData = req.body.data;
      const editedBy = req.body.editedBy || "Unknown";

      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ error: "Project not found" });

      const oldData = project.data || [];
      const changes = [];

      // Define index-to-label and category mappings
      const fieldMappings = [
        ["General", ["Location", "Route", "Prefix", "Postmile", "Suffix", "Direction", "Latitude", "Longitude", "Photos Folder Filepath"]],
        ["Service Location", ["Latitude", "Longitude"]],
        ["Plans", ["Installation EA", "Sheet", "Installation Filepath", "Replacement EA-1", "Sheet", "Filepath EA-1", "Replacement EA-2", "Sheet", "Filepath EA-2"]],
        ["Communication", ["Location", "Device", "Connected To", "Local IP", "Remote IP", "Remote Port #", "WL Access Point/Client IP", "Provider", "Make", "Model", "TSS", "Phone"]],
        ["CMS", ["Location", "Model", "Local IP", "Remote IP", "TMS ID", "Manufacturer"]],
        ["CCTV", ["Location", "Local IP", "Remote IP", "TMS ID", "Make", "Model", "Remote Port #"]],
        ["MVDS", ["Location", "Local IP", "Remote IP", "Remote Port #", "TMSID", "Make", "Model"]],
        ["UPS/Solar Charge Controller", ["Location", "Local IP", "Remote IP", "Remote Port #", "Make", "Model"]],
        ["RPS", ["Location", "Local IP", "Remote IP", "Remote Port #", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"]],
        ["2nd UPS/ Solar Charge Controller", ["Location", "Local IP", "Remote IP", "Remote Port #","Make", "Model"]],
        ["2nd RPS", ["Location", "Local IP", "Remote IP", "Remote Port #", "Make", "Model", "Outlet 1", "Outlet 2", "Outlet 3", "Outlet 4"]],
      ];

      const indexMap = {};
      let idx = 0;
      for (const [category, labels] of fieldMappings) {
        for (const label of labels) {
          indexMap[idx++] = { category, label };
        }
      }

      for (let i = 0; i < updatedData.length; i++) {
        const oldVal = oldData[i] ?? "";
        const newVal = updatedData[i] ?? "";
        if (oldVal !== newVal) {
          const mapping = indexMap[i];
          const label = mapping ? `[${mapping.category}] ${mapping.label}` : `Field [${i}]`;
          changes.push(`${label} changed from "${oldVal}" to "${newVal}"`);
        }
      }

      project.data = updatedData;

      if (changes.length > 0) {
        const changesByCategory = {};

        for (const change of changes) {
          const match = change.match(/^\[(.*?)\]/);
          const category = match ? match[1] : "Unknown";
          if (!changesByCategory[category]) {
            changesByCategory[category] = [];
          }
          changesByCategory[category].push(change);
        }

        const newLogs = Object.entries(changesByCategory).map(([category, descs]) => ({
          date: new Date().toLocaleString(),
          editedBy,
          description: descs.join("\n"),
        }));

        project.log = [...(project.log || []), ...newLogs];
      }

      await project.save();
      return { message: "Project updated successfully", project };
    },
    `Update Project (${req.params.id})`,
    true // High priority
  )
    .then(result => res.json(result))
    .catch(error => {
      console.error("Update Failed:", error);
      res.status(500).json({ error: "Failed to update project." });
    });
});


app.get('/api/latest-modification', (req, res) => {
  enqueue(
    async () => {
      const projects = await Project.find({ log: { $exists: true, $ne: [] } });
      let latestEntry = null;

      projects.forEach(project => {
        project.log.forEach(log => {
          const logDate = new Date(log.date);
          if (!latestEntry || logDate > new Date(latestEntry.date)) {
            latestEntry = {
              projectId: project._id,
              location: project.data?.[0] || "Unknown",
              date: log.date
            };
          }
        });
      });

      if (!latestEntry) {
        throw { status: 404, message: "No modifications found." };
      }

      return latestEntry;
    },
    "Latest Project Modification",
    true 
  )
    .then(result => res.json(result))
    .catch(err => {
      if (err.status === 404) {
        res.status(404).json({ message: err.message });
      } else {
        console.error("Error fetching latest modification:", err);
        res.status(500).json({ error: "Failed to retrieve latest modification." });
      }
    });
});

app.get('/api/recent', (req, res) => {
  enqueue(
    async () => {
      const projects = await Project.find({ log: { $exists: true, $ne: [] } });

      const latestLogsByLocation = {};

      projects.forEach(project => {
        const location = project.data?.[0] || "Unknown";

        project.log.forEach(log => {
          const logDate = new Date(log.date);

          if (
            !latestLogsByLocation[location] ||
            logDate > new Date(latestLogsByLocation[location].date)
          ) {
            latestLogsByLocation[location] = {
              projectId: project._id,
              location,
              date: logDate,
            };
          }
        });
      });

      const recentLogs = Object.values(latestLogsByLocation)
        .sort((a, b) => b.date - a.date)
        .slice(0, 100)
        .map(log => ({
          ...log,
          date: log.date.toISOString(),
        }));

      return recentLogs;
    },
    "Fetch Recent Modifications",
    true // High priority
  )
    .then(result => res.json(result))
    .catch(err => {
      console.error("Error fetching recent modifications:", err);
      res.status(500).json({ error: "Failed to retrieve recent modifications." });
    });
});



app.get('/api/project/:id/county', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('county');
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ county: project.county });
  } catch (err) {
    console.error("Error fetching county:", err);
    res.status(500).json({ error: "Failed to fetch county" });
  }
});


// API to Fetch All Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ error: "Failed to fetch all projects." });
  }
});


//API to fetch device Make
app.get('/api/makes', async (req, res) => {
  try {
    let doc = await MakeList.findOne({ type: 'deviceMakes' });

    if (!doc) {

      doc = await MakeList.create({ 
        type: 'deviceMakes', 
        makesByDeviceType: DEFAULT_MAKES 
      });
      console.log("Initialized make list with defaults.");
    }

    res.json(doc.makesByDeviceType || {});
  } catch (err) {
    console.error("Error fetching makes:", err);
    res.status(500).json({ error: "Failed to fetch makes." });
  }
});


//API to add a new make
app.post('/api/makes', async (req, res) => {
  const { deviceType, newMake } = req.body;
  if (!deviceType || !newMake) {
    return res.status(400).json({ error: "Missing deviceType or newMake." });
  }

  try {
    let doc = await MakeList.findOne({ type: 'deviceMakes' });
    if (!doc) {
      doc = await MakeList.create({ type: 'deviceMakes', makesByDeviceType: {} });
    }

    const currentList = doc.makesByDeviceType.get(deviceType) || [];
    if (!currentList.includes(newMake)) {
      currentList.push(newMake);
      doc.makesByDeviceType.set(deviceType, currentList);
      await doc.save();
    }

    res.json({ makesByDeviceType: doc.makesByDeviceType });
  } catch (err) {
    console.error("Error saving make:", err);
    res.status(500).json({ error: "Failed to save make." });
  }
});


//API to fetch device Model
app.get('/api/models', async (req, res) => {
  try {
    let doc = await ModelList.findOne({ type: 'deviceModels' });

    if (!doc) {
      doc = await ModelList.create({ 
        type: 'deviceModels', 
        modelsByDeviceType: DEFAULT_MODELS 
      });
    }

    res.json(doc.modelsByDeviceType || {});
  } catch (err) {
    console.error("Error fetching models:", err);
    res.status(500).json({ error: "Failed to fetch models." });
  }
});


//API to add a new model
app.post('/api/models', async (req, res) => {
  const { deviceType, newModel } = req.body;
  if (!deviceType || !newModel) {
    return res.status(400).json({ error: "Missing deviceType or newModel." });
  }

  try {
    let doc = await ModelList.findOne({ type: 'deviceModels' });
    if (!doc) {
      doc = await ModelList.create({ type: 'deviceModels', modelsByDeviceType: {} });
    }

    const currentList = doc.modelsByDeviceType.get(deviceType) || [];
    if (!currentList.includes(newModel)) {
      currentList.push(newModel);
      doc.modelsByDeviceType.set(deviceType, currentList);
      await doc.save();
    }

    res.json({ modelsByDeviceType: doc.modelsByDeviceType });
  } catch (err) {
    console.error("Error saving model:", err);
    res.status(500).json({ error: "Failed to save model." });
  }
});


// DELETE a Project by ID
app.delete('/api/project/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Project.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: "Site not found" });
    }

    res.json({ message: "Site deleted successfully", deletedId: id });
  } catch (err) {
    console.error("Error deleting Site:", err);
    res.status(500).json({ error: "Failed to delete Site" });
  }
});

//Deletes a single model from a device type's list.
app.delete('/api/models', async (req, res) => {
  const { deviceType, modelToDelete } = req.body;

  if (!deviceType || !modelToDelete) {
    return res.status(400).json({ error: "Missing deviceType or modelToDelete." });
  }

  try {
    const doc = await ModelList.findOne({ type: 'deviceModels' });
    if (!doc) return res.status(404).json({ error: "Model list not found." });

    const currentList = doc.modelsByDeviceType.get(deviceType) || [];
    const updatedList = currentList.filter(m => m !== modelToDelete);

    doc.modelsByDeviceType.set(deviceType, updatedList);
    await doc.save();

    res.json({ message: "Model deleted", modelsByDeviceType: doc.modelsByDeviceType });
  } catch (err) {
    console.error("Error deleting model:", err);
    res.status(500).json({ error: "Failed to delete model." });
  }
});

//Renames a model 
app.put('/api/models', async (req, res) => {
  const { deviceType, oldModel, newModel } = req.body;

  if (!deviceType || !oldModel || !newModel) {
    return res.status(400).json({ error: "Missing deviceType, oldModel, or newModel." });
  }

  try {
    const doc = await ModelList.findOne({ type: 'deviceModels' });
    if (!doc) return res.status(404).json({ error: "Model list not found." });

    const currentList = doc.modelsByDeviceType.get(deviceType) || [];
    const index = currentList.indexOf(oldModel);

    if (index === -1) {
      return res.status(404).json({ error: "Old model not found in list." });
    }

    currentList[index] = newModel;
    doc.modelsByDeviceType.set(deviceType, currentList);
    await doc.save();

    res.json({ message: "Model renamed", modelsByDeviceType: doc.modelsByDeviceType });
  } catch (err) {
    console.error("Error renaming model:", err);
    res.status(500).json({ error: "Failed to rename model." });
  }
});


//Deletes a single make from a device type's list.
app.delete('/api/makes', async (req, res) => {
  const { deviceType, makeToDelete } = req.body;

  if (!deviceType || !makeToDelete) {
    return res.status(400).json({ error: "Missing deviceType or makeToDelete." });
  }

  try {
    const doc = await MakeList.findOne({ type: 'deviceMakes' });
    if (!doc) return res.status(404).json({ error: "Make list not found." });

    const currentList = doc.makesByDeviceType.get(deviceType) || [];
    const updatedList = currentList.filter(m => m !== makeToDelete);

    doc.makesByDeviceType.set(deviceType, updatedList);
    await doc.save();

    res.json({ message: "Make deleted", makesByDeviceType: doc.makesByDeviceType });
  } catch (err) {
    console.error("Error deleting make:", err);
    res.status(500).json({ error: "Failed to delete make." });
  }
});

//Renames a make 
app.put('/api/makes', async (req, res) => {
  const { deviceType, oldMake, newMake } = req.body;

  if (!deviceType || !oldMake || !newMake) {
    return res.status(400).json({ error: "Missing deviceType, oldMake, or newMake." });
  }

  try {
    const doc = await MakeList.findOne({ type: 'deviceMakes' });
    if (!doc) return res.status(404).json({ error: "Make list not found." });

    const currentList = doc.makesByDeviceType.get(deviceType) || [];
    const index = currentList.indexOf(oldMake);

    if (index === -1) {
      return res.status(404).json({ error: "Old make not found in list." });
    }

    currentList[index] = newMake;
    doc.makesByDeviceType.set(deviceType, currentList);
    await doc.save();

    res.json({ message: "Make renamed", makesByDeviceType: doc.makesByDeviceType });
  } catch (err) {
    console.error("Error renaming make:", err);
    res.status(500).json({ error: "Failed to rename make." });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});

