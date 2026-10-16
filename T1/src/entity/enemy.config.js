import { BEHAVIOR } from "./enemy.enums.js";

const smallEnemyDimensions = {
    width: 2,
    height: 2,
    depth: 2,
}

const greatEnemyDimensions = {
    width: 3,
    height: 3,
    depth: 3,
}

export const enemiesConfig = {

    FLYING_RED: {
        color: "#e33617",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
        model: 'shy'
    },
    FLYING_BLUE: {
        color: "#206aff",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
        model: 'happy'
    },
    WALKING_PURPLE: {
        color: "#7b21e9",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 10,
        model: 'shy'
    },
    WALKING_ORANGE: {
        color: "#f19131",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 10,
        model: 'happy'
    },
}