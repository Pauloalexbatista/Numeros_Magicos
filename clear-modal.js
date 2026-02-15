// Script para limpar o localStorage e forçar o modal a aparecer novamente
// Cole isto na consola do browser (F12 → Console) e pressione Enter

localStorage.removeItem('responsibility_accepted');
console.log('✅ localStorage limpo! Recarregue a página para ver o modal.');
location.reload();
