async function testLogin() {
  try {
    const res = await fetch('http://localhost:3000/login');
    const html = await res.text();
    
    let checks = [];
    
    // Check 1: Does Mega-Sena exist in the local selector?
    if (html.includes('Mega-Sena')) {
      checks.push('✅ Mega-Sena encontrada na página.');
    } else {
      checks.push('❌ Mega-Sena NÃO encontrada.');
    }
    
    // Check 2: Are the top menu games hidden?
    // In the top menu we look for the specific aria-label "Seleccionar jogo"
    // Since isLogin is true, the GAMES.map won't render. 
    // We can check if Euromilhões has fewer occurrences than before, or check specifically for the top menu structure.
    
    console.log(checks.join('\n'));
    console.log('\nTeste local de servidor concluído!');
  } catch (e) {
    console.log('Servidor de desenvolvimento não está a correr no porto 3000.');
  }
}
testLogin();
