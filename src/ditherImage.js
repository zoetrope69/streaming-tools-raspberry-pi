const { v4: randomUUID } = require("uuid");
const gm = require("gm");

const {
  base64StrippedStringAndContentType,
} = require("./helpers.js");

const PRINT_WIDTH = 384;

async function ditherImage({ base64ImageString, isFlipped }) {
  return new Promise((resolve, reject) => {
    console.log("Dithering image...");

    if (!base64ImageString) {
      return reject("Missing `base64ImageString`");
    }

    const { string: imageString, contentType } =
      base64StrippedStringAndContentType(base64ImageString);

    const imageFilename = `${randomUUID()}.${contentType}`;
    const imagePath = `${__dirname}/../images/${imageFilename}`;

    gm(Buffer.from(imageString, "base64"), imageFilename)
      .resize(PRINT_WIDTH - 4, PRINT_WIDTH - 4)

      // make the image cripser, black and white and then dither
      .sharpen(5)
      .monochrome()

      .dither()

      // center on a white background the size of the printer paper
      .gravity("Center")
      .extent(PRINT_WIDTH, PRINT_WIDTH)

      // finally rotate, depending on the orientation of the printer
      .rotate("#fff", isFlipped ? 180 : 0)

      .write(imagePath, (error) => {
        if (error) {
          return reject(error);
        }

        resolve(imagePath);
      });
  });
}

module.exports = ditherImage;
