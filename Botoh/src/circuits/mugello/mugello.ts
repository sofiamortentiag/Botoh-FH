import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const mugello_raw = readFileSync(join(__dirname, "mugello.hbs"), "utf-8");
const mugello_json = JSON.parse(mugello_raw);

const MUGELLO_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: 17,
      maxY: 275,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: 17,
      maxY: 275,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: -799,
      maxX: -769,
      minY: 420,
      maxY: 604,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -314,
      maxX: -284,
      minY: -666,
      maxY: -524,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Autodromo Internazionale del Mugello by Quest",
  boxLine: {
    minX: -470,
    maxX: -61,
    minY: 227,
    maxY: 275,
  },
  pitlaneStart: {
    minX: -853,
    maxX: -823,
    minY: 117,
    maxY: 227,
  },
  pitlaneEnd: {
    minX: 103,
    maxX: 133,
    minY: 117,
    maxY: 227,
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
    x: mugello_json.redSpawnPoints[mugello_json.redSpawnPoints.length - 1][0],
    y: mugello_json.redSpawnPoints[mugello_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.mugello,
  MainColor: [0x009246, 0xffffff, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  physicsType: CircuitPhysics.CLASSIC
};

export const MUGELLO: Circuit = {
  map: mugello_raw,
  info: MUGELLO_INFO,
};
