import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../lib/email';

/**
 * Script de Teste - Resend Email Service
 * 
 * Testa os 3 tipos de emails:
 * 1. Verificação de email
 * 2. Recuperação de senha
 * 3. Boas-vindas
 */

async function testEmailService() {
    console.log('📧 Testando Serviço de Email Resend...\n');

    // Email de teste (use seu próprio email para receber os testes)
    const testEmail = 'numeros_magicos@outlook.com'; // Altere para seu email
    const testToken = 'test-token-123456789';
    const testName = 'Paulo';

    console.log(`Enviando emails de teste para: ${testEmail}\n`);

    // Teste 1: Email de Verificação
    console.log('1️⃣ Testando Email de Verificação...');
    try {
        const result1 = await sendVerificationEmail(testEmail, testToken);
        if (result1.success) {
            console.log('   ✅ Email de verificação enviado com sucesso!');
        } else {
            console.log('   ❌ Erro ao enviar email de verificação:', result1.error);
        }
    } catch (error) {
        console.log('   ❌ Erro:', error);
    }

    console.log('');

    // Teste 2: Email de Recuperação de Senha
    console.log('2️⃣ Testando Email de Recuperação de Senha...');
    try {
        const result2 = await sendPasswordResetEmail(testEmail, testToken);
        if (result2.success) {
            console.log('   ✅ Email de recuperação enviado com sucesso!');
        } else {
            console.log('   ❌ Erro ao enviar email de recuperação:', result2.error);
        }
    } catch (error) {
        console.log('   ❌ Erro:', error);
    }

    console.log('');

    // Teste 3: Email de Boas-Vindas
    console.log('3️⃣ Testando Email de Boas-Vindas...');
    try {
        const result3 = await sendWelcomeEmail(testEmail, testName);
        if (result3.success) {
            console.log('   ✅ Email de boas-vindas enviado com sucesso!');
        } else {
            console.log('   ❌ Erro ao enviar email de boas-vindas:', result3.error);
        }
    } catch (error) {
        console.log('   ❌ Erro:', error);
    }

    console.log('\n📊 Teste completo!');
    console.log('\n💡 Verifique a caixa de entrada de:', testEmail);
    console.log('   (Também verifique a pasta de spam)');
}

testEmailService()
    .then(() => {
        console.log('\n✅ Script finalizado!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erro fatal:', error);
        process.exit(1);
    });
