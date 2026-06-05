'use client';
// src/components/ui/BackToHome.tsx
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type BackToHomeProps = {
  centered?: boolean;
};

export default function BackToHome({ centered = false }: BackToHomeProps) {
  const { user } = useAuth();

  const href = user
    ? user.role === 'ong'
      ? '/painel'
      : '/dashboard'
    : '/';

  const label = user
    ? user.role === 'ong'
      ? 'Voltar ao painel'
      : 'Voltar ao dashboard'
    : 'Voltar ao site';

  return (
    <div className={centered ? 'pb-16 flex justify-center' : 'max-w-6xl mx-auto px-8 pt-8'}>
      <Link
        href={href}
        className="flex items-center gap-2 text-[#5E736A] hover:text-[#2C4A3E] transition-colors text-sm font-light"
      >
        <span className="text-base">←</span>
        <span>{label}</span>
      </Link>
    </div>
  );
}