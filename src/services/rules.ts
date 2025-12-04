
export interface GameRules {
    maxStars: number;
    costPerBet: number; // In Euros
    minStar: number;
    maxNumber: number;
    minNumber: number;
}

// Historical Rule Changes
// 1. Start (2004) -> 2011-05-09: 9 Stars, €2.00
// 2. 2011-05-10 -> 2016-09-23: 11 Stars, €2.00
// 3. 2016-09-24 -> Present: 12 Stars, €2.50

const RULE_CHANGES = [
    {
        startDate: '2004-02-13', // First draw
        endDate: '2011-05-09',
        rules: {
            maxStars: 9,
            costPerBet: 2.00,
            minStar: 1,
            maxNumber: 50,
            minNumber: 1
        }
    },
    {
        startDate: '2011-05-10',
        endDate: '2016-09-23',
        rules: {
            maxStars: 11,
            costPerBet: 2.00,
            minStar: 1,
            maxNumber: 50,
            minNumber: 1
        }
    },
    {
        startDate: '2016-09-24',
        endDate: '9999-12-31', // Future
        rules: {
            maxStars: 12,
            costPerBet: 2.50,
            minStar: 1,
            maxNumber: 50,
            minNumber: 1
        }
    }
];

export function getRulesForDate(date: Date | string): GameRules {
    const d = new Date(date);
    const dateStr = d.toISOString().split('T')[0];

    for (const epoch of RULE_CHANGES) {
        if (dateStr >= epoch.startDate && dateStr <= epoch.endDate) {
            return epoch.rules;
        }
    }

    // Fallback to current rules if something goes wrong
    return RULE_CHANGES[RULE_CHANGES.length - 1].rules;
}

export function isValidKeyForDate(numbers: number[], stars: number[], date: Date | string): boolean {
    const rules = getRulesForDate(date);

    // Check Numbers
    if (numbers.some(n => n < rules.minNumber || n > rules.maxNumber)) return false;

    // Check Stars
    if (stars.some(s => s < rules.minStar || s > rules.maxStars)) return false;

    return true;
}
