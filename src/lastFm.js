const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { LAST_FM_API_KEY, LAST_FM_USERNAME } = process.env;

class LastFm {
  constructor() {}

  async getRecentTracks() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LAST_FM_USERNAME}&api_key=${LAST_FM_API_KEY}&format=json`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.recenttracks) {
      return null;
    }

    return json.recenttracks.track;
  }

  async getRecentAlbumArt() {
    const recentTracks = await this.getRecentTracks();

    if (!recentTracks || recentTracks.length === 0) {
      return null;
    }

    const recentTrack = recentTracks[0];

    if (
      !recentTrack ||
      !Object.prototype.hasOwnProperty.call(recentTrack, "image")
    ) {
      return null;
    }

    const albumArt = recentTrack.image.find(
      (i) => i.size === "large",
    );

    if (!albumArt || albumArt["#text"] === "") {
      return null;
    }

    return albumArt["#text"];
  }
}

module.exports = LastFm;
