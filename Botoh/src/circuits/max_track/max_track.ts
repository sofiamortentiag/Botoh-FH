import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const max_track_raw = readFileSync(join(__dirname, "max_track.hbs"), "utf-8");
const max_track_json = JSON.parse(max_track_raw);

const MAX_TRACK_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: -180,
      maxY: -24,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: -180,
      maxY: -24,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1212,
      maxX: 1430,
      minY: -1630,
      maxY: -1600,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -540,
      maxX: -510,
      minY: -752,
      maxY: -549,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Max VS 100 Silverstone Layout By Nanoseb",
  boxLine: {
    minX: -200,
    maxX: 440,
    minY: 118,
    maxY: 196,
  },
  pitlaneStart: {
    minX: -200,
    maxX: -170,
    minY: 118,
    maxY: 196,
  },
  pitlaneEnd: {
    minX: 410,
    maxX: 440,
    minY: 118,
    maxY: 196,
  },
  drsStart: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  drsEnd: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  checkpoints: [],
  lastPlace: {
    x: max_track_json.redSpawnPoints[max_track_json.redSpawnPoints.length - 1][0],
    y: max_track_json.redSpawnPoints[max_track_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.max_track,
  MainColor: [0xae1c28, 0xffffff, 0x21468b],
  AvatarColor: 0x000001,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  physicsType: CircuitPhysics.CLASSIC
};

export const MAX_TRACK: Circuit = {
  map: max_track_raw,
  info: MAX_TRACK_INFO,
};
