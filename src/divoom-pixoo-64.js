require("dotenv").config();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const LastFM = require("./lastFm.js");
const Pixoo = require("./pixoo.js");
const Weather = require("./weather.js");
const getAlbumArtColors = require("./getAlbumArtColors.js");
const compareImages = require("./compareImages.js");

const weather = new Weather();
const pixoo = new Pixoo();
const lastFm = new LastFM();

let isPixooInitialised = false;
let isChangingAlbumArt = false;
let currentAlbumArt = "";
let currentTimeString = "";

function getCurrentTimeString() {
  const dateNow = new Date();
  const timeNowHours = dateNow.getHours().toString().padStart(2, "0");
  const timeNowMinutes = dateNow
    .getMinutes()
    .toString()
    .padStart(2, "0");
  const timeNow = `${timeNowHours}:${timeNowMinutes}`;
  return timeNow;
}

async function fetchImageBuffer(imageURL) {
  const response = await fetch(imageURL);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function showCurrentListeningSongs() {
  if (isChangingAlbumArt) {
    return;
  }

  isChangingAlbumArt = true;

  const recentAlbumArt = await lastFm.getRecentAlbumArt();
  const timeString = getCurrentTimeString();

  // if lastfm is broken dont do anything
  if (!recentAlbumArt) {
    isChangingAlbumArt = false;
    return;
  }

  // if album art or time hasnt changed dont do anything
  if (
    recentAlbumArt === currentAlbumArt &&
    timeString === currentTimeString
  ) {
    isChangingAlbumArt = false;
    return;
  }

  // cache time
  currentTimeString = timeString;

  const recentImageBuffer = await fetchImageBuffer(recentAlbumArt);
  const isDefaultImage = await compareImages(
    __dirname + "/lastfm-default-image.png",
    recentImageBuffer,
  );

  if (isDefaultImage) {
    console.log(`${new Date().toISOString()} - No image on LastFM.`);
  } else {
    // cache album art
    currentAlbumArt = recentAlbumArt;
  }

  const imageBuffer = isDefaultImage
    ? await fetchImageBuffer(currentAlbumArt)
    : recentImageBuffer;

  const { averageColor, highestContrastColor } =
    await getAlbumArtColors(imageBuffer);
  const textColor = highestContrastColor || [255, 255, 255];
  const backgroundColor = highestContrastColor
    ? averageColor
    : [0, 0, 0];

  console.log(
    `${new Date().toISOString()} - Drawing new image: ${recentAlbumArt}`,
  );

  // draw album art
  await pixoo.drawImage(imageBuffer);

  // draw degrees with background
  const degreesCelcius = await weather.getCachedDegreesCelcius();
  if (degreesCelcius) {
    await pixoo.drawRect([0, 64 - 7], [13, 7], backgroundColor);
    await pixoo.drawText(`${degreesCelcius}°`, [1, 58], textColor);
  }

  // draw time with background
  await pixoo.drawRect([43, 64 - 7], [21, 7], backgroundColor);
  await pixoo.drawText(currentTimeString, [44, 58], textColor);

  // paint to pixoo
  await pixoo.paint();

  isChangingAlbumArt = false;

  console.log("Drawn!");
}

pixoo.init().then(() => {
  if (!isPixooInitialised) {
    isPixooInitialised = true;
    showCurrentListeningSongs();
    setInterval(() => {
      showCurrentListeningSongs();
    }, 10000); // every 10 secs
  }
});
