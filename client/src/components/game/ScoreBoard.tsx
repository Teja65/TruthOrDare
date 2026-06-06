import { Player } from '../../types/Player';
import translations from '../../en.json';

type ScoreBoardProps = {
  players: Player[];
};

export function ScoreBoard({ players }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );

  return (
    <div className='score-board'>
      <div className='section-heading'>
        <p>{translations.labels.scoreBoard}</p>
      </div>
      <div className='score-list'>
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className='score-row'>
            <span>{index + 1}</span>
            <strong>{player.name}</strong>
            <span>{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
