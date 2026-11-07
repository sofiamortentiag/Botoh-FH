import { qualiTime, raceTime } from "../commands/gameMode/qualy/qualiMode";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { getRunningPlayers } from "../utils";
import {
  gameMode,
  GameMode,
  GeneralGameMode,
  generalGameMode,
} from "./changeGameModes";
import { changeGameStoppedNaturally } from "./gameStopeedNaturally";
import { Teams } from "./teams";

let wecFinishPhase = false;
export const wecFinishOrder: number[] = [];

export function isWecFinishPhase() {
  return wecFinishPhase;
}

export function startWecFinishPhase(room: RoomObject) {
  if (wecFinishPhase) return;
  wecFinishPhase = true;
  room.sendAnnouncement(
    "🏁 Tiempo cumplido: completen la vuelta y crucen la meta para quedar clasificados.",
    undefined,
    0xffd700,
    "bold",
  );
}

export function resetWecFinishPhase() {
  wecFinishPhase = false;
  wecFinishOrder.splice(0, wecFinishOrder.length);
}

export function endRaceSession(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject,
) {
  const players = getRunningPlayers(playersAndDiscs);
  const scores = room.getScores();

  const shouldStopForNoPlayers =
    scores !== null &&
    players.length === 0 &&
    gameMode !== GameMode.TRAINING &&
    gameMode !== GameMode.HARD_QUALY;

  const shouldStopForTimeLimit =
    (
      !LEAGUE_MODE ||
      gameMode === GameMode.WEC
    ) &&
    (
      (generalGameMode === GeneralGameMode.GENERAL_QUALY &&
        scores?.time > qualiTime * 60) ||
      (gameMode !== GameMode.WEC &&
        generalGameMode === GeneralGameMode.GENERAL_RACE &&
        raceTime > 0 && raceTime !== Number.MAX_VALUE &&
        scores?.time > raceTime * 60)
    );

  if (
    gameMode === GameMode.WEC &&
    isWecFinishPhase() &&
    !room.getPlayerList().some((player) => player.team === Teams.RUNNERS)
  ) {
    changeGameStoppedNaturally(false);
    setTimeout(() => {
      if (
        room.getScores() !== null &&
        !room.getPlayerList().some((player) => player.team === Teams.RUNNERS)
      ) {
        room.stopGame();
      }
    }, 100);
    return;
  }

  if (
    gameMode === GameMode.WEC &&
    generalGameMode === GeneralGameMode.GENERAL_RACE &&
    raceTime > 0 &&
    raceTime !== Number.MAX_VALUE &&
    scores?.time >= raceTime * 60
  ) {
    startWecFinishPhase(room);
    return;
  }

  if (shouldStopForNoPlayers || shouldStopForTimeLimit) {
    changeGameStoppedNaturally(true);
    room.stopGame();
  }
}

