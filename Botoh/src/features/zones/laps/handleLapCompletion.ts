import {
  generalGameMode,
  GeneralGameMode,
  gameMode,
  GameMode,
} from "../../changeGameState/changeGameModes";
import { playerList } from "../../changePlayerState/playerList";
import { handleBattleRoyaleLap } from "../../commands/gameMode/battleRoyale.ts/handleBattleRoyaleLaps";
import { updatePositionList } from "../../commands/gameMode/race/positionList";
import { checkBlueFlag } from "../handleSectorChange";
import { processCompletedLap } from "./processCompleteLap";
import { resetLapData } from "./resetLapData";
import { isWecFinishPhase, wecFinishOrder } from "../../changeGameState/EndRaceSession";
import { changeGameStoppedNaturally } from "../../changeGameState/gameStopeedNaturally";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import { refreshStandingsHtml } from "../../commands/gameMode/race/standingsRefresh";
import { positionList } from "../../commands/gameMode/race/positionList";
import { Teams } from "../../changeGameState/teams";

export function handleLapCompletion(
  pad: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  },
  room: RoomObject,
  hasSector: boolean,
  players: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  }[],
) {
  const p = pad.p;
  const data = playerList[p.id];

  const currentLap = ++data.currentLap;
  data.lapChanged = true;

  if (currentLap > 1) {
    processCompletedLap(pad, room, hasSector);
  }

  resetLapData(data, p.id, room);

  if (gameMode === GameMode.BATTLE_ROYALE) {
    handleBattleRoyaleLap(p, room);
    return;
  }
  if (
    generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
    gameMode !== GameMode.TRAINING
  ) {
    updatePositionList(players, room);
    checkBlueFlag(p, room);
  }

  if (gameMode === GameMode.WEC && isWecFinishPhase() && !wecFinishOrder.includes(p.id)) {
    wecFinishOrder.push(p.id);
    updatePositionList(players, room);
    room.setPlayerTeam(p.id, Teams.SPECTATORS);
    const finishedEntry = positionList.find((entry) => entry.id === p.id);
    if (finishedEntry) finishedEntry.active = false;
    updatePositionList(getRunningPlayers(getPlayerAndDiscs(room)), room);
    refreshStandingsHtml();
    room.sendAnnouncement(
      `🏁 ${p.name} terminó en P${wecFinishOrder.length}.`,
      undefined,
      0xffd700,
      "bold",
    );

    // Check after the team-change callback has had time to update the room's
    // player list. This also covers the final driver in solo sessions.
    setTimeout(() => {
      const hasRemainingDrivers = room
        .getPlayerList()
        .some((player) => player.team === Teams.RUNNERS);
      if (!hasRemainingDrivers && room.getScores() !== null) {
        // WEC must publish the classification instead of entering public flow.
        changeGameStoppedNaturally(false);
        room.stopGame();
      }
    }, 100);
  }
}
