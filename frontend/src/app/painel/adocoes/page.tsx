'use client';

// src/app/painel/adocoes/page.tsx
// Solicitações de adoção recebidas pela ONG

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import OngHeader from '@/components/layout/OngHeader';
import BackButton from '@/components/ui/BackButton';
import { api } from '@/services/api';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type AdoptionStatus = 'pending' | 'approved' | 'rejected';

interface Adoption {
  id: string;
  petName: string;
  petImage: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requestDate: string;
  status: AdoptionStatus;
  motivation: string;
  hasOtherPets: boolean;
  hasChildren: boolean;
  housingType: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const STATUS_MAP: Record<AdoptionStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pendente', color: 'bg-[#F4C542]/20 text-[#2C4A3E]', icon: '⏳' },
  approved: { label: 'Aprovada', color: 'bg-[#E8F0E6] text-[#2C4A3E]', icon: '✅' },
  rejected: { label: 'Recusada', color: 'bg-red-50 text-red-500', icon: '❌' },
};

function normalizeAdoption(raw: any): Adoption {
  return {
    id: raw.id,
    petName: raw.pet?.name || 'Pet',
    petImage: raw.pet?.photoUrl || '/pets/default.jpg',
    requesterName: raw.user?.fullName || 'Usuário',
    requesterEmail: raw.user?.email || '',
    requesterPhone: raw.user?.phone || 'Não informado',
    requestDate: new Date(raw.createdAt).toLocaleDateString('pt-BR'),
    status: raw.status.toLowerCase() as AdoptionStatus,
    motivation: raw.message || 'Sem mensagem adicional.',
    // Campos que podem não vir do backend simplificado, usamos default ou mock parcial
    hasOtherPets: raw.hasOtherPets ?? false,
    hasChildren: raw.hasChildren ?? false,
    housingType: raw.housingType ?? 'Não informado',
  };
}

// ─────────────────────────────────────────────
// MODAL DE DETALHES
// ─────────────────────────────────────────────

function AdoptionModal({
  adoption,
  onClose,
  onApprove,
  onReject,
}: {
  adoption: Adoption;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const statusInfo = STATUS_MAP[adoption.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44, 74, 62, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#2C4A3E]">Detalhes da Solicitação</h2>
            <p className="text-sm text-gray-400 mt-1">Recebida em {adoption.requestDate}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#2C4A3E] font-bold hover:bg-[#E8F0E6] transition-all"
          >
            ✕
          </button>
        </div>

        {/* Pet */}
        <div className="flex items-center gap-4 bg-[#F9F7F2] rounded-2xl p-4 mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
            <Image src={adoption.petImage} alt={adoption.petName} fill className="object-cover" sizes="64px" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-1">Pet solicitado</p>
            <p className="font-bold text-[#2C4A3E] text-lg">{adoption.petName}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.label}
          </span>
        </div>

        {/* Solicitante */}
        <div className="mb-5">
          <p className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest mb-3">Solicitante</p>
          <div className="bg-[#F9F7F2] rounded-2xl p-5 space-y-1.5">
            <p className="font-bold text-[#2C4A3E]">{adoption.requesterName}</p>
            <p className="text-sm text-gray-500">{adoption.requesterEmail}</p>
            <p className="text-sm text-gray-500">{adoption.requesterPhone}</p>
          </div>
        </div>

        {/* Respostas */}
        <div className="mb-6 space-y-3">
          <p className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest">Respostas do formulário</p>

          <div className="bg-[#F9F7F2] rounded-2xl p-5">
            <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-2">Motivação</p>
            <p className="text-sm text-gray-600 leading-relaxed">{adoption.motivation}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9F7F2] rounded-2xl p-4 text-center">
              <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-1">Outros pets?</p>
              <p className="font-bold text-[#2C4A3E]">{adoption.hasOtherPets ? 'Sim' : 'Não'}</p>
            </div>
            <div className="bg-[#F9F7F2] rounded-2xl p-4 text-center">
              <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-1">Crianças?</p>
              <p className="font-bold text-[#2C4A3E]">{adoption.hasChildren ? 'Sim' : 'Não'}</p>
            </div>
          </div>

          <div className="bg-[#F9F7F2] rounded-2xl p-4">
            <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-1">Tipo de moradia</p>
            <p className="font-bold text-[#2C4A3E]">{adoption.housingType}</p>
          </div>
        </div>

        {/* Ações — apenas se pendente */}
        {adoption.status === 'pending' && (
          <div className="flex gap-3">
            <button
              data-testid="reject-btn"
              onClick={() => { onReject(adoption.id); onClose(); }}
              className="flex-1 py-3 rounded-2xl border-2 border-red-200 text-red-500 font-bold hover:bg-red-50 transition-all text-sm"
            >
              ❌ Recusar
            </button>
            <button
              data-testid="approve-btn"
              onClick={() => { onApprove(adoption.id); onClose(); }}
              className="flex-1 py-3 rounded-2xl bg-[#3A5B4F] text-white font-bold hover:bg-[#2C4A3E] transition-all text-sm"
            >
              ✅ Aprovar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export default function PainelAdocoesPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Adoption | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | AdoptionStatus>('all');

  const fetchAdoptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getReceivedAdoptions();
      setAdoptions(data.map(normalizeAdoption));
    } catch (error) {
      console.error('Erro ao buscar adoções:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdoptions();
  }, [fetchAdoptions]);

  const handleApprove = async (id: string) => {
    try {
      await api.updateAdoptionStatus(id, 'APPROVED');
      setAdoptions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a)));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: 'approved' } : null);
    } catch (error) {
      alert('Erro ao aprovar adoção.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.updateAdoptionStatus(id, 'REJECTED');
      setAdoptions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a)));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: 'rejected' } : null);
    } catch (error) {
      alert('Erro ao recusar adoção.');
    }
  };

  const filtered = activeFilter === 'all'
    ? adoptions
    : adoptions.filter((a) => a.status === activeFilter);

  const pendingCount = adoptions.filter((a) => a.status === 'pending').length;

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <OngHeader />
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Navegação de volta */}
        <div className="mb-6">
          <BackButton href="/painel" label="Voltar ao painel" />
        </div>

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#2C4A3E]">Solicitações de Adoção</h1>
            <p className="text-gray-400 text-sm mt-1">
              {pendingCount > 0
                ? `${pendingCount} pendente${pendingCount !== 1 ? 's' : ''} aguardando sua decisão`
                : 'Nenhuma solicitação pendente'}
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="bg-[#F4C542]/20 text-[#2C4A3E] font-bold px-5 py-2.5 rounded-full text-sm w-fit">
              ⏳ {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { id: 'all', label: 'Todas' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'approved', label: 'Aprovadas' },
            { id: 'rejected', label: 'Recusadas' },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === f.id
                  ? 'bg-[#3A5B4F] text-white'
                  : 'bg-white text-[#2C4A3E] border border-gray-100 hover:border-[#3A5B4F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista vazia */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center border border-gray-100 shadow-sm">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-bold text-[#2C4A3E] text-xl mb-2">Nenhuma solicitação aqui</p>
            <p className="text-gray-400 text-sm">
              {activeFilter === 'all'
                ? 'Quando alguém solicitar adoção de um pet, aparecerá aqui.'
                : 'Nenhuma solicitação com esse status no momento.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((adoption) => {
              const statusInfo = STATUS_MAP[adoption.status];
              return (
                /* Card inteiro clicável */
                <button
                  key={adoption.id}
                  data-testid="adoption-item"
                  onClick={() => setSelected(adoption)}
                  className="w-full bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8F0E6] transition-all p-5 text-left group"
                >
                  <div className="flex items-center gap-4">

                    {/* Foto do pet */}
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image
                        src={adoption.petImage}
                        alt={adoption.petName}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>

                    {/* Infos principais */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-[#2C4A3E] text-sm">{adoption.requesterName}</p>
                        <span className="text-gray-300 text-xs">·</span>
                        <p className="text-xs text-gray-400">quer adotar {adoption.petName}</p>
                      </div>
                      <p className="text-xs text-gray-400 truncate leading-relaxed">
                        {adoption.motivation}
                      </p>
                    </div>

                    {/* Lado direito: status + data + seta */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <p className="text-xs text-gray-400">{adoption.requestDate}</p>
                    </div>

                    {/* Seta indicando clicável */}
                    <span className="text-gray-300 group-hover:text-[#3A5B4F] transition-colors ml-1 flex-shrink-0">
                      →
                    </span>

                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MINI FOOTER ── */}
      <div className="h-30" />
      <footer className="mt-12 border-t border-gray-100 py-6">
        <p className="text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} AdotaPET. Todos os direitos reservados.
        </p>
      </footer>

      {/* Modal */}
      {selected && (
        <AdoptionModal
          adoption={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </main>
  );
}