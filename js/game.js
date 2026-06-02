class Coin {
  constructor() {
    this.width = 28;
    this.height = 28;
    this.x = 40 + Math.random() * (CANVAS_WIDTH - 80 - this.width);
    this.y = -this.height;
    this.speed = 1.5;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    if (Assets.starIcon) {
      ctx.drawImage(Assets.starIcon, this.x, this.y, this.width, this.height);
    }
  }

  isOffScreen() {
    return this.y > CANVAS_HEIGHT + 30;
  }
}

class Player {
  constructor(canvasWidth, canvasHeight, characterId) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.characterId = characterId || 'Adventurer';
    this.width = 80;
    this.height = 80;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - FLOOR_HEIGHT - this.height / 2;
    this.speed = PLAYER_SPEED;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 10;
    this.state = 'idle';
    this.jumpTimer = 0;
    this.prevUp = false;
    this.lives = MAX_LIVES;
    this.invulnerableTimer = 0;
    this.score = 0;
  }

  reset() {
    this.x = this.canvasWidth / 2 - this.width / 2;
    this.y = this.canvasHeight - FLOOR_HEIGHT - this.height / 2;
    this.state = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.jumpTimer = 0;
    this.prevUp = false;
    this.lives = MAX_LIVES;
    this.invulnerableTimer = 0;
    this.score = 0;
  }

  hit() {
    if (this.invulnerableTimer > 0) return false;
    this.lives--;
    this.state = 'hurt';
    this.invulnerableTimer = INVULNERABLE_DURATION;
    SoundManager.play('playerHit');
    if (this.lives <= 0) SoundManager.play('death');
    return this.lives <= 0;
  }

  update(keys) {
    const moving = keys.left || keys.right || keys.down;

    if (keys.left) this.x -= this.speed;
    if (keys.right) this.x += this.speed;
    if (keys.down) this.y += this.speed;

    this.y = Math.min(this.y, this.canvasHeight - FLOOR_HEIGHT - this.height / 2);

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;

    if (keys.up && !this.prevUp) {
      this.jumpTimer = 8;
      SoundManager.play('jump');
    }
    this.prevUp = keys.up;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
      if (this.invulnerableTimer === 0 && this.state === 'hurt') {
        this.state = 'idle';
      }
    }

    if (this.jumpTimer > 0) {
      this.state = 'jump';
      this.jumpTimer--;
    } else if (!moving) {
      if (this.invulnerableTimer === 0) this.state = 'idle';
      this.animFrame = 0;
      this.animTimer = 0;
    } else {
      if (this.invulnerableTimer === 0) this.state = 'run';
      this.animTimer++;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 2;
      }
    }
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) return;

    const c = this.characterId;
    const get = (key) => Assets[c + '_' + key];
    let sprite;
    switch (this.state) {
      case 'hurt':
        sprite = get('hurt') || get('stand');
        break;
      case 'jump':
        sprite = get('jump') || get('stand');
        break;
      case 'run':
        sprite = this.animFrame === 0 ? get('walk1') : get('walk2');
        break;
      default:
        sprite = get('stand');
    }
    if (sprite) {
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.charIdx1 = 0;
    this.charIdx2 = 1;
    this.player1 = new Player(canvas.width, canvas.height, CHARACTER_TYPES[this.charIdx1].id);
    this.player2 = new Player(canvas.width, canvas.height, CHARACTER_TYPES[this.charIdx2].id);
    this.player2.x = canvas.width / 2 + this.player2.width / 2 + 20;
    this.keysP1 = { left: false, right: false, up: false, down: false };
    this.keysP2 = { left: false, right: false, up: false, down: false };
    this.backgroundImage = null;
    this.floorTileImage = null;
    this.enemies = [];
    this.coins = [];
    this.spawnTimer = 0;
    this.coinSpawnTimer = 0;
    this.state = 'menu';
    this.score = 0;
    this.elapsedFrames = 0;
    this.bgDecos = [];
    this.floorDecos = [];
    this.generateDecorations();
  }

  getDifficultyLevel() {
    return Math.min(
      Math.floor(this.elapsedFrames / DIFFICULTY_STEP_FRAMES),
      MAX_DIFFICULTY_LEVEL
    );
  }

  getSpawnInterval() {
    const level = this.getDifficultyLevel();
    const interval = SPAWN_INTERVAL_MS - level * 100;
    return Math.max(interval, MIN_SPAWN_INTERVAL_MS);
  }

  getSpeedMultiplier() {
    const level = this.getDifficultyLevel();
    return 1 + level * 0.2;
  }

  generateDecorations() {
    for (let i = 0; i < DECO_COUNT_BG; i++) {
      const def = BACKGROUND_DECORATIONS[i % BACKGROUND_DECORATIONS.length];
      const size = def.minSize + Math.random() * (def.maxSize - def.minSize);
      this.bgDecos.push({
        key: def.key,
        x: Math.random() * CANVAS_WIDTH,
        y: 20 + Math.random() * 180,
        w: size,
        h: size * 0.6,
      });
    }

    const grassTop = CANVAS_HEIGHT - FLOOR_HEIGHT;
    for (let i = 0; i < DECO_COUNT_FLOOR; i++) {
      const def = FLOOR_DECORATIONS[i % FLOOR_DECORATIONS.length];
      let x, y, w, h;
      if (def.grow) {
        w = def.size;
        h = def.size * 1.4;
        x = Math.random() * (CANVAS_WIDTH - w);
        y = grassTop - h + 10;
      } else {
        w = def.size;
        h = def.size;
        x = Math.random() * (CANVAS_WIDTH - w);
        y = grassTop + 10 + Math.random() * (FLOOR_HEIGHT - w - 10);
      }
      this.floorDecos.push({ key: def.key, x, y, w, h });
    }
  }

  restart() {
    this.player1.reset();
    this.player2.reset();
    this.player2.x += 40;
    this.enemies = [];
    this.coins = [];
    this.spawnTimer = 0;
    this.coinSpawnTimer = 0;
    this.elapsedFrames = 0;
    this.state = 'playing';
    this.bgDecos = [];
    this.floorDecos = [];
    this.generateDecorations();
  }

  update() {
    if (this.state === 'gameover' || this.state === 'menu') return;

    this.player1.update(this.keysP1);
    this.player2.update(this.keysP2);
    this.elapsedFrames++;

    this.spawnTimer++;
    const currentSpawnInterval = this.getSpawnInterval() / 16;
    if (this.spawnTimer >= currentSpawnInterval) {
      this.spawnTimer = 0;
      const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      this.enemies.push(new Enemy(type, this.getSpeedMultiplier()));
    }

    this.coinSpawnTimer++;
    if (this.coinSpawnTimer >= COIN_SPAWN_INTERVAL_MS / 16) {
      this.coinSpawnTimer = 0;
      this.coins.push(new Coin());
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update();
      if (this.enemies[i].isOffScreen()) {
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      this.coins[i].update();
      if (this.coins[i].isOffScreen()) {
        this.coins.splice(i, 1);
      }
    }

    for (const p of [this.player1, this.player2]) {
      if (p.lives <= 0) continue;
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (
          p.x + 8 < e.x + e.width - 8 &&
          p.x + p.width - 8 > e.x + 8 &&
          p.y + 8 < e.y + e.height - 8 &&
          p.y + p.height - 8 > e.y + 8
        ) {
          if (p.hit()) {
            if (this.player1.lives <= 0 && this.player2.lives <= 0) {
              this.state = 'gameover';
              SoundManager.play('gameOver');
            }
          }
          this.enemies.splice(i, 1);
          break;
        }
      }
    }

    for (const p of [this.player1, this.player2]) {
      if (p.lives <= 0) continue;
      for (let i = this.coins.length - 1; i >= 0; i--) {
        const c = this.coins[i];
        if (
          p.x < c.x + c.width &&
          p.x + p.width > c.x &&
          p.y < c.y + c.height &&
          p.y + p.height > c.y
        ) {
          p.score++;
          SoundManager.play('starCollect');
          this.coins.splice(i, 1);
          break;
        }
      }
    }
  }

  drawHud(ctx) {
    const iconSize = 24;
    const pad = 16;

    const drawPlayerHud = (player, label, color, x) => {
      let cx = x;
      if (Assets.starIcon) {
        ctx.drawImage(Assets.starIcon, cx, 12, iconSize, iconSize);
        cx += iconSize + 6;
      }
      ctx.fillStyle = color;
      ctx.font = 'bold 20px monospace';
      ctx.fillText(label + ' ' + player.score, cx, 32);
      cx += ctx.measureText(label + ' ' + player.score).width + 12;

      if (Assets.lifeIcon) {
        for (let i = 0; i < player.lives; i++) {
          ctx.drawImage(Assets.lifeIcon, cx, 12, iconSize, iconSize);
          cx += iconSize + 4;
        }
      }
    };

    drawPlayerHud(this.player1, 'P1', '#4fc3f7', pad);
    drawPlayerHud(this.player2, 'P2', '#81c784', CANVAS_WIDTH / 2 + pad);

    ctx.fillStyle = '#ffcc00';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Lv.' + this.getDifficultyLevel(), CANVAS_WIDTH - pad * 2 - 60, 32);

    ctx.fillStyle = SoundManager.isMuted ? '#666' : '#aaa';
    ctx.font = '22px monospace';
    ctx.fillText(SoundManager.isMuted ? '[M] OFF' : '[M] ON', CANVAS_WIDTH - pad, 32);
    ctx.textAlign = 'left';
  }

  drawMenu() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DUNGEON DODGE', CANVAS_WIDTH / 2, 100);

    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText('Выберите персонажей и нажмите PLAY', CANVAS_WIDTH / 2, 140);

    this.charButtons = [];
    for (let p = 0; p < 2; p++) {
      const isP1 = p === 0;
      const label = isP1 ? 'P1 — Стрелки' : 'P2 — WASD';
      const color = isP1 ? '#4fc3f7' : '#81c784';
      const idxKey = isP1 ? 'charIdx1' : 'charIdx2';
      const idx = this[idxKey];
      const charDef = CHARACTER_TYPES[idx];
      const baseY = 170 + p * 140;

      ctx.fillStyle = color;
      ctx.font = 'bold 20px monospace';
      ctx.fillText(label, CANVAS_WIDTH / 2, baseY);

      const portraitSize = 64;
      const portraitX = CANVAS_WIDTH / 2 - portraitSize / 2;
      const portraitY = baseY + 12;
      const stand = Assets[charDef.id + '_stand'];
      if (stand) {
        ctx.drawImage(stand, portraitX, portraitY, portraitSize, portraitSize);
      }

      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText(charDef.name, CANVAS_WIDTH / 2, portraitY + portraitSize + 18);

      const arrowSize = 36;
      const arrowY = portraitY + portraitSize / 2 - arrowSize / 2;
      const leftX = portraitX - 50;
      const rightX = portraitX + portraitSize + 14;

      ctx.fillStyle = '#555';
      ctx.fillRect(leftX, arrowY, arrowSize, arrowSize);
      ctx.fillRect(rightX, arrowY, arrowSize, arrowSize);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('<', leftX + arrowSize / 2, arrowY + arrowSize - 8);
      ctx.fillText('>', rightX + arrowSize / 2, arrowY + arrowSize - 8);
      ctx.textAlign = 'center';

      this.charButtons.push(
        { player: p, dir: -1, x: leftX, y: arrowY, w: arrowSize, h: arrowSize },
        { player: p, dir: 1, x: rightX, y: arrowY, w: arrowSize, h: arrowSize }
      );
    }

    const bx = CANVAS_WIDTH / 2 - 100;
    const by = 460;
    const bw = 200;
    const bh = 56;
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PLAY', CANVAS_WIDTH / 2, by + 38);

    this.playBtn = { x: bx, y: by, w: bw, h: bh };
  }

  startGame() {
    SoundManager.play('menuClick');
    this.restart();
    this.state = 'playing';
  }

  draw() {
    const ctx = this.ctx;

    if (this.state === 'menu') {
      this.drawMenu();
      return;
    }

    if (this.backgroundImage) {
      ctx.drawImage(this.backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    for (const d of this.bgDecos) {
      if (Assets[d.key]) {
        ctx.drawImage(Assets[d.key], d.x, d.y, d.w, d.h);
      }
    }

    if (this.floorTileImage) {
      const floorY = CANVAS_HEIGHT - FLOOR_HEIGHT;
      const tileW = this.floorTileImage.width;
      const tilesNeeded = Math.ceil(CANVAS_WIDTH / tileW);
      for (let i = 0; i < tilesNeeded; i++) {
        ctx.drawImage(this.floorTileImage, i * tileW, floorY, tileW, FLOOR_HEIGHT);
      }
    }

    for (const d of this.floorDecos) {
      if (Assets[d.key]) {
        ctx.drawImage(Assets[d.key], d.x, d.y, d.w, d.h);
      }
    }

    for (const c of this.coins) {
      c.draw(ctx);
    }

    this.player1.draw(ctx);
    this.player2.draw(ctx);

    for (const e of this.enemies) {
      e.draw(ctx);
    }

    this.drawHud(ctx);

    if (this.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 64px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

      ctx.fillStyle = '#4fc3f7';
      ctx.font = '28px monospace';
      ctx.fillText('P1: ' + this.player1.score, CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#81c784';
      ctx.fillText('P2: ' + this.player2.score, CANVAS_WIDTH / 2 + 120, CANVAS_HEIGHT / 2);

      ctx.font = '20px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Press R or click to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);

      ctx.textAlign = 'left';
    }
  }

  setKey(player, dir, state) {
    if (player === 1) this.keysP1[dir] = state;
    else this.keysP2[dir] = state;
  }
}
