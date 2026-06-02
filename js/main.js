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
  });

  canvas.addEventListener('click', () => {
    if (game.state === 'gameover') game.restart();
  });

  function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

init();
