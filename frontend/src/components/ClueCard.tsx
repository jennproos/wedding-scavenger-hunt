interface ClueCardProps {
  clue: string
}

export function ClueCard({ clue }: ClueCardProps) {
  return (
    <div className="clue-card">
      {clue.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  )
}
