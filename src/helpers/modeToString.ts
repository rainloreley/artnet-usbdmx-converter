const modes = [
    '0 - Standby',
    '1 - DMX In -> DMX Out',
    '2 - PC Out -> DMX Out',
    '3 - DMX In + PC Out -> DMX Out',
    '4 - DMX In -> PC In',
    '5 - DMX In -> DMX Out & DMX In -> PC In',
    '6 - PC Out -> DMX Out & DMX In -> PC In',
    '7 - DMX In + PC Out -> DMX Out & DMX In -> PC In'
]

/**
 * Converts a mode number to a human-readable description string
 * @param mode
 */
export default function modeToString(mode: number) {
    return modes[mode];
}