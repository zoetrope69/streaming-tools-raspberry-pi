const cache = require("memory-cache");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { WEATHER_API_KEY, WEATHER_LOCATION } = process.env;

const CACHE_KEY = "degrees-celcius";
const CACHE_TIMEOUT_MS = 1000 * 60 * 60; // 1 hour

class Weather {
  constructor() {}

  async getDegreesCelcius() {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${WEATHER_LOCATION}`;
    const response = await fetch(url);
    const json = await response.json();

    if (json.error) {
      console.error(json.error);
      return null;
    }

    if (!json.current || !json.current.temp_c) {
      return null;
    }

    return Math.round(json.current.temp_c);
  }

  async getCachedDegreesCelcius() {
    const cachedDegressCelcius = cache.get(CACHE_KEY);

    if (cachedDegressCelcius) {
      return cachedDegressCelcius;
    }

    console.log("Getting new weather info...");
    const degreesCelcius = await this.getDegreesCelcius();
    console.log(`Weather is: ${degreesCelcius}°c`);

    cache.put(CACHE_KEY, degreesCelcius, CACHE_TIMEOUT_MS);

    return degreesCelcius;
  }
}

module.exports = Weather;
