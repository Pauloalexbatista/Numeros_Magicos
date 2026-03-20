const fs = require('fs');
let code = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8');

// 1. Add Eye icon import if missing
if (!code.includes('Eye,')) {
    code = code.replace(/import {([^}]+)Activity([^}]+)} from 'lucide-react';/, "import {$1Activity, Eye$2} from 'lucide-react';");
}

// 2. Add LivePredictModal State
if (!code.includes('isLivePredictModalOpen')) {
    const modalStateStr = `
    const [isLivePredictModalOpen, setIsLivePredictModalOpen] = useState(false);
    const [livePredictData, setLivePredictData] = useState<any>(null);

    const openLivePredictModal = (modelMeta: any) => {
        setLivePredictData(modelMeta);
        setIsLivePredictModalOpen(true);
    };
    `;
    code = code.replace('const [backtestResult, setBacktestResult] = useState<any>(null);', 'const [backtestResult, setBacktestResult] = useState<any>(null);\n' + modalStateStr);
}

// 3. Inject Accuracy and Eye Button into EVERY card!
// We'll search for <div className="mt-4 flex gap-2"> and the first inner button that has handleTrainML to extract the variable name.
const regex = /<div className="text-sm text-slate-500 mt-2 flex-grow">([\s\S]*?)<\/div>\s*<div className="mt-4 flex gap-2">\s*<button\s+onClick=\{\(\) => handleTrainML\('([^']+)',\s*(neuralStatus\.[a-zA-Z_]+\.[a-zA-Z_]+)\.type\)\}/g;

code = code.replace(regex, (match, innerText, gameName, varName) => {
    // Check if it already has accuracy (prevent duplicate run)
    if (match.includes('Precisão (Modelo)')) return match;

    return `<div className="text-sm text-slate-500 mt-2 flex-grow">${innerText}</div>
                                        {${varName}?.accuracy !== null && ${varName}?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {${varName}.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(${varName})}
                                                disabled={!${varName}?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('${gameName}', ${varName}.type)}`;
});

// 4. Inject the Live Predict Modal at the bottom of the page
if (!code.includes('Central de Previsões ao Vivo')) {
    const modalHTML = `
            {/* Live Predict Modal */}
            {isLivePredictModalOpen && livePredictData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-indigo-900 flex items-center">
                                    <Eye className="w-5 h-5 mr-2" />
                                    Central de Previsões ao Vivo
                                </h3>
                                <p className="text-sm text-indigo-700 mt-0.5">{livePredictData.name}</p>
                            </div>
                            <button onClick={() => setIsLivePredictModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50 flex-grow flex flex-col justify-center items-center">
                            <div className="text-center mb-6">
                                <div className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-2">Próxima Chave Prevista</div>
                                {livePredictData.nextPrediction ? (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {livePredictData.nextPrediction.map((num: number, idx: number) => (
                                            <div key={idx} className={\`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md \${livePredictData.isSecondary ? 'bg-amber-400' : 'bg-indigo-600'}\`}>
                                                {num}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
                                        Nenhuma previsão gerada. Force um novo treino para gerar a primeira chave deste modelo!
                                    </div>
                                )}
                            </div>
                            {livePredictData.accuracy !== null && livePredictData.accuracy !== undefined && (
                                <div className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                                    <span className="text-slate-600 font-medium text-sm">Índice de Confiança (Precisão)</span>
                                    <span className="text-lg font-black text-indigo-600">{livePredictData.accuracy}%</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                            <button
                                onClick={() => setIsLivePredictModalOpen(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                            >Fechar</button>
                        </div>
                    </div>
                </div>
            )}
    `;
    code = code.replace('{/* Backtest Modal */}', modalHTML + '\n            {/* Backtest Modal */}');
}

fs.writeFileSync('src/app/admin/health/page.tsx', code);
console.log('UI Patch OK! Filesize: ' + code.length);
