const fs = require('fs');
let c = fs.readFileSync('src/app/admin/health/page.tsx', 'utf8');

c = c.replace(/import \{ Shield, Database, Activity, AlertTriangle, RefreshCw, CheckCircle, Clock \} from 'lucide-react';/, "import { Shield, Database, Activity, AlertTriangle, RefreshCw, CheckCircle, Clock, Layers, Cpu, Server } from 'lucide-react';");

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
        
                {activeTab === 'systems' && (`;

c = c.replace(/<GameCard data=\{TOTOLOTO\} title=\"Totoloto\" onSync=\{\(\) => handleSpecificSync\(\"TOTOLOTO\"\)\} isSyncing=\{isSyncingTarget === \"TOTOLOTO\"\} \/>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\{activeTab === 'systems' && \(/, dbEnd);

fs.writeFileSync('src/app/admin/health/page.tsx', c);
