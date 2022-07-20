const Divoom = require("pixoo");

const { PIXOO_IP_ADDRESS } = process.env;
const PIXOO_GRID_SIZE = 64;

class Pixoo {
  constructor() {
    this.pixoo = new Divoom.Pixoo(PIXOO_IP_ADDRESS, PIXOO_GRID_SIZE);
  }

  async init() {
    try {
      console.log("Initialising Pixoo...");
      await this.pixoo.init();
      console.log("Pixoo ready!");
    } catch (e) {
      throw new Error("Can't access Pixoom...");
    }
  }

  async paint(...args) {
    try {
      return this.pixoo.drawBuffer(...args);
    } catch (e) {
      console.error(e);
      console.error("Can't paint to Pixoom...");
    }
  }

  async drawText(...args) {
    return this.pixoo.drawText(...args);
  }

  async drawRect(pos, widthHeight, rgb) {
    const [width, height] = widthHeight;
    const [xPos, yPos] = pos;
    for (let x = xPos; x < width + xPos; x++) {
      for (let y = yPos; y < height + yPos; y++) {
        this.pixoo.drawPixel([x, y], rgb);
      }
    }
  }

  async drawImage(imageBuffer) {
    await this.pixoo.drawImage(
      imageBuffer,
      [0, 0],
      "bicubicInterpolation",
    );
  }
}

module.exports = Pixoo;
