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

    if (moving) {
      this.animTimer++;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 2;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }

  draw(ctx) {
    let sprite;
    if (Assets.playerWalk1 && Assets.playerWalk2) {
      sprite = this.animFrame === 0 ? Assets.playerWalk1 : Assets.playerWalk2;
    } else if (Assets.player) {
      sprite = Assets.player;
    } else {
      return;
    }
    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
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
  }

  update() {
    this.player.update(this.keys);
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
  }

  setKey(dir, state) {
    this.keys[dir] = state;
  }
}
