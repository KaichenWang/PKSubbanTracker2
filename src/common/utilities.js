import { useEffect, useRef } from 'react';

export const fetchPlayerData = async (playerId, seasonId) => {
  const response = await fetch(
    `https://statsapi.web.nhl.com/api/v1/people/${playerId}/stats?stats=yearByYear`
  );
  const json = await response.json();
  const allStats = json.stats[0].splits;
  const seasonStats = allStats.filter((stats) => {
    return stats.season === seasonId;
  });
  if (seasonStats.length < 1) return;
  const stats = seasonStats[0];
  return {
    id: seasonId,
    stats: {
      teamId: stats.team.id,
      games: stats.stat.games,
      goals: stats.stat.goals,
      assists: stats.stat.assists,
      points: stats.stat.points,
      plusMinus: stats.stat.plusMinus,
    },
  };
};

export const fetchTeamsData = async (seasonId) => {
  const response = await fetch(
    `https://statsapi.web.nhl.com/api/v1/standings?season=${seasonId}`
  );
  const json = await response.json();
  const teamsData = {};
  json.records.forEach((divisionRecords) => {
    divisionRecords.teamRecords.forEach((record) => {
      const leagueRecord = record.leagueRecord;
      leagueRecord.points = record.points;
      leagueRecord.round = null;
      teamsData[record.team.id] = leagueRecord;
    });
  });
  return teamsData;
};

export const updatePlayerStats = (player, data) => {
  const updatedPlayer = Object.assign({}, player);
  const { id, stats } = data;
  updatedPlayer.stats[id] = stats;
  const total = updatedPlayer.stats['total'];
  updatedPlayer.stats['total'] = {
    teamId: total.teamId,
    games: total.games + stats.games,
    goals: total.goals + stats.goals,
    assists: total.assists + stats.assists,
    points: total.points + stats.points,
    plusMinus: total.plusMinus + stats.plusMinus,
  };
  return updatedPlayer;
};

export const updateTeamStats = (team, data) => {
  const updatedTeam = Object.assign({}, team);
  const { id, stats } = data;
  team.stats[id] = {
    win: stats.wins,
    loss: stats.losses,
    overtimeLoss: stats.ot,
    type: stats.type,
    round: stats.round,
    points: stats.points,
  };
  return updatedTeam;
};

export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const getUpdateType = (
  paramPrevious,
  paramCurrent,
  statePrevious,
  stateCurrent
) => {
  let type = null;
  if (
    paramPrevious !== paramCurrent &&
    statePrevious === stateCurrent &&
    paramCurrent !== stateCurrent
  ) {
    type = 'state';
  } else if (
    statePrevious !== stateCurrent &&
    paramPrevious === paramCurrent &&
    paramCurrent !== stateCurrent
  ) {
    type = 'param';
  }
  return type;
};

export const trapFocusHandler = (container) => {
  return (evt) => {
    const focusableModalElements = container.querySelectorAll(
      'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,[tabindex],[contentEditable=true]'
    );
    const firstElement = focusableModalElements[0];
    const lastElement =
      focusableModalElements[focusableModalElements.length - 1];
    if (evt.keyCode !== 9) return;
    if (evt.shiftKey && document.activeElement === firstElement) {
      evt.preventDefault();
      lastElement.focus();
    } else if (!evt.shiftKey && document.activeElement === lastElement) {
      evt.preventDefault();
      firstElement.focus();
    }
  };
};

export const sumPlayerTotals = (data) => {
  const players = [...data];
  players.forEach((player) => {
    const total = player.stats['total'];
    Object.keys(player.stats).forEach((seasonId) => {
      if (seasonId !== 'total') {
        const stat = player.stats[seasonId];
        total.games += stat.games;
        total.goals += stat.goals;
        total.assists += stat.assists;
        total.points += stat.points;
        total.plusMinus += stat.plusMinus;
      }
    });
  });
  return players;
};
