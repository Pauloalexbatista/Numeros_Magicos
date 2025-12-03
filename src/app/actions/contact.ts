'use server'

export async function sendContactMessage(formData: FormData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("📨 New Contact Message:");
    console.log(`From: ${name} (${email})`);
    console.log(`Message: ${message}`);

    return { success: true, message: "Mensagem enviada com sucesso!" };
}
