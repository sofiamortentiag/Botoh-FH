

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const interlagosWec_raw = readFileSync(join(__dirname, "interlagosWec.hbs"), "utf-8");
const interlagosWec_json = JSON.parse(interlagosWec_raw);




const INTERLAGOSWEC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: -322,
      maxY: -13,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: -322,
      maxY: -13,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: -120,
      maxX: -90,
      minY: -2225,
      maxY: -1763,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -1500,
      maxX: -900,
      minY: -1583,
      maxY: -1553,
    },
    passingDirection: Direction.UP,
  },
  name: "Autodromo Jose Carlos Pace - New Gen By Nanoseb",
  boxLine: {
    minX: -599,
    maxX: 341,
    minY: -322,
    maxY: -266,
  },
  pitlaneStart: {
    minX: -713,
    maxX: -683,
    minY: -266,
    maxY: -210,
  },
  pitlaneEnd: {
    minX: 341,
    maxX: 371,
    minY: -266,
    maxY: -210,
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
    x: interlagosWec_json.redSpawnPoints[
      interlagosWec_json.redSpawnPoints.length - 1
    ][0],
    y: interlagosWec_json.redSpawnPoints[
      interlagosWec_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.interlagosWec,
  MainColor: [0x10a100, 0xffff00, 0x10a100],
  AvatarColor: 0x00008c,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  physicsType: CircuitPhysics.FH_NEWGEN,
    CutDetectSegments: 
  [
  {
    v0: [710.7338820301784,-255.48696844993145],
    v1: [851.3374485596709,-262.3456790123457],
    index: 169,
    penalty: 5
  },
  {
    v0: [812.9808000000003,-547.0416000000001],
    v1: [1216.5552000000005,-482.88960000000014],
    index: 170,
    penalty: 5
  },
  {
    v0: [1018.4867652288777,-904.9687547629935],
    v1: [1063.7352029670274,-900.2057613168724],
    index: 171,
    penalty: 5
  },
  {
    v0: [955.0754458161866,-804.1838134430728],
    v1: [978.2235939643348,-780.1783264746228],
    index: 172,
    penalty: 5
  },
  {
    v0: [961.3308438754256,-1467.7958136462937],
    v1: [897.0304323527918,-1366.9791190367323],
    index: 173,
    penalty: 5
  },
  {
    v0: [-727.0000000000001,-2012.0000000000005],
    v1: [-665.0000000000001,-1989.0000000000005],
    index: 174,
    penalty: 5
  },
  {
    v0: [-777.6000000000001,-1818.7200000000005],
    v1: [-732.2400000000001,-1801.4400000000005],
    index: 175,
    penalty: 5
  },
  {
    v0: [-172.8,-706.32],
    v1: [32.400000000000006,-621.0000000000001],
    index: 176,
    penalty: 5
  },
  {
    v0: [-172.8,-706.32],
    v1: [-22.680000000000007,-531.3600000000001],
    index: 177,
    penalty: 5
  },
  {
    v0: [-172.8,-706.32],
    v1: [-598.3200000000002,-601.5600000000002],
    index: 178,
    penalty: 5
  },
  {
    v0: [-1302.8688000000004,-875.9664000000002],
    v1: [-541.2096000000001,-1150.0704000000003],
    index: 179,
    penalty: 5
  },
  {
    v0: [-541.2096000000001,-1150.0704000000003],
    v1: [-805.9824000000002,-1092.9168000000004],
    index: 180,
    penalty: 5
  },
  {
    v0: [-805.9824000000002,-1092.9168000000004],
    v1: [-787.3200000000003,-1136.0736000000004],
    index: 181,
    penalty: 5
  },
  {
    v0: [-1481.5724774400007,-1116.9614361600006],
    v1: [-1487.0144332800007,-1658.436042240001],
    index: 182,
    penalty: 5
  },
  {
    v0: [-1481.5724774400007,-1116.9614361600006],
    v1: [-1755.0307584000009,-1359.1284710400007],
    index: 183,
    penalty: 5
  },
  {
    v0: [-1481.5724774400007,-1116.9614361600006],
    v1: [-1763.1936921600009,-1315.5928243200005],
    index: 184,
    penalty: 5
  },
  {
    v0: [-1481.5724774400007,-1116.9614361600006],
    v1: [-1125.1243699200006,-1291.1040230400006],
    index: 185,
    penalty: 5
  },
  {
    v0: [-1481.5724774400007,-1116.9614361600006],
    v1  : [-1111.5194803200006,-1167.2995276800007],
    index: 186,
    penalty: 5
  },
  {
    v0: [-2050.8111360000007,-1842.9586560000007],
    v1: [-1706.9097600000007,-1724.5457280000007],
    index: 187,
    penalty: 5
  },
  {
    v0: [-2050.8111360000007,-1842.9586560000007],
    v1: [-1830.3615360000008,-1567.0817280000006],
    index: 188,
    penalty : 5
  }
],
};

export const INTERLAGOSWEC: Circuit = {
  map: interlagosWec_raw,
  info: INTERLAGOSWEC_INFO,
};
