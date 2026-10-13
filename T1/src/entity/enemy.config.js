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
        color: "#e33617",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
    },
    FLYING_BLUE: {
        color: "#206aff",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15
    },
    WALKING_PURPLE: {
        color: "#7b21e9",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5
    },
    WALKING_ORANGE: {
        color: "#f19131",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5
    },
}