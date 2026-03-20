const fs = require('fs');

let c = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8');

c = c.replace(/import \{ Shield, Database, Activity, AlertTriangle, RefreshCw, CheckCircle, Clock \} from 'lucide-react';/, "import { Shield, Database, Activity, AlertTriangle, RefreshCw, CheckCircle, Clock, Layers, Cpu, Server } from 'lucide-react';");

c = c.replace(/const \[isSyncingTarget, setIsSyncingTarget\] = useState<string \| null>\(null\);/, `const [isSyncingTarget, setIsSyncingTarget] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'database' | 'systems' | 'neural'>('database');
    const [filterGame, setFilterGame] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');`);

const tabs = `                {/* Tabs Navigation */}
                <div className="flex flex-col sm:flex-row gap-2 bg-gray-200/50 p-1.5 rounded-xl mb-8 w-full sm:w-max">
                    <button 
                        onClick={() => setActiveTab('database')}
                        className={\`flex items-center justify-center px-6 py-3 rounded-lg text-sm font-bold transition-all \${activeTab === 'database' ? 'bg-white text-[#3510c4] shadow-sm' : 'text-slate-600 hover:text-slate-900 border border-transparent hover:bg-white/50'}\`}
                    >
                        <Server className="w-4 h-4 mr-2" /> Análise da BD
                    </button>
                    <button 
                        onClick={() => setActiveTab('systems')}
                        className={\`flex items-center justify-center px-6 py-3 rounded-lg text-sm font-bold transition-all \${activeTab === 'systems' ? 'bg-white text-[#3510c4] shadow-sm' : 'text-slate-600 hover:text-slate-900 border border-transparent hover:bg-white/50'}\`}
                    >
                        <Layers className="w-4 h-4 mr-2" /> Gestão de Sistemas
                    </button>
                    <button 
                        onClick={() => setActiveTab('neural')}
                        className={\`flex items-center justify-center px-6 py-3 rounded-lg text-sm font-bold transition-all \${activeTab === 'neural' ? 'bg-white text-[#3510c4] shadow-sm' : 'text-slate-600 hover:text-slate-900 border border-transparent hover:bg-white/50'}\`}
                    >
                        <Cpu className="w-4 h-4 mr-2" /> Redes Neuronais
                    </button>
                </div>

                {/* Global Status Banner */}
                {activeTab === 'database' && (
                <>
                <div className={\`mb-8 p-5 rounded-2xl flex items-center shadow-sm border \${`;

c = c.replace(/\{\/\* Global Status Banner \*\/\}\r?\n\s*<div className=\{\`mb-8 p-5 rounded-2xl flex items-center shadow-sm border \$\{/, tabs);

const dbEnd = `<GameCard data={TOTOLOTO} title={"Totoloto"} onSync={() => handleSpecificSync("TOTOLOTO")} isSyncing={isSyncingTarget === "TOTOLOTO"} />
                </div>
                </>
                )}
            </div>
        
                {/* Switchboard Section */}
                {activeTab === 'systems' && (
                <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8 mb-8">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                Gestão de Sistemas (Switchboard)
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Congele ou ative sistemas em tempo real no servidor.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                            {isLoadingSystems && <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin mr-2" />}
                            <select 
                                value={filterGame} 
                                onChange={(e) => setFilterGame(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="ALL">Todos os Jogos</option>
                                <option value="EUROMILLIONS">EuroMilhões</option>
                                <option value="EURODREAMS">EuroDreams</option>
                                <option value="TOTOLOTO">Totoloto</option>
                            </select>
                            <select 
                                value={filterType} 
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="ALL">Todos os Tipos</option>
                                <option value="BASE">Base</option>
                                <option value="PIRAMIDE">Pirâmide</option>
                                <option value="ML">Machine Learning</option>
                                <option value="ENSEMBLE">Ensemble / Composto</option>
                            </select>
                        </div>
                    </div>`;

c = c.replace(/<GameCard data=\{TOTOLOTO\} title=\"Totoloto\" onSync=\{\(\) => handleSpecificSync\(\"TOTOLOTO\"\)\} isSyncing=\{isSyncingTarget === \"TOTOLOTO\"\} \/>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\{\/\* Switchboard Section \*\/\}\r?\n\s*<div className=\"bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8\">\r?\n\s*<div className=\"p-6 border-b border-gray-100 bg-gray-50\/50 flex items-center justify-between\">\r?\n\s*<div>\r?\n\s*<h2 className=\"text-xl font-bold text-slate-900 flex items-center\">\r?\n\s*Gestão de Sistemas \(Switchboard\)\r?\n\s*<\/h2>\r?\n\s*<p className=\"text-sm text-slate-500 mt-1\">Congele ou ative sistemas em tempo real no servidor\.<\/p>\r?\n\s*<\/div>\r?\n\s*\{isLoadingSystems && <RefreshCw className=\"w-5 h-5 text-indigo-500 animate-spin\" \/>\}\r?\n\s*<\/div>/, dbEnd);

c = c.replace(/<tbody className=\"divide-y divide-gray-100\">\r?\n\s*\{systems\.map\(\(sys\) => \(/, `<tbody className="divide-y divide-gray-100">
                                {systems.filter(s => (filterGame === 'ALL' || s.game === filterGame) && (filterType === 'ALL' || s.systemType === filterType)).map((sys) => (`);

const sysEnd = `                    </div>
                </div>
                </div>
                )}

                {/* Neural Laboratory */}
                {activeTab === 'neural' && (
                <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8 mb-8">`;

c = c.replace(/<\/div>\r?\n\s*<\/div>\r?\n\s*\{\/\* Neural Laboratory \*\/\}\r?\n\s*<div className=\"bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8\">/, sysEnd);

const neuralEnd = `                    </div>
                </div>
                </div>
                )}

            {/* Backtest Modal */}`;

c = c.replace(/<\/div>\r?\n\s*<\/div>\r?\n\s*\{\/\* Backtest Modal \*\/\}/, neuralEnd);

fs.writeFileSync('src/app/admin/health/page.tsx', c);
