require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');

const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Define a Flexible Schema for Projects
const ProjectSchema = new mongoose.Schema({
  county: String,  // Store county name for filtering
  data: Object     // Store project data dynamically
}, { strict: false });

const Project = mongoose.model('Project', ProjectSchema);

// Upload and Process Excel File (Only Store Data Rows)
app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      console.error("Upload Failed: No file provided.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    const county = req.body.county ? req.body.county.trim() : "Unknown";

    console.log(`Uploading file for county: ${county}`);

    // Read Excel File
    const workbook = xlsx.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    console.log(`Successfully read sheet: ${sheetName}`);

    //Convert sheet to JSON (Ignore headers, only keep data rows)
    const sheetData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (!sheetData || sheetData.length < 3) {
      console.error("Upload Failed: Excel file does not contain enough rows.");
      return res.status(400).json({ error: "Excel file must contain at least 3 rows (2 headers + data rows)." });
    }

    console.log(`Extracted ${sheetData.length} rows from Excel.`);

    const tableData = sheetData.slice(2); //Remove headers, keep only data

    if (tableData.length === 0) {
      console.error("Upload Failed: No data rows found.");
      return res.status(400).json({ error: "No data found in the file." });
    }

    //Store the data in MongoDB
    const projects = tableData.map(row => ({ county, data: row }));
    await Project.insertMany(projects);

    console.log(`Successfully uploaded ${projects.length} projects for ${county}`);
    res.json({ message: `Data for ${county} uploaded successfully`, data: projects });

  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ error: "Failed to process the uploaded file." });
  }
});

// Fetch All Projects for a County
app.get('/api/projects/:county', async (req, res) => {
  try {
    const projects = await Project.find({ county: req.params.county });
    res.json(projects);
  } catch (error) {
    console.error("Fetch Failed:", error);
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
