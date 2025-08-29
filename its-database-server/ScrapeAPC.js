
// module.exports = async function scrapeAPC(browser, ip) {
//   if (!ip) throw new Error("Missing UPS IP.");
 
//   const page = await browser.newPage();

//   try {
//     const url = `http://${ip}`;
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

//     await page.waitForSelector('form[name="frmLogin"]', { timeout: 20000 });
//     await page.type('input[name="login_username"]', 'itsdb', { delay: 50 });
//     await page.type('input[name="login_password"]', 'traffic1', { delay: 50 });

//     // await Promise.all([
//     //   page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
//     //   page.click('input[type="submit"][value="Log On"]')
//     // ]);

//     // await new Promise(resolve => setTimeout(resolve, 2000));

//     // const dropdowns = await page.$$('a.dropdown-toggle');
//     // let statusDropdownClicked = false;
//     // const maxAttempts = 5;
//     // const delay = 2000;

//     // for (let attempt = 0; attempt < maxAttempts; attempt++) {
      
//     //   const dropdowns = await page.$$('a.dropdown-toggle');
//     //   for (const dropdown of dropdowns) {
//     //     const text = await dropdown.evaluate(el => el.textContent.trim());
//     //     if (text === "Status") {
//     //       await dropdown.click();
//     //       statusDropdownClicked = true;
//     //       await new Promise(resolve => setTimeout(resolve, 2000));
//     //       break;
//     //     }
//     //   }

//     //   if (statusDropdownClicked) break;
//     //   await new Promise(resolve => setTimeout(resolve, delay)); // wait and retry
//     // }

//     // if (!statusDropdownClicked) {
//     //   throw new Error("Could not find 'Status' dropdown.");
//     // }

//     // await page.waitForSelector('a[href="ulstat.htm"]', { timeout: 30000 });
//     // await page.click('a[href="ulstat.htm"]');
//     await Promise.all([
//   page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }),
//   page.click('input[type="submit"][value="Log On"]'),
// ]);

// // Get whatever the device redirected to, e.g.
// // http://10.239.60.69:84/NMC/I8P2tk6lmMrNO3viiCXyGA/home.htm
// const afterLoginUrl = page.url();

// // Build the session-aware UPS Status URL
// const ulstatUrl = new URL('ulstat.htm', afterLoginUrl).href;

// // Go there directly (fast path)
// await page.goto(ulstatUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{});

// // If the page didn’t render metrics yet, fall back to home and click a link
// if (!(await page.$('#langRuntimeRemaining'))) {
//   // Ensure we’re in the same session base (e.g., /NMC/<token>/)
//   const homeUrl = new URL('home.htm', afterLoginUrl).href;
//   await page.goto(homeUrl, { waitUntil: 'domcontentloaded', timeout: 12000 }).catch(()=>{});

//   // Try any link to ulstat.htm (works even when navbar is collapsed)
//   const link = await page.$('a[href*="ulstat.htm"]');
//   if (link) {
//     await link.click().catch(()=>{});
//     await page.waitForSelector('#langRuntimeRemaining', { timeout: 15000 }).catch(()=>{});
//   } else {
//     // As a last resort, open the hamburger then click Status -> UPS
//     const burger = await page.$('.navbar-toggle');
//     if (burger) { await burger.click(); await page.waitForTimeout(500); }
//     const [statusBtn] = await page.$x("//li[contains(@class,'dropdown')]/a[contains(.,'Status')]");
//     if (statusBtn) { await statusBtn.click(); await page.waitForTimeout(300); }
//     const [upsLink] = await page.$x("//a[contains(@href,'ulstat') or normalize-space(.)='UPS']");
//     if (upsLink) {
//       await upsLink.click();
//       await page.waitForSelector('#langRuntimeRemaining', { timeout: 15000 });
//     }
//   }
// }

//     // Try each selector individually instead of Promise.all
//     const tryWaitForSelector = async (selector) => {
//       try {
//         await page.waitForSelector(selector, { timeout: 15000 });
//       } catch {
//         // Do nothing
//       }
//     };

//     await tryWaitForSelector('#langRuntimeRemaining');
//     await tryWaitForSelector('#langInputVoltage');
//     await tryWaitForSelector('#langOutputVoltage');
//     await tryWaitForSelector('#langBatteryCapacity');
//     await tryWaitForSelector('#langBatteryVolt');
//     await tryWaitForSelector('#langHealth');

//     const evaluateWithTimeout = async (elementHandle, fn, timeout = 5000) => {
//       return await Promise.race([
//         elementHandle.evaluate(fn),
//         new Promise((_, reject) => setTimeout(() => reject(new Error('evaluate timeout')), timeout))
//       ]);
//     };

