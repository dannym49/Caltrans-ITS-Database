const axios = require("axios");
const puppeteer = require("puppeteer-core");
const scrapeAPC = require("./ScrapeAPC");
const scrapeIntellipower = require("./ScrapeIntellipower");
const scrapeSolarMorningstar = require("./ScrapeSolarMorningstar");
const scrapeSolarDailyMetrics = require("./ScrapeSolarDailyMetrics");

let upsCache = {};
let solarCache = {};
let solarDailyCache = {};

function stripPort(ip) {
  return (ip || "").split(":")[0];
}

function isWithinScrapeWindow(startHour = 6, endHour = 18) {//scrape between 6am and 6pm
  const now = new Date();
  const hour = now.getHours();
  return hour >= startHour && hour < endHour;
}


async function scrapeAllUPS(browser) {
    const res = await axios.get("http://localhost:5000/api/projects");
    const upsProjects = res.data.filter((proj) => {
      const make = (proj.data?.[56] || "").toLowerCase();
      return (
        (make.includes("intellipower") || make.includes("apc")) &&
        (proj.data?.[35] || proj.data?.[40])
      );
    });

    const tasks = upsProjects.map((proj) => async () => {
      const ip = stripPort(proj.data[54]);
      const finalIp = proj.data[55] ? `${ip}:${proj.data[55]}` : ip;
      const make = (proj.data?.[56] || "").toLowerCase();

      try {
        const data = make.includes("intellipower")
          ? await scrapeIntellipower(browser, finalIp)
          : await scrapeAPC(browser, finalIp);
        upsCache[proj._id] = data;
      } catch (err) {
        upsCache[proj._id] = { error: err.message || err };
      }
    });

    await runWithConcurrencyLimit(tasks, 3);
  
}

async function scrapeAllSolar(browser) {
  
    const res = await axios.get("http://localhost:5000/api/projects");
    const solarProjects = res.data.filter(
      (proj) =>
        String(proj.data?.[56] || "").toLowerCase().includes("morning") &&
        (String(proj.data?.[9] || "").toLowerCase().includes("solar") ||
          String(proj.data?.[10] || "").toLowerCase().includes("solar")) &&
        (proj.data?.[35] || proj.data?.[40])
    );

    const tasks = solarProjects.map((proj) => async () => {
      const ip = stripPort(proj.data[54]);
      const finalIp = proj.data[55] ? `${ip}:${proj.data[55]}` : ip;
      const model = proj.data?.[57] || "";

      try {
        const data = await scrapeSolarMorningstar(browser, finalIp, model);
        solarCache[proj._id] = data;
      } catch (err) {
        solarCache[proj._id] = { error: err.message || err };
      }
    });

    await runWithConcurrencyLimit(tasks, 3);
  
}

async function scrapeAllSolarDaily(browser) {
  
    const res = await axios.get("http://localhost:5000/api/projects");
    const dailyProjects = res.data.filter(
      (proj) =>
        String(proj.data?.[56] || "").toLowerCase().includes("morning") &&
        (proj.data?.[35] || proj.data?.[40])
    );

    const tasks = dailyProjects.map((proj) => async () => {
      const ip = stripPort(proj.data[54]);
      const finalIp = proj.data[55] ? `${ip}:${proj.data[55]}` : ip;

      try {
        const data = await scrapeSolarDailyMetrics(browser, finalIp);
        solarDailyCache[proj._id] = data;
      } catch (err) {
        solarDailyCache[proj._id] = { error: err.message || err };
      }
    });

    await runWithConcurrencyLimit(tasks, 1);
    
}

async function runWithConcurrencyLimit(tasks, limit = 3) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const p = task();
    results.push(p);
    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    if (executing.length >= limit) await Promise.race(executing);
  }

  return Promise.all(results);
}

function startBackgroundScraping() {
  const cycle = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      protocolTimeout: 60000,
      executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    while (true) {
       if (!isWithinScrapeWindow()) {
      } else {
        await scrapeAllSolar(browser);
        await scrapeAllUPS(browser);
        await scrapeAllSolarDaily(browser);
      }
      await new Promise((resolve) => setTimeout(resolve, 20 * 60 * 1000)); // wait 20 min
    }

    // await browser.close(); // not reachable
  };

  cycle();
}

module.exports = {
  startBackgroundScraping,
  getCachedUPS: () => upsCache,
  getCachedSolar: () => solarCache,
  getCachedSolarDaily: () => solarDailyCache,
};
