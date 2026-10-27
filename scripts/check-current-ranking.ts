async function check() {
  for (const game of ["EUROMILLIONS", "TOTOLOTO"]) {
    try {
      const res = await fetch(`http://localhost:3000/api/tools/radar?game=${game}&domain=NUMBERS`);
      if (!res.ok) {
        console.log(`Failed for ${game}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      console.log(`=== RANKING ATUAL DO RADAR: ${game} ===`);
      data.systems.forEach((s: any, idx: number) => {
        console.log(
          `#${idx + 1} ${s.systemName.padEnd(30)} | JPI: ${String(s.jpiScore).padStart(3)} | Status: ${s.statusLabel.padEnd(25)} | Atraso: ${String(s.currentDelay).padStart(3)} | 4/5 Ciclo: ${s.travesSinceLastJackpot}/${s.travesPerJackpotMean} | 4s últ.5: ${s.travesLast5}`
        );
      });
      console.log("\n");
    } catch (e: any) {
      console.log(`Server not running or error: ${e.message}`);
    }
  }
}

check();
