const { PRINTER_USB, PRINTER_BAUDRATE } = process.env;

if (!PRINTER_USB || !PRINTER_BAUDRATE) {
  return console.error("Missing environment variabes.");
}

const SerialPort = require("serialport");
const serialPort = new SerialPort(PRINTER_USB, {
  baudRate: parseInt(PRINTER_BAUDRATE),
});
const ThermalPrinter = require("thermalprinter");

class Printer {
  constructor() {
    this.printer = null;

    this.initialisePrinter();
  }

  async initialisePrinter() {
    return new Promise((resolve) => {
      serialPort.on("open", () => {
        console.log("Serial port open!");

        /*
              maxPrintingDots = 0-255. Max heat dots, Unit (8dots), Default: 7 (64 dots)
              heatingTime = 3-255. Heating time, Unit (10us), Default: 80 (800us)
              heatingInterval = 0-255. Heating interval, Unit (10µs), Default: 2 (20µs)
          
              The more max heating dots, the more peak current will cost when printing,
              the faster printing speed. The max heating dots is 8*(n+1).
          
              The more heating time, the more density, but the slower printing speed.
              If heating time is too short, blank page may occur.
          
              The more heating interval, the more clear, but the slower printing speed.
            */

        this.printer = new ThermalPrinter(serialPort, {
          maxPrintingDots: 10,
          heatingTime: 150,
          heatingInterval: 120,
          commandDelay: 2,
        });

        this.printer.on("ready", () => {
          console.log("Printer ready!");
          resolve();
        });
      });
    });
  }

  async printText({ text }) {
    if (!this.printer) {
      throw new Error("No printer initialised");
    }

    return new Promise((resolve) => {
      this.printer
        .printLine(text)
        .lineFeed(1)
        .print(() => {
          console.log("Printed text");

          resolve();
        });
    });
  }

  async printImage({ imagePath }) {
    if (!this.printer) {
      throw new Error("No printer initialised");
    }

    return new Promise((resolve) => {
      this.printer
        .printImage(imagePath)
        .lineFeed(2)
        .print(() => {
          console.log("Printed image");

          resolve();
        });
    });
  }
}

module.exports = Printer;
