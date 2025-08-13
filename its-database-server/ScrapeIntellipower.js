module.exports = async function scrapeIntellipower(browser, ip) {
  if (!ip) throw new Error("Missing UPS IP.");

  const page = await browser.newPage();

  try {
    const url = `http://${ip}/status.htm`;
    await page.authenticate({ username: 'itsdb', password: 'traffic1' });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

    // Attempt to wait for key element but do not throw if it fails
    try {
      await page.waitForFunction(() => {
        const el = document.querySelector('#contentdiv2_2');
        return el && el.innerText.trim().length > 0;
      }, { timeout: 25000 });
    } catch {
      // Allow scraping to proceed even if this check fails
    }

    const getValueById = async (selector, retries = 3, delay = 1000) => {
      for (let i = 0; i <= retries; i++) {
        try {
          return await page.$eval(selector, el => el.innerText.trim());
        } catch {
          if (i === retries) return null;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    const data = {
      inputVoltage: await getValueById('#contentdiv0_5', 3, 1500),
      inputFrequency: await getValueById('#contentdiv0_8', 3, 1500),
      batteryCondition: await getValueById('#contentdiv2_2', 3, 1500),
      batteryCapacity: await getValueById('#contentdiv2_7', 3, 1500),
      timeOnBattery: await getValueById('#contentdiv2_9', 3, 1500),
      estimatedBatteryTimeRemaining: await getValueById('#contentdiv2_10', 3, 1500),
      outputVoltage: await getValueById('#contentdiv1_1', 3, 1500),
      batteryVoltage: await getValueById('#contentdiv2_8', 3, 1500),
      lastUpdated: new Date().toISOString()
    };

    return data;
  } catch (err) {
    throw new Error("Failed to scrape UPS page: " + err.message);
  } finally {
    try {
      await page.close();
    } catch {}
  }
};


