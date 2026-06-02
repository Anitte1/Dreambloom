const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const PLAYER_SPEED = 7;
const SPAWN_INTERVAL_MS = 1500;
const MIN_SPAWN_INTERVAL_MS = 500;
const DIFFICULTY_STEP_FRAMES = 600;
const MAX_DIFFICULTY_LEVEL = 10;

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

const MAX_LIVES = 3;
const INVULNERABLE_DURATION = 60;
const COIN_SCORE = 50;
const COIN_SPAWN_INTERVAL_MS = 3000;

const LIFE_ICON_PATH = 'assets/kenney_ui-pack/PNG/Red/Double/icon_circle.png';
const STAR_ICON_PATH = 'assets/kenney_ui-pack/PNG/Yellow/Double/star.png';

const BACKGROUND_DECORATIONS = [
  { key: 'cloud1', path: 'assets/kenney_background-elements-remastered/PNG/Default/cloud1.png', minSize: 80, maxSize: 140 },
  { key: 'cloud3', path: 'assets/kenney_background-elements-remastered/PNG/Default/cloud3.png', minSize: 60, maxSize: 110 },
  { key: 'cloud7', path: 'assets/kenney_background-elements-remastered/PNG/Default/cloud7.png', minSize: 90, maxSize: 150 },
];

const FLOOR_DECORATIONS = [
  { key: 'flowerRed', path: 'assets/kenney_hexagon-tiles/Tiles/flowerRed.png', size: 20, grow: false },
  { key: 'flowerYellow', path: 'assets/kenney_hexagon-tiles/Tiles/flowerYellow.png', size: 20, grow: false },
  { key: 'flowerBlue', path: 'assets/kenney_hexagon-tiles/Tiles/flowerBlue.png', size: 20, grow: false },
  { key: 'smallRockGrass', path: 'assets/kenney_hexagon-tiles/Tiles/smallRockGrass.png', size: 24, grow: false },
  { key: 'treeSmall', path: 'assets/kenney_background-elements-remastered/PNG/Default/treeSmall_green1.png', size: 60, grow: true },
  { key: 'treePine', path: 'assets/kenney_background-elements-remastered/PNG/Default/treePine.png', size: 80, grow: true },
  { key: 'tree', path: 'assets/kenney_background-elements-remastered/PNG/Default/tree.png', size: 100, grow: true },
  { key: 'bush', path: 'assets/kenney_background-elements-remastered/PNG/Default/bush1.png', size: 50, grow: true },
];

const DECO_COUNT_BG = 5;
const DECO_COUNT_FLOOR = 15;

const BACKGROUND_PATH = 'assets/kenney_background-elements-remastered/Backgrounds/backgroundForest.png';
const FLOOR_TILE_PATH = 'assets/kenney_hexagon-tiles/Tiles/tileGrass.png';
const FLOOR_HEIGHT = 80;
