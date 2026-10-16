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
        model: 'tree',
        minProximity: 25
    },
    FLYING_BLUE: {
        color: "#206aff",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
        model: 'ghost',
        minProximity: 25
    },
    WALKING_PURPLE: {
        color: "#7b21e9",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5,
        model: 'tree',
        minProximity: 5
    },
    WALKING_ORANGE: {
        color: "#f19131",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5,
        model: 'ghost',
        minProximity: 5
    },
}