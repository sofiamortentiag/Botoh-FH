import { Teams } from "../../../../changeGameState/teams";
import { sendChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
import { printAllPositions } from "../../../../commands/gameMode/race/printAllPositions";
import { gameMode, GameMode } from "../../../../changeGameState/changeGameModes";
import { laps } from "../../../laps";

export function notifySpectatorsCurrentLap(
  room: RoomObject,
  currentLap: number,
  pad: { p: PlayerObject; disc: DiscPropertiesObject }[],
) {
  pad
    .filter((pla) => pla.p.team !== Teams.RUNNERS)
    .forEach((pla) => {
      sendChatMessage(
        room,
        gameMode === GameMode.WEC
          ? MESSAGES.WEC_CURRENT_LAP(currentLap)
          : MESSAGES.CURRENT_LAP(currentLap, laps),
        pla.p.id,
      );
      printAllPositions(room, pla.p.id, false);
    });
}
