// Test script for input validator functionality
// Run with: npx tsx src/__tests__/security/test-input-validator.ts

import {
    validateEmail,
    validatePassword,
    validateName,
    sanitizeInput,
    validateRegistrationData
} from '@/lib/input-validator';

console.log('🧪 Testing Input Validator...\n');

// Test 1: Email Validation
console.log('Test 1: Email Validation');
const emailTests = [
    { email: 'valid@example.com', expected: true },
    { email: 'test.user@domain.co.uk', expected: true },
    { email: 'invalid', expected: false },
    { email: 'no@domain', expected: false },
    { email: '@nodomain.com', expected: false },
    { email: '', expected: false },
];

emailTests.forEach(test => {
    const result = validateEmail(test.email);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`  ${status} "${test.email}" → ${result ? 'valid' : 'invalid'}`);
});
console.log();

// Test 2: Password Validation
console.log('Test 2: Password Validation');
const passwordTests = [
    { password: 'SecurePass123', expectedValid: true },
    { password: 'abc123', expectedValid: true },
    { password: '12345', expectedValid: false, reason: 'too short' },
    { password: '123456', expectedValid: false, reason: 'weak password' },
    { password: 'password', expectedValid: false, reason: 'weak password' },
    { password: '', expectedValid: false, reason: 'empty' },
];

passwordTests.forEach(test => {
    const result = validatePassword(test.password);
    const status = result.valid === test.expectedValid ? '✅' : '❌';
    console.log(`  ${status} "${test.password}" → ${result.valid ? 'valid' : `invalid (${result.errors.join(', ')})`}`);
});
console.log();

// Test 3: Name Validation
console.log('Test 3: Name Validation');
const nameTests = [
    { name: 'Paulo Silva', expected: true },
    { name: 'João-Pedro', expected: true },
    { name: "O'Brien", expected: true },
    { name: 'José María', expected: true },
    { name: 'A', expected: true },
    { name: '', expected: false },
    { name: '<script>alert()</script>', expected: false },
    { name: '123456', expected: false },
];

nameTests.forEach(test => {
    const result = validateName(test.name);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`  ${status} "${test.name}" → ${result ? 'valid' : 'invalid'}`);
});
console.log();

// Test 4: Input Sanitization
console.log('Test 4: Input Sanitization');
const sanitizeTests = [
    { input: 'Normal text', expected: 'Normal text' },
    { input: '<script>alert("XSS")</script>', expected: 'scriptalert("XSS")/script' },
    { input: 'Text with <tags>', expected: 'Text with tags' },
    { input: '  spaces  ', expected: 'spaces' },
];

sanitizeTests.forEach(test => {
    const result = sanitizeInput(test.input);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`  ${status} "${test.input}" → "${result}"`);
});
console.log();

// Test 5: Full Registration Data Validation
console.log('Test 5: Full Registration Validation');

// Valid registration
const validFormData = new FormData();
validFormData.set('name', 'Paulo Silva');
validFormData.set('email', 'paulo@example.com');
validFormData.set('password', 'SecurePass123');

const validResult = validateRegistrationData(validFormData);
console.log(`  Valid data: ${validResult.valid ? '✅ PASS' : '❌ FAIL'}`);
if (validResult.data) {
    console.log(`    Name: "${validResult.data.name}"`);
    console.log(`    Email: "${validResult.data.email}"`);
}

// Invalid registration (weak password)
const invalidFormData = new FormData();
invalidFormData.set('name', 'Test User');
invalidFormData.set('email', 'test@example.com');
invalidFormData.set('password', '123456');

const invalidResult = validateRegistrationData(invalidFormData);
console.log(`  Weak password: ${!invalidResult.valid ? '✅ PASS - Rejected' : '❌ FAIL - Should reject'}`);
if (!invalidResult.valid) {
    console.log(`    Errors: ${invalidResult.errors.join(', ')}`);
}

// Invalid email
const invalidEmailData = new FormData();
invalidEmailData.set('name', 'Test User');
invalidEmailData.set('email', 'not-an-email');
invalidEmailData.set('password', 'ValidPass123');

const invalidEmailResult = validateRegistrationData(invalidEmailData);
console.log(`  Invalid email: ${!invalidEmailResult.valid ? '✅ PASS - Rejected' : '❌ FAIL - Should reject'}`);
if (!invalidEmailResult.valid) {
    console.log(`    Errors: ${invalidEmailResult.errors.join(', ')}`);
}

console.log('\n✅ All input validator tests completed!\n');
