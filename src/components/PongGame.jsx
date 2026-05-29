import { useEffect, useRef, useState } from 'react';

const W = 500;
const H = 240;
const PADDLE_W = 10;
const PADDLE_H = 55;
const BALL_SIZE = 8;
const PADDLE_SPEED = 5;
const WIN_SCORE = 5;

function resetBall(state, dir) {
  state.ball.x = W / 2;
  state.ball.y = H / 2;
  const angle = (Math.random() * 0.6 - 0.3);
  const speed = 4;
  state.ball.vx = speed * dir;
  state.ball.vy = speed * Math.tan(angle);
}

function draw(ctx, state) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#00ff00';

  ctx.font = '20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(state.playerScore, W / 4, 28);
  ctx.fillText(state.aiScore, (W * 3) / 4, 28);

  ctx.fillRect(16, state.playerY, PADDLE_W, PADDLE_H);
  ctx.fillRect(W - 16 - PADDLE_W, state.aiY, PADDLE_W, PADDLE_H);

  ctx.fillRect(state.ball.x - BALL_SIZE / 2, state.ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
}

export default function PongGame() {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const state = {
      ball: { x: W / 2, y: H / 2, vx: 4, vy: 2 },
      playerY: H / 2 - PADDLE_H / 2,
      aiY: H / 2 - PADDLE_H / 2,
      playerScore: 0,
      aiScore: 0,
      keys: {},
      running: true,
    };

    const endGame = (winner) => {
      state.running = false;
      setGameOver({ winner, playerScore: state.playerScore, aiScore: state.aiScore });
    };

    const onKeyDown = (e) => {
      state.keys[e.key] = true;
      if (['w', 'W', 's', 'S'].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e) => { state.keys[e.key] = false; };
    const onCommand = () => endGame(null);

    const onTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleY = H / rect.height;
      const touchY = (touch.clientY - rect.top) * scaleY;
      state.playerY = Math.max(0, Math.min(H - PADDLE_H, touchY - PADDLE_H / 2));
    };
    const onTouchStart = (e) => { e.preventDefault(); onTouchMove(e); };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('aidan-os-command', onCommand);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    let raf;
    let lastTime = null;
    const loop = (timestamp) => {
      if (!state.running) return;

      if (lastTime === null) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 16.67, 3);
      lastTime = timestamp;

      if ((state.keys['w'] || state.keys['W']) && state.playerY > 0)
        state.playerY = Math.max(0, state.playerY - PADDLE_SPEED * dt);
      if ((state.keys['s'] || state.keys['S']) && state.playerY < H - PADDLE_H)
        state.playerY = Math.min(H - PADDLE_H, state.playerY + PADDLE_SPEED * dt);

      const aiCenter = state.aiY + PADDLE_H / 2;
      if (aiCenter < state.ball.y - 20 && state.aiY < H - PADDLE_H)
        state.aiY = Math.min(H - PADDLE_H, state.aiY + PADDLE_SPEED * 0.35 * dt);
      else if (aiCenter > state.ball.y + 20 && state.aiY > 0)
        state.aiY = Math.max(0, state.aiY - PADDLE_SPEED * 0.35 * dt);

      state.ball.x += state.ball.vx * dt;
      state.ball.y += state.ball.vy * dt;

      if (state.ball.y - BALL_SIZE / 2 <= 0) {
        state.ball.y = BALL_SIZE / 2;
        state.ball.vy *= -1;
      } else if (state.ball.y + BALL_SIZE / 2 >= H) {
        state.ball.y = H - BALL_SIZE / 2;
        state.ball.vy *= -1;
      }

      const px = 16 + PADDLE_W;
      if (
        state.ball.vx < 0 &&
        state.ball.x - BALL_SIZE / 2 <= px &&
        state.ball.x + BALL_SIZE / 2 >= 16 &&
        state.ball.y + BALL_SIZE / 2 >= state.playerY &&
        state.ball.y - BALL_SIZE / 2 <= state.playerY + PADDLE_H
      ) {
        state.ball.x = px + BALL_SIZE / 2;
        const rel = (state.ball.y - (state.playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
        const speed = Math.min(Math.hypot(state.ball.vx, state.ball.vy) * 1.05, 10);
        state.ball.vx = speed * Math.cos(rel * (Math.PI / 4));
        state.ball.vy = speed * Math.sin(rel * (Math.PI / 4));
      }

      const ax = W - 16 - PADDLE_W;
      if (
        state.ball.vx > 0 &&
        state.ball.x + BALL_SIZE / 2 >= ax &&
        state.ball.x - BALL_SIZE / 2 <= W - 16 &&
        state.ball.y + BALL_SIZE / 2 >= state.aiY &&
        state.ball.y - BALL_SIZE / 2 <= state.aiY + PADDLE_H
      ) {
        state.ball.x = ax - BALL_SIZE / 2;
        const rel = (state.ball.y - (state.aiY + PADDLE_H / 2)) / (PADDLE_H / 2);
        const speed = Math.min(Math.hypot(state.ball.vx, state.ball.vy) * 1.05, 10);
        state.ball.vx = -speed * Math.cos(rel * (Math.PI / 4));
        state.ball.vy = speed * Math.sin(rel * (Math.PI / 4));
      }

      if (state.ball.x < 0) {
        state.aiScore++;
        if (state.aiScore >= WIN_SCORE) { endGame('Computer'); return; }
        resetBall(state, 1);
      } else if (state.ball.x > W) {
        state.playerScore++;
        if (state.playerScore >= WIN_SCORE) { endGame('You'); return; }
        resetBall(state, -1);
      }

      draw(ctx, state);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('aidan-os-command', onCommand);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  if (gameOver) {
    const { winner, playerScore, aiScore } = gameOver;
    if (winner === 'You') return <span>You win! Final score: {playerScore}–{aiScore}</span>;
    if (winner === 'Computer') return <span>Computer wins. Final score: {playerScore}–{aiScore}</span>;
    return <span>Game ended. Score: {playerScore}–{aiScore}</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span>PONG — W/S or touch to move your paddle (left) — first to {WIN_SCORE} wins</span>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ border: '1px solid #00ff00', display: 'block', maxWidth: '100%' }}
      />
    </div>
  );
}
