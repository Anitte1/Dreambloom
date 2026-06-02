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

  for (const ch of CHARACTER_TYPES) {
    const base = 'assets/kenney_platformer-characters/PNG/' + ch.id + '/Poses/';
    await Promise.all([
      loadImage(base + ch.prefix + '_stand.png').then(img => Assets[ch.id + '_stand'] = img),
      loadImage(base + ch.prefix + '_walk1.png').then(img => Assets[ch.id + '_walk1'] = img),
      loadImage(base + ch.prefix + '_walk2.png').then(img => Assets[ch.id + '_walk2'] = img),
      loadImage(base + ch.prefix + '_jump.png').then(img => Assets[ch.id + '_jump'] = img),
      loadImage(base + ch.prefix + '_hurt.png').then(img => Assets[ch.id + '_hurt'] = img),
    ]);
  }

  for (const m of MAP_TYPES) {
    Assets['bg_' + m.name] = await loadImage(m.background);
    Assets['floor_' + m.name] = await loadImage(m.floor);
  }

  Assets.lifeIcon = await loadImage(LIFE_ICON_PATH);
  Assets.starIcon = await loadImage(STAR_ICON_PATH);

  const allDecos = {};
  for (const d of CLOUD_DEFS) allDecos[d.key] = d.path;
  for (const m of MAP_TYPES) {
    for (const d of m.floorDecos) allDecos[d.key] = d.path;
  }
  for (const [key, path] of Object.entries(allDecos)) {
    Assets[key] = await loadImage(path);
  }

  for (const t of ENEMY_TYPES) {
    Assets[t.id] = await loadImage(t.path);
    Assets[t.id + 'Anim'] = await loadImage(t.animPath);
  }

  const game = new Game(canvas);
  SoundManager.startMusic();

  function handleKey(e, state) {
    const key = e.key;
    switch (key) {
      case 'ArrowLeft': e.preventDefault(); game.setKey(1, 'left', state); break;
      case 'ArrowRight': e.preventDefault(); game.setKey(1, 'right', state); break;
      case 'ArrowUp': e.preventDefault(); game.setKey(1, 'up', state); break;
      case 'ArrowDown': e.preventDefault(); game.setKey(1, 'down', state); break;
      case 'a': case 'A': e.preventDefault(); game.setKey(2, 'left', state); break;
      case 'd': case 'D': e.preventDefault(); game.setKey(2, 'right', state); break;
      case 'w': case 'W': e.preventDefault(); game.setKey(2, 'up', state); break;
      case 's': case 'S': e.preventDefault(); game.setKey(2, 'down', state); break;
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

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  canvas.addEventListener('click', (e) => {
    const pos = getMousePos(e);

    if (game.state === 'menu') {
      if (game.muteBtn && pos.x >= game.muteBtn.x && pos.x <= game.muteBtn.x + game.muteBtn.w && pos.y >= game.muteBtn.y && pos.y <= game.muteBtn.y + game.muteBtn.h) {
        SoundManager.toggleMute();
        return;
      }
      if (game.charButtons) {
        for (const btn of game.charButtons) {
          if (pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h) {
            const key = btn.player === 0 ? 'charIdx1' : 'charIdx2';
            const maxIdx = CHARACTER_TYPES.length - 1;
            game[key] = (game[key] + btn.dir + maxIdx + 1) % CHARACTER_TYPES.length;
            const charDef = CHARACTER_TYPES[game[key]];
            const p = btn.player === 0 ? game.player1 : game.player2;
            p.characterId = charDef.id;
            return;
          }
        }
      }
      if (game.mapButtons) {
        for (const btn of game.mapButtons) {
          if (pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h) {
            const maxIdx = MAP_TYPES.length - 1;
            game.mapIdx = (game.mapIdx + btn.dir + maxIdx + 1) % MAP_TYPES.length;
            return;
          }
        }
      }
      if (game.playBtn && pos.x >= game.playBtn.x && pos.x <= game.playBtn.x + game.playBtn.w && pos.y >= game.playBtn.y && pos.y <= game.playBtn.y + game.playBtn.h) {
        game.startGame();
      }
    } else if (game.state === 'gameover') {
      game.restart();
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
