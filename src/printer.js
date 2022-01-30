const { PRINTER_USB, PRINTER_BAUDRATE } = process.env;

if (!PRINTER_USB || !PRINTER_BAUDRATE) {
  return console.error("Missing environment variabes.");
}

const PRINT_CHARACTER_PER_MILLISECOND = 12;

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
  }

  async initialise() {
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

  async queuePrintItem({ printItem, estimatedTimeout }) {
    return this.queue.add(() => {
      return new Promise((resolve) => {
        console.log("Printing...");
        printItem.print(() => {
          /* 
            printer doesn't tell us when it's finished printing
            just when we've finished sending serial info to it

            ive manually recorded how long different text takes
            to print and just gonna use that to estimate how long
            to take...
          */
          setTimeout(() => {
            console.log("Printed");
            resolve();
          }, estimatedTimeout || 2 * 1000); // 2 second default
        });
      });
    });
  }

  async printText({
    text,
    isFlipped = false,
    isBig = false,
    lineFeed = { before: 0, after: 0 },
  }) {
    if (!this.printer) {
      throw new Error("No printer initialised");
    }

    const printItem = this.printer
      .lineFeed(lineFeed.before)
      .big(isBig)
      .upsideDown(isFlipped)
      .printText(text)
      .lineFeed(lineFeed.after)
      .big(false);

    return this.queuePrintItem({
      printItem,
      estimatedTimeout: text.length * PRINT_CHARACTER_PER_MILLISECOND,
    });
  }

  async printImage({
    imagePath,
    lineFeed = { before: 0, after: 0 },
  }) {
    if (!this.printer) {
      throw new Error("No printer initialised");
    }

    const printItem = this.printer
      .lineFeed(lineFeed.before)
      .printImage(imagePath)
      .lineFeed(lineFeed.after);

    return this.queuePrintItem({
      printItem,
      estimatedTimeout: 30 * 1000, // 30 seconds
    });
  }
}

module.exports = Printer;