//     const getValueById = async (id, retries = 3, delay = 1000) => {
//       for (let i = 0; i <= retries; i++) {
//         try {
//           const label = await page.$(`#${id}`);
//           if (!label) throw new Error("Label not found");

//           const valueText = await evaluateWithTimeout(label, el => {
//             const dataField = el.closest('.dataField');
//             const valueContainer = dataField?.querySelector('.dataValue');
//             return valueContainer?.innerText.trim() || null;
//           });

//           if (!valueText) throw new Error("Value not found");
//           return valueText;
//         } catch {
//           if (i === retries) return null;
//           await new Promise(resolve => setTimeout(resolve, delay));
//         }
//       }
//     };

//     const data = {
//       runtimeRemaining: await getValueById('langRuntimeRemaining', 3, 1500),
//       inputVoltage: await getValueById('langInputVoltage', 3, 1500),
//       outputVoltage: await getValueById('langOutputVoltage', 3, 1500),
//       batteryCapacity: await getValueById('langBatteryCapacity', 3, 1500),
//       batteryVoltage: await getValueById('langBatteryVolt', 3, 1500),
//       batteryHealth: await getValueById('langHealth', 3, 1500),
//       lastUpdated: new Date().toISOString()
//     };

//     return data;
//   } catch (err) {
//     throw new Error("Failed to get APC data: " + err.message);
//   } finally {
//     try {
//       await page.close();
//     } catch {}
//   }
// };
  
module.exports = async function scrapeAPC(browser, ip, maxRetries = 3) {
  if (!ip) throw new Error("Missing UPS IP.");

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const page = await browser.newPage();

    try {
      const url = `http://${ip}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

      await page.waitForSelector('form[name="frmLogin"]', { timeout: 20000 });
      await page.type('input[name="login_username"]', "itsdb", { delay: 50 });
      await page.type('input[name="login_password"]', "traffic1", { delay: 50 });

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }),
        page.click('input[type="submit"][value="Log On"]'),
      ]);

      const afterLoginUrl = page.url();

      const ulstatUrl = new URL("ulstat.htm", afterLoginUrl).href;
      await page
        .goto(ulstatUrl, { waitUntil: "domcontentloaded", timeout: 15000 })
        .catch(() => {});

      // If metrics not present, fall back to home + nav
      if (!(await page.$("#langRuntimeRemaining"))) {
        const homeUrl = new URL("home.htm", afterLoginUrl).href;
        await page.goto(homeUrl, {
          waitUntil: "domcontentloaded",
          timeout: 12000,
        });

        const link = await page.$('a[href*="ulstat.htm"]');
        if (link) {
          await link.click();
          await page.waitForSelector("#langRuntimeRemaining", { timeout: 15000 });
        } else {
          const burger = await page.$(".navbar-toggle");
          if (burger) {
            await burger.click();
            await page.waitForTimeout(500);
          }
          const [statusBtn] = await page.$x(
            "//li[contains(@class,'dropdown')]/a[contains(.,'Status')]"
          );
          if (statusBtn) {
            await statusBtn.click();
            await page.waitForTimeout(300);
          }
          const [upsLink] = await page.$x(
            "//a[contains(@href,'ulstat') or normalize-space(.)='UPS']"
          );
          if (upsLink) {
            await upsLink.click();
            await page.waitForSelector("#langRuntimeRemaining", { timeout: 15000 });
          }
        }
      }

      // Scrape values
      const evaluateWithTimeout = async (elementHandle, fn, timeout = 5000) => {
        return await Promise.race([
          elementHandle.evaluate(fn),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("evaluate timeout")), timeout)
          ),
        ]);
      };

      const getValueById = async (id, retries = 3, delay = 1000) => {
        for (let i = 0; i <= retries; i++) {
          try {
            const label = await page.$(`#${id}`);
            if (!label) throw new Error("Label not found");

            const valueText = await evaluateWithTimeout(label, (el) => {
              const dataField = el.closest(".dataField");
              const valueContainer = dataField?.querySelector(".dataValue");
              return valueContainer?.innerText.trim() || null;
            });

            if (!valueText) throw new Error("Value not found");
            return valueText;
          } catch (err) {
            if (i === retries) return null;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      };

      const data = {
        runtimeRemaining: await getValueById("langRuntimeRemaining", 3, 1500),
        inputVoltage: await getValueById("langInputVoltage", 3, 1500),
        outputVoltage: await getValueById("langOutputVoltage", 3, 1500),
        batteryCapacity: await getValueById("langBatteryCapacity", 3, 1500),
        batteryVoltage: await getValueById("langBatteryVolt", 3, 1500),
        batteryHealth: await getValueById("langHealth", 3, 1500),
        lastUpdated: new Date().toISOString(),
      };

      await page.close();
      return data; 
    } catch (err) {
      lastError = err;
      await page.close();
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

 
  throw new Error(`Failed to scrape APC page`);
};
