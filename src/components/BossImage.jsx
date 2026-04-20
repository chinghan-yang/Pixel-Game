export default function BossImage({ seed, isPreloading }) {
  // 顯示 DiceBear 的 pixel-art
  const imageUrl = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed}`;

  return (
    <div style={{
      width: '150px',
      height: '150px',
      margin: '0 auto 20px',
      border: '4px solid var(--color-border)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      display: isPreloading ? 'none' : 'block' // 如果只是在背後 preloading 就不顯示
    }}>
      <img 
        src={imageUrl} 
        alt={`Boss ${seed}`} 
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} 
      />
    </div>
  );
}
