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
        name: "Espirito do fogo",
        color: "#e33617",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
        model: 'ghost',
        minProximity: 25
    },
    FLYING_BLUE: {
        name: "Fantasma de notredame",
        color: "#0088d7",
        dimensions: smallEnemyDimensions,
        life: 5,
        behavior: BEHAVIOR.FLYING,
        speed: 15,
        model: 'ghost',
        minProximity: 25
    },
    WALKING_PURPLE: {
        name: "Desgaça podi",
        color: "#d037ff",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5,
        model: 'tree',
        minProximity: 10
    },
    WALKING_ORANGE: {
        name: "Andarilho do destino",
        color: "#b05a05",
        dimensions: greatEnemyDimensions,
        life: 3,
        behavior: BEHAVIOR.WALKING,
        speed: 5,
        model: 'tree',
        minProximity: 10
    },
}