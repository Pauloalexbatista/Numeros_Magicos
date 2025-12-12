import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json();

        // Validações
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        // Validar comprimentos
        if (name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { error: 'Nome deve ter entre 2 e 100 caracteres' },
                { status: 400 }
            );
        }

        if (subject.length < 3 || subject.length > 200) {
            return NextResponse.json(
                { error: 'Assunto deve ter entre 3 e 200 caracteres' },
                { status: 400 }
            );
        }

        if (message.length < 10 || message.length > 5000) {
            return NextResponse.json(
                { error: 'Mensagem deve ter entre 10 e 5000 caracteres' },
                { status: 400 }
            );
        }

        // Enviar email
        console.log('[API] Sending contact email to:', email);
        const result = await sendContactEmail(name, email, subject, message);
        console.log('[API] Email result:', result);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Erro ao enviar mensagem. Tente novamente.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Mensagem enviada com sucesso! Responderemos em breve.'
        });
    } catch (error) {
        console.error('Error in contact form:', error);
        return NextResponse.json(
            { error: 'Erro ao processar solicitação' },
            { status: 500 }
        );
    }
}
