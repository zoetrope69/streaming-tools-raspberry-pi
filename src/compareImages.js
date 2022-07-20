const jimp = require("jimp");

async function compareImages(imageAData, imageBData) {
  const imageA = await jimp.read(imageAData);
  const imageB = await jimp.read(imageBData);

  const diff = jimp.diff(imageA, imageB); // Pixel difference

  return diff.percent === 0;
}

module.exports = compareImages;
