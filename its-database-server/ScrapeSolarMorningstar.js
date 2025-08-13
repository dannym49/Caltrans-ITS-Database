module.exports = async function scrapeSolarMorningstar(browser, ip, model) {
  const page = await browser.newPage();

  try {
    const url = `http://${ip}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const waitForInputValue = async (selector) => {
      try {
        await page.waitForFunction((sel) => {
          const el = document.querySelector(sel);
          return el && el.value && el.value.trim().length > 0;
        }, { timeout: 30000 }, selector);

        return await page.$eval(selector, el => el.value.trim());
      } catch {
        return '';
      }
    };

    const controllerType = await page.$eval('body', el => {
      const match = el.getAttribute('onload')?.match(/LVInit\('(.+?)'\)/);
      return match ? match[1] : 'Unknown';
    });

    let chargeCurrentSelector = '';
    if (controllerType === 'Prostar PWM') {
      chargeCurrentSelector = 'form[name="fDArrayI"] input[name="lblcurrentValue"]';
    } else if (controllerType === 'Prostar MPPT') {
      chargeCurrentSelector = 'form[name="fDChargeI"] input[name="lblcurrentValue"]';
    } else {
      throw new Error(`Unknown controller type: ${controllerType}`);
    }

    const data = {
      chargeState: await waitForInputValue('form[name="fDChargeSt"] input[name="lblvalSt"]'),
      batteryVoltage: await waitForInputValue('form[name="fDBattV"] input[name="lblcurrentValue"]'),
      chargeCurrent: await waitForInputValue(chargeCurrentSelector),
      arrayVoltage: await waitForInputValue('form[name="fDArrayV"] input[name="lblcurrentValue"]'),
      loadState: await waitForInputValue('form[name="fDLoadState"] input[name="lblvalSt"]'),
      loadVoltage: await waitForInputValue('form[name="fDLoadV"] input[name="lblcurrentValue"]'),
      loadCurrent: await waitForInputValue('form[name="fDLoadI"] input[name="lblcurrentValue"]'),
      batteryTemp: await waitForInputValue('form[name="fDTBatt"] input[name="lblcurrentValue"]'),
      alarm: await waitForInputValue('form[name="fDAlarms"] textarea[name="lblvalAlarm"]'),
      arrayFaults: await waitForInputValue('form[name="fDAlarms"] textarea[name="lblvalAError"]'),
      loadFaults: await waitForInputValue('form[name="fDAlarms"] textarea[name="lblvalLError"]'),
      lastUpdated: new Date().toISOString(),
    };

    if (controllerType === 'Prostar MPPT') {
      data.sweepPMax = await waitForInputValue('form[name="fDSweepPmax"] input[name="lblcurrentValue"]');
    }

    return data;
  } catch (err) {
    throw new Error("Failed to scrape solar controller: " + err.message);
  } finally {
    try {
      await page.close();
    } catch {}
  }
};

