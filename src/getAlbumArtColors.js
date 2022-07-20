const { getAverageColor } = require("fast-average-color-node");
const getColors = require("get-image-colors");
const chroma = require("chroma-js");
const imageType = require("image-type");

function getHighestContrastColor({ averageColor, colors }) {
  const sortedContrastColors = colors.sort((a, b) => {
    const aContrast = chroma.contrast(averageColor, a);
    const bContrast = chroma.contrast(averageColor, b);
    return aContrast > bContrast ? 1 : -1;
  });

  const [highestContrastColor] = sortedContrastColors;

  if (chroma.contrast(averageColor, highestContrastColor) > 5) {
    return highestContrastColor.rgb();
  }

  if (chroma.contrast(averageColor, [0, 0, 0]) > 5) {
    return [0, 0, 0];
  }

  if (chroma.contrast(averageColor, [255, 255, 255]) > 5) {
    return [255, 255, 255];
  }

  return null;
}

async function getAlbumArtColors(imageBuffer) {
  const { mime } = imageType(imageBuffer);

  const { rgb } = await getAverageColor(imageBuffer);
  const averageColor = chroma(rgb);
  const colors = await getColors(imageBuffer, mime);

  const highestContrastColor = getHighestContrastColor({
    averageColor,
    colors,
  });

  return {
    averageColor: averageColor.rgb(),
    highestContrastColor,
  };
}

module.exports = getAlbumArtColors;
