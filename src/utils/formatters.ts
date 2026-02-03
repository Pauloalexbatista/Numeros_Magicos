export function formatSystemName(name: string): string {
    return name
        .replace(/_EURODREAMS/g, ' _EURD')
        .replace(/_TOTOLOTO/g, ' _TOTO')
        .replace(/_EUROMILLIONS/g, ' _EURM')
        .replace(/\(EuroDreams\)/g, '(EURD)')
        .replace(/\(Totoloto\)/g, '(TOTO)')
        .replace(/\(Euromillions\)/g, '(EURM)');
}
