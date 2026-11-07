import { leagueScuderia } from "../../scuderias/scuderias";

export function handleSeeScuderias(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  let message = "Name | Tag | Series\n-------------------\n";

  for (const scuderiaKey in leagueScuderia) {
    if (Object.prototype.hasOwnProperty.call(leagueScuderia, scuderiaKey)) {
      const scuderia = leagueScuderia[scuderiaKey];
      message += `${scuderia.name} | ${scuderia.tag} | ${scuderia.series ?? "—"}\n`;
    }
  }

  room.sendAnnouncement(message, byPlayer.id);
}
