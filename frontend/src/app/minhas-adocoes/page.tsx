'use client';

// src/app/minhas-adocoes/page.tsx

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import PrivateHeader from '@/components/layout/PrivateHeader';
import BackButton from '@/components/ui/BackButton';

const statusConfig = {
  PENDING:  { label: 'Pendente',  color: 'bg-yellow-100 text-yellow-700',  icon: '⏳' },
  APPROVED: { label: 'Aprovada',  color: 'bg-[#E8F0E6] text-[#3A5B4F]',   icon: '✅' },
  REJECTED: { label: 'Recusada', color: 'bg-red-50 text-red-500',          icon: '❌' },
  CANCELED: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500',      icon: '⚪' },
};

export default function MinhasAdocoesPage() {
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdoptions = async () => {
      try {
        setLoading(true);
        const data = await api.getMyAdoptions();
        setAdoptions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar adoções');
      } finally {
        setLoading(false);
      }
    };
    fetchAdoptions();
  }, []);

  const handleSignTerm = async (reqId: string) => {
    try {
      await api.signResponsibilityTerm(reqId);
      alert('Termo assinado com sucesso! 🐾');
      // Recarregar a lista para refletir mudanças se houver (ex: sumir o botão ou mudar status)
      const data = await api.getMyAdoptions();
      setAdoptions(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao assinar termo');
    }
  };

  if (loading) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen font-sans">
        <PrivateHeader />
        <div className="h-20" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#F4C542] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#2C4A3E] font-medium">Carregando suas adoções...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <PrivateHeader />
      <div className="h-20" />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-4 -ml-2 -mt-2">
          <BackButton href="/dashboard" label="Voltar" />
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#2C4A3E] mb-2">Minhas Adoções</h1>
          <p className="text-gray-500">Acompanhe o status dos seus pedidos de adoção.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 font-medium">
            ❌ {error}
          </div>
        )}

        {adoptions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
            <p className="text-4xl mb-4">🐾</p>
            <p className="font-bold text-[#2C4A3E] text-lg mb-2">Nenhuma adoção ainda</p>
            <p className="text-gray-400 mb-8">Explore os pets disponíveis e faça seu primeiro pedido!</p>
            <a
              href="/dashboard"
              className="bg-[#3A5B4F] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#2C4A3E] transition-all inline-block"
            >
              Ver pets disponíveis
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {adoptions.map((adoption) => {
              const status = statusConfig[adoption.status as keyof typeof statusConfig] || statusConfig.PENDING;
              return (
                <div
                  key={adoption.id}
                  className="bg-white rounded-[24px] border border-gray-100 p-6 flex items-center gap-6"
                >
                  {/* Foto do pet */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={adoption.pet?.photoUrl || '/pets/placeholder.jpg'}
                      alt={adoption.pet?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Infos */}
                  <div className="flex-grow">
                    <h3 className="font-black text-[#2C4A3E] text-lg">{adoption.pet?.name}</h3>
                    <p className="text-sm text-gray-400">{adoption.pet?.breed || 'SRD'}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      Solicitado em {new Date(adoption.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Status */}
                  <div className={`${status.color} px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 flex-shrink-0`}>
                    <span>{status.icon}</span>
                    {status.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Aviso termo (aparece quando há adoção aprovada) */}
        {adoptions.some((a) => a.status === 'APPROVED') && (
          <div className="mt-8 bg-[#F4C542]/20 border border-[#F4C542] rounded-[24px] p-6 flex items-start gap-4">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-bold text-[#2C4A3E] mb-1">Adoção aprovada! Assine o termo de responsabilidade</p>
              <p className="text-sm text-gray-500 mb-4">
                Sua adoção foi aprovada. Para concluir o processo, assine digitalmente o termo de responsabilidade.
              </p>
              <button 
                onClick={() => {
                  const approvedAdoption = adoptions.find(a => a.status === 'APPROVED');
                  if (approvedAdoption) handleSignTerm(approvedAdoption.id);
                }}
                className="bg-[#3A5B4F] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#2C4A3E] transition-all text-sm"
              >
                Assinar termo ✍️
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
