module.exports = async function scrapeSolarDailyMetrics(browser, ip) {
  if (!ip) throw new Error("Missing IP address.");

  const page = await browser.newPage();

  try {
    const url = `http://${ip}/datalog.html`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Retry wrapper for scraping functions
    const getWithRetries = async (fn, retries = 3, delay = 1000, label = "") => {
      for (let i = 0; i <= retries; i++) {
        try {
          const result = await fn();
          return result;
        } catch (err) {
          if (i === retries) {
            return null;
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    await getWithRetries(
      () => page.waitForSelector('#logLTbl tbody', { timeout: 80000 }),
      2,
      2000,
      'waitForSelector #logLTbl tbody'
    );

    const labels = await getWithRetries(() =>
      page.$$eval('#logLTbl tbody tr', trs => {
        const normalize = str => str?.trim().toLowerCase();
        return trs.map(tr => {
          const td = tr.querySelector('td.lbl');
          return td ? normalize(td.textContent) : '';
        });
      }),
      2,
      1500,
      'extract labels'
    );


    const dataRows = await getWithRetries(() =>
      page.$$eval('#logTbl tbody tr', trs =>
        trs.map(tr =>
          Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
        )
      ),
      2,
      1500,
      'extract data rows'
    );

    

    const hourMeter = labels?.findIndex(label => label === 'hour meter') ?? -1;
    const vbminIndex = labels?.findIndex(label => label === 'vb min') ?? -1;
    const absorptionIndex = labels?.findIndex(label => label === 'absorption') ?? -1;
    const floatIndex = labels?.findIndex(label => label === 'float') ?? -1;

    const result = {
      Vbmin: vbminIndex !== -1 ? dataRows?.[vbminIndex] || [] : [],
      Absorption: absorptionIndex !== -1 ? dataRows?.[absorptionIndex] || [] : [],
      Float: floatIndex !== -1 ? dataRows?.[floatIndex] || [] : [],
      HourMeter: hourMeter !== -1 ? dataRows?.[hourMeter] || [] : [],
      lastUpdated: new Date().toISOString()
    };

    
    
    return result;
  } catch (err) {
    throw new Error("Failed to scrape daily metrics: " + err.message);
  } finally {
    try {
      await page.close();
      
    } catch (e) {
      
    }
  }
};


