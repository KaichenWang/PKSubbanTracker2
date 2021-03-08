import React, { useState, useEffect } from 'react';

import { PLAYERS, TEAMS, LATEST_SEASON_ID } from '../../common/data';
import {
  fetchPlayerData,
  fetchTeamsData,
  updatePlayerStats,
  updateTeamStats,
  sumPlayerTotals
} from '../../common/utilities';

import Card from '../Card';

import './Stats.css';

function Stats(props) {

  const { seasonId, handleError } = props;
  const [players, setPlayers] = useState();
  const [teams, setTeams] = useState(TEAMS);

  useEffect(() => {
    const playersWithTotals = sumPlayerTotals(PLAYERS);
    setPlayers(playersWithTotals);
    /* Fetch and set latest player and team data from server */
    async function setData() {
      try {
        const updatedPlayers = [...playersWithTotals];
        const updatedTeams = [];
        await Promise.all(
          PLAYERS.map(async (player) => {
            const i = updatedPlayers.findIndex(
              (current) => player.id === current.id
            );
            updatedPlayers[i] = updatePlayerStats(
              player,
              await fetchPlayerData(player.id, LATEST_SEASON_ID)
            );
          })
        );
        setPlayers(updatedPlayers);
        const teamData = await fetchTeamsData(LATEST_SEASON_ID);
        TEAMS.forEach((team) => {
          updatedTeams.push(
            updateTeamStats(team, {
              id: LATEST_SEASON_ID,
              stats: teamData[team.id],
            })
          );
        });
        setTeams(updatedTeams);
      } catch (err) {
        handleError();
      }
    }
    setData();
  }, []);

  return (
    <div className="Stats">
      {players && players.map((player) => {
        return (
          <div key={player.id} className="Stats__item">
            <Card
              player={player}
              team={teams.find(
                (team) => team.id === player.stats[seasonId]?.teamId
              )}
              seasonId={seasonId}
            ></Card>
          </div>
        );
      })}
    </div>
  );
}

export default Stats;
