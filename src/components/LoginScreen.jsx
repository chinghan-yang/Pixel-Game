import { useState } from 'react';

function LoginScreen({ onStart }) {
  const [idInput, setIdInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idInput.trim()) {
      onStart(idInput.trim());
    }
  };

  return (
    <div className="screen-container">
      <h1 className="title">
        PIXEL <br/> TRIVIA 
      </h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p className="pixel-text" style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
          INSERT PLAYER ID <span className="blink">_</span>
        </p>
        <input 
          type="text" 
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          className="pixel-input"
          placeholder="e.g. MASTER123"
          autoFocus
        />
        <button 
          type="submit" 
          className="pixel-btn"
          disabled={!idInput.trim()}
        >
          START GAME
        </button>
      </form>
    </div>
  );
}

export default LoginScreen;
