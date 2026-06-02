class Enemy {
  constructor(typeDef) {
    this.typeDef = typeDef;
    this.width = typeDef.width;
    this.height = typeDef.height;
    this.x = Math.random() * (CANVAS_WIDTH - this.width);
    this.y = -this.height;
    this.speed = typeDef.speed;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 15;
  }

  update() {
    this.y += this.speed;
    this.animTimer++;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  draw(ctx) {
    let sprite;
    if (this.animFrame === 0) {
      sprite = Assets[this.typeDef.id] || null;
    } else {
      sprite = Assets[this.typeDef.id + 'Anim'] || Assets[this.typeDef.id] || null;
    }
    if (sprite) {
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
    }
  }

  isOffScreen() {
    return this.y > CANVAS_HEIGHT + 50;
  }
}
