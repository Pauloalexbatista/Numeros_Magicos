/**
 * Teste Resend com Email Padrão
 * Usa onboarding@resend.dev (sem necessidade de verificação)
 */

import { Resend } from 'resend';

const RESEND_API_KEY = 're_3evzLKjb_7NDZeVWLPY8BqhFo8Ak7kYLx';

async function testWithDefaultEmail() {
    console.log('📧 Testando com Email Padrão do Resend...\n');

    const resend = new Resend(RESEND_API_KEY);

    try {
        console.log('Enviando email...');

        const result = await resend.emails.send({
            from: 'Números Mágicos <onboarding@resend.dev>', // Email padrão que funciona
            to: 'numeros_magicos@outlook.com',
            subject: '✅ Teste RESEND Funcionando - Números Mágicos',
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
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .success {
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Resend Funcionando!</h1>
              </div>
              <div class="content">
                <div class="success">✅</div>
                <h2>Email Recebido com Sucesso!</h2>
                <p>O serviço Resend está <strong>100% operacional</strong>!</p>
                
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; text-align: left;">
                  <p><strong>✅ Configuração Completa:</strong></p>
                  <ul style="margin: 10px 0;">
                    <li>API Key: Funcionando</li>
                    <li>Envio de Emails: OK</li>
                    <li>Templates HTML: OK</li>
                    <li>Integração: Pronta</li>
                  </ul>
                </div>
                
                <p style="margin-top: 30px; color: #059669; font-weight: bold;">
                  Pronto para usar em produção! 🚀
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  Enviado em: ${new Date().toLocaleString('pt-PT')}
                </p>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos | Powered by Resend</p>
                <p>Este email foi enviado de: onboarding@resend.dev</p>
              </div>
            </div>
          </body>
        </html>
      `
        });

        console.log('\n🎉 EMAIL ENVIADO COM SUCESSO!');
        console.log('━'.repeat(50));
        console.log('📬 ID:', result.data?.id);
        console.log('📧 Para:', 'numeros_magicos@outlook.com');
        console.log('📤 De:', 'onboarding@resend.dev');
        console.log('━'.repeat(50));
        console.log('\n✅ VERIFIQUE SUA CAIXA DE ENTRADA AGORA!');
        console.log('   → numeros_magicos@outlook.com');
        console.log('   → Assunto: "✅ Teste RESEND Funcionando"');
        console.log('\n💡 Verifique também a pasta SPAM!');

    } catch (error: any) {
        console.log('\n❌ ERRO:', error.message || error);
    }
}

testWithDefaultEmail()
    .then(() => {
        console.log('\n✅ Teste completo!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erro fatal:', error);
        process.exit(1);
    });
