import React from 'react';

interface PredictionLineProps {
    title: string;
    selectedNumbers: number[];
    totalVotes?: Record<number, number>; // Optional: to show vote counts per number
    isMain?: boolean; // Highlight if it's the main prediction
    colorTheme?: 'amber' | 'slate' | 'orange' | 'green'; // For styling
}

export function PredictionLine({
    title,
    selectedNumbers,
    totalVotes,
    isMain = false,
    colorTheme = 'amber'
}: PredictionLineProps) {
    // Generate array 1-50
    const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

    // Calculate Max Votes for normalization
    const maxVotes = totalVotes ? Math.max(...Object.values(totalVotes)) : 0;

    const getThemeBaseColor = () => {
        switch (colorTheme) {
            case 'amber': return '245, 158, 11'; // amber-500
            case 'slate': return '100, 116, 139'; // slate-500
            case 'orange': return '249, 115, 22'; // orange-500
            case 'green': return '34, 197, 94';   // green-500
            default: return '59, 130, 246';       // blue-500
        }
    };

    const baseColorRgb = getThemeBaseColor();
    const inactiveClass = 'bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-700';

    return (
        <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold ${isMain ? 'text-lg' : 'text-sm text-zinc-500'}`}>
                    {title}
                </h3>
                {isMain && (
                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">
                        {selectedNumbers.length} números selecionados
                    </span>
                )}
            </div>

            <div className="relative">
                {/* Grid: 25 columns on desktop (2 lines for 50 numbers), adaptive on mobile */}
                <div className="grid grid-cols-10 md:grid-cols-[repeat(25,minmax(0,1fr))] gap-y-4 gap-x-1 justify-items-center">
                    {allNumbers.map(num => {
                        const isSelected = selectedNumbers.includes(num);
                        const votes = totalVotes ? totalVotes[num] : undefined;

                        // Calculate intensity: If votes exist, scale 0.4 to 1.0 based on maxVotes
                        // If no votes but selected (fallback), use 1.0
                        let intensity = 1;
                        if (votes !== undefined && maxVotes > 0) {
                            intensity = 0.4 + ((votes / maxVotes) * 0.6);
                        }

                        // Dynamic Style for selected numbers
                        const dynamicStyle = isSelected ? {
                            backgroundColor: `rgba(${baseColorRgb}, ${intensity})`,
                            color: 'white',
                            boxShadow: isMain ? `0 4px 6px -1px rgba(${baseColorRgb}, ${intensity * 0.5})` : 'none'
                        } : {};

                        return (
                            <div key={num} className="flex flex-col items-center gap-1">
                                <div
                                    className={`
                                        w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-300
                                        ${!isSelected ? inactiveClass : ''}
                                        ${isSelected && isMain ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-current' : ''}
                                    `}
                                    style={dynamicStyle}
                                >
                                    {num}
                                </div>
                                {/* Show votes if available */}
                                {votes !== undefined && (
                                    <span className={`text-[9px] font-mono font-medium ${votes > 0 ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-700'}`}>
                                        {votes > 0 ? votes.toFixed(1) : '0'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
