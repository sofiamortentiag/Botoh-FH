import { endRaceSession } from '../changeGameState/EndRaceSession';
import { distributeSpeed } from '../speed/distributrSpeed';
import { updateErs } from '../speed/fuel&Ers/ers';
import { checkPlayerSector } from '../zones/handleSectorChange';

import { handlePitlane } from '../tires&pits/pitLane';
import { getRunningPlayers, vectorSpeed } from '../utils';
import { updateGripCounter } from '../speed/grip/grip';
import handleTireWear from '../tires&pits/handleTireWear';
import { getPlayerAndDiscs } from '../playerFeatures/getPlayerAndDiscs';
import {
  handleChangeCollisionPlayerSuzuka,
  handleChangePlayerSizeSuzuka,
} from '../zones/handleSuzukaTp';
import { afkKick } from '../afk/afk';
import { setBallPosition } from '../cameraAndBall/setBallPosition';
import { detectPitPerTick } from '../tires&pits/performPitStop';
import { detectCut } from '../detectCut/detectCut';
import { GameMode, gameMode } from '../changeGameState/changeGameModes';
import { kickIfQualyTimeEnded } from '../commands/gameMode/qualy/hardQualyFunctions';
import { checkTireStatus } from '../tires&pits/tireBlowManager';
import { mainLapCommand } from '../zones/laps/mainLapCommands';
import { checkTrainingHourlyLog } from '../counters/checkTrainingHourlyLog';
import { updateDebrisTouch } from '../debris/detectCollisionDebris';
import { handleChangeCollisionPlayerCano, handleChangePlayerSizeCano } from '../zones/handleCanoTp';
import { GeneralGameMode, generalGameMode } from '../changeGameState/changeGameModes';
import { updatePositionList } from '../commands/gameMode/race/positionList';
import { refreshLiveStandingsApi } from '../commands/gameMode/race/standingsHtml';
import { captureLiveRaceData } from '../commands/gameMode/race/liveRaceState';

const detectCutThrottledByPlayer: Map<number, ReturnType<typeof throttlePerSecond>> = new Map();
let lastLiveTimingSampleAt = 0;
const LIVE_TIMING_SAMPLE_INTERVAL_MS = 1000;

export let gameStarted = false;
export function setGameStarted(value: boolean) {
  gameStarted = value;
}

export function GameTick(room: RoomObject) {
  room.onGameTick = function () {
    const playersAndDiscs = getPlayerAndDiscs(room);
    const players = getRunningPlayers(playersAndDiscs);

    endRaceSession(playersAndDiscs, room);
    updateGripCounter(playersAndDiscs);
    updateErs(playersAndDiscs, room);
    setBallPosition(room);
    checkTrainingHourlyLog();
    updateDebrisTouch(room);

    if (gameMode !== GameMode.WAITING) {
      handlePitlane(playersAndDiscs, room);
      distributeSpeed(playersAndDiscs, room);
      checkPlayerSector(playersAndDiscs, room);
      mainLapCommand(playersAndDiscs, room);
    }

    players.forEach((pad) => {
      const p = pad.p;
      handleTireWear(p, room);
      checkTireStatus(p, room);

      handleChangePlayerSizeSuzuka(pad, room);
      handleChangePlayerSizeCano(pad, room);
      handleChangeCollisionPlayerSuzuka(pad, room);
      handleChangeCollisionPlayerCano(pad, room);
      detectPitPerTick(pad, room);

      if (!detectCutThrottledByPlayer.has(pad.p.id)) {
        detectCutThrottledByPlayer.set(pad.p.id, throttlePerSecond(detectCut, 20));
      }
      detectCutThrottledByPlayer.get(pad.p.id)!(pad, room);

      if (gameMode === GameMode.HARD_QUALY) {
        kickIfQualyTimeEnded(room, p);
      }

      // updatePreviousPos(pad, p);
    });

    const now = Date.now();
    if (
      now - lastLiveTimingSampleAt >= LIVE_TIMING_SAMPLE_INTERVAL_MS &&
      (generalGameMode === GeneralGameMode.GENERAL_RACE ||
        generalGameMode === GeneralGameMode.GENERAL_QUALY)
    ) {
      lastLiveTimingSampleAt = now;
      captureLiveRaceData(playersAndDiscs, room);
      if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
        updatePositionList(players, room, false);
      }
      refreshLiveStandingsApi();
    }

    afkKick(room);

    if (room.getScores()?.time && room.getScores().time > 0) {
      gameStarted = true;
    }
  };
}

export function throttlePerSecond<T extends any[]>(fn: (...args: T) => void, perSecond: number) {
  const tickInterval = Math.floor(60 / perSecond);
  let tickCount = 0;

  return (...args: T) => {
    tickCount++;
    if (tickCount >= tickInterval) {
      tickCount = 0;
      fn(...args);
    }
  };
}
