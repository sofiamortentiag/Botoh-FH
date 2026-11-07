import { playerList, PlayerInfo } from "../../../changePlayerState/playerList";
import { resetPlayer } from "../../../changePlayerState/players";
import { GameMode, gameMode, generalGameMode, GeneralGameMode } from "../../../changeGameState/changeGameModes";
import { Teams } from "../../../changeGameState/teams";
import { getPlayerScuderia } from "../../scuderia/getScuderia";
import { getPlayerAndDiscs } from "../../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../../utils";
import { updatePositionList, positionList } from "../race/positionList";
import { ifInBoxZone } from "../../../tires&pits/pitLane";
import { lapPositions } from "../../../zones/laps/handleLapChange";
import { transferLapCsvHistory } from "../../../changePlayerState/lapRecorder";
import { transferBestLapToDriver } from "../../../zones/laps/trackBestLap";
import { handleAvatar, Situacions } from "../../../changePlayerState/handleAvatar";
import { isWecFinishPhase } from "../../../changeGameState/EndRaceSession";

function copyRaceState(source: PlayerInfo, target: PlayerInfo, targetDisc: DiscPropertiesObject): PlayerInfo {
  return {
    ...source,
    // Identity and personal preferences belong to the driver, not the car.
    ip: target.ip,
    isInTheRoom: target.isInTheRoom,
    afk: target.afk,
    afkAlert: target.afkAlert,
    leagueScuderia: target.leagueScuderia,
    showTires: target.showTires,
    language: target.language,
    everyoneLaps: target.everyoneLaps,
    voted: target.voted,
    cameraFollowing: target.cameraFollowing,
    timeWhenEntered: target.timeWhenEntered,
    lapTimes: [...source.lapTimes],
    bestTimeWithTeam: source.bestTimeWithTeam.map((entry) => ({ ...entry })),
    sectorTime: [...source.sectorTime],
    bestSectorTimes: [...source.bestSectorTimes] as [number, number, number],
    pits: {
      pitsNumber: source.pits.pitsNumber,
      pit: source.pits.pit.map((entry) => ({ ...entry })),
    },
    pitFailures: source.pitFailures
      ? {
          ...source.pitFailures,
          tyres: [...source.pitFailures.tyres],
          perTyreTimes: [...source.pitFailures.perTyreTimes],
        }
      : undefined,
    alertSent: { ...source.alertSent },
    previousPos: { x: targetDisc.x, y: targetDisc.y },
    // A switch is only allowed after the active service has finished.
    inPitlane: true,
    inPitStop: false,
    pitCountdown: 0,
    pitTargetTires: source.tires,
    pitInitialPos: undefined,
    pitSteps: undefined,
    boxAlert: false,
    drs: false,
    slipstreamEndTime: undefined,
    finalSlipstream: 0,
  };
}

export function handleDriverChangeCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  const fail = (message: string) =>
    room.sendAnnouncement(message, byPlayer.id, 0xff5555);

  if (!byPlayer.admin) {
    fail("Solo un administrador puede realizar un relevo.");
    return;
  }
  if (gameMode !== GameMode.WEC || generalGameMode !== GeneralGameMode.GENERAL_RACE || !room.getScores()) {
    fail("El relevo solo está disponible durante una carrera WEC.");
    return;
  }
  if (isWecFinishPhase()) {
    fail("La carrera ya está en la vuelta de llegada; no se pueden hacer más relevos.");
    return;
  }
  if (args.length < 2) {
    fail("Uso: !relevo <id piloto que sale> <id piloto que entra>");
    return;
  }

  const outgoingId = Number(args[0]);
  const incomingId = Number(args[1]);
  if (!Number.isInteger(outgoingId) || !Number.isInteger(incomingId) || outgoingId === incomingId) {
    fail("Indica dos IDs de piloto distintos. Uso: !relevo <sale> <entra>");
    return;
  }

  const drivers = getPlayerAndDiscs(room);
  const outgoing = drivers.find(({ p, disc }) => p.id === outgoingId && p.team === Teams.RUNNERS && disc !== null);
  const incoming = drivers.find(({ p, disc }) => p.id === incomingId && p.team === Teams.RUNNERS && disc !== null);
  if (!outgoing || !incoming) {
    fail("Ambos pilotos deben estar en pista como corredores activos.");
    return;
  }
  if (!ifInBoxZone(outgoing, room) || !ifInBoxZone(incoming, room)) {
    fail("Ambos pilotos deben estar físicamente dentro del box para hacer el relevo.");
    return;
  }

  const outgoingData = playerList[outgoingId];
  const incomingData = playerList[incomingId];
  if (!outgoingData || !incomingData) {
    fail("No se pudo leer el estado de carrera de uno de los pilotos.");
    return;
  }
  const outgoingTeam = getPlayerScuderia(outgoingData);
  const incomingTeam = getPlayerScuderia(incomingData);
  if (!outgoingTeam || !incomingTeam || outgoingData.leagueScuderia !== incomingData.leagueScuderia) {
    fail("Los dos pilotos deben tener asignado el mismo equipo.");
    return;
  }
  if (outgoingData.inPitStop || incomingData.inPitStop) {
    fail("Termina el servicio de boxes antes de realizar el relevo.");
    return;
  }

  // Transfer all car/race state before moving the outgoing driver to spectators,
  // since the team-change hook resets that driver's state.
  playerList[incomingId] = copyRaceState(outgoingData, incomingData, incoming.disc);
  handleAvatar(Situacions.ChangeTyre, incoming.p, room);
  transferLapCsvHistory(outgoingId, incomingId, incoming.p.name);
  transferBestLapToDriver(outgoing.p.name, incoming.p.name);

  for (const lap of lapPositions) {
    for (let index = lap.length - 1; index >= 0; index--) {
      if (lap[index].id === incomingId) lap.splice(index, 1);
    }
    for (const position of lap) {
      if (position.id === outgoingId) {
        position.id = incomingId;
        position.name = incoming.p.name;
      }
    }
  }

  // Keep the outgoing car's exact live rank. Re-adding the incoming driver at
  // the end can move the car down when two entries are tied on lap/sector/time.
  for (let index = positionList.length - 1; index >= 0; index--) {
    if (positionList[index].id === incomingId) positionList.splice(index, 1);
  }
  const outgoingPosition = positionList.find((entry) => entry.id === outgoingId);
  if (outgoingPosition) {
    outgoingPosition.id = incomingId;
    outgoingPosition.name = incoming.p.name;
  }
  room.setPlayerTeam(outgoingId, Teams.SPECTATORS);
  resetPlayer(outgoing.p, room, outgoingId, true);
  updatePositionList(getRunningPlayers(getPlayerAndDiscs(room)), room);
  room.sendAnnouncement(
    `🔄 Relevo ${outgoing.p.name} → ${incoming.p.name} (${outgoingTeam.name}). Datos de carrera y coche transferidos.`,
    undefined,
    outgoingTeam.color,
  );
}
