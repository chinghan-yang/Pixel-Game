import { useState, useEffect } from 'react';
import BossImage from './BossImage';

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
const FETCH_COUNT = import.meta.env.VITE_QUESTION_COUNT || 10;
const PASS_THRESHOLD = import.meta.env.VITE_PASS_THRESHOLD || 6;

export default function GameScreen({ playerId, onEnd }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState('CONNECTING TO SERVER...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 取得題目
    const fetchQuestions = async () => {
      try {
        setLoadingMsg('FETCHING QUESTIONS...');
        // 如果沒有設定變數，可能會有問題，但在測試環境忽略
        if (!GAS_URL) {
           console.warn('VITE_GOOGLE_APP_SCRIPT_URL is not set.');
           // Mock Data for development
           setTimeout(() => {
             const mockQuestions = Array.from({length: FETCH_COUNT}).map((_, i) => ({
               id: i+1,
               question: `QUESTION ${i+1}: WHAT IS 1+1?`,
               options: { A: '1', B: '2', C: '3', D: '4' }
             }));
             setQuestions(mockQuestions);
             setLoadingMsg('');
           }, 1000);
           return;
        }

        const res = await fetch(GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' }, // 避免 CORS 放棄 application/json
          body: JSON.stringify({ action: 'getQuestions', count: FETCH_COUNT })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          setQuestions(data.data.questions);
          setLoadingMsg('');
        } else {
          setLoadingMsg('ERROR: ' + data.message);
        }
      } catch (err) {
        setLoadingMsg('NETWORK ERROR...');
        console.error(err);
      }
    };
    fetchQuestions();
  }, [GAS_URL]);

  const handleSelectOption = async (optionKey) => {
    const currentQ = questions[currentIndex];
    const newAnswers = [...answers, { id: currentQ.id, selected: optionKey }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 答題結束，送出計算
      await submitResult(newAnswers);
    }
  };

  const submitResult = async (finalAnswers) => {
    setIsSubmitting(true);
    setLoadingMsg('CALCULATING SCORE...');
    
    try {
      if (!GAS_URL) {
        // Mock
        setTimeout(() => {
          onEnd({
            playerId,
            score: Math.floor(Math.random() * FETCH_COUNT),
            isPassed: true // Mock true
          });
        }, 1500);
        return;
      }

      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ 
          action: 'submitScore', 
          playerId, 
          answers: finalAnswers,
          passThreshold: PASS_THRESHOLD 
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        onEnd(data.data);
      } else {
        setLoadingMsg('SUBMIT ERROR: ' + data.message);
      }
    } catch (err) {
      setLoadingMsg('NETWORK ERROR D:');
      console.error(err);
    }
  };

  if (loadingMsg || isSubmitting) {
    return (
      <div className="screen-container">
        <h2 className="loading-text blink">{loadingMsg}</h2>
        {/* 我們可以在等待的時候把即將出現的關主預載 */}
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
           {questions.map((q, idx) => (
             <BossImage key={q.id} seed={q.id * 100 + idx} isPreloading={true} />
           ))}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  // 為了讓每一個關卡都有不同關主，可以利用題目 ID 當作 seed
  const currentSeed = currentQ.id * 100 + currentIndex; 
  const progress = `${currentIndex + 1} / ${questions.length}`;

  return (
    <div className="screen-container" style={{ justifyContent: 'flex-start', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
        <span className="pixel-text" style={{ color: 'var(--color-primary)' }}>PLAYER: {playerId}</span>
        <span className="pixel-text" style={{ color: 'var(--color-accent)' }}>STAGE {progress}</span>
      </div>

      <BossImage seed={currentSeed} isPreloading={false} />

      <div className="pixel-panel" style={{ width: '100%', minHeight: '120px', marginBottom: '20px' }}>
        <p style={{ lineHeight: '1.5', minHeight: '60px' }}>{currentQ.question}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%' }}>
        {Object.entries(currentQ.options).map(([key, val]) => (
          <button 
            key={key} 
            className="pixel-btn" 
            onClick={() => handleSelectOption(key)}
          >
            <span style={{ color: 'var(--color-secondary)' }}>{key}.</span> {val}
          </button>
        ))}
      </div>
    </div>
  );
}
