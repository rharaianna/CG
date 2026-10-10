import { BEHAVIOR } from "./enemy.enums.js";

const smallEnemyDimensions = {
    width: 1,
    height: 1,
    depth: 1,
}

const greatEnemyDimensions = {
    width: 2,
    height: 2,
    depth: 2,
}

export const enemiesConfig = {

    FLYING_RED: {
        color: "#a81c03",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15
    },
    FLYING_BLUE: {
        color: "#0342a8",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15
    },
    WALKING_PURPLE: {
        color: "#4d03a8",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5
    },
    WALKING_ORANGE: {
        color: "#f1a131",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5
    },
}