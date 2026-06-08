import { Player } from '../../utils/Player';

type TruthDareCardProps = {
  player: Player;
  category: string;
  type: 'truth' | 'dare';
  prompt: string;
};

export function TruthDareCard({
  player,
  category,
  type,
  prompt,
}: TruthDareCardProps) {
  return (
    <div className='truth-dare-card'>
      <p>{`${player.name}'s ${type}`}</p>
      <h3>{category}</h3>
      <p>{prompt}</p>
    </div>
  );
}
