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
  await SoundManager.init();
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

  function handleKey(e, state) {
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); game.setKey(1, 'left', state); break;
      case 'ArrowRight': e.preventDefault(); game.setKey(1, 'right', state); break;
      case 'ArrowUp': e.preventDefault(); game.setKey(1, 'up', state); break;
      case 'ArrowDown': e.preventDefault(); game.setKey(1, 'down', state); break;
      case 'a': game.setKey(2, 'left', state); break;
      case 'd': game.setKey(2, 'right', state); break;
      case 'w': game.setKey(2, 'up', state); break;
      case 's': game.setKey(2, 'down', state); break;
    }
  }

  document.addEventListener('keydown', (e) => {
    handleKey(e, true);
  });

  document.addEventListener('keyup', (e) => {
    handleKey(e, false);
    if (e.key === 'r' || e.key === 'R') {
      if (game.state === 'gameover') game.restart();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (game.state === 'menu') game.startGame();
    }
    if (e.key === 'm' || e.key === 'M') {
      SoundManager.toggleMute();
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
