import fs from 'fs';
import path from 'path';

const matrixData = JSON.parse(fs.readFileSync('data/daily_totoloto_matrix.json', 'utf8'));

const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matriz de Importância dos Sistemas — Totoloto</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    /* Custom scrollbars */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
    
    .sticky-col {
      position: sticky;
      left: 0;
      z-index: 20;
    }
    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 30;
    }
    .sticky-corner {
      position: sticky;
      top: 0;
      left: 0;
      z-index: 40;
    }
    .col-highlight {
      background-color: rgba(99, 102, 241, 0.18) !important;
    }
  </style>
</head>
<body class="bg-[#0B1120] text-slate-100 font-sans p-4 sm:p-6 min-h-screen">

  <div class="max-w-[1600px] mx-auto space-y-5">
    
    <!-- Top Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            TOTOLOTO 5/49
          </span>
          <span class="text-xs text-slate-400">Próximo Sorteio: <strong>Quarta-feira, 11 Nov 2026</strong></span>
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          📊 Matriz Comparativa: Sistemas vs Posição dos Números
        </h1>
        <p class="text-xs text-slate-400 mt-0.5">
          Cada célula indica a <strong>ordem de importância (1º ao 49º)</strong> que o sistema atribuiu a esse número para o próximo sorteio.
        </p>
      </div>

      <!-- Controls & Legend -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 text-[11px] font-bold bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <span class="w-3 h-3 rounded bg-amber-500"></span> 1º - 5º (Top 5)
          <span class="w-3 h-3 rounded bg-blue-500 ml-2"></span> 6º - 10º
          <span class="w-3 h-3 rounded bg-emerald-600/80 ml-2"></span> 11º - 25º
          <span class="w-3 h-3 rounded bg-slate-800 border border-slate-600 ml-2"></span> 26º - 49º
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <span class="text-slate-400">Total de Sistemas</span>
        <div class="text-lg font-black text-white mt-0.5">18 Sistemas + Corte</div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <span class="text-slate-400">Bolas no Globo</span>
        <div class="text-lg font-black text-indigo-400 mt-0.5">49 Números (1 a 49)</div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <span class="text-slate-400">Consenso #1 (Melhor Média)</span>
        <div class="text-lg font-black text-emerald-400 mt-0.5">Bola 14 (Média 16.4º)</div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <span class="text-slate-400">Mais Votada no Top 5</span>
        <div class="text-lg font-black text-amber-400 mt-0.5">Bola 49 (5 votos Top 5)</div>
      </div>
    </div>

    <!-- Table Container with Horizontal and Vertical Scrolling -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div class="overflow-x-auto max-h-[720px] relative">
        <table class="w-full text-center border-collapse text-xs" id="matrixTable">
          
          <!-- Table Header (Numbers 1 to 49) -->
          <thead>
            <tr class="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 sticky-header">
              <th class="p-3 text-left min-w-[240px] max-w-[240px] sticky-corner bg-slate-950 border-r border-slate-800 shadow-md">
                Sistema / Número
              </th>
              ${Array.from({ length: 49 }, (_, i) => i + 1).map(num => `
                <th class="py-2.5 px-1.5 min-w-[34px] hover:bg-indigo-950/60 transition cursor-pointer" title="Número ${num}" data-col="${num}">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-200 font-black text-[11px] border border-slate-700">
                    ${num}
                  </span>
                </th>
              `).join('')}
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-slate-800/60 font-mono text-[11px]">
            ${matrixData.systems.map(sys => {
              const isMatriz = sys.family === 'PRIORITÁRIO';
              return `
                <tr class="hover:bg-slate-800/40 transition group ${isMatriz ? 'bg-amber-950/20 font-semibold' : ''}">
                  <td class="p-2.5 text-left sticky-col bg-slate-900 group-hover:bg-slate-800 transition border-r border-slate-800 font-sans shadow-sm whitespace-nowrap">
                    <div class="flex items-center justify-between gap-2">
                      <span class="${isMatriz ? 'text-amber-400 font-black' : 'text-slate-200 font-semibold'}">
                        ${sys.name}
                      </span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded font-sans ${
                        isMatriz ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'
                      }">
                        ${isMatriz ? 'CORTE' : sys.family.slice(0, 4)}
                      </span>
                    </div>
                  </td>
                  ${Array.from({ length: 49 }, (_, i) => i + 1).map(b => {
                    const r = sys.ranks[b] || 49;
                    let cellStyle = 'bg-slate-900/40 text-slate-500';
                    let badge = r;
                    if (r <= 5) {
                      cellStyle = 'bg-amber-500 text-slate-950 font-black shadow-sm';
                    } else if (r <= 10) {
                      cellStyle = 'bg-blue-600 text-white font-bold';
                    } else if (r <= 25) {
                      cellStyle = 'bg-emerald-950/60 text-emerald-300 font-medium border border-emerald-800/40';
                    }
                    if (isMatriz) {
                      if (r <= 25) {
                        cellStyle = 'bg-emerald-600 text-white font-black';
                        badge = '✓' + r;
                      } else {
                        cellStyle = 'bg-rose-950/50 text-rose-400 border border-rose-900/40 line-through';
                        badge = '✕';
                      }
                    }
                    return `
                      <td class="p-1 border-r border-slate-800/30 transition cell-data" data-col="${b}" title="${sys.name} → Bola ${b}: Posição ${r}º">
                        <span class="inline-flex items-center justify-center w-full py-0.5 rounded ${cellStyle}">
                          ${badge}
                        </span>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>

          <!-- Table Footer (Consenso Médio por Bola) -->
          <tfoot class="border-t-2 border-slate-700 bg-slate-950 text-[11px] font-bold sticky bottom-0 z-20">
            <tr class="bg-slate-950">
              <td class="p-3 text-left sticky-col bg-slate-950 border-r border-slate-800 font-sans text-indigo-400 font-black">
                Média Posição Geral
              </td>
              ${Array.from({ length: 49 }, (_, i) => i + 1).map(b => {
                const item = matrixData.consensus.find(c => c.ball === b) || { avgRank: 25, top5Votes: 0 };
                const isBest = item.avgRank <= 20;
                return `
                  <td class="p-1 border-r border-slate-800/50 font-mono ${isBest ? 'text-emerald-400 font-black bg-emerald-950/20' : 'text-slate-400'}" data-col="${b}">
                    ${item.avgRank}
                  </td>
                `;
              }).join('')}
            </tr>
            <tr class="bg-slate-950">
              <td class="p-2 text-left sticky-col bg-slate-950 border-r border-slate-800 font-sans text-amber-400 font-black">
                Votos no Top 5 (🔥)
              </td>
              ${Array.from({ length: 49 }, (_, i) => i + 1).map(b => {
                const item = matrixData.consensus.find(c => c.ball === b) || { top5Votes: 0 };
                const hot = item.top5Votes >= 4;
                return `
                  <td class="p-1 border-r border-slate-800/50 font-mono ${hot ? 'text-amber-300 font-black bg-amber-500/20' : 'text-slate-500'}" data-col="${b}">
                    ${item.top5Votes > 0 ? item.top5Votes : '-'}
                  </td>
                `;
              }).join('')}
            </tr>
          </tfoot>

        </table>
      </div>
    </div>

  </div>

  <script>
    // Hover column highlight
    document.querySelectorAll('[data-col]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const col = el.getAttribute('data-col');
        document.querySelectorAll('[data-col="' + col + '"]').forEach(c => c.classList.add('col-highlight'));
      });
      el.addEventListener('mouseleave', () => {
        const col = el.getAttribute('data-col');
        document.querySelectorAll('[data-col="' + col + '"]').forEach(c => c.classList.remove('col-highlight'));
      });
    });
  </script>
</body>
</html>`;

const outPath = 'C:/Users/paulo/.gemini/antigravity/brain/7f5b2061-2574-4cdb-abed-fb4e45627ce4/totoloto_matrix_report.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Artifact written to:', outPath);
