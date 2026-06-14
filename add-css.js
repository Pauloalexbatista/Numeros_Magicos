const fs = require('fs');
const cssFile = 'src/app/globals.css';
let cssContent = fs.readFileSync(cssFile, 'utf8');

const newRules = `
/* ============================================================
   GLASSMORPHISM & DYNAMIC COLOR CLASSES
   ============================================================ */

.glass-card {
  background: var(--surface-1);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  overflow: hidden;
}

.dark .glass-card {
  background: rgba(19, 21, 28, 0.6);
}

.glass-card:hover {
  border-color: var(--accent-border, var(--border-strong));
  box-shadow: var(--shadow-md), 0 0 20px var(--glow, transparent);
}

.glass-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  transition: all var(--transition-base);
  background: var(--accent, var(--surface-2));
  color: #fff;
  border: 1px solid transparent;
  box-shadow: 0 4px 14px var(--glow, rgba(0,0,0,0.1));
}

.glass-button:not(:disabled):hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
  box-shadow: 0 6px 20px var(--glow, rgba(0,0,0,0.15));
}

.glass-button:disabled {
  background: var(--surface-2);
  color: var(--text-disabled);
  box-shadow: none;
  cursor: not-allowed;
}

.game-glow-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at top, var(--glow, transparent) 0%, transparent 70%);
  opacity: 0.5;
  pointer-events: none;
}
`;

if (!cssContent.includes('.glass-card {')) {
  cssContent += newRules;
  fs.writeFileSync(cssFile, cssContent, 'utf8');
  console.log('Added glass classes');
} else {
  console.log('Classes already exist');
}
