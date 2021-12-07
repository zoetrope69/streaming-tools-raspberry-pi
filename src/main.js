require("dotenv").config();

const { NGROK_URL, PORT } = process.env;

if (!NGROK_URL) {
  return console.error("Missing environment variables.");
}

const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const getIpAddress = require("./getIpAddress.js");
const ditherImage = require("./ditherImage.js");
const Printer = require("./printer.js");

async function pingMainServer() {
  console.log("Pinging main server...");
  const ipAddress = getIpAddress();
  const host = `http://${ipAddress}:${PORT}`;
  const response = await fetch(NGROK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source: "raspberry-pi", host }),
  });

  if (response.status !== 200) {
    console.log(
      "Couldn't ping",
      response.status,
      response.statusText,
    );
    return;
  }

  const json = await response.json();

  console.log("Main server response", json);
}

const app = express();

app.use(express.json());

async function main() {
  const printer = new Printer();

  pingMainServer();
  setInterval(pingMainServer, 10000); // then ping every 10 secs

  app.get("/", async (_request, response) => {
    response.send("Hello World");
  });

  app.post(`/print/image`, async (request, response) => {
    response.json({ success: true });

    const { base64ImageString, isFlipped } = request.body;

    if (base64ImageString) {
      const ditheredImagePath = await ditherImage({
        base64ImageString,
        isFlipped,
      });
      await printer.printImage({ imagePath: ditheredImagePath });
    }
  });

  app.post(`/print/text`, async (request, response) => {
    response.json({ success: true });

    const { text, isFlipped, isBig } = request.body;

    if (text) {
      await printer.printText({ text, isFlipped, isBig });
    }
  });
}
main();

app.listen(PORT, () => {
  console.info(`Listening on http://localhost:${PORT}`);
});
