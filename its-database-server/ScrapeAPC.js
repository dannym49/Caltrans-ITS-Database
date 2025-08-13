
module.exports = async function scrapeAPC(browser, ip) {
  if (!ip) throw new Error("Missing UPS IP.");
 
  const page = await browser.newPage();

  try {
    const url = `http://${ip}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    await page.waitForSelector('form[name="frmLogin"]', { timeout: 20000 });
    await page.type('input[name="login_username"]', 'itsdb', { delay: 50 });
    await page.type('input[name="login_password"]', 'traffic1', { delay: 50 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
      page.click('input[type="submit"][value="Log On"]')
    ]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const dropdowns = await page.$$('a.dropdown-toggle');
    let statusDropdownClicked = false;
    const maxAttempts = 5;
    const delay = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      
      const dropdowns = await page.$$('a.dropdown-toggle');
      for (const dropdown of dropdowns) {
        const text = await dropdown.evaluate(el => el.textContent.trim());
        if (text === "Status") {
          await dropdown.click();
          statusDropdownClicked = true;
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        }
      }

      if (statusDropdownClicked) break;
      await new Promise(resolve => setTimeout(resolve, delay)); // wait and retry
    }

    if (!statusDropdownClicked) {
      throw new Error("Could not find 'Status' dropdown.");
    }

    await page.waitForSelector('a[href="ulstat.htm"]', { timeout: 30000 });
    await page.click('a[href="ulstat.htm"]');

    // Try each selector individually instead of Promise.all
    const tryWaitForSelector = async (selector) => {
      try {
        await page.waitForSelector(selector, { timeout: 15000 });
      } catch {
        // Do nothing
      }
    };

    await tryWaitForSelector('#langRuntimeRemaining');
    await tryWaitForSelector('#langInputVoltage');
    await tryWaitForSelector('#langOutputVoltage');
    await tryWaitForSelector('#langBatteryCapacity');
    await tryWaitForSelector('#langBatteryVolt');
    await tryWaitForSelector('#langHealth');

    const evaluateWithTimeout = async (elementHandle, fn, timeout = 5000) => {
      return await Promise.race([
        elementHandle.evaluate(fn),
        new Promise((_, reject) => setTimeout(() => reject(new Error('evaluate timeout')), timeout))
      ]);
    };

    const getValueById = async (id, retries = 3, delay = 1000) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const label = await page.$(`#${id}`);
          if (!label) throw new Error("Label not found");

          const valueText = await evaluateWithTimeout(label, el => {
            const dataField = el.closest('.dataField');
            const valueContainer = dataField?.querySelector('.dataValue');
            return valueContainer?.innerText.trim() || null;
          });

          if (!valueText) throw new Error("Value not found");
          return valueText;
        } catch {
          if (i === retries) return null;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    const data = {
      runtimeRemaining: await getValueById('langRuntimeRemaining', 3, 1500),
      inputVoltage: await getValueById('langInputVoltage', 3, 1500),
      outputVoltage: await getValueById('langOutputVoltage', 3, 1500),
      batteryCapacity: await getValueById('langBatteryCapacity', 3, 1500),
      batteryVoltage: await getValueById('langBatteryVolt', 3, 1500),
      batteryHealth: await getValueById('langHealth', 3, 1500),
      lastUpdated: new Date().toISOString()
    };

    return data;
  } catch (err) {
    throw new Error("Failed to get APC data: " + err.message);
  } finally {
    try {
      await page.close();
    } catch {}
  }
};
  
