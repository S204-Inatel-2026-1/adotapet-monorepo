'use client';

// src/app/painel/page.tsx
// Dashboard overview da ONG — dados mockados
// TODO (Lucas): substituir mocks pelos endpoints reais

import Link from 'next/link';
import { useState } from 'react';
import { X, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import OngHeader from '@/components/layout/OngHeader';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0];
  if (hour >= 5 && hour < 12) return `Bom dia, ${firstName}! ☀️`;
  if (hour >= 12 && hour < 18) return `Boa tarde, ${firstName}! 🌤️`;
  return `Boa noite, ${firstName}! 🌙`;
}

// ─────────────────────────────────────────────
// DADOS MOCKADOS
// TODO (Lucas): substituir por chamadas reais à API
// ─────────────────────────────────────────────

const MOCK_STATS = {
  totalPets: 12,
  pendingAdoptions: 5,
  approvedAdoptions: 8,
  newRescues: 2,
};

// TODO (Lucas): GET /adoptions/received?limit=3
const MOCK_RECENT_ADOPTIONS = [
  { id: 'adoc-001', petName: 'Thor', requesterName: 'Maria Silva',  status: 'pending'  as const },
  { id: 'adoc-002', petName: 'Thor', requesterName: 'João Pereira', status: 'pending'  as const },
  { id: 'adoc-003', petName: 'Nina', requesterName: 'Carla Mendes', status: 'approved' as const },
];

