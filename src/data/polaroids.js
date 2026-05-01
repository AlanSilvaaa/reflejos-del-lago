import normalModeImage from '../assets/images/modes/normal_mode.png'
import noMovementModeImage from '../assets/images/modes/no_movement_mode.png'
import infiniteModeImage from '../assets/images/modes/infinite_mode.png'

export const normalModeText = {
    front: {
        img: normalModeImage,
        title: "Modo normal",
        highscore: "1800 pts.",
    },
    back: {
        title: "Modo normal",
        description: "La experiencia clásica de juego",
        rules: ["3 minutos por ronda", "3 rondas", "Puedes mover la cámara"],
    },
}

export const noMovementModeText = {
    front: {
        img: noMovementModeImage,
        title: "Sin movimiento",
        highscore: "80 pts.",
    },
    back: {
        title: "Sin movimiento",
        description: "¿Puedes reconocer la imagen sin moverte?",
        rules: ["3 minutos por ronda", "3 rondas", "Puedes mover la cámara", "No puedes moverte"],
    },
}

export const customModeText = {
    front: {
        img: infiniteModeImage,
        title: "Modo personalizado",
        highscore: "configurable",
    },
    back: {
        title: "Modo personalizado",
        description: "Construye una partida a tu medida",
        rules: ["Rondas configurables", "Tiempo ajustable", "Filtra por comunas", "Elige dificultad y movimiento"],
    },
}
