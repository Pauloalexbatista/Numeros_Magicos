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
    'lstm': {
        primary: 'blue',
        gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        numberBorder: 'border-blue-300 dark:border-blue-700',
        numberText: 'text-blue-700 dark:text-blue-300',
        spinner: 'border-blue-600',
        stats: ['blue', 'cyan', 'indigo', 'sky']
    },
    'random-forest': {
        primary: 'green',
        gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        border: 'border-green-200 dark:border-green-800',
        numberBorder: 'border-green-300 dark:border-green-700',
        numberText: 'text-green-700 dark:text-green-300',
        spinner: 'border-green-600',
        stats: ['green', 'emerald', 'teal', 'lime']
    },
    'ml-classifier': {
        primary: 'cyan',
        gradient: 'from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20',
        border: 'border-cyan-200 dark:border-cyan-800',
        numberBorder: 'border-cyan-300 dark:border-cyan-700',
        numberText: 'text-cyan-700 dark:text-cyan-300',
        spinner: 'border-cyan-600',
        stats: ['cyan', 'sky', 'blue', 'indigo']
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
