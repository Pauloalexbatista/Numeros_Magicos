import { getMagicSquareData } from "../services/wheeling";

interface MagicSquareDisplayProps {
    square: number[][];
    highlightedKey?: number; // Index of the key to highlight
}

export function MagicSquareDisplay({ square, highlightedKey }: MagicSquareDisplayProps) {
    if (square.length === 0) return null;

    const n = square.length;
    const data = getMagicSquareData(n * n);
    if (!data) return null;
    const { pattern, name, sum } = data;

    // Determine which cells to highlight based on highlightedKey
    const isHighlighted = (row: number, col: number): boolean => {
        if (highlightedKey === undefined) return false;
        if (highlightedKey < n) return row === highlightedKey;
        if (highlightedKey < 2 * n) return col === (highlightedKey - n);
        if (highlightedKey === 2 * n) return row === col;
        if (highlightedKey === 2 * n + 1) return row + col === n - 1;
        return false;
    };

    const GridHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div className="text-center mb-6">
            <h4 className="font-bold text-purple-900 dark:text-purple-100 uppercase tracking-widest text-lg md:text-xl">{title}</h4>
            {subtitle && <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-1">{subtitle}</p>}
        </div>
    );

    const SquareGrid = ({ data, isPattern, showSums }: { data: number[][]; isPattern?: boolean; showSums?: boolean }) => (
        <div className="grid gap-x-2 md:gap-x-4 gap-y-2 items-center" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(0, 1fr))` }}>
            {/* Row-by-row mapping */}
            {data.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="contents">
                    {/* Row Label (left) */}
                    <div className="text-xs md:text-sm font-black text-purple-400/80 pr-1 md:pr-2 text-right">
                        {showSums ? sum : ''}
                    </div>

                    {/* Cells */}
                    {row.map((num, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`
                                w-11 h-11 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-2xl font-black text-sm md:text-xl lg:text-2xl
                                transition-all duration-300 border-[3px]
                                ${isHighlighted(rowIndex, colIndex)
                                    ? 'bg-purple-600 text-white border-purple-300 scale-110 shadow-2xl z-20 ring-4 ring-purple-500/20'
                                    : isPattern
                                        ? 'bg-card/50 backdrop-blur-sm text-zinc-300 dark:text-zinc-700 border-border'
                                        : 'bg-white dark:bg-purple-900/40 text-purple-900 dark:text-white border-purple-50 dark:border-purple-800 shadow-xl'
                                }
                            `}
                        >
                            {num}
                        </div>
                    ))}
                </div>
            ))}

            {/* Bottom Row Labels */}
            <div className="contents">
                <div className="h-6"></div> {/* Corner empty space */}
                {[...Array(n)].map((_, i) => (
                    <div key={`col-${i}`} className="text-xs md:text-sm font-black text-purple-400/80 pt-3 text-center">
                        {showSums ? sum : ''}
                    </div>
                ))}
            </div>

            {/* Diagonal Sum indicator */}
            {showSums && (
                <div className="col-start-full row-start-full -mb-10 -mr-6 md:-mr-10" style={{ gridColumnStart: n + 1, gridRowStart: n + 1 }}>
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center text-xs md:text-sm font-black shadow-2xl ring-4 ring-white dark:ring-purple-900/20">
                        {sum}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/20 p-4 md:p-8 lg:p-12 rounded-[2.5rem] border-4 border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden">
            <div className="w-full flex flex-col xl:flex-row items-center justify-around gap-12 lg:gap-8">
                {/* 1. Square Pattern */}
                <div className="flex flex-col items-center flex-1">
                    <GridHeader title={`QUADRADO MÁGICO DE ${name.toUpperCase()}`} subtitle="Posições Estáticas do Padrão" />
                    <SquareGrid data={pattern} isPattern showSums />
                </div>

                {/* Arrow indicator for desktop */}
                <div className="hidden xl:block text-5xl text-purple-300 animate-pulse">➡️</div>
                <div className="xl:hidden text-4xl text-purple-300 animate-bounce mt-4">⬇️</div>

                {/* 2. Results (Deployments) */}
                <div className="flex flex-col items-center flex-1">
                    <GridHeader title="DESDOBRAMENTOS" subtitle="Seus Números nas Posições" />
                    <SquareGrid data={square} showSums={false} />
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-20">
                <div className="bg-white/80 dark:bg-purple-950/40 p-6 md:p-8 rounded-3xl border-2 border-purple-100 dark:border-purple-800 shadow-lg backdrop-blur-sm">
                    <h5 className="flex items-center gap-3 mb-4 font-black uppercase text-purple-900 dark:text-purple-100 text-sm md:text-base">
                        <span className="text-2xl">💡</span> COMO LER ESTE MAPA:
                    </h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm text-purple-800/80 dark:text-purple-200/80 leading-relaxed font-medium">
                        <li className="flex gap-2">
                            <span className="text-purple-500">✅</span>
                            <span>O quadrado da esquerda mostra as <strong>posições fixas</strong> do Quadrado Mágico de {name}.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-purple-500">✅</span>
                            <span>O quadrado da direita preenche essas posições com os seus <strong>números selecionados</strong>.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-purple-500">✅</span>
                            <span>O seu <strong>número #1</strong> (mais forte) ocupa a posição estratégica mais importante do quadrado.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-purple-500">✅</span>
                            <span>As chaves resultam da leitura sistemática das {n} linhas, {n} colunas e 2 diagonais.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}