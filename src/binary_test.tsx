export default function App() { return <div>
                                                disabled={!neuralStatus.TOTOLOTO.RF_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.TOTOLOTO?.CLASSIFIER_STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.TOTOLOTO.CLASSIFIER_STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-pink-100 text-pink-700 rounded-md">
                                                    ML Classifier
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.TOTOLOTO.CLASSIFIER_STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.TOTOLOTO.CLASSIFIER_STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.TOTOLOTO.CLASSIFIER_STARS.lastTrained ? `${new Date(neuralStatus.TOTOLOTO.CLASSIFIER_STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.TOTOLOTO.CLASSIFIER_STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button 
                                                onClick={() => handleTrainML('TOTOLOTO', neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('TOTOLOTO', neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type, neuralStatus.TOTOLOTO.CLASSIFIER_STARS.name)}
                                                disabled={!neuralStatus.TOTOLOTO.CLASSIFIER_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
                </div>
                )}

            {/* Backtest Modal */}
            {isBacktestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                                    Simulação Retrospectiva
                                </h3>
                                <p className="text-sm text-slate-500">{backtestTarget?.name} ({backtestTarget?.game})</p>
                            </div>
                            <button 
                                onClick={() => setIsBacktestModalOpen(false)}
                                disabled={isBacktesting}
                                className="text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-lg p-1.5 transition-colors disabled:opacity-50"
                            >✕</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {!backtestResult ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Escolha o tamanho da amostra (número final de sorteios reais) que pretende esconder do modelo para forçar previsões baseadas no histórico iterativo.
                                    </p>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Qtd. a Simular (Dias):</label>
                                        <select 
                                            value={backtestSamples}
                                            onChange={(e) => setBacktestSamples(e.target.value)}
                                            disabled={isBacktesting}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg border p-2.5"
                                        >
                                            <option value="5">Últimos 5 sorteios</option>
                                            <option value="10">Últimos 10 sorteios (Recomendado)</option>
                                            <option value="25">Últimos 25 sorteios</option>
                                            <option value="50">Últimos 50 sorteios</option>
                                        </select>
                                    </div>
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                                        As execuções irão usar a arquitetura de Treino em Tempo Real para prever sucessivamente os resultados ocultos.
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <div className="text-green-600 font-bold mb-1">Simulação Concluída!</div>
                                        <div className="text-4xl font-black text-slate-900">{backtestResult.totalPoints} pts</div>
                                        <div className="text-sm text-slate-500 mt-1">Acumulados em {backtestSamples} avaliações.</div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm max-h-[300px] overflow-y-auto font-mono text-slate-700">
                                        {backtestResult.logs.map((l, idx) => (
                                            <div key={idx} className="mb-1">{l}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            {!backtestResult ? (
                                <button
                                    onClick={runBacktest}
                                    disabled={isBacktesting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center disabled:opacity-50"
                                >
                                    {isBacktesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {isBacktesting ? 'A Simular Histórico...' : 'Iniciar Backtest'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setBacktestResult(null)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                                >Nova Simulação</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

    );
}

;}