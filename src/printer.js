const { PRINTER_USB, PRINTER_BAUDRATE } = process.env;

if (!PRINTER_USB || !PRINTER_BAUDRATE) {
  return console.error("Missing environment variabes.");
}

const { default: PQueue } = require("p-queue");
const SerialPort = require("serialport");
const serialPort = new SerialPort(PRINTER_USB, {
  baudRate: parseInt(PRINTER_BAUDRATE),
});
const ThermalPrinter = require("thermalprinter");

class Printer {
  constructor() {
    this.printer = null;
    this.queue = new PQueue({ concurrency: 1 });

    let count = 0;
    this.queue.on("active", () => {
      console.log(
        `Working on item #${++count}.  Size: ${
          this.queue.size
        }  Pending: ${this.queue.pending}`,
      );
    });

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

  async queuePrintItem(printItem) {
    return this.queue.add(() => {
      return new Promise((resolve) => {
        console.log("Printing...");
        printItem.print(() => {
          console.log("Printed");

          /* 
            just a lil delay cause im
            scared it'll break
          */
          setTimeout(resolve, 100);
        });
      });
    });
  }

  async printText({ text, isFlipped = false, isBig = false }) {
    if (!this.printer) {
      throw new Error("No printer initialised");
    }

    return this.queuePrintItem(
      this.printer
        .big(isBig)
        .upsideDown(isFlipped)
        .printText(text)
        .lineFeed(3)
        .big(false), // disable big mode
    );
  }

  async printImage({ imagePath }) {
    if (!this.printer) {
      throw new Error("No printer initialised");
    }

    return this.queuePrintItem(
      this.printer.printImage(imagePath).lineFeed(2),
    );
  }
}

module.exports = Printer;
