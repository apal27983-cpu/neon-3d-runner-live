export const WorldConfig = {
  // Lane Configuration
  LANES: [-3.0, 0.0, 3.0],
  LANE_COUNT: 3,
  LANE_SPACING: 3.0,
  
  // Road & Environment
  ROAD_WIDTH: 10.5,
  SEGMENT_LENGTH: 60.0,
  NUM_SEGMENTS: 6, // 360 units rendered ahead
  ROAD_RECYCLE_Z: 25.0, // Recycle segment when its start passes behind camera
  
  // Scenery
  CITY_BOUNDS_X: 18.0, // Distance of city towers from road center
  NUM_BUILDINGS: 30,
  
  // Player Physics & Dimensions
  GROUND_Y: 0.0,
  PLAYER_SIZE: { width: 1.2, height: 1.2, depth: 1.2 },
  // Fair collision box slightly tighter than visual mesh
  PLAYER_HITBOX: { width: 0.85, height: 0.85, depth: 0.85 },
  GRAVITY: 52.0, // 2x gravity multiplier for snappy, realistic jumps
  JUMP_IMPULSE: 17.5, // Tuned for quick ascent and rapid descent
  LANE_CHANGE_SPEED: 18.0, // Interpolation speed for smooth lane change
  
  // Gameplay Speeds
  INITIAL_SPEED: 28.0,
  MAX_SPEED: 62.0,
  SPEED_ACCEL_RATE: 0.45, // Units per second acceleration
  
  // Camera
  CAMERA: {
    fov: 65,
    near: 0.1,
    far: 450,
    offset: { x: 0, y: 5.2, z: 9.5 },
    lookAtOffset: { x: 0, y: 1.5, z: -16.0 },
    smoothing: 12.0,
    leanFactor: 0.12, // Roll tilt when shifting lanes
  },
  
  // Aesthetic Colors
  COLORS: {
    bg: 0x070014,
    cyan: 0x00F5FF,
    purple: 0x8A2EFF,
    magenta: 0xFF2BD6,
    pink: 0xFF007F,
    white: 0xEAFBFF,
    road: 0x080214,
    roadGrid: 0x8A2EFF,
    guardrails: 0x00F5FF
  },
  
  // Obstacles
  SPAWN_START_Z: -180.0, // Initial spawn distance ahead
  MIN_OBSTACLE_INTERVAL: 0.55, // Fast obstacle spawn interval at high speed
  MAX_OBSTACLE_INTERVAL: 1.25, // Fast initial obstacle spawn interval
  RECYCLE_Z: 20.0 // Obstacle passes player and is recycled
};
