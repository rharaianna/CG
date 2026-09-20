export function makeCastleConfig(WIDTH, DEPTH, SCALE) {

    // Aplica escala global (espelha o que o construtor fazia antes)
    WIDTH *= SCALE;
    DEPTH *= SCALE;

    //  Chão 
    const FLOOR_HEIGHT = 0.1  * SCALE;
    const FLOOR_WIDTH  = WIDTH * 1.5;
    const FLOOR_DEPTH  = DEPTH * 1.5;

    //  Paredes externas 
    const WALL_HEIGHT = 13 * SCALE;
    const WALL_DEPTH  =  2 * SCALE;

    //  Torres de canto 
    const TOWER_HEIGHT          = 21  * SCALE;
    const TOWER_RADIUS          =  5  * SCALE;
    const TOWER_INNER_RADIUS    =  2.7 * SCALE;
    const TOWER_RADIAL_SEGMENTS = 32;                   // sem escala — é uma contagem
    const TOWER_BRICKS          =  2  * SCALE;
    const TOWER_OFFSET          =  1  * SCALE;          // deslocamento das torres em relação às paredes

    //  Torres intermediárias 
    const MIDTOWER_HEIGHT = TOWER_HEIGHT;               // mesma altura das torres de canto
    const MIDTOWER_WIDTH  = 12   * SCALE;
    const MIDTOWER_DEPTH  =  9   * SCALE;
    const MIDTOWER_BRICKS =  0.15 * TOWER_HEIGHT;

    //  Torre frontal 
    const FRONTTOWER_HEIGHT = TOWER_HEIGHT * 1.05;      // um pouco mais alta que as demais
    const FRONTTOWER_WIDTH  = 21   * SCALE;
    const FRONTTOWER_DEPTH  =  9   * SCALE;
    const FRONTTOWER_BRICKS =  0.15 * TOWER_HEIGHT;

    //  Portões 
    const DOOR_HEIGHT = WALL_HEIGHT / 2;
    const DOOR_WIDTH  = TOWER_RADIUS;                   // largura igual ao raio das torres
    const DOOR_DEPTH  = DOOR_WIDTH * 0.1;

    //  Escadas e teto 
    const DISTANCE          = 3    * SCALE;             // largura dos tetos e mid walls
    const CEIL_Y            = 8    * SCALE;             // altura do teto (determina nº de degraus)
    const STAIR_STEP_WITDH  = DISTANCE;                 // largura do degrau = faixa lateral
    const STAIR_STEP_HEIGHT = 0.18 * SCALE;
    const STAIR_STEP_DEPTH  = 0.32 * SCALE;
    const STEPS_NUMBER      = Math.floor(CEIL_Y / STAIR_STEP_HEIGHT);
    const STAIR_TOTAL_DEPTH = STEPS_NUMBER * STAIR_STEP_DEPTH;

    // 
    return {
        // dimensões escaladas (usadas no layout de Castle.js)
        WIDTH, DEPTH, SCALE,

        floor: {
            width:  FLOOR_WIDTH,
            depth:  FLOOR_DEPTH,
            height: FLOOR_HEIGHT,
        },

        wall: {
            height: WALL_HEIGHT,
            depth:  WALL_DEPTH,
        },

        tower: {
            height:         TOWER_HEIGHT,
            radius:         TOWER_RADIUS,
            innerRadius:    TOWER_INNER_RADIUS,
            radialSegments: TOWER_RADIAL_SEGMENTS,
            bricks:         TOWER_BRICKS,
            offset:         TOWER_OFFSET,
        },

        midTower: {
            height: MIDTOWER_HEIGHT,
            width:  MIDTOWER_WIDTH,
            depth:  MIDTOWER_DEPTH,
            bricks: MIDTOWER_BRICKS,
        },

        frontTower: {
            height: FRONTTOWER_HEIGHT,
            width:  FRONTTOWER_WIDTH,
            depth:  FRONTTOWER_DEPTH,
            bricks: FRONTTOWER_BRICKS,
        },

        door: {
            height: DOOR_HEIGHT,
            width:  DOOR_WIDTH,
            depth:  DOOR_DEPTH,
        },

        stair: {
            stepWidth:  STAIR_STEP_WITDH,
            stepHeight: STAIR_STEP_HEIGHT,
            stepDepth:  STAIR_STEP_DEPTH,
            stepNumber: STEPS_NUMBER,
            totalDepth: STAIR_TOTAL_DEPTH,
        },

        ceil: {
            y:        CEIL_Y,
            distance: DISTANCE,
        },
    };
}
