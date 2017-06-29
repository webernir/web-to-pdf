var express = require('express');
var router = express.Router();
const htmlPdf = require('html-pdf-chrome');
const chromeLauncher = require('chrome-launcher');

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

router.get('/:url', async function (req, res, next) {
  const chrome = await launchChrome(false)
  console.log(`Chrome debuggable on port: ${chrome.port}`);
  const html = '<p>Hello, world!</p>';
  const options = {
    port: chrome.port, // port Chrome is listening on 
  };
  const url = 'https://github.com/westy92/html-pdf-chrome';
  const pdf = await htmlPdf.create(url, options);
 console.log("pdf ", pdf);
  await pdf.toFile('test.pdf')
  res.json({ title: req.params.url });
});

module.exports = router;
