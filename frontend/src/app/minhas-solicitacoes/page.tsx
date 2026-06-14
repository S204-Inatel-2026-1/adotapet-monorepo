'use client';

// src/app/minhas-adocoes/page.tsx

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import PrivateHeader from '@/components/layout/PrivateHeader';
import BackButton from '@/components/ui/BackButton';
import { X, MapPin, Calendar, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

// ─── Configs de status ───────────────────────────────────────────────────────

const adoptionStatusConfig = {
  PENDING:  { label: 'Pendente',  bg: 'bg-yellow-100',   text: 'text-yellow-700', icon: '⏳' },
  APPROVED: { label: 'Aprovada',  bg: 'bg-[#E8F0E6]',    text: 'text-[#3A5B4F]', icon: '✅' },
  REJECTED: { label: 'Recusada', bg: 'bg-red-50',        text: 'text-red-500',    icon: '❌' },
  CANCELED: { label: 'Cancelada', bg: 'bg-gray-100',     text: 'text-gray-500',   icon: '⚪' },
};

const rescueStatusConfig = {
  OPEN:        { label: 'Recebido',        bg: 'bg-blue-50',      text: 'text-blue-600',   icon: '📩' },
  IN_PROGRESS: { label: 'Equipe acionada', bg: 'bg-yellow-100',   text: 'text-yellow-700', icon: '🚨' },
  RESOLVED:    { label: 'Resolvido',       bg: 'bg-[#E8F0E6]',    text: 'text-[#3A5B4F]', icon: '✅' },
  CANCELED:    { label: 'Cancelado',       bg: 'bg-gray-100',     text: 'text-gray-500',   icon: '⚪' },
};

// ─── Fluxo de adoção ─────────────────────────────────────────────────────────

const adoptionFlow = [
  { label: 'Solicitação enviada',   description: 'Seu pedido foi recebido pela ONG.' },
  { label: 'Análise da ONG',        description: 'A ONG está avaliando seu perfil e a solicitação.' },
  { label: 'Entrevista / Visita',   description: 'A ONG pode entrar em contato para entrevista ou visita ao lar.' },
  { label: 'Aprovação',             description: 'Adoção aprovada! O pet está reservado para você.' },
  { label: 'Conclusão',             description: 'Processo finalizado. Bem-vindo ao novo integrante da família! 🐾' },
];

function getAdoptionStep(status: string): number {
  if (status === 'APPROVED') return 4;
  if (status === 'PENDING')  return 1;
  if (status === 'REJECTED' || status === 'CANCELED') return -1;
  return 0;
}

// ─── Fluxo de resgate ────────────────────────────────────────────────────────

const rescueFlow = [
  { label: 'Solicitação recebida', description: 'Seu pedido de resgate foi registrado.' },
  { label: 'Em análise',           description: 'Nossa equipe está avaliando a situação.' },
  { label: 'Equipe acionada',      description: 'Uma equipe foi designada para o resgate.' },
  { label: 'Resolvido',            description: 'O animal foi resgatado com sucesso! 🐾' },
];

function getRescueStep(status: string): number {
  if (status === 'OPEN')        return 0;
  if (status === 'IN_PROGRESS') return 2;
  if (status === 'RESOLVED')    return 3;
  return 0;
}

// ─── Mock de dados ────────────────────────────────────────────────────────────
// TODO (Lucas): remover mocks e buscar dados reais
// - adoções: GET /adoptions/my-requests
// - resgates: GET /rescue-help-requests (quando endpoint estiver disponível)

const MOCK_ADOPTIONS = [
  {
    id: 'adoc-1',
    type: 'adoption' as const,
    status: 'PENDING',
    createdAt: '2026-06-01T10:00:00Z',
    message: 'Tenho experiência com cães e moro em casa com quintal.',
    pet: {
      name: 'Thor',
      breed: 'Labrador',
      photoUrl: '/pets/thor.jpg',
      species: 'DOG',
      age: '2 anos',
      size: 'LARGE',
      sex: 'MALE',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      description: 'Thor é um labrador carinhoso e cheio de energia.',
    },
  },
  {
    id: 'adoc-2',
    type: 'adoption' as const,
    status: 'APPROVED',
    createdAt: '2026-05-20T14:30:00Z',
    message: 'Adoro gatos e tenho muito espaço em casa.',
    pet: {
      name: 'Luna',
      breed: 'SRD',
      photoUrl: '/pets/luna.jpg',
      species: 'CAT',
      age: '1 ano',
      size: 'SMALL',
      sex: 'FEMALE',
      city: 'Pouso Alegre',
      state: 'MG',
      description: 'Luna é uma gatinha tranquila e afetuosa.',
    },
  },
];

const MOCK_RESCUES = [
  {
    id: 'resg-1',
    type: 'rescue' as const,
    status: 'IN_PROGRESS',
    createdAt: '2026-06-10T08:00:00Z',
    title: 'Cachorro ferido na Rua das Flores',
    description: 'Encontrei um cachorro com uma pata ferida próximo ao mercado. Ele parece assustado mas está quieto.',
    address: 'Rua das Flores, 123',
    city: 'Santa Rita do Sapucaí',
    state: 'MG',
  },
  {
    id: 'resg-2',
    type: 'rescue' as const,
    status: 'OPEN',
    createdAt: '2026-06-12T16:45:00Z',
    title: 'Gato preso em árvore',
    description: 'Um gato está preso em uma árvore alta há mais de 12 horas e não consegue descer.',
    address: 'Praça Central, s/n',
    city: 'Santa Rita do Sapucaí',
    state: 'MG',
  },
];

// ─── Modal de Adoção ─────────────────────────────────────────────────────────

function AdoptionModal({ adoption, onClose, onSignTerm }: {
  adoption: typeof MOCK_ADOPTIONS[0];
  onClose: () => void;
  onSignTerm: (id: string) => void;
}) {
  const status = adoptionStatusConfig[adoption.status as keyof typeof adoptionStatusConfig];
  const currentStep = getAdoptionStep(adoption.status);
  const isCanceled = adoption.status === 'REJECTED' || adoption.status === 'CANCELED';

  const speciesLabel = adoption.pet.species === 'DOG' ? 'Cachorro' : adoption.pet.species === 'CAT' ? 'Gato' : 'Animal';
  const sexLabel = adoption.pet.sex === 'MALE' ? 'Macho' : 'Fêmea';
  const sizeLabel: Record<string, string> = { SMALL: 'Pequeno', MEDIUM: 'Médio', LARGE: 'Grande' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="bg-[#E8F0E6] text-[#2C4A3E] text-xs font-bold px-3 py-1 rounded-full">🐾 Adoção</span>
            <span className={`${status.bg} ${status.text} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
              {status.icon} {status.label}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="size-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Pet */}
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={adoption.pet.photoUrl || '/pets/placeholder.jpg'}
                alt={adoption.pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-[#2C4A3E]">{adoption.pet.name}</h2>
              <p className="text-gray-400 text-sm">{adoption.pet.breed || 'SRD'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-[#E8F0E6] text-[#2C4A3E] text-xs px-2 py-1 rounded-full">{speciesLabel}</span>
                <span className="bg-[#E8F0E6] text-[#2C4A3E] text-xs px-2 py-1 rounded-full">{sexLabel}</span>
                <span className="bg-[#E8F0E6] text-[#2C4A3E] text-xs px-2 py-1 rounded-full">{adoption.pet.age}</span>
                {adoption.pet.size && (
                  <span className="bg-[#E8F0E6] text-[#2C4A3E] text-xs px-2 py-1 rounded-full">{sizeLabel[adoption.pet.size] || adoption.pet.size}</span>
                )}
              </div>
              {(adoption.pet.city || adoption.pet.state) && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <MapPin className="size-3" />
                  {adoption.pet.city}{adoption.pet.state ? `, ${adoption.pet.state}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Mensagem da solicitação */}
          {adoption.message && (
            <div className="bg-[#F9F7F2] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#2C4A3E] mb-1">Sua mensagem</p>
              <p className="text-sm text-gray-500 leading-relaxed">"{adoption.message}"</p>
            </div>
          )}

          {/* Data */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="size-3" />
            Solicitado em {new Date(adoption.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>

          {/* Fluxo de adoção */}
          {!isCanceled && (
            <div>
              <p className="text-sm font-bold text-[#2C4A3E] mb-3">Como funciona o processo</p>
              <div className="space-y-3">
                {adoptionFlow.map((step, index) => {
                  const isDone    = index < currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDone    ? 'bg-[#3A5B4F]' :
                          isCurrent ? 'bg-[#F4C542]' :
                          'bg-gray-100'
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="size-3.5 text-white" />
                          ) : isCurrent ? (
                            <Clock className="size-3.5 text-[#2C4A3E]" />
                          ) : (
                            <Circle className="size-3.5 text-gray-300" />
                          )}
                        </div>
                        {index < adoptionFlow.length - 1 && (
                          <div className={`w-0.5 h-6 mt-1 ${isDone ? 'bg-[#3A5B4F]' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className={`text-sm font-bold ${isDone ? 'text-[#3A5B4F]' : isCurrent ? 'text-[#2C4A3E]' : 'text-gray-300'}`}>
                          {step.label}
                        </p>
                        {(isDone || isCurrent) && (
                          <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status cancelado/rejeitado */}
          {isCanceled && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="size-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-500">
                  {adoption.status === 'REJECTED' ? 'Solicitação recusada' : 'Solicitação cancelada'}
                </p>
                <p className="text-xs text-red-400 mt-1">
                  {adoption.status === 'REJECTED'
                    ? 'Infelizmente esta solicitação não foi aprovada. Você pode tentar adotar outro pet!'
                    : 'Esta solicitação foi cancelada.'}
                </p>
              </div>
            </div>
          )}

          {/* Botão assinar termo */}
          {adoption.status === 'APPROVED' && (
            <div className="bg-[#F4C542]/20 border border-[#F4C542] rounded-2xl p-4">
              <p className="text-sm font-bold text-[#2C4A3E] mb-1">📄 Assine o termo de responsabilidade</p>
              <p className="text-xs text-gray-500 mb-3">
                Para concluir a adoção, assine digitalmente o termo de responsabilidade pelo cuidado do animal.
              </p>
              <button
                onClick={() => onSignTerm(adoption.id)}
                className="w-full bg-[#3A5B4F] hover:bg-[#2C4A3E] text-white py-3 rounded-2xl font-bold text-sm transition-colors"
              >
                Assinar termo ✍️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Resgate ─────────────────────────────────────────────────────────

function RescueModal({ rescue, onClose }: {
  rescue: typeof MOCK_RESCUES[0];
  onClose: () => void;
}) {
  const status = rescueStatusConfig[rescue.status as keyof typeof rescueStatusConfig];
  const currentStep = getRescueStep(rescue.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="bg-red-50 text-red-500 text-xs font-bold px-3 py-1 rounded-full">🆘 Resgate</span>
            <span className={`${status.bg} ${status.text} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
              {status.icon} {status.label}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="size-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Título e descrição */}
          <div>
            <h2 className="text-xl font-black text-[#2C4A3E] mb-2">{rescue.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{rescue.description}</p>
          </div>

          {/* Local */}
          {(rescue.address || rescue.city) && (
            <div className="bg-[#F9F7F2] rounded-2xl p-4 flex items-start gap-3">
              <MapPin className="size-4 text-[#3A5B4F] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#2C4A3E] mb-0.5">Local informado</p>
                <p className="text-sm text-gray-500">
                  {rescue.address && <span>{rescue.address}<br /></span>}
                  {rescue.city}{rescue.state ? `, ${rescue.state}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Data */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="size-3" />
            Solicitado em {new Date(rescue.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>

          {/* Fluxo de resgate */}
          <div>
            <p className="text-sm font-bold text-[#2C4A3E] mb-3">Acompanhamento do resgate</p>
            <div className="space-y-3">
              {rescueFlow.map((step, index) => {
                const isDone    = index < currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone    ? 'bg-[#3A5B4F]' :
                        isCurrent ? 'bg-[#F4C542]' :
                        'bg-gray-100'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 className="size-3.5 text-white" />
                        ) : isCurrent ? (
                          <Clock className="size-3.5 text-[#2C4A3E]" />
                        ) : (
                          <Circle className="size-3.5 text-gray-300" />
                        )}
                      </div>
                      {index < rescueFlow.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${isDone ? 'bg-[#3A5B4F]' : 'bg-gray-100'}`} />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-bold ${isDone ? 'text-[#3A5B4F]' : isCurrent ? 'text-[#2C4A3E]' : 'text-gray-300'}`}>
                        {step.label}
                      </p>
                      {(isDone || isCurrent) && (
                        <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

type Item =
  | (typeof MOCK_ADOPTIONS[0] & { type: 'adoption' })
  | (typeof MOCK_RESCUES[0]   & { type: 'rescue'   });

export default function MinhasSolicitacoesPage() {
  // TODO (Lucas): substituir por dados reais
  // adoções: await api.getMyAdoptions()
  // resgates: await api.getMyRescues() — quando endpoint /rescue-help-requests estiver disponível
  const [items]   = useState<Item[]>([
    ...MOCK_ADOPTIONS.map(a => ({ ...a, type: 'adoption' as const })),
    ...MOCK_RESCUES.map(r => ({ ...r, type: 'rescue' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  const [loading]          = useState(false);
  const [selectedAdoption, setSelectedAdoption] = useState<typeof MOCK_ADOPTIONS[0] | null>(null);
  const [selectedRescue,   setSelectedRescue]   = useState<typeof MOCK_RESCUES[0]   | null>(null);

  const handleSignTerm = async (reqId: string) => {
    try {
      await api.signResponsibilityTerm(reqId);
      alert('Termo assinado com sucesso! 🐾');
      setSelectedAdoption(null);
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
            <p className="text-[#2C4A3E] font-medium">Carregando suas solicitações...</p>
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
          <h1 className="text-4xl font-black text-[#2C4A3E] mb-2">Minhas Solicitações</h1>
          <p className="text-gray-500">Acompanhe seus pedidos de adoção e resgate.</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
            <p className="text-4xl mb-4">🐾</p>
            <p className="font-bold text-[#2C4A3E] text-lg mb-2">Nenhuma solicitação ainda</p>
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
            {items.map((item) => {
              if (item.type === 'adoption') {
                const status = adoptionStatusConfig[item.status as keyof typeof adoptionStatusConfig] || adoptionStatusConfig.PENDING;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAdoption(item)}
                    className="w-full bg-white rounded-[24px] border border-gray-100 p-6 flex items-center gap-6 hover:border-[#3A5B4F]/30 hover:shadow-sm transition-all text-left"
                  >
                    {/* Foto do pet */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.pet?.photoUrl || '/pets/placeholder.jpg'}
                        alt={item.pet?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Infos */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#E8F0E6] text-[#2C4A3E] text-xs font-bold px-2 py-0.5 rounded-full">🐾 Adoção</span>
                      </div>
                      <h3 className="font-black text-[#2C4A3E] text-lg leading-tight">{item.pet?.name}</h3>
                      <p className="text-sm text-gray-400">{item.pet?.breed || 'SRD'}</p>
                      <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    {/* Status */}
                    <div className={`${status.bg} ${status.text} px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 flex-shrink-0`}>
                      <span>{status.icon}</span>
                      {status.label}
                    </div>
                  </button>
                );
              }

              // Card de resgate
              const status = rescueStatusConfig[item.status as keyof typeof rescueStatusConfig] || rescueStatusConfig.OPEN;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedRescue(item as typeof MOCK_RESCUES[0])}
                  className="w-full bg-white rounded-[24px] border border-gray-100 p-6 flex items-center gap-6 hover:border-red-200 hover:shadow-sm transition-all text-left"
                >
                  {/* Ícone resgate */}
                  <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">🆘</span>
                  </div>

                  {/* Infos */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">🆘 Resgate</span>
                    </div>
                    <h3 className="font-black text-[#2C4A3E] text-base leading-tight truncate">{(item as any).title}</h3>
                    {((item as any).city || (item as any).state) && (
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="size-3" />
                        {(item as any).city}{(item as any).state ? `, ${(item as any).state}` : ''}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Status */}
                  <div className={`${status.bg} ${status.text} px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 flex-shrink-0`}>
                    <span>{status.icon}</span>
                    {status.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modais */}
      {selectedAdoption && (
        <AdoptionModal
          adoption={selectedAdoption}
          onClose={() => setSelectedAdoption(null)}
          onSignTerm={handleSignTerm}
        />
      )}
      {selectedRescue && (
        <RescueModal
          rescue={selectedRescue}
          onClose={() => setSelectedRescue(null)}
        />
      )}
    </main>
  );
}