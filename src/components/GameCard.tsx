import Link from 'next/link';
import { GameType } from '@/types/game';
import React from 'react';

type GameCardProps = {
  game: GameType;
  title: string;
  icon?: React.ReactNode;
  href?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function GameCard({ game, title, icon, href, children, footer }: GameCardProps) {
  return (
    <div
      data-game={game}
      className="game-card"
    >
      <div className="game-card-header">
        <span className="dot" />
        {icon}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="game-card-body">{children}</div>
      {footer ? <div className="px-5 pb-4">{footer}</div> : null}
    </div>
  );
}

type GameLinkCardProps = {
  game: GameType;
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
};

export function GameLinkCard({ game, title, description, href, badge, icon, footer }: GameLinkCardProps) {
  return (
    <Link href={href} className="block">
      <div data-game={game} className="game-card">
        <div className="game-card-header">
          <span className="dot" />
          {icon}
          <span className="font-semibold text-sm">{title}</span>
          {badge ? (
            <span className="ml-auto rounded-full bg-surface-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="game-card-body">
          <p className="text-sm text-secondary">{description}</p>
        </div>
        {footer ? <div className="px-5 pb-4">{footer}</div> : null}
      </div>
    </Link>
  );
}
