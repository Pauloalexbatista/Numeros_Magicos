export function formatSystemName(name: string): string {
    if (!name) return name;
    return name
        .replace(/_EUROMILLIONS/gi, ' EURM')
        .replace(/\(EUROMILLIONS\)/gi, ' EURM')
        .replace(/_EURODREAMS/gi, ' EURD')
        .replace(/\(EURODREAMS\)/gi, ' EURD')
        .replace(/_TOTOLOTO/gi, ' TTLT')
        .replace(/\(TOTOLOTO\)/gi, ' TTLT')
        .replace(/\(TOTO\)/gi, ' TTLT')
        .replace(/_TOTO/gi, ' TTLT');
}
