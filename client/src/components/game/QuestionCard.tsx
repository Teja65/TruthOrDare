type QuestionCardProps = {
  title: string;
  question: string;
};

export function QuestionCard({ title, question }: QuestionCardProps) {
  return (
    <div className='question-card'>
      <h3>{title}</h3>
      <p>{question}</p>
    </div>
  );
}
