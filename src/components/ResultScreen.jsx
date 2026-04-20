export default function ResultScreen({ result, onRestart }) {
  if (!result) return null;

  const { score, isPassed } = result;

  return (
    <div className="screen-container">
      <h1 className="title" style={{ color: isPassed ? 'var(--color-primary)' : 'var(--color-error)' }}>
        {isPassed ? 'STAGE CLEARED!' : 'GAME OVER'}
      </h1>
      
      <div className="pixel-panel" style={{ textAlign: 'center', marginBottom: '30px', padding: '30px' }}>
        <h2 className="pixel-text" style={{ marginBottom: '20px' }}>YOUR SCORE</h2>
        <p className="pixel-text" style={{ fontSize: '3rem', color: 'var(--color-accent)' }}>
          {score}
        </p>
      </div>

      <button className="pixel-btn" onClick={onRestart}>
        PLAY AGAIN
      </button>
    </div>
  );
}
