const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const PLAYER_SPEED = 7;
const ENEMY_BASE_SPEED = 3;
const SPAWN_INTERVAL_MS = 1500;

const PLAYER_STAND_PATH = 'assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_stand.png';
const PLAYER_WALK1_PATH = 'assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_walk1.png';
const PLAYER_WALK2_PATH = 'assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_walk2.png';
const PLAYER_JUMP_PATH = 'assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_jump.png';
const PLAYER_HURT_PATH = 'assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_hurt.png';
const ENEMY_TYPES = [
  { id: 'slime', speed: 2, width: 48, height: 48, path: 'assets/kenney_platformer-art-extended-enemies/Enemy sprites/slime.png', animPath: 'assets/kenney_platformer-art-extended-enemies/Enemy sprites/slime_walk.png' },
  { id: 'ghost', speed: 3, width: 48, height: 56, path: 'assets/kenney_platformer-art-extended-enemies/Enemy sprites/ghost.png', animPath: 'assets/kenney_platformer-art-extended-enemies/Enemy sprites/ghost_normal.png' },
  { id: 'bat',   speed: 4, width: 40, height: 40, path: 'assets/kenney_platformer-art-extended-enemies/Enemy sprites/bat.png', animPath: 'assets/kenney_platformer-art-extended-enemies/Enemy sprites/bat_fly.png' },
];

const BACKGROUND_PATH = 'assets/kenney_background-elements-remastered/Backgrounds/backgroundForest.png';
const FLOOR_TILE_PATH = 'assets/kenney_hexagon-tiles/Tiles/tileGrass.png';
const FLOOR_HEIGHT = 80;
