'use client';

/**
 * EntryGuard - A verificação de entrada humana é feita na página /login e no middleware.ts
 * (que deixa passar os robôs do Google/AdSense e exige o clique de aceitação em /login para humanos).
 */
export default function EntryGuard({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
}
