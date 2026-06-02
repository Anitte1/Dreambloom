const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const Assets = {};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('Failed to load: ' + src);
      resolve(null);
    };
    img.src = src;
  });
}

async function init() {
  Assets.playerStand = await loadImage(PLAYER_STAND_PATH);
  Assets.playerWalk1 = await loadImage(PLAYER_WALK1_PATH);
  Assets.playerWalk2 = await loadImage(PLAYER_WALK2_PATH);
  Assets.playerJump = await loadImage(PLAYER_JUMP_PATH);
  Assets.playerHurt = await loadImage(PLAYER_HURT_PATH);
  Assets.background = await loadImage(BACKGROUND_PATH);
  Assets.floorTile = await loadImage(FLOOR_TILE_PATH);

  Assets.lifeIcon = await loadImage(LIFE_ICON_PATH);
  Assets.starIcon = await loadImage(STAR_ICON_PATH);

  for (const d of [...BACKGROUND_DECORATIONS, ...FLOOR_DECORATIONS]) {
    Assets[d.key] = await loadImage(d.path);
  }

  for (const t of ENEMY_TYPES) {
    Assets[t.id] = await loadImage(t.path);
    Assets[t.id + 'Anim'] = await loadImage(t.animPath);
  }

  const game = new Game(canvas);
  game.backgroundImage = Assets.background;
  game.floorTileImage = Assets.floorTile;

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft': case 'ArrowRight': case 'ArrowUp': case 'ArrowDown':
        e.preventDefault();
        break;
    }
    switch (e.key) {
      case 'ArrowLeft': case 'a': game.setKey('left', true); break;
      case 'ArrowRight': case 'd': game.setKey('right', true); break;
      case 'ArrowUp': case 'w': game.setKey('up', true); break;
      case 'ArrowDown': case 's': game.setKey('down', true); break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'ArrowLeft': case 'ArrowRight': case 'ArrowUp': case 'ArrowDown':
        e.preventDefault();
        break;
    }
    switch (e.key) {
      case 'ArrowLeft': case 'a': game.setKey('left', false); break;
      case 'ArrowRight': case 'd': game.setKey('right', false); break;
      case 'ArrowUp': case 'w': game.setKey('up', false); break;
      case 'ArrowDown': case 's': game.setKey('down', false); break;
    }
    if (e.key === 'r' || e.key === 'R') {
      if (game.state === 'gameover') game.restart();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (game.state === 'menu') game.startGame();
    }
  });

  canvas.addEventListener('click', (e) => {
    if (game.state === 'gameover') {
      game.restart();
    } else if (game.state === 'menu' && game.playBtn) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const btn = game.playBtn;
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        game.startGame();
      }
    }
  });

  function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

init();