// TODO (Lucas): GET /rescue-help-requests?limit=2 (quando backend implementar)
const MOCK_RECENT_RESCUES = [
  {
    id: 'res-001',
    animalType: 'Cachorro',
    location: 'Bairro São Benedito',
    receivedAt: '2h atrás',
    status: 'new' as const,
    description: 'Animal encontrado machucado próximo à escola municipal. Aparenta ter sido atropelado. Está consciente mas não consegue se locomover.',
    address: 'Rua das Flores, 123 — Bairro São Benedito',
  },
  {
    id: 'res-002',
    animalType: 'Gato',
    location: 'Centro',
    receivedAt: '5h atrás',
    status: 'analyzing' as const,
    description: 'Gato preso em árvore há mais de 12 horas no centro da cidade. Está assustado e não consegue descer sozinho.',
    address: 'Praça Central, s/n — Centro',
  },
];

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function PainelPage() {
  const { user } = useAuth();
  const [selectedRescue, setSelectedRescue] = useState<typeof MOCK_RECENT_RESCUES[0] | null>(null);

  const { totalPets, pendingAdoptions, approvedAdoptions, newRescues } = MOCK_STATS;

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <OngHeader />
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">

        {/* ── SAUDAÇÃO ── */}
        <div className="bg-white rounded-[32px] px-8 py-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3A5B4F] flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#2C4A3E]">
              {user?.name ? getGreeting(user.name) : 'Bem-vindo! 👋'}
            </h2>
            <p className="text-gray-400 text-sm">Gerencie seus pets, solicitações e resgates.</p>
          </div>
        </div>

        {/* ── MÉTRICAS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pets cadastrados',       value: totalPets,         icon: '🐾', href: '/painel/pets',    highlight: false },
            { label: 'Solicitações pendentes', value: pendingAdoptions,  icon: '⏳', href: '/painel/adocoes', highlight: pendingAdoptions > 0 },
            { label: 'Adoções aprovadas',      value: approvedAdoptions, icon: '✅', href: '/painel/adocoes', highlight: false },
            { label: 'Resgates novos',         value: newRescues,        icon: '🚨', href: '#resgates',       highlight: newRescues > 0 },
          ].map((metric) => (
            <Link key={metric.label} href={metric.href} className="block group">
              <div className={`bg-white rounded-[24px] p-6 border shadow-sm hover:shadow-md transition-all ${
                metric.highlight ? 'border-[#F4C542] shadow-[#F4C542]/10' : 'border-gray-100'
              }`}>
                <span className="text-3xl mb-3 block">{metric.icon}</span>
                <p className="text-4xl font-black text-[#2C4A3E] mb-1">{metric.value}</p>
                <p className="text-sm text-gray-400 font-medium leading-snug">{metric.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── ACESSO RÁPIDO ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Bloco: Meus Pets */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-[#2C4A3E]">Meus Pets</h3>
                <p className="text-sm text-gray-400 mt-1">{totalPets} pets cadastrados</p>
              </div>
              <Link href="/painel/pets" className="text-sm font-bold text-[#3A5B4F] hover:text-[#2C4A3E] transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9F7F2]">
                <span className="text-2xl">🐶</span>
                <div className="flex-1">
                  <p className="font-bold text-[#2C4A3E] text-sm">Thor</p>
                  <p className="text-xs text-gray-400">Labrador · Grande</p>
                </div>
                <span className="text-xs font-bold bg-[#E8F0E6] text-[#2C4A3E] px-3 py-1 rounded-full">Disponível</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9F7F2]">
                <span className="text-2xl">🐱</span>
                <div className="flex-1">
                  <p className="font-bold text-[#2C4A3E] text-sm">Nina</p>
                  <p className="text-xs text-gray-400">Siamês · Pequeno</p>
                </div>
                <span className="text-xs font-bold bg-[#F4C542]/20 text-[#2C4A3E] px-3 py-1 rounded-full">Em análise</span>
              </div>
            </div>

            <Link
              href="/painel/pets/novo"
              className="mt-5 w-full py-3 rounded-2xl border-2 border-dashed border-[#E8F0E6] text-[#3A5B4F] text-sm font-bold hover:border-[#3A5B4F] hover:bg-[#E8F0E6]/30 transition-all flex items-center justify-center gap-2"
            >
              + Cadastrar novo pet
            </Link>
          </div>

          {/* Bloco: Solicitações Recentes */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-[#2C4A3E]">Solicitações Recentes</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {pendingAdoptions} pendente{pendingAdoptions !== 1 ? 's' : ''}
                </p>
              </div>
              <Link href="/painel/adocoes" className="text-sm font-bold text-[#3A5B4F] hover:text-[#2C4A3E] transition-colors">
                Ver todas →
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_RECENT_ADOPTIONS.map((adoption) => (
                <div key={adoption.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9F7F2]">
                  <div className="w-9 h-9 rounded-full bg-[#E8F0E6] flex items-center justify-center text-sm font-black text-[#2C4A3E] flex-shrink-0">
                    {adoption.requesterName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2C4A3E] text-sm truncate">{adoption.requesterName}</p>
                    <p className="text-xs text-gray-400">quer adotar {adoption.petName}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                    adoption.status === 'pending' ? 'bg-[#F4C542]/20 text-[#2C4A3E]' : 'bg-[#E8F0E6] text-[#2C4A3E]'
                  }`}>
                    {adoption.status === 'pending' ? '⏳ Pendente' : '✅ Aprovado'}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/painel/adocoes"
              className="mt-5 w-full py-3 rounded-2xl bg-[#E8F0E6] text-[#3A5B4F] text-sm font-bold hover:bg-[#d4e4d0] transition-all flex items-center justify-center"
            >
              Gerenciar solicitações
            </Link>
          </div>
        </div>

        {/* ── RESGATES RECENTES ── */}
        <div id="resgates" className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-[#2C4A3E]">Chamados de Resgate</h3>
              <p className="text-sm text-gray-400 mt-1">Solicitações de resgate recebidas pela plataforma</p>
            </div>
            {newRescues > 0 && (
              <span className="bg-red-50 text-red-500 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                {newRescues} novo{newRescues > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {MOCK_RECENT_RESCUES.map((rescue) => (
              <button
                key={rescue.id}
                onClick={() => setSelectedRescue(rescue)}
                className="w-full flex items-center justify-between gap-6 p-5 rounded-2xl bg-[#F9F7F2] hover:bg-[#E8F0E6] transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-xl flex-shrink-0">
                    🚨
                  </div>
                  <div>
                    <p className="font-black text-[#2C4A3E] text-sm">
                      {rescue.animalType} em situação de risco
                    </p>
                    <p className="text-xs text-[#3A5B4F] font-medium">
                      📍 Santa Rita do Sapucaí — {rescue.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Recebido há {rescue.receivedAt}</p>
                  </div>
                </div>
                <span className="bg-[#3A5B4F] text-white font-bold px-5 py-2.5 rounded-2xl text-sm flex-shrink-0 hover:bg-[#2C4A3E] transition-colors">
                  Ver detalhes →
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── MINI FOOTER ── */}
      <footer className="mt-12 border-t border-gray-100 py-6">
        <p className="text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} AdotaPET. Todos os direitos reservados.
        </p>
      </footer>

      {/* ── MODAL DE RESGATE ── */}
      {selectedRescue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="bg-red-50 text-red-500 text-xs font-bold px-3 py-1 rounded-full">🆘 Resgate</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedRescue.status === 'new'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedRescue.status === 'new' ? '📩 Novo' : '🔍 Em análise'}
                </span>
              </div>
              <button onClick={() => setSelectedRescue(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="size-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-xl font-black text-[#2C4A3E]">
                {selectedRescue.animalType} em situação de risco
              </h2>

              <div className="flex items-center gap-2 text-sm text-[#3A5B4F] font-medium">
                <MapPin className="size-4 flex-shrink-0" />
                {selectedRescue.address}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="size-3" />
                Recebido há {selectedRescue.receivedAt}
              </div>

              <div className="bg-[#F9F7F2] rounded-2xl p-4">
                <p className="text-xs font-bold text-[#2C4A3E] mb-1">Descrição</p>
                <p className="text-sm text-gray-500 leading-relaxed">{selectedRescue.description}</p>
              </div>

              {/* TODO (Lucas): conectar com endpoint de atualização de status do resgate */}
              <button className="w-full bg-[#3A5B4F] hover:bg-[#2C4A3E] text-white py-3 rounded-2xl font-bold text-sm transition-colors">
                Acionar equipe de resgate 🚨
              </button>

              <button
                onClick={() => setSelectedRescue(null)}
                className="w-full border-2 border-gray-200 text-gray-500 py-3 rounded-2xl font-bold text-sm hover:border-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}