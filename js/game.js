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

class PowerUpItem {
  constructor(type) {
    this.type = type;
    this.width = 32;
    this.height = 32;
    this.x = 40 + Math.random() * (CANVAS_WIDTH - 80 - this.width);
    this.y = -this.height;
    this.speed = 1.2;
    this.bobPhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.y += this.speed;
    this.bobPhase += 0.05;
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2 + Math.sin(this.bobPhase) * 3;
    const r = this.width / 2;

    ctx.shadowColor = this.type.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = this.type.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type.label, cx, cy);
  }

  isOffScreen() {
    return this.y > CANVAS_HEIGHT + 30;
  }
}

class Player {
  constructor(canvasWidth, canvasHeight, characterId, name) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.characterId = characterId || 'Adventurer';
    this.name = name || 'Player';
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
    this.dead = false;
    this.activeBuffs = { shield: 0, magnet: 0 };
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
    this.dead = false;
    this.activeBuffs = { shield: 0, magnet: 0 };
  }

  hit() {
    if (this.activeBuffs.shield > 0) return false;
    if (this.invulnerableTimer > 0) return false;
    this.lives--;
    this.state = 'hurt';
    this.invulnerableTimer = INVULNERABLE_DURATION;
    SoundManager.play('playerHit');
    if (this.lives <= 0) {
      this.dead = true;
      SoundManager.play('death');
    }
    return this.lives <= 0;
  }

  update(keys) {
    if (this.dead) return;

    for (const key of ['shield', 'magnet']) {
      if (this.activeBuffs[key] > 0) this.activeBuffs[key]--;
    }

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
    if (this.dead) return;
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) return;

    if (this.activeBuffs.shield > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#4fc3f7';
      ctx.shadowBlur = 18;
      ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      ctx.restore();
    }

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
    this.mapIdx = 0;
    this.player1 = new Player(canvas.width, canvas.height, CHARACTER_TYPES[this.charIdx1].id, 'Player 1');
    this.player2 = new Player(canvas.width, canvas.height, CHARACTER_TYPES[this.charIdx2].id, 'Player 2');
    this.player2.x = canvas.width / 2 - this.player2.width / 2 - 150;
    this.player2.y = canvas.height - FLOOR_HEIGHT - this.player2.height / 2 + 5;
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
    this.deathMessages = [];
    this.particles = [];
    this.powerUps = [];
    this.powerUpSpawnTimer = 0;
    this.slowmoTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
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

  spawnParticles(x, y, color, count, speed, life, size) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.5 + Math.random());
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: life * (0.5 + Math.random() * 0.5),
        maxLife: life,
        size: size * (0.5 + Math.random()),
        color,
      });
    }
  }

  generateDecorations() {
    const map = MAP_TYPES[this.mapIdx];
    const cloudKeys = map.bgDecos;
    for (let i = 0; i < DECO_COUNT_BG; i++) {
      const key = cloudKeys[i % cloudKeys.length];
      const def = CLOUD_DEFS.find(c => c.key === key);
      if (!def) continue;
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
    const floorDecos = map.floorDecos;
    for (let i = 0; i < DECO_COUNT_FLOOR; i++) {
      const def = floorDecos[i % floorDecos.length];
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
    this.player2.x = this.player2.canvasWidth / 2 - this.player2.width / 2 - 200;
    this.player2.y = this.player2.canvasHeight - FLOOR_HEIGHT - this.player2.height / 2 + 5;
    this.enemies = [];
    this.coins = [];
    this.spawnTimer = 0;
    this.coinSpawnTimer = 0;
    this.elapsedFrames = 0;
    this.state = 'playing';
    this.bgDecos = [];
    this.floorDecos = [];
    this.deathMessages = [];
    this.particles = [];
    this.powerUps = [];
    this.powerUpSpawnTimer = 0;
    this.slowmoTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.generateDecorations();
  }

  update() {
    if (this.state === 'gameover' || this.state === 'menu') return;

    this.player1.update(this.keysP1);
    this.player2.update(this.keysP2);
    this.elapsedFrames++;

    if (this.slowmoTimer > 0) this.slowmoTimer--;

    this.spawnTimer++;
    const currentSpawnInterval = this.getSpawnInterval() / 16;
    if (this.spawnTimer >= currentSpawnInterval) {
      this.spawnTimer = 0;
      const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      const sm = this.slowmoTimer > 0 ? 0.5 : 1;
      this.enemies.push(new Enemy(type, this.getSpeedMultiplier() * sm));
    }

    this.coinSpawnTimer++;
    if (this.coinSpawnTimer >= COIN_SPAWN_INTERVAL_MS / 16) {
      this.coinSpawnTimer = 0;
      this.coins.push(new Coin());
    }

    this.powerUpSpawnTimer++;
    if (this.powerUpSpawnTimer >= POWERUP_SPAWN_INTERVAL_MS / 16) {
      this.powerUpSpawnTimer = 0;
      const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      this.powerUps.push(new PowerUpItem(type));
    }

    const enemyMult = this.slowmoTimer > 0 ? 0.5 : 1;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].speed = this.enemies[i].baseSpeed * enemyMult;
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

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      this.powerUps[i].update();
      if (this.powerUps[i].isOffScreen()) {
        this.powerUps.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.shakeTimer > 0) this.shakeTimer--;

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
            if (p.lives <= 0) {
              this.shakeTimer = 12;
              this.shakeIntensity = 8;
              this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#e74c3c', 20, 4, 30, 5);
            }
            this.deathMessages.push({
              text: p.name + ' has fallen!',
              timer: 120,
              color: p === this.player1 ? '#4fc3f7' : '#81c784',
            });
            if (this.player1.lives <= 0 && this.player2.lives <= 0) {
              this.state = 'gameover';
              SoundManager.play('gameOver');
            }
          } else {
            this.shakeTimer = 6;
            this.shakeIntensity = 4;
            this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ff6b6b', 12, 3, 20, 4);
          }
          this.spawnParticles(e.x + e.width / 2, e.y + e.height / 2, 'rgba(200,200,200,0.7)', 6, 2, 15, 4);
          this.enemies.splice(i, 1);
          break;
        }
      }
    }

    for (let i = this.deathMessages.length - 1; i >= 0; i--) {
      this.deathMessages[i].timer--;
      if (this.deathMessages[i].timer <= 0) {
        this.deathMessages.splice(i, 1);
      }
    }

    for (const p of [this.player1, this.player2]) {
      if (p.lives <= 0) continue;

      if (p.activeBuffs.magnet > 0) {
        const px = p.x + p.width / 2;
        const py = p.y + p.height / 2;
        for (const c of this.coins) {
          const dx = px - (c.x + c.width / 2);
          const dy = py - (c.y + c.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAGNET_RANGE && dist > 1) {
            c.x += (dx / dist) * MAGNET_PULL;
            c.y += (dy / dist) * MAGNET_PULL;
          }
        }
      }

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
          this.spawnParticles(c.x + c.width / 2, c.y + c.height / 2, '#ffd700', 8, 3, 20, 3);
          this.coins.splice(i, 1);
          break;
        }
      }
    }

    for (const p of [this.player1, this.player2]) {
      if (p.lives <= 0) continue;
      for (let i = this.powerUps.length - 1; i >= 0; i--) {
        const pu = this.powerUps[i];
        if (
          p.x < pu.x + pu.width &&
          p.x + p.width > pu.x &&
          p.y < pu.y + pu.height &&
          p.y + p.height > pu.y
        ) {
          const t = pu.type;
          if (t.id === 'extralife') {
            if (p.lives < MAX_LIVES) {
              p.lives++;
              this.spawnParticles(pu.x + pu.width / 2, pu.y + pu.height / 2, '#e74c3c', 10, 3, 25, 4);
            } else {
              this.powerUps.splice(i, 1);
              continue;
            }
          } else if (t.id === 'slowmo') {
            this.slowmoTimer = t.duration;
          } else {
            p.activeBuffs[t.id] = t.duration;
          }
          this.spawnParticles(pu.x + pu.width / 2, pu.y + pu.height / 2, t.color, 8, 3, 20, 4);
          this.powerUps.splice(i, 1);
          break;
        }
      }
    }
  }

  drawHud(ctx) {
    const iconSize = 20;
    const pad = 16;
    const barHeight = 36;
    const centerY = barHeight / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, barHeight);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barHeight);
    ctx.lineTo(CANVAS_WIDTH, barHeight);
    ctx.stroke();

    const drawSection = (player, label, color, startX) => {
      let x = startX;

      if (Assets.starIcon) {
        ctx.drawImage(Assets.starIcon, x, centerY - iconSize / 2, iconSize, iconSize);
        x += iconSize + 4;
      }
      ctx.fillStyle = color;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(player.score), x, centerY);
      x += ctx.measureText(String(player.score)).width + 10;

      if (Assets.lifeIcon) {
        for (let i = 0; i < player.lives; i++) {
          ctx.drawImage(Assets.lifeIcon, x, centerY - iconSize / 2, iconSize, iconSize);
          x += iconSize + 2;
        }
      }

      x += 6;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(label, x, centerY);
      x += ctx.measureText(label).width + 6;

      if (player.activeBuffs.shield > 0) {
        const s = Math.ceil(player.activeBuffs.shield / 60);
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '11px monospace';
        ctx.fillText('[🛡' + s + ']', x, centerY);
        x += 50;
      }
      if (player.activeBuffs.magnet > 0) {
        const s = Math.ceil(player.activeBuffs.magnet / 60);
        ctx.fillStyle = '#ffeb3b';
        ctx.font = '11px monospace';
        ctx.fillText('[🧲' + s + ']', x, centerY);
      }
    };

    const name1 = this.player1.name.length > 8 ? this.player1.name.slice(0, 8) + '..' : this.player1.name;
    drawSection(this.player1, name1, '#4fc3f7', pad);

    const name2 = this.player2.name.length > 8 ? this.player2.name.slice(0, 8) + '..' : this.player2.name;
    drawSection(this.player2, name2, '#81c784', CANVAS_WIDTH / 2 + pad);

    if (this.slowmoTimer > 0) {
      const s = Math.ceil(this.slowmoTimer / 60);
      ctx.fillStyle = '#ce93d8';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[⏱SLOW ' + s + 's]', CANVAS_WIDTH / 2, centerY);
    }

    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('Lv.' + this.getDifficultyLevel(), CANVAS_WIDTH - pad, centerY);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  drawMenu() {
    const ctx = this.ctx;

    const map = MAP_TYPES[this.mapIdx];
    const bg = Assets['bg_' + map.name];
    if (bg) {
      ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 60px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    ctx.fillText('⚔ DUNGEON DODGE ⚔', CANVAS_WIDTH / 2, 85);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '16px monospace';
    ctx.fillText('Выберите персонажей, карту и нажмите PLAY', CANVAS_WIDTH / 2, 120);

    const panelW = 280;
    const panelH = 130;
    const panelGap = 30;
    const panelY = 150;
    const panel1X = CANVAS_WIDTH / 2 - panelGap / 2 - panelW;
    const panel2X = CANVAS_WIDTH / 2 + panelGap / 2;

    this.charButtons = [];
    for (let p = 0; p < 2; p++) {
      const isP1 = p === 0;
      const label = isP1 ? 'P1  [←→↑↓]' : 'P2  [WASD]';
      const color = isP1 ? '#4fc3f7' : '#81c784';
      const idxKey = isP1 ? 'charIdx1' : 'charIdx2';
      const idx = this[idxKey];
      const charDef = CHARACTER_TYPES[idx];
      const px = isP1 ? panel1X : panel2X;

      ctx.fillStyle = 'rgba(20,20,40,0.8)';
      ctx.fillRect(px, panelY, panelW, panelH);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px, panelY, panelW, panelH);

      ctx.fillStyle = color;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(label, px + panelW / 2, panelY + 22);

      const portraitSize = 60;
      const portraitX = px + panelW / 2 - portraitSize / 2;
      const portraitY = panelY + 32;
      const stand = Assets[charDef.id + '_stand'];
      if (stand) {
        ctx.drawImage(stand, portraitX, portraitY, portraitSize, portraitSize);
      }

      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.fillText(charDef.name, px + panelW / 2, portraitY + portraitSize + 14);

      const pObj = isP1 ? this.player1 : this.player2;
      const nameLabel = '"' + pObj.name + '"';
      ctx.fillStyle = '#ffcc00';
      ctx.font = '13px monospace';
      ctx.fillText(nameLabel, px + panelW / 2, portraitY + portraitSize + 32);
      const nameBtnY = portraitY + portraitSize + 18;
      const nameBtnH = 18;
      if (!isP1) {
        this.nameBtnsP2 = { x: px, y: nameBtnY, w: panelW, h: nameBtnH, player: pObj };
      } else {
        this.nameBtnsP1 = { x: px, y: nameBtnY, w: panelW, h: nameBtnH, player: pObj };
      }

      const arrowSize = 30;
      const arrowY = portraitY + portraitSize / 2 - arrowSize / 2;
      const leftX = px + 10;
      const rightX = px + panelW - 10 - arrowSize;

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(leftX, arrowY, arrowSize, arrowSize);
      ctx.fillRect(rightX, arrowY, arrowSize, arrowSize);
      ctx.fillStyle = color;
      ctx.font = 'bold 20px monospace';
      ctx.fillText('<', leftX + arrowSize / 2, arrowY + arrowSize - 7);
      ctx.fillText('>', rightX + arrowSize / 2, arrowY + arrowSize - 7);

      this.charButtons.push(
        { player: p, dir: -1, x: leftX, y: arrowY, w: arrowSize, h: arrowSize },
        { player: p, dir: 1, x: rightX, y: arrowY, w: arrowSize, h: arrowSize }
      );
    }

    const mapY = panelY + panelH + 20;
    ctx.fillStyle = 'rgba(20,20,40,0.8)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 130, mapY, 260, 40);
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 130, mapY, 260, 40);

    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('MAP: ' + map.name, CANVAS_WIDTH / 2, mapY + 26);

    const mapArrowSize = 30;
    const mapArrowY2 = mapY + 5;
    const mapLeftX = CANVAS_WIDTH / 2 - 120;
    const mapRightX = CANVAS_WIDTH / 2 + 90;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(mapLeftX, mapArrowY2, mapArrowSize, mapArrowSize);
    ctx.fillRect(mapRightX, mapArrowY2, mapArrowSize, mapArrowSize);
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('<', mapLeftX + mapArrowSize / 2, mapArrowY2 + mapArrowSize - 7);
    ctx.fillText('>', mapRightX + mapArrowSize / 2, mapArrowY2 + mapArrowSize - 7);

    this.mapButtons = [
      { dir: -1, x: mapLeftX, y: mapArrowY2, w: mapArrowSize, h: mapArrowSize },
      { dir: 1, x: mapRightX, y: mapArrowY2, w: mapArrowSize, h: mapArrowSize },
    ];

    const bx = CANVAS_WIDTH / 2 - 90;
    const by = mapY + 60;
    const bw = 180;
    const bh = 48;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.fillText('PLAY', CANVAS_WIDTH / 2, by + 33);
    ctx.shadowBlur = 0;

    this.playBtn = { x: bx, y: by, w: bw, h: bh };

    const muted = SoundManager.isMuted;
    const mx = CANVAS_WIDTH / 2 - 60;
    const my = by + bh + 22;
    const mw = 120;
    const mh = 36;
    ctx.fillStyle = muted ? 'rgba(100,100,100,0.5)' : 'rgba(255,255,255,0.15)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = muted ? '#666' : '#aaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx, my, mw, mh);
    ctx.fillStyle = muted ? '#666' : '#aaa';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(muted ? '🔇 SOUND OFF' : '🔊 SOUND ON', mx + mw / 2, my + 24);
    ctx.textAlign = 'left';
    this.muteBtn = { x: mx, y: my, w: mw, h: mh };
  }

  startGame() {
    SoundManager.play('menuClick');
    SoundManager.startMusic();
    const map = MAP_TYPES[this.mapIdx];
    this.backgroundImage = Assets['bg_' + map.name] || null;
    this.floorTileImage = Assets['floor_' + map.name] || null;
    this.restart();
    this.state = 'playing';
  }

  draw() {
    const ctx = this.ctx;

    if (this.state === 'menu') {
      this.drawMenu();
      return;
    }

    ctx.save();
    if (this.shakeTimer > 0) {
      const ox = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const oy = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(ox, oy);
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

    for (const pu of this.powerUps) {
      pu.draw(ctx);
    }

    this.player1.draw(ctx);
    this.player2.draw(ctx);

    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    for (const msg of this.deathMessages) {
      const alpha = msg.timer > 30 ? 1 : msg.timer / 30;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = msg.color;
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(msg.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;

    const drawName = (player, color) => {
      if (player.dead) return;
      ctx.fillStyle = color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, player.x + player.width / 2, player.y - 6);
    };
    drawName(this.player1, '#4fc3f7');
    drawName(this.player2, '#81c784');

    for (const e of this.enemies) {
      e.draw(ctx);
    }

    if (this.slowmoTimer > 0) {
      ctx.fillStyle = 'rgba(100, 0, 150, 0.08)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    ctx.restore();

    this.drawHud(ctx);

    if (this.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 64px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

      ctx.fillStyle = '#4fc3f7';
      ctx.font = '24px monospace';
      ctx.fillText(this.player1.name + ': ' + this.player1.score, CANVAS_WIDTH / 2 - 140, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#81c784';
      ctx.fillText(this.player2.name + ': ' + this.player2.score, CANVAS_WIDTH / 2 + 140, CANVAS_HEIGHT / 2);

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
