class Player {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 64;
    this.height = 64;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - this.height - 10;
    this.speed = PLAYER_SPEED;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 10;
    this.state = 'idle';
    this.jumpTimer = 0;
    this.prevUp = false;
  }

  reset() {
    this.x = this.canvasWidth / 2 - this.width / 2;
    this.y = this.canvasHeight - this.height - 10;
    this.state = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.jumpTimer = 0;
    this.prevUp = false;
  }

  update(keys) {
    const moving = keys.left || keys.right || keys.up || keys.down;

    if (keys.left) this.x -= this.speed;
    if (keys.right) this.x += this.speed;
    if (keys.up) this.y -= this.speed;
    if (keys.down) this.y += this.speed;

    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
    if (this.y + this.height > this.canvasHeight) this.y = this.canvasHeight - this.height;

    if (keys.up && !this.prevUp) {
      this.jumpTimer = 8;
    }
    this.prevUp = keys.up;

    if (this.jumpTimer > 0) {
      this.state = 'jump';
      this.jumpTimer--;
    } else if (!moving) {
      this.state = 'idle';
      this.animFrame = 0;
      this.animTimer = 0;
    } else {
      this.state = 'run';
      this.animTimer++;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 2;
      }
    }
  }

  draw(ctx) {
    let sprite;
    switch (this.state) {
      case 'hurt':
        sprite = Assets.playerHurt || Assets.playerStand;
        break;
      case 'jump':
        sprite = Assets.playerJump || Assets.playerStand;
        break;
      case 'run':
        sprite = this.animFrame === 0 ? Assets.playerWalk1 : Assets.playerWalk2;
        break;
      default:
        sprite = Assets.playerStand;
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
    this.player = new Player(canvas.width, canvas.height);
    this.keys = { left: false, right: false, up: false, down: false };
    this.backgroundImage = null;
    this.floorTileImage = null;
    this.enemies = [];
    this.spawnTimer = 0;
    this.state = 'playing';
    this.score = 0;
  }

  restart() {
    this.player.reset();
    this.enemies = [];
    this.spawnTimer = 0;
    this.score = 0;
    this.state = 'playing';
  }

  update() {
    if (this.state === 'gameover') return;

    this.player.update(this.keys);
    this.score++;

    this.spawnTimer++;
    if (this.spawnTimer >= SPAWN_INTERVAL_MS / 16) {
      this.spawnTimer = 0;
      const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      this.enemies.push(new Enemy(type));
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update();
      if (this.enemies[i].isOffScreen()) {
        this.enemies.splice(i, 1);
      }
    }

    const p = this.player;
    for (const e of this.enemies) {
      if (
        p.x + 8 < e.x + e.width - 8 &&
        p.x + p.width - 8 > e.x + 8 &&
        p.y + 8 < e.y + e.height - 8 &&
        p.y + p.height - 8 > e.y + 8
      ) {
        this.player.state = 'hurt';
        this.state = 'gameover';
        break;
      }
    }
  }

  draw() {
    const ctx = this.ctx;

    if (this.backgroundImage) {
      ctx.drawImage(this.backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    if (this.floorTileImage) {
      const floorY = CANVAS_HEIGHT - FLOOR_HEIGHT;
      for (let x = 0; x < CANVAS_WIDTH; x += this.floorTileImage.width) {
        ctx.drawImage(this.floorTileImage, x, floorY, this.floorTileImage.width, FLOOR_HEIGHT);
      }
    }

    this.player.draw(ctx);

    for (const e of this.enemies) {
      e.draw(ctx);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText('Score: ' + Math.floor(this.score / 60), 20, 40);

    if (this.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 64px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.fillStyle = '#fff';
      ctx.font = '32px monospace';
      ctx.fillText('Score: ' + Math.floor(this.score / 60), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

      ctx.font = '20px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Press R or click to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);

      ctx.textAlign = 'left';
    }
  }

  setKey(dir, state) {
    this.keys[dir] = state;
  }
}
