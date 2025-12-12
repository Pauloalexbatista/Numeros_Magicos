/**
 * Script Simples para Testar Resend
 * 
 * Execute com: npx tsx src/scripts/test-resend-direct.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Verificando configuração...\n');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ Não encontrado');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Não encontrado');
console.log('');

async function testResend() {
    // Importar Resend dinamicamente DEPOIS de carregar as env vars
    const { Resend } = await import('resend');

    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('📧 Enviando email de teste...\n');

    try {
        const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'numeros_magicos@outlook.com',
            to: 'numeros_magicos@outlook.com', // Altere para seu email
            subject: '🎉 Teste Resend - Números Mágicos',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .content {
                padding: 40px 30px;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Teste Bem-Sucedido!</h1>
              </div>
              <div class="content">
                <h2>Parabéns!</h2>
                <p>O serviço de email Resend está funcionando perfeitamente no projeto <strong>Números Mágicos</strong>!</p>
                <p>Este é um email de teste enviado em: <strong>${new Date().toLocaleString('pt-PT')}</strong></p>
                <p>Tudo está configurado e pronto para uso! 🚀</p>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos. Powered by Resend.</p>
              </div>
            </div>
          </body>
        </html>
      `
        });

        console.log('✅ Email enviado com sucesso!');
        console.log('📬 ID:', result.data?.id);
        console.log('');
        console.log('💡 Verifique sua caixa de entrada em: numeros_magicos@outlook.com');
        console.log('   (Também verifique a pasta de spam)');

    } catch (error: any) {
        console.log('❌ Erro ao enviar email:');
        console.log('');
        console.log(error.message || error);

        if (error.message?.includes('Missing API key')) {
            console.log('');
            console.log('💡 Dica: Verifique se RESEND_API_KEY está configurado no .env.local');
        }
    }
}

testResend()
    .then(() => {
        console.log('');
        console.log('✅ Teste finalizado!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
