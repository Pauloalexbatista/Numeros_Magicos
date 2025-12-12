import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

const DEFAULT_SENDER = process.env.RESEND_FROM_EMAIL || 'Números Mágicos <noreply@numerosmagicos.com>';

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: DEFAULT_SENDER,
      to: email,
      subject: '🔮 Verifique seu email - Números Mágicos',
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
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 40px 30px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
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
                <h1>🔮 Números Mágicos</h1>
              </div>
              <div class="content">
                <h2>Bem-vindo!</h2>
                <p>Obrigado por se registar. Clique no botão abaixo para verificar seu email:</p>
                <center>
                  <a href="${verificationUrl}" class="button">
                    Verificar Email
                  </a>
                </center>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Ou copie e cole este link no navegador:<br>
                  <code style="background: #f4f4f4; padding: 10px; display: block; margin-top: 10px; word-break: break-all;">
                    ${verificationUrl}
                  </code>
                </p>
                <p style="margin-top: 30px; color: #999; font-size: 12px;">
                  Este link expira em 24 horas.
                </p>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: DEFAULT_SENDER,
      to: email,
      subject: '🔐 Recuperação de Senha - Números Mágicos',
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
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .content {
                padding: 40px 30px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
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
                <h1>🔐 Recuperação de Senha</h1>
              </div>
              <div class="content">
                <h2>Redefinir Senha</h2>
                <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
                <center>
                  <a href="${resetUrl}" class="button">
                    Redefinir Senha
                  </a>
                </center>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Ou copie e cole este link no navegador:<br>
                  <code style="background: #f4f4f4; padding: 10px; display: block; margin-top: 10px; word-break: break-all;">
                    ${resetUrl}
                  </code>
                </p>
                <p style="margin-top: 30px; color: #ff6b6b; font-size: 13px;">
                  ⚠️ Se você não solicitou esta alteração, ignore este email.
                </p>
                <p style="color: #999; font-size: 12px;">
                  Este link expira em 1 hora.
                </p>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: DEFAULT_SENDER,
      to: email,
      subject: '🎉 Bem-vindo aos Números Mágicos!',
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
              .feature {
                margin: 20px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Bem-vindo!</h1>
              </div>
              <div class="content">
                <h2>Olá ${name}!</h2>
                <p>Estamos muito felizes por você fazer parte da comunidade <strong>Números Mágicos</strong>!</p>
                
                <h3>🔮 O que você pode fazer:</h3>
                <div class="feature">
                  <strong>📊 Análises Avançadas</strong><br>
                  Acesse sistemas de previsão baseados em matemática, Vortex e Tesla/Rodin
                </div>
                <div class="feature">
                  <strong>🏆 Rankings</strong><br>
                  Veja os sistemas mais precisos e suas taxas de acerto
                </div>
                <div class="feature">
                  <strong>📈 Histórico</strong><br>
                  Analise padrões em milhares de sorteios anteriores
                </div>
                
                <center>
                  <a href="${process.env.NEXTAUTH_URL}" style="
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                  ">
                    Começar Agora
                  </a>
                </center>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  const contactEmail = DEFAULT_SENDER;

  try {
    // Email para o administrador (você)
    await resend.emails.send({
      from: contactEmail,
      to: contactEmail, // Envia para o próprio remetente (você recebe na caixa do domínio)
      replyTo: email, // Permite responder diretamente ao visitante
      subject: `📧 Contato: ${subject}`,
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
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .content {
                padding: 40px 30px;
              }
              .info-box {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #4CAF50;
              }
              .message-box {
                background: #fff;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin: 20px 0;
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
                <h1>📧 Nova Mensagem de Contato</h1>
              </div>
              <div class="content">
                <h2>Detalhes do Remetente</h2>
                <div class="info-box">
                  <p><strong>👤 Nome:</strong> ${name}</p>
                  <p><strong>📧 Email:</strong> ${email}</p>
                  <p><strong>📋 Assunto:</strong> ${subject}</p>
                  <p><strong>🕒 Data:</strong> ${new Date().toLocaleString('pt-PT')}</p>
                </div>
                
                <h2>Mensagem</h2>
                <div class="message-box">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                
                <p style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 5px; font-size: 14px;">
                  💡 <strong>Dica:</strong> Clique em "Responder" para responder diretamente para ${email}
                </p>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos | Sistema de Contato</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    // Email de confirmação para o visitante
    await resend.emails.send({
      from: contactEmail,
      to: email,
      subject: '✅ Mensagem Recebida - Números Mágicos',
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
                <h1>✅ Mensagem Recebida!</h1>
              </div>
              <div class="content">
                <h2>Olá ${name}!</h2>
                <p>Recebemos sua mensagem e entraremos em contato em breve.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Resumo da sua mensagem:</strong></p>
                  <p><strong>Assunto:</strong> ${subject}</p>
                  <p style="color: #666; font-size: 14px; margin-top: 10px;">
                    ${message.substring(0, 150)}${message.length > 150 ? '...' : ''}
                  </p>
                </div>
                
                <p style="color: #667eea; font-weight: bold; text-align: center; margin-top: 30px;">
                  Responderemos o mais breve possível! 🚀
                </p>
              </div>
              <div class="footer">
                <p>© 2025 Números Mágicos. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error };
  }
}
