/**
 * Editorial music discovery metadata for Creamfields Chile 2026.
 * Genres are indicative, NOT official artist classifications. Empty means unverified.
 * Images: only third-party files with a checked Commons license; never Spotify CDN photos.
 */
export const STYLE_OPTIONS = [
  { key: "techno", label: "Techno" },
  { key: "hard-techno", label: "Hard Techno" },
  { key: "house", label: "House" },
  { key: "tech-house", label: "Tech House" },
  { key: "melodic", label: "Melodic" },
  { key: "edm", label: "EDM / Big Room" },
  { key: "hardstyle", label: "Hardstyle" },
  { key: "bass", label: "Bass / Dubstep" },
  { key: "latin-house", label: "Latin House" },
  { key: "trance", label: "Trance" }
] as const;

export type MusicStyle = (typeof STYLE_OPTIONS)[number]["key"];
export type Attendance = "voy" | "talvez" | "no";
export const MUSIC_STYLES: Partial<Record<string, MusicStyle[]>> = {
  "CALVIN HARRIS": ["edm", "house"],
  "CHARLOTTE DE WITTE": ["techno"],
  "FISHER": ["tech-house", "house"],
  "HARDWELL": ["edm"],
  "HUGEL": ["latin-house", "house"],
  "BORIS BREJCHA": ["techno", "melodic"],
  "LOST FREQUENCIES": ["house", "edm"],
  "LP GIOBBI": ["house"],
  "MORTEN": ["edm", "techno"],
  "DON DIABLO": ["edm", "house"],
  "JONAS BLUE": ["house", "edm"],
  "TWO FRIENDS": ["edm"],
  "MATTN": ["edm"],
  "BASSJACKERS": ["edm"],
  "LOUD LUXURY": ["house"],
  "BRUNO MARTINI": ["house", "edm"],
  "JADEN BOJSEN": ["house"],
  "AARON HIBELL": ["trance", "melodic"],
  "INNELLEA": ["melodic", "techno"],
  "KÖLSCH": ["melodic", "techno"],
  "NIC FANCIULLI": ["tech-house", "house"],
  "SOSA": ["tech-house"],
  "FAITHLESS SOUND SYSTEM": ["house", "trance"],
  "ÂME LIVE": ["melodic", "house"],
  "ANFISA LETYAGO": ["techno"],
  "ENRICO SANGIULIANO": ["techno"],
  "CLARA CUVÉ": ["hard-techno", "techno"],
  "CHARLIE SPARKS": ["hard-techno"],
  "AZYR": ["hard-techno"],
  "CRISTOBAL PESCE": ["hard-techno", "techno"],
  "YANAMASTE": ["techno", "hard-techno"],
  "YANAMASTE LIVE": ["techno", "hard-techno"],
  "VIRTUAL RIOT": ["bass"],
  "BASS MODULATORS": ["hardstyle"],
  "MUTILATOR": ["hardstyle"],
  "BRENNAN HEART": ["hardstyle"],
  "WARFACE": ["hardstyle"],
  "THE STRAIKERZ": ["hardstyle"]
};
export function getStyles(artist: string): MusicStyle[] {
  return MUSIC_STYLES[artist.toUpperCase()] ?? [];
}
export type LicensedArtistImage = {
  url: string;
  filePage: string;
  credit: string;
  license: string;
  licenseUrl: string;
  crop: boolean;
};
export const LICENSED_ARTIST_IMAGES: Record<string, LicensedArtistImage> = {
  "CHARLOTTE DE WITTE": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Charlotte_de_Witte_(2026).jpg?width=700",
    filePage: "https://commons.wikimedia.org/wiki/File:Charlotte_de_Witte_(2026).jpg",
    credit: "Joost Pauwels",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    crop: true
  },
  "BORIS BREJCHA": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Boris_brejcha_2017_03_12.jpg?width=700",
    filePage: "https://commons.wikimedia.org/wiki/File:Boris_brejcha_2017_03_12.jpg",
    credit: "Gauvain",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    crop: true
  },
  "CALVIN HARRIS": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/CalvinharrisDJ.jpg?width=700",
    filePage: "https://commons.wikimedia.org/wiki/File:CalvinharrisDJ.jpg",
    credit: "BitchBuzz",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    crop: true
  },
  "HARDWELL": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Hardwell.jpg?width=700",
    filePage: "https://commons.wikimedia.org/wiki/File:Hardwell.jpg",
    credit: "Mox",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    crop: true
  }
};
export const STAGE_META: Record<string, { label: string; accent: string; description: string }> = {
  "MAIN STAGE": { label: "MAIN", accent: "#bbfc66", description: "Grandes headliners y electrónica masiva" },
  "A STAGE": { label: "A STAGE", accent: "#71e4ff", description: "EDM, house y sonidos de festival" },
  "ALTERNATIVE": { label: "ALTERNATIVE", accent: "#ff73d7", description: "Bass y sonidos de alto impacto" },
  "HE.SHE.THEY": { label: "HE.SHE.THEY", accent: "#ffad78", description: "Techno y sonidos intensos" },
  "RADIO CAROLINA": { label: "RADIO CAROLINA", accent: "#d2b5ff", description: "Escena local y propuestas variadas" },
  "GRIETA X PANAL RECORDS": { label: "GRIETA X PANAL", accent: "#f2b168", description: "Curaduría electrónica alternativa" },
  "CREAM": { label: "CREAM", accent: "#7eebbc", description: "House y electrónica de club" },
  "FERAL": { label: "FERAL", accent: "#a18cff", description: "Techno, melodic y live" }
};
export function spotifyArtistSearch(artist: string) {
  return "https://open.spotify.com/search/" + encodeURIComponent(artist);
}
export function spotifyPlaylistSearch(artist: string) {
  return "https://open.spotify.com/search/" + encodeURIComponent(artist + " playlist");
}
export function soundcloudSetSearch(artist: string) {
  return "https://soundcloud.com/search/sets?q=" + encodeURIComponent(artist);
}

/**
 * Verified open-use informational artist wordmarks. Logos can retain trademark
 * protections even if the file is CC0 or PD-textlogo. Attribution and source
 * pages remain visible; do not imply the artist endorses TrackDJs.
 */
export type OpenArtistLogo = {
  url: string;
  sourcePage: string;
  author: string;
  license: string;
  licenseUrl: string;
  trademarkNotice: boolean;
};
export const OPEN_ARTIST_LOGOS: Partial<Record<string, OpenArtistLogo>> = {
  "CALVIN HARRIS": {
    url:"https://commons.wikimedia.org/wiki/Special:FilePath/Calvin_Harris_logo2.png?width=500",
    sourcePage:"https://commons.wikimedia.org/wiki/File:Calvin_Harris_logo2.png",
    author:"calvinharris.com (subido a Wikimedia Commons)",
    license:"CC0 1.0",
    licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",
    trademarkNotice:true
  },
  "HARDWELL": {
    url:"https://commons.wikimedia.org/wiki/Special:FilePath/Hardwell_Logo.png?width=500",
    sourcePage:"https://commons.wikimedia.org/wiki/File:Hardwell_Logo.png",
    author:"Hardwell",
    license:"PD-textlogo (figuras y tipografía simples)",
    licenseUrl:"https://commons.wikimedia.org/wiki/Commons:Threshold_of_originality",
    trademarkNotice:true
  }
};
