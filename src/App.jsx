import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import './index.css';

// 定義狀態機
const SCREEN_LOGIN = 'LOGIN';
const SCREEN_GAME = 'GAME';
const SCREEN_RESULT = 'RESULT';

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREEN_LOGIN);
  const [playerId, setPlayerId] = useState('');
  
  // 保存本局遊戲結果資料
  const [gameResult, setGameResult] = useState(null);

  const startGame = (id) => {
    setPlayerId(id);
    setCurrentScreen(SCREEN_GAME);
  };

  const endData = (resultData) => {
    setGameResult(resultData);
    setCurrentScreen(SCREEN_RESULT);
  };
  
  const restartGame = () => {
    setCurrentScreen(SCREEN_LOGIN);
    setPlayerId('');
    setGameResult(null);
  };

  return (
    <div className="app-container">
      {currentScreen === SCREEN_LOGIN && <LoginScreen onStart={startGame} />}
      {currentScreen === SCREEN_GAME && <GameScreen playerId={playerId} onEnd={endData} />}
      {currentScreen === SCREEN_RESULT && <ResultScreen result={gameResult} onRestart={restartGame} />}
    </div>
  );
}

export default App;
