import { playerList } from "../../../../changePlayerState/playerList";
import { sendChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
import { processIfMinimumPitStopsMet } from "../../../../tires&pits/minimumPit";
import { gameMode, GameMode } from "../../../../changeGameState/changeGameModes";
import { laps } from "../../../laps";

export function notifyCurrentLapAndPitInfo(
  p: PlayerObject,
  room: RoomObject,
  currentLap: number
) {
  sendChatMessage(
    room,
    gameMode === GameMode.WEC
      ? MESSAGES.WEC_CURRENT_LAP(currentLap)
      : MESSAGES.CURRENT_LAP(currentLap, laps),
    p.id,
  );

  // Minimum pit requirements are expressed in remaining laps, so they do not
  // apply to the timed WEC format.
  if (gameMode !== GameMode.WEC) {
    const data = playerList[p.id];
    processIfMinimumPitStopsMet(p, currentLap, laps, data.pits.pitsNumber, room);
  }
}
