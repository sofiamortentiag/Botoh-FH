import { PitsInfo, playerList } from "../../../changePlayerState/playerList";
import { vectorSpeed } from "../../../utils";
import { refreshStandingsHtml } from "./standingsRefresh";
import { isWecFinishPhase, wecFinishOrder } from "../../../changeGameState/EndRaceSession";

export const positionList: {
  id: number;
  name: string;
  pitsInfo: PitsInfo;
  pits: number;
  time: number;
  totalTime: number;
  lap: number;
  active: boolean;
  currentSector: number;
  team: string | null;
  speed: number;
}[] = [];

export function updatePositionList(
  players: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject,
  shouldRefresh = true,
) {
  // Cria um conjunto com os nomes dos jogadores atualmente ativos na sala
  const activePlayers = new Set(players.map((player) => player.p.name));

  // Atualiza ou insere os dados de cada jogador na lista de posições
  players.forEach((player) => {
    const { p } = player;
    const playerData = playerList[p.id];

    const playerPositionIndex = positionList.findIndex(
      (entry) => entry.name === p.name,
    );

    // Monta o objeto com as informações atuais do jogador
    const playerInfo = {
      id: p.id,
      name: p.name,
      pitsInfo: playerData.pits,
      pits: playerData.pits.pitsNumber,
      time: playerData.bestTime,
      timeWithTeam: playerData.bestTimeWithTeam,
      totalTime: playerData.totalTime,
      lap: playerData.currentLap,
      active: true,
      currentSector: playerData.currentSector,
      team: playerData.leagueScuderia,
      speed: vectorSpeed(player.disc.xspeed, player.disc.yspeed),
    };

    // Atualiza ou adiciona o jogador na lista de posições
    if (playerPositionIndex !== -1) {
      positionList[playerPositionIndex] = playerInfo;
    } else {
      positionList.push(playerInfo);
    }
  });

  // Marca como inativos os jogadores que não estão mais presentes na sala
  positionList.forEach((entry) => {
    if (!activePlayers.has(entry.name)) {
      entry.active = false;
    }
  });

  // Ordena a lista de posições com base nas voltas, setor atual e tempo total
  positionList.sort((a, b) => {
    // Completed laps are the primary WEC classification criterion, including
    // during the checkered-flag phase. Finish order only breaks lap-count ties.
    if (a.lap !== b.lap) return b.lap - a.lap;

    if (isWecFinishPhase()) {
      const aFinishIndex = wecFinishOrder.indexOf(a.id);
      const bFinishIndex = wecFinishOrder.indexOf(b.id);
      if (aFinishIndex !== -1 || bFinishIndex !== -1) {
        if (aFinishIndex === -1) return 1;
        if (bFinishIndex === -1) return -1;
        if (aFinishIndex !== bFinishIndex) return aFinishIndex - bFinishIndex;
      }
    }

    if (a.currentSector !== b.currentSector) {
      return b.currentSector - a.currentSector; // quem estiver mais à frente no setor
    }
    return a.totalTime - b.totalTime; // quem tiver menos tempo, está na frente
  });

  if (shouldRefresh) refreshStandingsHtml();
}
