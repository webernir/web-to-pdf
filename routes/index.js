var express = require('express');
var router = express.Router();
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const log = require('lighthouse-logger');

log.setLevel('info');

function launchChrome(headless = true) {
  return chromeLauncher.launch({
    // port: 9222, // Uncomment to force a specific port of your choice.
    chromeFlags: [
      '--window-size=412,732',
      '--disable-gpu',
      headless ? '--headless' : ''
    ]
  });
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/print/:url', async function (req, res, next) {
  const chrome = await launchChrome(false)
  console.log(`Chrome debuggable on port: ${chrome.port}`);

  const protocol = await CDP({ port: chrome.port });
  const { Page, Runtime } = protocol;
  await Promise.all([Page.enable(), Runtime.enable()]);

  Page.navigate({ url: 'https://www.chromestatus.com/' });
  Page.loadEventFired(async () => {
    const pdf = ''
    console.log(Page.printToPDF)
    try {
      pdf = Page.printToPDF()
    }
    catch (err) {
      pdf = err
    }
    console.log("pdf ", pdf);

    const js = "document.querySelector('title').textContent";
    // Evaluate the JS expression in the page.
    const result = await Runtime.evaluate({ expression: js });

    console.log('Title of page: ' + result.result.value);

    protocol.close();
    chrome.kill(); // Kill Chrome.
    res.json({ title: req.params.url });
  });
});

module.exports = router;
