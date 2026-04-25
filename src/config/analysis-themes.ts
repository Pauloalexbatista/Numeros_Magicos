// Sistema de cores para páginas de análise
export const analysisThemes = {
    'vortex-pyramid': {
        primary: 'purple',
        gradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        numberBorder: 'border-purple-300 dark:border-purple-700',
        numberText: 'text-purple-700 dark:text-purple-300',
        spinner: 'border-purple-600',
        stats: ['purple', 'indigo', 'blue', 'cyan']
    },
    'root-sum': {
        primary: 'orange',
        gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        numberBorder: 'border-orange-300 dark:border-orange-700',
        numberText: 'text-orange-700 dark:text-orange-300',
        spinner: 'border-orange-600',
        stats: ['orange', 'amber', 'yellow', 'orange']
    },
    'standard-deviation': {
        primary: 'pink',
        gradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
        border: 'border-pink-200 dark:border-pink-800',
        numberBorder: 'border-pink-300 dark:border-pink-700',
        numberText: 'text-pink-700 dark:text-pink-300',
        spinner: 'border-pink-600',
        stats: ['pink', 'rose', 'fuchsia', 'pink']
    },
    'pattern-based': {
        primary: 'rose',
        gradient: 'from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20',
        border: 'border-rose-200 dark:border-rose-800',
        numberBorder: 'border-rose-300 dark:border-rose-700',
        numberText: 'text-rose-700 dark:text-rose-300',
        spinner: 'border-rose-600',
        stats: ['rose', 'red', 'pink', 'rose']
    }
} as const;

export type AnalysisThemeKey = keyof typeof analysisThemes;

// Helper para obter tema
export function getAnalysisTheme(key: AnalysisThemeKey) {
    return analysisThemes[key];
}
