import { BEHAVIOR } from "./enemy.enums.js";
import { KEYS } from "./key.config.js";

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

    FLYING_FIRST: {
        name: "Maldição da Esperança",
        key: KEYS.FIRST,
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
        model: 'ghost',
        minProximity: 25
    },
    FLYING_SECOND: {
        name: "Fantasma da Torre",
        key: KEYS.SECOND,
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
        model: 'ghost',
        minProximity: 25
    },
    WALKING_FIRST: {
        name: "Caminhante",
        key: KEYS.THIRD,
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5,
        model: 'tree',
        minProximity: 10
    },
    WALKING_SECOND: {
        name: "Andarilho",
        key: KEYS.FOURTH,
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5,
        model: 'tree',
        minProximity: 10
    },
}