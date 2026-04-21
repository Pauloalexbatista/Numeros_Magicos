const BASE_URL = 'https://numerosmagicos.com/api/admin';
const SECRET_HEADER = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer magia2026'
};

async function runTraining(game: string, targetNetwork: string) {
    console.log(`\n🚀 Lançando treino sequencial para: ${game} -> ${targetNetwork}...`);
    console.log(`Acompanha o progresso no Laboratório em: https://numerosmagicos.com/admin/health`);
    
    try {
        const res = await fetch(`${BASE_URL}/ml`, {
            method: 'POST',
            headers: SECRET_HEADER,
            body: JSON.stringify({ game, targetNetwork })
        });
        
        const data = await res.json();
        if (res.ok) {
            console.log(`✅ Concluído e Guardado: ${data.message}`);
            return true;
        } else {
            console.error(`❌ Erro no cálculo: ${data.error}`);
            return false;
        }
    } catch (e: any) {
        console.error(`💥 Erro de rede: ${e.message}`);
        return false;
    }
}

async function startSurgicalPhase() {
    console.log("--- FASE CIRÚRGICA: TREINO SEQUENCIAL LABORATÓRIO 2.0 ---");
    
    // Iniciaremos com o EuroMilhões
    await runTraining('EUROMILLIONS', 'RF_NUMBERS');
    await runTraining('EUROMILLIONS', 'RF_STARS');
    
    // Podemos continuar para os outros modelos após verificarmos o sucesso destes
    console.log("\n--- PAUSA DE SEGURANÇA: ESPERANDO VALIDAÇÃO DO UTILIZADOR ---");
}

startSurgicalPhase();
