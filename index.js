const isRenderer = require("is-electron-renderer");
const electron = require("electron");
const path = require("path");
const extend = require("deep-extend");

const BrowserWindow = isRenderer
  ? electron.remote.BrowserWindow
  : electron.BrowserWindow;

const PDF_JS_PATH = path.join(__dirname, "pdfjs", "web", "viewer.html");

class PDFWindow extends BrowserWindow {
  constructor(opts) {
    super(
      extend({}, opts, {
        webPreferences: { nodeIntegration: false },
      })
    );

    this.webContents.on("will-navigate", (event, url) => {
      event.preventDefault();
      this.loadURL(url);
    });

    this.webContents.on("new-window", (event, url) => {
      event.preventDefault();

      event.newGuest = new PDFWindow();
      event.newGuest.loadURL(url);
    });
  }

  loadURL(url, options) {
    super.loadURL(
      `file://${path.join(
        __dirname,
        "pdfjs",
        "web",
        "viewer.html"
      )}?file=${decodeURIComponent(url)}`,
      options
    );
  }
}

PDFWindow.addSupport = function (browserWindow) {
  browserWindow.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    browserWindow.loadURL(url);
  });
  browserWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    event.newGuest = new PDFWindow();
    event.newGuest.loadURL(url);
  });

  const load = browserWindow.loadURL;
  browserWindow.loadURL = function (url, options) {
    load.call(
      browserWindow,
      `file://${PDF_JS_PATH}?file=${decodeURIComponent(url)}`,
      options
    );
  };
};

module.exports = PDFWindow;
