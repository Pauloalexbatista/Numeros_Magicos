/**
 * Input validation and sanitization utilities
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
    valid: boolean;
    errors: string[]
} {
    const errors: string[] = [];

    if (!password || typeof password !== 'string') {
        return { valid: false, errors: ['Password é obrigatória'] };
    }

    if (password.length < 6) {
        errors.push('Password deve ter pelo menos 6 caracteres');
    }

    if (password.length > 128) {
        errors.push('Password demasiado longa');
    }

    // Optional: Check for common weak passwords
    const weakPasswords = ['123456', 'password', '123456789', 'qwerty', '111111'];
    if (weakPasswords.includes(password.toLowerCase())) {
        errors.push('Password demasiado fraca');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate name (alphanumeric + spaces, accents allowed)
 */
export function validateName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;

    // Allow letters (including accented), spaces, hyphens, apostrophes
    // Length: 1-100 characters
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{1,100}$/;
    return nameRegex.test(name.trim());
}

/**
 * Sanitize input (remove potential harmful characters)
 * Note: Prisma already protects against SQL injection via prepared statements
 * This is an additional layer for display/storage
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent XSS
        .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize form data
 */
export function validateRegistrationData(formData: FormData): {
    valid: boolean;
    errors: string[];
    data?: {
        name: string;
        email: string;
        password: string;
    };
} {
    const errors: string[] = [];

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate name
    if (!validateName(name)) {
        errors.push('Nome inválido');
    }

    // Validate email
    if (!validateEmail(email)) {
        errors.push('Email inválido');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        errors.push(...passwordValidation.errors);
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        errors: [],
        data: {
            name: sanitizeInput(name),
            email: email.toLowerCase().trim(),
            password: password
        }
    };
}
