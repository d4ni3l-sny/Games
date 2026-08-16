export const DEFAULT_GAMES = [
  {
    id: 'space-invaders',
    title: 'Galaxy Defender',
    category: 'Arcade',
    description: 'Classic arcade space shooter. Defend earth from waves of descending alien invaders and score maximum points!',
    embedType: 'srcdoc',
    thumbnailColor: 'from-purple-900 to-indigo-950',
    icon: 'Rocket',
    tags: ['Retro', 'Shooter', 'Arcade', 'Space'],
    rating: 4.9,
    plays: 14200,
    featured: true,
    controls: [
      { key: '← / → or A / D', action: 'Move Ship' },
      { key: 'Spacebar', action: 'Fire Laser' },
      { key: 'P', action: 'Pause Game' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0b0c16; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #canvas-wrap { position: relative; box-shadow: 0 0 30px rgba(120, 80, 255, 0.3); border: 2px solid #2d2f4d; border-radius: 8px; overflow: hidden; }
  canvas { background: #060710; display: block; }
  #ui { position: absolute; top: 10px; left: 15px; right: 15px; display: flex; justify-content: space-between; font-size: 14px; text-shadow: 0 0 8px #a855f7; }
  .screen { position: absolute; inset: 0; background: rgba(8,9,18,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  h1 { font-size: 28px; color: #a855f7; margin-bottom: 12px; letter-spacing: 2px; text-shadow: 0 0 15px #9333ea; }
  p { font-size: 13px; color: #94a3b8; margin-bottom: 20px; text-align: center; line-height: 1.6; }
  button { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; transition: transform 0.1s, box-shadow 0.2s; box-shadow: 0 0 15px rgba(124, 58, 237, 0.5); }
  button:hover { transform: scale(1.05); }
</style>
</head>
<body>
<div id="canvas-wrap">
  <div id="ui">
    <div>SCORE: <span id="score">0</span></div>
    <div>WAVE: <span id="wave">1</span></div>
    <div>LIVES: <span id="lives">❤️❤️❤️</span></div>
  </div>
  <canvas id="c" width="600" height="480"></canvas>
  <div id="start-screen" class="screen">
    <h1>GALAXY DEFENDER</h1>
    <p>Defeat the alien armada before they reach the ground.<br>Use <b>← / →</b> to move and <b>SPACE</b> to fire.</p>
    <button onclick="startGame()">LAUNCH MISSION</button>
  </div>
  <div id="game-over-screen" class="screen" style="display:none;">
    <h1 id="end-title" style="color: #ef4444;">MISSION FAILED</h1>
    <p id="end-score">Final Score: 0</p>
    <button onclick="startGame()">PLAY AGAIN</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let score = 0, wave = 1, lives = 3, running = false, lastTime = 0;
let player, bullets, aliens, alienBullets, particles, stars;
let alienDir = 1, alienStepTimer = 0, alienStepInterval = 600;

function createStars() {
  stars = [];
  for(let i=0; i<60; i++) {
    stars.push({ x: Math.random()*c.width, y: Math.random()*c.height, size: Math.random()*1.8 + 0.5, speed: Math.random()*0.8 + 0.2 });
  }
}

function initGame() {
  score = 0; wave = 1; lives = 3;
  player = { x: c.width/2 - 18, y: c.height - 45, w: 36, h: 20, speed: 6, reload: 0 };
  bullets = []; alienBullets = []; particles = [];
  spawnAliens();
  updateUI();
  createStars();
}

function spawnAliens() {
  aliens = [];
  const rows = 4, cols = 8;
  const colors = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4'];
  for(let r=0; r<rows; r++) {
    for(let col=0; col<cols; col++) {
      aliens.push({
        x: 60 + col * 60,
        y: 60 + r * 35,
        w: 30, h: 20,
        color: colors[r],
        points: (rows - r) * 10
      });
    }
  }
  alienStepInterval = Math.max(200, 650 - wave * 50);
}

function updateUI() {
  document.getElementById('score').innerText = score;
  document.getElementById('wave').innerText = wave;
  document.getElementById('lives').innerText = '❤️'.repeat(Math.max(0, lives));
}

const keys = {};
window.addEventListener('keydown', e => {
  if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-over-screen').style.display = 'none';
  initGame();
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function gameOver(won = false) {
  running = false;
  document.getElementById('end-title').innerText = won ? 'VICTORY!' : 'GAME OVER';
  document.getElementById('end-title').style.color = won ? '#10b981' : '#ef4444';
  document.getElementById('end-score').innerText = 'Final Score: ' + score + ' (Wave ' + wave + ')';
  document.getElementById('game-over-screen').style.display = 'flex';
}

function spawnParticles(x, y, color, count=12) {
  for(let i=0; i<count; i++) {
    particles.push({
      x, y,
      vx: (Math.random()-0.5)*5,
      vy: (Math.random()-0.5)*5,
      life: 1,
      color: color || '#a855f7'
    });
  }
}

function loop(t) {
  if(!running) return;
  const dt = t - lastTime;
  lastTime = t;

  // Stars background
  stars.forEach(s => {
    s.y += s.speed;
    if(s.y > c.height) { s.y = 0; s.x = Math.random()*c.width; }
  });

  // Controls
  if(keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
  if(keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;
  player.x = Math.max(10, Math.min(c.width - player.w - 10, player.x));

  if(player.reload > 0) player.reload -= dt;
  if((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.reload <= 0) {
    bullets.push({ x: player.x + player.w/2 - 2, y: player.y - 4, w: 4, h: 12, speed: 9 });
    player.reload = 220;
  }

  // Update Bullets
  for(let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if(bullets[i].y < -10) bullets.splice(i, 1);
  }

  // Alien firing
  if(Math.random() < 0.02 + wave * 0.005 && aliens.length > 0) {
    const randomAlien = aliens[Math.floor(Math.random() * aliens.length)];
    alienBullets.push({ x: randomAlien.x + randomAlien.w/2, y: randomAlien.y + randomAlien.h, w: 4, h: 10, speed: 4 + wave * 0.3 });
  }

  for(let i = alienBullets.length - 1; i >= 0; i--) {
    alienBullets[i].y += alienBullets[i].speed;
    // Player hit
    if(alienBullets[i].x > player.x && alienBullets[i].x < player.x + player.w &&
       alienBullets[i].y > player.y && alienBullets[i].y < player.y + player.h) {
      alienBullets.splice(i, 1);
      lives--;
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ef4444', 20);
      updateUI();
      if(lives <= 0) { gameOver(false); return; }
      continue;
    }
    if(alienBullets[i] && alienBullets[i].y > c.height + 10) alienBullets.splice(i, 1);
  }

  // Alien step movement
  alienStepTimer += dt;
  if(alienStepTimer > alienStepInterval) {
    alienStepTimer = 0;
    let hitEdge = false;
    for(let a of aliens) {
      if((alienDir === 1 && a.x + a.w >= c.width - 20) || (alienDir === -1 && a.x <= 20)) {
        hitEdge = true;
        break;
      }
    }
    if(hitEdge) {
      alienDir *= -1;
      for(let a of aliens) {
        a.y += 18;
        if(a.y + a.h >= player.y) { gameOver(false); return; }
      }
    } else {
      for(let a of aliens) {
        a.x += alienDir * 14;
      }
    }
  }

  // Bullet-Alien collisions
  for(let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
    const b = bullets[bIdx];
    for(let aIdx = aliens.length - 1; aIdx >= 0; aIdx--) {
      const a = aliens[aIdx];
      if(b.x < a.x + a.w && b.x + b.w > a.x && b.y < a.y + a.h && b.y + b.h > a.y) {
        score += a.points;
        spawnParticles(a.x + a.w/2, a.y + a.h/2, a.color);
        aliens.splice(aIdx, 1);
        bullets.splice(bIdx, 1);
        updateUI();
        if(aliens.length === 0) {
          wave++;
          score += 500;
          spawnAliens();
          updateUI();
        }
        break;
      }
    }
  }

  // Draw Scene
  ctx.fillStyle = '#060710';
  ctx.fillRect(0, 0, c.width, c.height);

  // Stars
  stars.forEach(s => {
    ctx.fillStyle = 'rgba(255,255,255,' + (s.speed*0.8) + ')';
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });

  // Draw Player Ship
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(player.x + player.w/2, player.y);
  ctx.lineTo(player.x + player.w, player.y + player.h);
  ctx.lineTo(player.x + player.w * 0.7, player.y + player.h - 5);
  ctx.lineTo(player.x + player.w * 0.3, player.y + player.h - 5);
  ctx.lineTo(player.x, player.y + player.h);
  ctx.closePath();
  ctx.fill();

  // Engine flame
  ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#eab308';
  ctx.fillRect(player.x + player.w/2 - 3, player.y + player.h - 4, 6, 6 + Math.random()*5);

  // Draw Bullets
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#38bdf8';
  ctx.fillStyle = '#7dd3fc';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

  // Draw Alien Bullets
  ctx.shadowColor = '#ef4444';
  ctx.fillStyle = '#f87171';
  alienBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

  // Draw Aliens
  aliens.forEach(a => {
    ctx.fillStyle = a.color;
    ctx.shadowColor = a.color;
    ctx.shadowBlur = 6;
    ctx.fillRect(a.x, a.y + 4, a.w, a.h - 8);
    ctx.fillRect(a.x + 4, a.y, a.w - 8, a.h);
    // Eyes
    ctx.fillStyle = '#060710';
    ctx.fillRect(a.x + 6, a.y + 6, 4, 4);
    ctx.fillRect(a.x + a.w - 10, a.y + 6, 4, 4);
  });

  // Particles
  for(let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.03;
    if(p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 0;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x, p.y, 3, 3);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  requestAnimationFrame(loop);
}
</script>
</body>
</html>`
  },
  {
    id: 'snake-retro',
    title: 'Neon Snake',
    category: 'Retro',
    description: 'Slither through the cyber grid! Consume neon orbs to grow longer and hit the leaderboard score without hitting walls or yourself.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-emerald-900 to-teal-950',
    icon: 'Activity',
    tags: ['Classic', 'Snake', 'Retro', 'Arcade'],
    rating: 4.8,
    plays: 28400,
    featured: true,
    controls: [
      { key: 'Arrow Keys or WASD', action: 'Change Direction' },
      { key: 'Spacebar', action: 'Pause / Resume' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #090e11; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #wrap { position: relative; border: 2px solid #134e4a; border-radius: 8px; box-shadow: 0 0 35px rgba(20, 184, 166, 0.25); overflow: hidden; }
  canvas { background: #04080a; display: block; }
  #top { position: absolute; top: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; font-size: 15px; text-shadow: 0 0 10px #14b8a6; color: #2dd4bf; }
  .modal { position: absolute; inset: 0; background: rgba(4, 8, 10, 0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  h1 { font-size: 32px; color: #14b8a6; margin-bottom: 8px; text-shadow: 0 0 20px #0d9488; }
  p { font-size: 13px; color: #99f6e4; margin-bottom: 20px; }
  button { background: #0d9488; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 15px; box-shadow: 0 0 15px rgba(13, 148, 136, 0.6); }
  button:hover { background: #14b8a6; }
</style>
</head>
<body>
<div id="wrap">
  <div id="top">
    <div>SCORE: <span id="score">0</span></div>
    <div>HIGH: <span id="high">0</span></div>
  </div>
  <canvas id="c" width="480" height="480"></canvas>
  <div id="start" class="modal">
    <h1>NEON SNAKE</h1>
    <p>Eat glowing energy cubes. Avoid colliding with walls & tail.</p>
    <button onclick="start()">START GAME</button>
  </div>
  <div id="over" class="modal" style="display:none;">
    <h1 style="color:#f43f5e; text-shadow: 0 0 20px #e11d48;">CRASHED!</h1>
    <p id="final">Score: 0</p>
    <button onclick="start()">TRY AGAIN</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const GRID = 20, TILES = 24;
let snake, dir, nextDir, food, goldFood, score = 0, highScore = localStorage.getItem('snake_hi') || 0;
let loopId, isRunning = false, speed = 100;
document.getElementById('high').innerText = highScore;

function start() {
  document.getElementById('start').style.display = 'none';
  document.getElementById('over').style.display = 'none';
  snake = [{x: 12, y: 12}, {x: 11, y: 12}, {x: 10, y: 12}];
  dir = {x: 1, y: 0}; nextDir = {x: 1, y: 0};
  score = 0; speed = 110;
  document.getElementById('score').innerText = score;
  spawnFood();
  isRunning = true;
  clearInterval(loopId);
  loopId = setInterval(tick, speed);
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * TILES),
    y: Math.floor(Math.random() * TILES)
  };
  if(Math.random() < 0.25) {
    goldFood = { x: Math.floor(Math.random() * TILES), y: Math.floor(Math.random() * TILES), timer: 45 };
  } else { goldFood = null; }
}

window.addEventListener('keydown', e => {
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) e.preventDefault();
  if((e.code==='ArrowUp'||e.code==='KeyW') && dir.y===0) nextDir = {x: 0, y: -1};
  if((e.code==='ArrowDown'||e.code==='KeyS') && dir.y===0) nextDir = {x: 0, y: 1};
  if((e.code==='ArrowLeft'||e.code==='KeyA') && dir.x===0) nextDir = {x: -1, y: 0};
  if((e.code==='ArrowRight'||e.code==='KeyD') && dir.x===0) nextDir = {x: 1, y: 0};
});

function tick() {
  if(!isRunning) return;
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if(head.x < 0 || head.x >= TILES || head.y < 0 || head.y >= TILES) { die(); return; }
  for(let segment of snake) {
    if(segment.x === head.x && segment.y === head.y) { die(); return; }
  }

  snake.unshift(head);

  let ate = false;
  if(head.x === food.x && head.y === food.y) {
    score += 10;
    ate = true;
    spawnFood();
    if(speed > 60 && score % 40 === 0) {
      speed -= 4;
      clearInterval(loopId);
      loopId = setInterval(tick, speed);
    }
  } else if(goldFood && head.x === goldFood.x && head.y === goldFood.y) {
    score += 35;
    goldFood = null;
    ate = true;
  }

  if(!ate) snake.pop();
  if(goldFood) { goldFood.timer--; if(goldFood.timer <= 0) goldFood = null; }

  if(score > highScore) { highScore = score; localStorage.setItem('snake_hi', highScore); document.getElementById('high').innerText = highScore; }
  document.getElementById('score').innerText = score;

  draw();
}

function die() {
  isRunning = false;
  clearInterval(loopId);
  document.getElementById('final').innerText = 'Final Score: ' + score;
  document.getElementById('over').style.display = 'flex';
}

function draw() {
  ctx.fillStyle = '#04080a';
  ctx.fillRect(0, 0, c.width, c.height);

  // Grid
  ctx.strokeStyle = 'rgba(20, 184, 166, 0.05)';
  ctx.lineWidth = 1;
  for(let i=0; i<TILES; i++) {
    ctx.beginPath(); ctx.moveTo(i*GRID, 0); ctx.lineTo(i*GRID, c.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*GRID); ctx.lineTo(c.width, i*GRID); ctx.stroke();
  }

  // Food
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#f43f5e';
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(food.x*GRID+3, food.y*GRID+3, GRID-6, GRID-6);

  if(goldFood) {
    ctx.shadowColor = '#eab308';
    ctx.fillStyle = '#eab308';
    ctx.fillRect(goldFood.x*GRID+2, goldFood.y*GRID+2, GRID-4, GRID-4);
  }

  // Snake
  snake.forEach((s, i) => {
    ctx.shadowColor = '#2dd4bf';
    ctx.shadowBlur = i === 0 ? 12 : 5;
    ctx.fillStyle = i === 0 ? '#5eead4' : '#14b8a6';
    ctx.fillRect(s.x*GRID+1, s.y*GRID+1, GRID-2, GRID-2);
  });
  ctx.shadowBlur = 0;
}
</script>
</body>
</html>`
  },
  {
    id: 'falling-blocks-2048',
    title: '2048 Neon',
    category: 'Puzzle',
    description: 'Join the numbers and get to the 2048 tile! Swipe or use arrow keys to slide tiles seamlessly on a glowing 4x4 matrix.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-amber-900 to-orange-950',
    icon: 'Layers',
    tags: ['Math', 'Puzzle', 'Brain', 'Strategy'],
    rating: 4.9,
    plays: 35100,
    featured: true,
    controls: [
      { key: 'Arrow Keys or WASD', action: 'Slide Tiles' },
      { key: 'R', action: 'Restart Game' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #110e08; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  .header { width: 360px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .title { font-size: 32px; font-weight: 900; color: #f59e0b; letter-spacing: -1px; text-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
  .scores { display: flex; gap: 8px; }
  .box { background: #261f12; padding: 6px 12px; border-radius: 6px; text-align: center; min-width: 65px; border: 1px solid #45371c; }
  .lbl { font-size: 10px; color: #a89984; text-transform: uppercase; font-weight: bold; }
  .val { font-size: 16px; font-weight: bold; color: #fef3c7; }
  #board { width: 360px; height: 360px; background: #1c160c; border: 3px solid #3d2f16; border-radius: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 10px; position: relative; box-shadow: 0 0 30px rgba(245, 158, 11, 0.15); }
  .cell { background: #2b2214; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; transition: transform 0.1s; }
  .tile-2 { background: #3b2d18; color: #fef08a; }
  .tile-4 { background: #4d3a1f; color: #fed7aa; }
  .tile-8 { background: #ea580c; color: #fff; box-shadow: 0 0 10px rgba(234, 88, 12, 0.4); }
  .tile-16 { background: #d97706; color: #fff; box-shadow: 0 0 12px rgba(217, 119, 6, 0.5); }
  .tile-32 { background: #e11d48; color: #fff; box-shadow: 0 0 14px rgba(225, 29, 72, 0.6); }
  .tile-64 { background: #be123c; color: #fff; font-size: 22px; box-shadow: 0 0 16px rgba(190, 18, 60, 0.7); }
  .tile-128 { background: #8b5cf6; color: #fff; font-size: 20px; box-shadow: 0 0 18px rgba(139, 92, 246, 0.7); }
  .tile-256 { background: #7c3aed; color: #fff; font-size: 20px; box-shadow: 0 0 20px rgba(124, 58, 237, 0.8); }
  .tile-512 { background: #06b6d4; color: #fff; font-size: 18px; box-shadow: 0 0 22px rgba(6, 182, 212, 0.9); }
  .tile-1024 { background: #10b981; color: #fff; font-size: 16px; box-shadow: 0 0 24px rgba(16, 185, 129, 0.9); }
  .tile-2048 { background: #f59e0b; color: #110e08; font-size: 16px; box-shadow: 0 0 28px rgba(245, 158, 11, 1); }
  .overlay { position: absolute; inset: 0; background: rgba(17, 14, 8, 0.9); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
  .btn { background: #f59e0b; color: #110e08; font-weight: bold; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 14px; }
</style>
</head>
<body>
<div class="header">
  <div class="title">2048</div>
  <div class="scores">
    <div class="box"><div class="lbl">Score</div><div id="sc" class="val">0</div></div>
    <div class="box"><div class="lbl">Best</div><div id="hi" class="val">0</div></div>
    <button class="btn" onclick="init()">↺</button>
  </div>
</div>
<div id="board"></div>
<script>
let grid = [], score = 0, best = localStorage.getItem('2048_best') || 0;
document.getElementById('hi').innerText = best;

function init() {
  grid = Array(16).fill(0);
  score = 0;
  addRandom(); addRandom();
  render();
}

function addRandom() {
  const empty = [];
  grid.forEach((v, i) => { if(v===0) empty.push(i); });
  if(!empty.length) return;
  const idx = empty[Math.floor(Math.random()*empty.length)];
  grid[idx] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  const b = document.getElementById('board');
  b.innerHTML = '';
  grid.forEach(val => {
    const c = document.createElement('div');
    c.className = 'cell' + (val ? ' tile-' + val : '');
    c.innerText = val || '';
    b.appendChild(c);
  });
  document.getElementById('sc').innerText = score;
  if(score > best) { best = score; localStorage.setItem('2048_best', best); document.getElementById('hi').innerText = best; }
}

function slide(row) {
  let arr = row.filter(x => x);
  for(let i=0; i<arr.length-1; i++) {
    if(arr[i] === arr[i+1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i+1, 1);
    }
  }
  while(arr.length < 4) arr.push(0);
  return arr;
}

function move(dir) {
  let changed = false;
  const prev = [...grid];
  if(dir === 'left' || dir === 'right') {
    for(let r=0; r<4; r++) {
      let row = [grid[r*4], grid[r*4+1], grid[r*4+2], grid[r*4+3]];
      if(dir === 'right') row.reverse();
      let res = slide(row);
      if(dir === 'right') res.reverse();
      for(let c=0; c<4; c++) grid[r*4+c] = res[c];
    }
  } else {
    for(let c=0; c<4; c++) {
      let col = [grid[c], grid[c+4], grid[c+8], grid[c+12]];
      if(dir === 'down') col.reverse();
      let res = slide(col);
      if(dir === 'down') res.reverse();
      for(let r=0; r<4; r++) grid[r*4+c] = res[r];
    }
  }
  if(prev.some((v, i) => v !== grid[i])) {
    addRandom();
    render();
  }
}

window.addEventListener('keydown', e => {
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) e.preventDefault();
  if(e.code==='ArrowLeft'||e.code==='KeyA') move('left');
  if(e.code==='ArrowRight'||e.code==='KeyD') move('right');
  if(e.code==='ArrowUp'||e.code==='KeyW') move('up');
  if(e.code==='ArrowDown'||e.code==='KeyS') move('down');
  if(e.code==='KeyR') init();
});

init();
</script>
</body>
</html>`
  },
  {
    id: 'block-drop-tetris',
    title: 'Block Matrix',
    category: 'Retro',
    description: 'Stack and rotate tetrominoes to clear rows, achieve multi-line combos, and survive increasing drop speeds in this iconic arcade puzzle.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-blue-900 to-indigo-950',
    icon: 'Grid',
    tags: ['Tetris', 'Arcade', 'Blocks', 'Puzzle'],
    rating: 4.9,
    plays: 42100,
    featured: true,
    controls: [
      { key: '← / → or A / D', action: 'Move Piece' },
      { key: '↑ or W', action: 'Rotate' },
      { key: '↓ or S', action: 'Soft Drop' },
      { key: 'Spacebar', action: 'Hard Drop' },
      { key: 'C', action: 'Hold Piece' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #080d1a; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #container { display: flex; gap: 16px; background: #0c1427; padding: 16px; border-radius: 10px; border: 2px solid #1e293b; box-shadow: 0 0 30px rgba(56, 189, 248, 0.2); position: relative; }
  canvas { background: #030712; border: 1px solid #1e293b; border-radius: 4px; display: block; }
  .sidebar { display: flex; flex-direction: column; justify-content: space-between; width: 110px; }
  .card { background: #030712; padding: 8px; border-radius: 6px; border: 1px solid #1e293b; text-align: center; }
  .label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
  .val { font-size: 16px; font-weight: bold; color: #38bdf8; }
  .btn { background: #0284c7; color: #fff; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; }
  .btn:hover { background: #0369a1; }
  #overlay { position: absolute; inset: 0; background: rgba(3, 7, 18, 0.9); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
  h2 { color: #f43f5e; font-size: 24px; text-shadow: 0 0 10px #f43f5e; }
</style>
</head>
<body>
<div id="container">
  <canvas id="c" width="220" height="440"></canvas>
  <div class="sidebar">
    <div class="card"><div class="label">SCORE</div><div id="score" class="val">0</div></div>
    <div class="card"><div class="label">LINES</div><div id="lines" class="val">0</div></div>
    <div class="card"><div class="label">LEVEL</div><div id="level" class="val">1</div></div>
    <button class="btn" onclick="start()">NEW GAME</button>
  </div>
  <div id="overlay">
    <h2 id="over-txt">BLOCK MATRIX</h2>
    <button class="btn" onclick="start()">PLAY NOW</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const COLS = 10, ROWS = 20, BLOCK = 22;
let grid = [], current, score = 0, lines = 0, level = 1, isOver = true, dropInterval = 800, lastDrop = 0;

const SHAPES = [
  { s: [[1,1,1,1]], c: '#06b6d4' }, // I
  { s: [[1,1],[1,1]], c: '#eab308' }, // O
  { s: [[0,1,0],[1,1,1]], c: '#a855f7' }, // T
  { s: [[1,0,0],[1,1,1]], c: '#f97316' }, // L
  { s: [[0,0,1],[1,1,1]], c: '#3b82f6' }, // J
  { s: [[0,1,1],[1,1,0]], c: '#22c55e' }, // S
  { s: [[1,1,0],[0,1,1]], c: '#ef4444' }  // Z
];

function start() {
  document.getElementById('overlay').style.display = 'none';
  grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  score = 0; lines = 0; level = 1; isOver = false; dropInterval = 800;
  updateUI();
  spawn();
  requestAnimationFrame(loop);
}

function spawn() {
  const p = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  current = { shape: p.s, color: p.c, x: Math.floor((COLS - p.s[0].length)/2), y: 0 };
  if(collide(current.shape, current.x, current.y)) {
    isOver = true;
    document.getElementById('over-txt').innerText = 'GAME OVER';
    document.getElementById('overlay').style.display = 'flex';
  }
}

function collide(shape, ox, oy) {
  for(let r=0; r<shape.length; r++) {
    for(let cl=0; cl<shape[r].length; cl++) {
      if(shape[r][cl]) {
        let nx = ox + cl, ny = oy + r;
        if(nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && grid[ny][nx])) return true;
      }
    }
  }
  return false;
}

function rotate(mat) {
  return mat[0].map((_, i) => mat.map(row => row[i]).reverse());
}

function merge() {
  current.shape.forEach((row, r) => {
    row.forEach((val, cl) => {
      if(val) grid[current.y + r][current.x + cl] = current.color;
    });
  });

  let cleared = 0;
  for(let r = ROWS - 1; r >= 0; r--) {
    if(grid[r].every(v => v !== 0)) {
      grid.splice(r, 1);
      grid.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if(cleared) {
    lines += cleared;
    score += [0, 100, 300, 500, 800][cleared] * level;
    level = Math.floor(lines / 8) + 1;
    dropInterval = Math.max(120, 800 - (level - 1) * 70);
    updateUI();
  }
  spawn();
}

function updateUI() {
  document.getElementById('score').innerText = score;
  document.getElementById('lines').innerText = lines;
  document.getElementById('level').innerText = level;
}

window.addEventListener('keydown', e => {
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) e.preventDefault();
  if(isOver) return;
  if((e.code==='ArrowLeft'||e.code==='KeyA') && !collide(current.shape, current.x - 1, current.y)) current.x--;
  if((e.code==='ArrowRight'||e.code==='KeyD') && !collide(current.shape, current.x + 1, current.y)) current.x++;
  if(e.code==='ArrowUp'||e.code==='KeyW') {
    const rot = rotate(current.shape);
    if(!collide(rot, current.x, current.y)) current.shape = rot;
  }
  if((e.code==='ArrowDown'||e.code==='KeyS') && !collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateUI();
  }
  if(e.code==='Space') {
    while(!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
      score += 2;
    }
    merge();
  }
});

function loop(t) {
  if(isOver) return;
  if(t - lastDrop > dropInterval) {
    if(!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      merge();
    }
    lastDrop = t;
  }

  // Draw
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, c.width, c.height);

  // Grid background
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  for(let r=0; r<ROWS; r++) {
    for(let cl=0; cl<COLS; cl++) {
      ctx.strokeRect(cl*BLOCK, r*BLOCK, BLOCK, BLOCK);
    }
  }

  // Placed blocks
  grid.forEach((row, r) => {
    row.forEach((col, cl) => {
      if(col) {
        ctx.fillStyle = col;
        ctx.fillRect(cl*BLOCK+1, r*BLOCK+1, BLOCK-2, BLOCK-2);
      }
    });
  });

  // Current piece
  if(current) {
    ctx.fillStyle = current.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = current.color;
    current.shape.forEach((row, r) => {
      row.forEach((val, cl) => {
        if(val) ctx.fillRect((current.x+cl)*BLOCK+1, (current.y+r)*BLOCK+1, BLOCK-2, BLOCK-2);
      });
    });
    ctx.shadowBlur = 0;
  }

  requestAnimationFrame(loop);
}
</script>
</body>
</html>`
  },
  {
    id: 'flappy-neon',
    title: 'Neon Flapper',
    category: 'Arcade',
    description: 'Tap or click to flap through glowing obstacles. Maintain rhythm, beat your high score, and dodge the laser gates!',
    embedType: 'srcdoc',
    thumbnailColor: 'from-yellow-900 to-amber-950',
    icon: 'Compass',
    tags: ['Flappy', 'Casual', 'Skill', 'Arcade'],
    rating: 4.7,
    plays: 19800,
    featured: false,
    controls: [
      { key: 'Spacebar or Click', action: 'Flap Wing' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0c0a09; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #wrap { position: relative; border: 2px solid #292524; border-radius: 8px; box-shadow: 0 0 25px rgba(234, 179, 8, 0.2); overflow: hidden; }
  canvas { background: #1c1917; display: block; cursor: pointer; }
  .screen { position: absolute; inset: 0; background: rgba(12, 10, 9, 0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  h1 { font-size: 30px; color: #facc15; margin-bottom: 8px; text-shadow: 0 0 15px #eab308; }
  p { font-size: 13px; color: #d6d3d1; margin-bottom: 16px; }
  button { background: #ca8a04; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
<div id="wrap">
  <canvas id="c" width="380" height="520"></canvas>
  <div id="start" class="screen">
    <h1>NEON FLAPPER</h1>
    <p>Tap / Space to fly through the gates</p>
    <button onclick="play()">START GAME</button>
  </div>
  <div id="over" class="screen" style="display:none;">
    <h1 style="color:#ef4444;">GAME OVER</h1>
    <p id="res">Score: 0</p>
    <button onclick="play()">PLAY AGAIN</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let bird, pipes, score = 0, highScore = localStorage.getItem('flappy_hi') || 0, isRunning = false;

function play() {
  document.getElementById('start').style.display = 'none';
  document.getElementById('over').style.display = 'none';
  bird = { x: 70, y: 220, vy: 0, gravity: 0.35, jump: -6.5, r: 12 };
  pipes = [];
  score = 0;
  isRunning = true;
  requestAnimationFrame(loop);
}

function flap() {
  if(!isRunning) return;
  bird.vy = bird.jump;
}

window.addEventListener('keydown', e => { if(e.code==='Space') { e.preventDefault(); flap(); } });
c.addEventListener('click', flap);

function loop() {
  if(!isRunning) return;
  bird.vy += bird.gravity;
  bird.y += bird.vy;

  if(pipes.length === 0 || pipes[pipes.length-1].x < c.width - 160) {
    const gap = 135;
    const top = Math.random() * (c.height - gap - 100) + 40;
    pipes.push({ x: c.width, top: top, bottom: top + gap, passed: false });
  }

  for(let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= 2.2;
    // Check score
    if(!pipes[i].passed && pipes[i].x < bird.x) {
      pipes[i].passed = true;
      score++;
    }
    // Collisions
    if(bird.x + bird.r > pipes[i].x && bird.x - bird.r < pipes[i].x + 45) {
      if(bird.y - bird.r < pipes[i].top || bird.y + bird.r > pipes[i].bottom) {
        die(); return;
      }
    }
    if(pipes[i].x < -50) pipes.splice(i, 1);
  }

  if(bird.y + bird.r > c.height || bird.y - bird.r < 0) { die(); return; }

  // Draw
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, c.width, c.height);

  // Pipes
  pipes.forEach(p => {
    ctx.fillStyle = '#065f46';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.fillRect(p.x, 0, 45, p.top);
    ctx.strokeRect(p.x, 0, 45, p.top);
    ctx.fillRect(p.x, p.bottom, 45, c.height - p.bottom);
    ctx.strokeRect(p.x, p.bottom, 45, c.height - p.bottom);
  });

  // Bird
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#facc15';
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eye
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(bird.x + 5, bird.y - 3, 3, 0, Math.PI*2);
  ctx.fill();

  // Score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('SCORE: ' + score, 20, 40);

  requestAnimationFrame(loop);
}

function die() {
  isRunning = false;
  if(score > highScore) { highScore = score; localStorage.setItem('flappy_hi', highScore); }
  document.getElementById('res').innerText = 'Score: ' + score + ' (Best: ' + highScore + ')';
  document.getElementById('over').style.display = 'flex';
}
</script>
</body>
</html>`
  },
  {
    id: 'brick-smasher-breakout',
    title: 'Breakout DX',
    category: 'Arcade',
    description: 'Destroy colorful brick formations with a high-velocity bouncing ball and power-up paddles. Clear all stages without losing your lives!',
    embedType: 'srcdoc',
    thumbnailColor: 'from-rose-900 to-pink-950',
    icon: 'Shield',
    tags: ['Breakout', 'Arcade', 'Retro', 'Bricks'],
    rating: 4.8,
    plays: 16700,
    featured: false,
    controls: [
      { key: 'Mouse or ← / →', action: 'Move Paddle' },
      { key: 'Spacebar', action: 'Launch Ball' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #180a0a; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #wrap { position: relative; border: 2px solid #4c0519; border-radius: 8px; box-shadow: 0 0 30px rgba(244, 63, 94, 0.2); }
  canvas { background: #0c0406; display: block; }
  .screen { position: absolute; inset: 0; background: rgba(12, 4, 6, 0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  h1 { font-size: 28px; color: #fb7185; margin-bottom: 8px; }
  button { background: #e11d48; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; }
</style>
</head>
<body>
<div id="wrap">
  <canvas id="c" width="500" height="420"></canvas>
  <div id="menu" class="screen">
    <h1>BREAKOUT DX</h1>
    <p style="color:#fda4af; margin-bottom:15px;">Use Left/Right arrows or mouse to move paddle</p>
    <button onclick="start()">PLAY</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let paddle, ball, bricks = [], score = 0, lives = 3, running = false, launched = false;

function start() {
  document.getElementById('menu').style.display = 'none';
  paddle = { w: 90, h: 12, x: c.width/2 - 45, y: c.height - 25, speed: 7 };
  ball = { x: c.width/2, y: c.height - 40, r: 6, vx: 4, vy: -4 };
  score = 0; lives = 3; launched = true; running = true;
  initBricks();
  requestAnimationFrame(loop);
}

function initBricks() {
  bricks = [];
  const rows = 5, cols = 8, bw = 54, bh = 18, pad = 6, offT = 40, offL = 12;
  const colors = ['#f43f5e', '#fb7185', '#f59e0b', '#10b981', '#06b6d4'];
  for(let r=0; r<rows; r++) {
    for(let cl=0; cl<cols; cl++) {
      bricks.push({ x: offL + cl*(bw+pad), y: offT + r*(bh+pad), w: bw, h: bh, color: colors[r], val: (rows-r)*10 });
    }
  }
}

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });
c.addEventListener('mousemove', e => {
  const rect = c.getBoundingClientRect();
  paddle.x = e.clientX - rect.left - paddle.w/2;
});

function loop() {
  if(!running) return;

  if(keys['ArrowLeft'] || keys['KeyA']) paddle.x -= paddle.speed;
  if(keys['ArrowRight'] || keys['KeyD']) paddle.x += paddle.speed;
  paddle.x = Math.max(0, Math.min(c.width - paddle.w, paddle.x));

  ball.x += ball.vx;
  ball.y += ball.vy;

  if(ball.x - ball.r <= 0 || ball.x + ball.r >= c.width) ball.vx *= -1;
  if(ball.y - ball.r <= 0) ball.vy *= -1;

  // Paddle collision with angle
  if(ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h &&
     ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
    ball.vy = -Math.abs(ball.vy);
    const diff = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
    ball.vx = diff * 5;
  }

  // Bricks collision
  for(let i=bricks.length-1; i>=0; i--) {
    const b = bricks[i];
    if(ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
      ball.vy *= -1;
      score += b.val;
      bricks.splice(i, 1);
      if(bricks.length === 0) { initBricks(); }
      break;
    }
  }

  // Fall off
  if(ball.y > c.height) {
    lives--;
    if(lives <= 0) {
      running = false;
      document.getElementById('menu').style.display = 'flex';
      return;
    } else {
      ball.x = paddle.x + paddle.w/2;
      ball.y = paddle.y - 15;
      ball.vy = -4;
    }
  }

  // Draw
  ctx.fillStyle = '#0c0406';
  ctx.fillRect(0, 0, c.width, c.height);

  // Paddle
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

  // Ball
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fill();

  // Bricks
  bricks.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });

  // UI
  ctx.fillStyle = '#fda4af';
  ctx.font = '14px monospace';
  ctx.fillText('SCORE: ' + score, 15, 25);
  ctx.fillText('LIVES: ' + '❤️'.repeat(lives), c.width - 120, 25);

  requestAnimationFrame(loop);
}
</script>
</body>
</html>`
  },
  {
    id: 'cyber-slope-runner',
    title: 'Cyber Tunnel 3D',
    category: 'Action',
    description: 'High velocity pseudo-3D obstacle dodger. Roll through the neon track, avoid red hazards, and jump over bottomless pits.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-cyan-900 to-blue-950',
    icon: 'Zap',
    tags: ['3D', 'Runner', 'Speed', 'Action'],
    rating: 4.8,
    plays: 31200,
    featured: true,
    controls: [
      { key: '← / → or A / D', action: 'Steer Sphere' },
      { key: 'Spacebar / W', action: 'Jump' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #050b14; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #wrap { position: relative; border: 2px solid #0369a1; border-radius: 8px; box-shadow: 0 0 35px rgba(14, 165, 233, 0.3); overflow: hidden; }
  canvas { background: #020617; display: block; }
  .screen { position: absolute; inset: 0; background: rgba(2, 6, 23, 0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  h1 { font-size: 30px; color: #38bdf8; margin-bottom: 8px; text-shadow: 0 0 20px #0ea5e9; }
  button { background: #0284c7; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
<div id="wrap">
  <canvas id="c" width="480" height="420"></canvas>
  <div id="start" class="screen">
    <h1>CYBER TUNNEL 3D</h1>
    <p style="color:#94a3b8; margin-bottom:16px;">Steer with Left/Right arrows, avoid obstacles!</p>
    <button onclick="play()">START RUN</button>
  </div>
  <div id="over" class="screen" style="display:none;">
    <h1 style="color:#ef4444;">WIPEOUT</h1>
    <p id="dist-txt" style="color:#cbd5e1; margin-bottom:16px;">Distance: 0m</p>
    <button onclick="play()">TRY AGAIN</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let player, obstacles, distance = 0, speed = 6, isRunning = false;

function play() {
  document.getElementById('start').style.display = 'none';
  document.getElementById('over').style.display = 'none';
  player = { x: 0, y: 0, z: 0, vx: 0 };
  obstacles = [];
  distance = 0; speed = 7; isRunning = true;
  requestAnimationFrame(loop);
}

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

function loop() {
  if(!isRunning) return;

  if(keys['ArrowLeft'] || keys['KeyA']) player.vx = -0.06;
  else if(keys['ArrowRight'] || keys['KeyD']) player.vx = 0.06;
  else player.vx *= 0.85;

  player.x += player.vx;
  player.x = Math.max(-1.4, Math.min(1.4, player.x));
  distance += speed * 0.1;
  speed += 0.002;

  // Spawn obstacles
  if(Math.random() < 0.08) {
    obstacles.push({
      x: (Math.random() - 0.5) * 2.5,
      z: 50,
      w: 0.6,
      h: 0.8
    });
  }

  // Update obstacles
  for(let i=obstacles.length-1; i>=0; i--) {
    obstacles[i].z -= speed * 0.1;
    // Collision check
    if(obstacles[i].z < 1.5 && obstacles[i].z > -0.5) {
      if(Math.abs(player.x - obstacles[i].x) < 0.45) {
        die(); return;
      }
    }
    if(obstacles[i].z < -5) obstacles.splice(i, 1);
  }

  // Draw 3D scene
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, c.width, c.height);

  const horizonY = 160;
  const fov = 200;

  // Draw grid lines
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 1;
  for(let i = -2; i <= 2; i += 0.5) {
    const startX = c.width/2 + i * 20;
    const endX = c.width/2 + i * 180;
    ctx.beginPath();
    ctx.moveTo(startX, horizonY);
    ctx.lineTo(endX, c.height);
    ctx.stroke();
  }

  // Horizontal moving lines
  ctx.strokeStyle = '#0284c7';
  const offset = (distance * 10) % 40;
  for(let y = horizonY + offset; y < c.height; y += 35) {
    const scale = (y - horizonY) / (c.height - horizonY);
    ctx.lineWidth = scale * 2;
    ctx.beginPath();
    ctx.moveTo(c.width/2 - 250 * scale, y);
    ctx.lineTo(c.width/2 + 250 * scale, y);
    ctx.stroke();
  }

  // Draw obstacles
  obstacles.forEach(o => {
    if(o.z > 0.5) {
      const scale = fov / (o.z + fov);
      const scrX = c.width/2 + o.x * 200 * scale;
      const scrY = horizonY + (100) * scale;
      const szW = o.w * 150 * scale;
      const szH = o.h * 150 * scale;

      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10 * scale;
      ctx.fillRect(scrX - szW/2, scrY - szH, szW, szH);
      ctx.shadowBlur = 0;
    }
  });

  // Player sphere
  const pScreenX = c.width/2 + player.x * 120;
  const pScreenY = c.height - 50;

  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(pScreenX, pScreenY, 18, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // UI
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('DISTANCE: ' + Math.floor(distance) + 'm', 20, 30);
  ctx.fillText('SPEED: ' + speed.toFixed(1) + 'x', c.width - 140, 30);

  requestAnimationFrame(loop);
}

function die() {
  isRunning = false;
  document.getElementById('dist-txt').innerText = 'Distance Reached: ' + Math.floor(distance) + 'm';
  document.getElementById('over').style.display = 'flex';
}
</script>
</body>
</html>`
  },
  {
    id: 'minesweeper-classic',
    title: 'Minesweeper Retro',
    category: 'Puzzle',
    description: 'Uncover hidden minefield tiles with logic and deductive reasoning. Flag potential mines and clear the grid safely!',
    embedType: 'srcdoc',
    thumbnailColor: 'from-slate-800 to-zinc-950',
    icon: 'Target',
    tags: ['Minesweeper', 'Logic', 'Puzzle', 'Windows'],
    rating: 4.8,
    plays: 18200,
    featured: false,
    controls: [
      { key: 'Left Click', action: 'Reveal Cell' },
      { key: 'Right Click / Long Press', action: 'Flag / Unflag' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #1e293b; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
  .box { background: #334155; padding: 14px; border-radius: 8px; border: 2px solid #475569; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
  .bar { display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-weight: bold; }
  .digits { color: #ef4444; font-size: 20px; font-family: monospace; }
  .face { font-size: 22px; cursor: pointer; }
  #grid { display: grid; grid-template-columns: repeat(9, 32px); gap: 2px; }
  .cell { width: 32px; height: 32px; background: #475569; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; cursor: pointer; border: 1px solid #64748b; }
  .cell.revealed { background: #1e293b; border-color: #334155; }
  .n1 { color: #38bdf8; } .n2 { color: #4ade80; } .n3 { color: #f87171; } .n4 { color: #c084fc; }
</style>
</head>
<body>
<div class="box">
  <div class="bar">
    <div id="mines" class="digits">010</div>
    <div id="face" class="face" onclick="init()">🙂</div>
    <div id="time" class="digits">000</div>
  </div>
  <div id="grid" oncontextmenu="return false;"></div>
</div>
<script>
const COLS = 9, ROWS = 9, MINES = 10;
let grid = [], minesLeft = MINES, gameOver = false, timer = 0, timerId;

function init() {
  clearInterval(timerId);
  timer = 0; gameOver = false; minesLeft = MINES;
  document.getElementById('time').innerText = '000';
  document.getElementById('mines').innerText = String(minesLeft).padStart(3, '0');
  document.getElementById('face').innerText = '🙂';

  grid = Array.from({length: ROWS}, () => Array.from({length: COLS}, () => ({ mine: false, rev: false, flag: false, count: 0 })));

  let placed = 0;
  while(placed < MINES) {
    let r = Math.floor(Math.random()*ROWS), c = Math.floor(Math.random()*COLS);
    if(!grid[r][c].mine) { grid[r][c].mine = true; placed++; }
  }

  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      if(!grid[r][c].mine) {
        let cnt = 0;
        for(let dr=-1; dr<=1; dr++) {
          for(let dc=-1; dc<=1; dc++) {
            let nr = r+dr, nc = c+dc;
            if(nr>=0 && nr<ROWS && nc>=0 && nc<COLS && grid[nr][nc].mine) cnt++;
          }
        }
        grid[r][c].count = cnt;
      }
    }
  }

  render();
  timerId = setInterval(() => {
    if(!gameOver) {
      timer++;
      document.getElementById('time').innerText = String(timer).padStart(3, '0');
    }
  }, 1000);
}

function render() {
  const g = document.getElementById('grid');
  g.innerHTML = '';
  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      const d = document.createElement('div');
      const cell = grid[r][c];
      d.className = 'cell' + (cell.rev ? ' revealed' : '');
      if(cell.rev) {
        if(cell.mine) d.innerText = '💣';
        else if(cell.count > 0) {
          d.innerText = cell.count;
          d.classList.add('n' + cell.count);
        }
      } else if(cell.flag) {
        d.innerText = '🚩';
      }
      d.onmousedown = (e) => {
        if(gameOver) return;
        if(e.button === 2) {
          if(!cell.rev) {
            cell.flag = !cell.flag;
            minesLeft += cell.flag ? -1 : 1;
            document.getElementById('mines').innerText = String(minesLeft).padStart(3, '0');
            render();
          }
        } else if(e.button === 0 && !cell.flag) {
          reveal(r, c);
        }
      };
      g.appendChild(d);
    }
  }
}

function reveal(r, c) {
  const cell = grid[r][c];
  if(cell.rev || cell.flag) return;
  cell.rev = true;
  if(cell.mine) {
    gameOver = true;
    document.getElementById('face').innerText = '😵';
    // reveal all mines
    grid.forEach(row => row.forEach(cl => { if(cl.mine) cl.rev = true; }));
  } else if(cell.count === 0) {
    for(let dr=-1; dr<=1; dr++) {
      for(let dc=-1; dc<=1; dc++) {
        let nr = r+dr, nc = c+dc;
        if(nr>=0 && nr<ROWS && nc>=0 && nc<COLS) reveal(nr, nc);
      }
    }
  }

  // Win check
  let won = true;
  grid.forEach(row => row.forEach(cl => { if(!cl.mine && !cl.rev) won = false; }));
  if(won) {
    gameOver = true;
    document.getElementById('face').innerText = '😎';
  }
  render();
}

init();
</script>
</body>
</html>`
  },
  {
    id: 'pong-championship',
    title: 'Cyber Pong',
    category: 'Sports',
    description: 'The grandfather of video games revitalized with neon paddle physics and intelligent AI opponent difficulties.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-green-900 to-emerald-950',
    icon: 'Trophy',
    tags: ['Pong', 'Retro', '2-Player', 'Sports'],
    rating: 4.6,
    plays: 12500,
    featured: false,
    controls: [
      { key: 'W / S or Up / Down', action: 'Move Left Paddle' },
      { key: 'Mouse', action: 'Move Paddle' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #052e16; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #wrap { position: relative; border: 2px solid #15803d; border-radius: 8px; box-shadow: 0 0 30px rgba(34, 197, 94, 0.3); }
  canvas { background: #022c22; display: block; }
</style>
</head>
<body>
<div id="wrap">
  <canvas id="c" width="560" height="380"></canvas>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let p1 = { y: 150, h: 70, w: 10, score: 0 }, p2 = { y: 150, h: 70, w: 10, score: 0 };
let ball = { x: 280, y: 190, r: 6, vx: 5, vy: 3 };

c.addEventListener('mousemove', e => {
  const rect = c.getBoundingClientRect();
  p1.y = e.clientY - rect.top - p1.h/2;
});

function loop() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if(ball.y - ball.r <= 0 || ball.y + ball.r >= c.height) ball.vy *= -1;

  // AI paddle tracking
  p2.y += (ball.y - (p2.y + p2.h/2)) * 0.1;

  // P1 collision
  if(ball.x - ball.r <= 25 && ball.y >= p1.y && ball.y <= p1.y + p1.h) {
    ball.vx = Math.abs(ball.vx) * 1.05;
    ball.vy += (ball.y - (p1.y + p1.h/2)) * 0.1;
  }
  // P2 collision
  if(ball.x + ball.r >= c.width - 25 && ball.y >= p2.y && ball.y <= p2.y + p2.h) {
    ball.vx = -Math.abs(ball.vx) * 1.05;
    ball.vy += (ball.y - (p2.y + p2.h/2)) * 0.1;
  }

  // Scoring
  if(ball.x < 0) { p2.score++; resetBall(); }
  if(ball.x > c.width) { p1.score++; resetBall(); }

  // Draw
  ctx.fillStyle = '#022c22';
  ctx.fillRect(0, 0, c.width, c.height);

  // Net
  ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
  ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(c.width/2, 0); ctx.lineTo(c.width/2, c.height); ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(15, p1.y, p1.w, p1.h);
  ctx.fillRect(c.width - 25, p2.y, p2.w, p2.h);

  // Ball
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();

  // Scores
  ctx.font = '32px monospace';
  ctx.fillText(p1.score, c.width/2 - 60, 50);
  ctx.fillText(p2.score, c.width/2 + 40, 50);

  requestAnimationFrame(loop);
}

function resetBall() {
  ball.x = c.width/2;
  ball.y = c.height/2;
  ball.vx = (Math.random() > 0.5 ? 5 : -5);
  ball.vy = (Math.random() - 0.5) * 6;
}

loop();
</script>
</body>
</html>`
  },
  {
    id: 'gem-clicker-tycoon',
    title: 'Crystal Clicker Tycoon',
    category: 'Idle',
    description: 'Mine sparkling cyber crystals! Purchase auto-miners, laser cutters, and quantum excavators to build your infinite crystal empire.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-fuchsia-900 to-purple-950',
    icon: 'Sparkles',
    tags: ['Idle', 'Clicker', 'Tycoon', 'Casual'],
    rating: 4.7,
    plays: 24600,
    featured: false,
    controls: [
      { key: 'Click Gem', action: 'Mine Crystals' },
      { key: 'Click Upgrades', action: 'Purchase Automation' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #130a1c; color: #fff; font-family: system-ui, sans-serif; display: flex; height: 100vh; overflow: hidden; }
  .left { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 2px solid #2e1065; padding: 20px; }
  .right { width: 260px; background: #1e0f33; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .count { font-size: 32px; font-weight: 900; color: #c084fc; text-shadow: 0 0 20px #a855f7; margin-bottom: 4px; }
  .cps { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
  .gem { width: 140px; height: 140px; background: radial-gradient(circle, #e879f9, #a855f7, #6b21a8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; cursor: pointer; box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); transition: transform 0.08s; }
  .gem:active { transform: scale(0.92); }
  .upgrade { background: #2e1065; border: 1px solid #581c87; padding: 10px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  .upgrade:hover { background: #3b0764; }
  .u-name { font-weight: bold; font-size: 13px; color: #e9d5ff; }
  .u-cost { font-size: 12px; color: #c084fc; }
  .u-qty { font-size: 16px; font-weight: 900; color: #f0abfc; }
</style>
</head>
<body>
<div class="left">
  <div id="gems" class="count">0 💎</div>
  <div id="cps" class="cps">0 crystals / second</div>
  <div class="gem" onclick="clickGem()">💎</div>
</div>
<div id="upgrades" class="right"></div>
<script>
let crystals = 0, totalCPS = 0;
const items = [
  { id: 1, name: 'Auto-Picker', cost: 15, cps: 1, count: 0 },
  { id: 2, name: 'Laser Drill', cost: 100, cps: 8, count: 0 },
  { id: 3, name: 'Crystal Refinery', cost: 1100, cps: 45, count: 0 },
  { id: 4, name: 'Quantum Mine', cost: 12000, cps: 260, count: 0 }
];

function clickGem() {
  crystals += 1;
  updateUI();
}

function buy(idx) {
  const item = items[idx];
  if(crystals >= item.cost) {
    crystals -= item.cost;
    item.count++;
    item.cost = Math.floor(item.cost * 1.18);
    calcCPS();
    renderUpgrades();
    updateUI();
  }
}

function calcCPS() {
  totalCPS = items.reduce((acc, it) => acc + (it.count * it.cps), 0);
}

function updateUI() {
  document.getElementById('gems').innerText = Math.floor(crystals).toLocaleString() + ' 💎';
  document.getElementById('cps').innerText = totalCPS + ' crystals / second';
}

function renderUpgrades() {
  const u = document.getElementById('upgrades');
  u.innerHTML = '';
  items.forEach((it, idx) => {
    const d = document.createElement('div');
    d.className = 'upgrade';
    d.onclick = () => buy(idx);
    d.innerHTML = '<div><div class="u-name">' + it.name + ' (+' + it.cps + '/s)</div><div class="u-cost">Cost: ' + it.cost.toLocaleString() + ' 💎</div></div><div class="u-qty">' + it.count + '</div>';
    u.appendChild(d);
  });
}

setInterval(() => {
  crystals += totalCPS / 10;
  updateUI();
}, 100);

renderUpgrades();
updateUI();
</script>
</body>
</html>`
  },
  {
    id: 'dino-runner-chrome',
    title: 'T-Rex Desert Runner',
    category: 'Retro',
    description: 'Jump over cacti and duck under pterodactyls in this timeless offline classic recreation.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-amber-950 to-stone-900',
    icon: 'Flame',
    tags: ['Dino', 'Runner', 'Offline', 'Classic'],
    rating: 4.8,
    plays: 27900,
    featured: false,
    controls: [
      { key: 'Spacebar / ↑', action: 'Jump' },
      { key: '↓', action: 'Duck' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #1c1917; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #wrap { position: relative; border: 2px solid #44403c; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
  canvas { background: #0c0a09; display: block; }
  .screen { position: absolute; inset: 0; background: rgba(12, 10, 9, 0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  h1 { font-size: 28px; color: #e7e5e4; margin-bottom: 8px; }
  button { background: #78716c; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
<div id="wrap">
  <canvas id="c" width="540" height="240"></canvas>
  <div id="start" class="screen">
    <h1>T-REX RUNNER</h1>
    <p style="color:#a8a29e; margin-bottom:14px;">Press Space or Up Arrow to jump</p>
    <button onclick="play()">START RUN</button>
  </div>
  <div id="over" class="screen" style="display:none;">
    <h1 style="color:#ef4444;">GAME OVER</h1>
    <p id="sc-txt" style="color:#d6d3d1; margin-bottom:14px;">Score: 0</p>
    <button onclick="play()">RETRY</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let dino, obstacles, score = 0, speed = 6, running = false;

function play() {
  document.getElementById('start').style.display = 'none';
  document.getElementById('over').style.display = 'none';
  dino = { x: 40, y: 170, w: 26, h: 36, vy: 0, jump: -10.5, gravity: 0.6, isGround: true };
  obstacles = [];
  score = 0; speed = 6.5; running = true;
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => {
  if(['Space','ArrowUp'].includes(e.code)) {
    e.preventDefault();
    if(dino.isGround) { dino.vy = dino.jump; dino.isGround = false; }
  }
});

function loop() {
  if(!running) return;
  dino.vy += dino.gravity;
  dino.y += dino.vy;
  if(dino.y >= 170) { dino.y = 170; dino.vy = 0; dino.isGround = true; }

  score++;
  speed += 0.001;

  if(obstacles.length === 0 || obstacles[obstacles.length-1].x < c.width - 240) {
    if(Math.random() < 0.04) {
      obstacles.push({ x: c.width, w: 18 + Math.random()*12, h: 28 + Math.random()*16 });
    }
  }

  for(let i=obstacles.length-1; i>=0; i--) {
    obstacles[i].x -= speed;
    // Collision
    const ob = obstacles[i];
    if(dino.x + dino.w > ob.x && dino.x < ob.x + ob.w && dino.y + dino.h > 206 - ob.h) {
      die(); return;
    }
    if(obstacles[i].x < -30) obstacles.splice(i, 1);
  }

  // Draw
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, c.width, c.height);

  // Ground line
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 206); ctx.lineTo(c.width, 206); ctx.stroke();

  // Dino
  ctx.fillStyle = '#e7e5e4';
  ctx.fillRect(dino.x, dino.y, dino.w, dino.h);

  // Obstacles (cacti)
  ctx.fillStyle = '#10b981';
  obstacles.forEach(o => {
    ctx.fillRect(o.x, 206 - o.h, o.w, o.h);
  });

  // Score
  ctx.fillStyle = '#a8a29e';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('SCORE: ' + Math.floor(score/6), c.width - 140, 30);

  requestAnimationFrame(loop);
}

function die() {
  running = false;
  document.getElementById('sc-txt').innerText = 'Final Score: ' + Math.floor(score/6);
  document.getElementById('over').style.display = 'flex';
}
</script>
</body>
</html>`
  },
  {
    id: 'tic-tac-toe-master',
    title: 'Tic-Tac-Toe Smart AI',
    category: 'Strategy',
    description: 'Play the classic game of Xs and Os against an unbeatable Minimax algorithm or challenge a friend in 2-Player local mode.',
    embedType: 'srcdoc',
    thumbnailColor: 'from-blue-950 to-slate-900',
    icon: 'Grid',
    tags: ['Board', 'Strategy', '2-Player', 'Classic'],
    rating: 4.6,
    plays: 11200,
    featured: false,
    controls: [
      { key: 'Left Click', action: 'Place X or O' }
    ],
    srcdocContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0f172a; color: #fff; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
  .title { font-size: 26px; font-weight: 800; color: #38bdf8; margin-bottom: 12px; }
  .status { font-size: 16px; color: #94a3b8; margin-bottom: 16px; height: 24px; }
  .board { display: grid; grid-template-columns: repeat(3, 90px); gap: 8px; background: #1e293b; padding: 12px; border-radius: 12px; border: 2px solid #334155; }
  .cell { width: 90px; height: 90px; background: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 42px; font-weight: 900; cursor: pointer; transition: background 0.15s; }
  .cell:hover { background: #1e293b; }
  .cell.x { color: #38bdf8; }
  .cell.o { color: #f43f5e; }
  .btn { margin-top: 16px; background: #0284c7; color: #fff; border: none; padding: 8px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
<div class="title">TIC-TAC-TOE AI</div>
<div id="status" class="status">Your Turn (X)</div>
<div id="board" class="board"></div>
<button class="btn" onclick="init()">RESTART</button>
<script>
let board = Array(9).fill(''), isOver = false;

function init() {
  board = Array(9).fill('');
  isOver = false;
  document.getElementById('status').innerText = 'Your Turn (X)';
  render();
}

function render() {
  const b = document.getElementById('board');
  b.innerHTML = '';
  board.forEach((val, i) => {
    const c = document.createElement('div');
    c.className = 'cell ' + val.toLowerCase();
    c.innerText = val;
    c.onclick = () => makeMove(i);
    b.appendChild(c);
  });
}

function checkWin(bd) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(let w of wins) {
    if(bd[w[0]] && bd[w[0]] === bd[w[1]] && bd[w[0]] === bd[w[2]]) return bd[w[0]];
  }
  if(bd.every(v => v !== '')) return 'Tie';
  return null;
}

function makeMove(i) {
  if(board[i] !== '' || isOver) return;
  board[i] = 'X';
  render();
  let win = checkWin(board);
  if(win) { finish(win); return; }

  document.getElementById('status').innerText = 'AI Thinking...';
  setTimeout(aiMove, 250);
}

function aiMove() {
  if(isOver) return;
  // Simple Smart AI
  let move = findBestMove();
  if(move !== -1) {
    board[move] = 'O';
    render();
    let win = checkWin(board);
    if(win) { finish(win); return; }
    document.getElementById('status').innerText = 'Your Turn (X)';
  }
}

function findBestMove() {
  // Check if AI can win
  for(let i=0; i<9; i++) {
    if(board[i]==='') {
      board[i] = 'O';
      if(checkWin(board)==='O') { board[i]=''; return i; }
      board[i] = '';
    }
  }
  // Block human win
  for(let i=0; i<9; i++) {
    if(board[i]==='') {
      board[i] = 'X';
      if(checkWin(board)==='X') { board[i]=''; return i; }
      board[i] = '';
    }
  }
  // Center
  if(board[4]==='') return 4;
  // Corners
  const corners = [0,2,6,8].filter(c => board[c]==='');
  if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
  // Remaining
  const remaining = board.map((v,i)=>v===''?i:null).filter(v=>v!==null);
  return remaining.length ? remaining[0] : -1;
}

function finish(res) {
  isOver = true;
  if(res === 'Tie') document.getElementById('status').innerText = '🤝 Game Ended in a Draw!';
  else if(res === 'X') document.getElementById('status').innerText = '🎉 You Won!';
  else document.getElementById('status').innerText = '🤖 AI Won!';
}

init();
</script>
</body>
</html>`
  }
];
