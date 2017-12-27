var express = require('express');
var router = express.Router();
const htmlPdf = require('html-pdf-chrome');
// const htmlPdf = require('../pdf-html');
const chromeLauncher = require('chrome-launcher');
var conversion = require("phantom-html-to-pdf")();
const execFile = require('child_process').execFile;
const uuid = require('uuid/v4')
const fs = require('fs')
const path = require('path')

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

router.get('/phantom', async (req, res) => {
  const url = 'http://bina-nir-w-dev:4201/user/register';
  conversion({
    url,
    // waitForJS: true,
    printDelay: 300,
  }, function (err, pdf) {
    console.log(pdf.logs);
    console.log(pdf.numberOfPages);
    pdf.stream.pipe(res);
  });
})

function launchHeadlessChrome(url, filename, callback) {
  // Assuming MacOSx.
  const CHROME = 'C:\\Users\\webernir.BINAF\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe';
  execFile(CHROME, ['--headless', '--disable-gpu', `--print-to-pdf=${filename}`, url], callback);
}

router.get('/print/test', async function (req, res, next) {
  const url = 'http://localhost:8080/print/forms/3';
  launchHeadlessChrome(url, `${uuid()}.pdf`, (err, stdout, stderr) => {
    console.log(err)
    console.log(stdout)
    console.log(stderr)
    res.json({ success: true })
  })
});

router.get('/headless', async function (req, res, next) {
  const chrome = await launchChrome()
  console.log(`Chrome debuggable on port: ${chrome.port}`);
  const options = {
    port: chrome.port// milliseconds
  };
  // const url = 'https://github.com/westy92/html-pdf-chrome';
  const url = 'http://localhost:8080/print/forms/3';
  
  const pdf = await htmlPdf.create(url, options);
  console.log("pdf ", pdf, process.cwd());
  const fileName = `${uuid()}.pdf`
  await pdf.toFile(fileName)
  fs.readFile(path.resolve(process.cwd(), fileName), function (err, data) {
    res.contentType("application/pdf");
    res.send(data);
  });
});



module.exports = router;
