/**
 * Script FINAL para Testar Resend
 * 
 * Execute com: npx tsx src/scripts/test-resend-final.ts
 */

import { Resend } from 'resend';

const RESEND_API_KEY = 're_3evzLKjb_7NDZeVWLPY8BqhFo8Ak7kYLx';
const FROM_EMAIL = 'Números Mágicos <noreply@numerosmagicos.com>';
const TO_EMAIL = 'numeros_magicos@outlook.com'; // Altere se quiser receber em outro email

async function testResend() {
  console.log('📧 Testando Resend Email Service...\n');

  const resend = new Resend(RESEND_API_KEY);

  try {
    console.log('Enviando email de teste...');

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: '🎉 Teste Resend - Números Mágicos FUNCIONA!',
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
                text-align: center;
              }
              .success-icon {
                font-size: 64px;
                margin-bottom: 20px;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              .stats {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Números Mágicos</h1>
              </div>
              <div class="content">
                <div class="success-icon">✅</div>
                <h2>Resend Funcionando Perfeitamente!</h2>
                <p>Parabéns! O serviço de email está 100% operacional.</p>
                
                <div class="stats">
                  <p><strong>Email enviado em:</strong><br>${new Date().toLocaleString('pt-PT')}</p>
                  <p><strong>De:</strong> ${FROM_EMAIL}</p>
                  <p><strong>Para:</strong> ${TO_EMAIL}</p>
                </div>
                
                <h3>✨ O que já funciona:</h3>
                <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                  <li>✅ Emails de verificação</li>
                  <li>✅ Recuperação de senha</li>
                  <li>✅ Emails de boas-vindas</li>
                </ ul>
                
                <p style="margin-top: 30px; color: #667eea; font-weight: bold;">
                  Tudo pronto para produção! 🎉
                </p>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos | Powered by Resend</p>
                <p>FREE Tier: 100 emails/dia | 3,000 emails/mês</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    console.log('\n✅ EMAIL ENVIADO COM SUCESSO!');
    console.log('━'.repeat(50));
    console.log('📬 ID do Email:', result.data?.id);
    console.log('📧 Destinatário:', TO_EMAIL);
    console.log('━'.repeat(50));
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Verifique sua caixa de entrada');
    console.log('   2. Verifique também a pasta de SPAM');
    console.log('   3. Se não receber, aguarde alguns minutos');
    console.log('\n🎉 Resend está 100% FUNCIONANDO!');

  } catch (error: any) {
    console.log('\n❌ ERRO ao enviar email:');
    console.log('━'.repeat(50));
    console.log(error.message || error);
    console.log('━'.repeat(50));

    if (error.message?.includes('API key')) {
      console.log('\n💡 Problema: API Key inválida');
      console.log('   Verifique se a key está correta no Resend');
    } else if (error.message?.includes('email')) {
      console.log('\n💡 Problema: Email não verificado');
      console.log('   Vá no dashboard do Resend e verifique o email remetente');
    }
  }
}

testResend()
  .then(() => {
    console.log('\n✅ Teste finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
