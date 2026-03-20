import { TotolotoService } from './src/services/totolotoService';

async function main() {
    console.log('🔄 Re-importando Histórico Totoloto (com correção de Fuso Horário)...');
    const ttService = new TotolotoService();
    // Limite 2011 porque o LoteriaGuru mudou a sua estrutura de HTML profunda mais ou menos por essa altura
    await ttService.seedFromArchive(2011); 
    console.log('✅ Finalizado!');
}

main().catch(console.error);
