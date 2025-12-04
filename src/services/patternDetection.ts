interface Draw {
    date: string | Date;
    numbers: number[];
    stars: number[];
    numbersDrawOrder?: number[];
    starsDrawOrder?: number[];
}

/**
 * Calculate frequency (how many times each number/star appears) over the given draws.
 * Returns an object with two maps: `numberFreq` (1‑50) and `starFreq` (1‑12).
 */
export function calculateFrequency(draws: Draw[], limit?: number) {
    const used = limit ? draws.slice(0, limit) : draws;
    const numberFreq: Record<number, number> = {};
    const starFreq: Record<number, number> = {};

    // Initialise counters
    for (let i = 1; i <= 50; i++) numberFreq[i] = 0;
    for (let i = 1; i <= 12; i++) starFreq[i] = 0;

    used.forEach(d => {
        d.numbers.forEach(n => {
            if (numberFreq[n] !== undefined) numberFreq[n]++;
        });
        d.stars.forEach(s => {
            if (starFreq[s] !== undefined) starFreq[s]++;
        });
    });

    return { numberFreq, starFreq };
}

/**
 * Calculate longest presence and absence streaks for each number and star.
 * Returns an object with `presenceStreak` and `absenceStreak` maps for numbers and stars.
 */
export function calculateStreaks(draws: Draw[]) {
    const presenceStreakNumbers: Record<number, number> = {};
    const absenceStreakNumbers: Record<number, number> = {};
    const presenceStreakStars: Record<number, number> = {};
    const absenceStreakStars: Record<number, number> = {};

    // Initialise with zeros
    for (let i = 1; i <= 50; i++) {
        presenceStreakNumbers[i] = 0;
        absenceStreakNumbers[i] = 0;
    }
    for (let i = 1; i <= 12; i++) {
        presenceStreakStars[i] = 0;
        absenceStreakStars[i] = 0;
    }

    // Track current streak counters while iterating chronologically (newest first)
    const currentPresenceNum: Record<number, number> = {};
    const currentAbsenceNum: Record<number, number> = {};
    const currentPresenceStar: Record<number, number> = {};
    const currentAbsenceStar: Record<number, number> = {};

    // Initialise current counters to 0
    for (let i = 1; i <= 50; i++) {
        currentPresenceNum[i] = 0;
        currentAbsenceNum[i] = 0;
    }
    for (let i = 1; i <= 12; i++) {
        currentPresenceStar[i] = 0;
        currentAbsenceStar[i] = 0;
    }

    draws.forEach(draw => {
        // Numbers
        for (let n = 1; n <= 50; n++) {
            if (draw.numbers.includes(n)) {
                currentPresenceNum[n] += 1;
                currentAbsenceNum[n] = 0;
                if (currentPresenceNum[n] > presenceStreakNumbers[n]) {
                    presenceStreakNumbers[n] = currentPresenceNum[n];
                }
            } else {
                currentAbsenceNum[n] += 1;
                currentPresenceNum[n] = 0;
                if (currentAbsenceNum[n] > absenceStreakNumbers[n]) {
                    absenceStreakNumbers[n] = currentAbsenceNum[n];
                }
            }
        }
        // Stars
        for (let s = 1; s <= 12; s++) {
            if (draw.stars.includes(s)) {
                currentPresenceStar[s] += 1;
                currentAbsenceStar[s] = 0;
                if (currentPresenceStar[s] > presenceStreakStars[s]) {
                    presenceStreakStars[s] = currentPresenceStar[s];
                }
            } else {
                currentAbsenceStar[s] += 1;
                currentPresenceStar[s] = 0;
                if (currentAbsenceStar[s] > absenceStreakStars[s]) {
                    absenceStreakStars[s] = currentAbsenceStar[s];
                }
            }
        }
    });

    return {
        numberPresenceStreak: presenceStreakNumbers,
        numberAbsenceStreak: absenceStreakNumbers,
        starPresenceStreak: presenceStreakStars,
        starAbsenceStreak: absenceStreakStars,
    };
}
