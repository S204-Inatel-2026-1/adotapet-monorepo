'use client';

// src/app/painel/pets/page.tsx
// Lista de pets cadastrados pela ONG — dados mockados
// TODO (Lucas): substituir mocks pelos endpoints reais

import Link from 'next/link';
import Image from 'next/image';
import PrivateHeader from '@/components/layout/PrivateHeader';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/ui/BackButton';
import OngHeader from '@/components/layout/OngHeader';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type PetStatus = 'available' | 'pending' | 'adopted';

interface OngPet {
  id: string;
  name: string;
  image: string;
  type: 'dog' | 'cat';
  breed: string;
  age: string;
  size: 'small' | 'medium' | 'large';
  status: PetStatus;
  pendingAdoptions: number;
  tags?: string[];
}

// ─────────────────────────────────────────────
// DADOS MOCKADOS
// TODO (Lucas): GET /pets?registeredById=:userId
// ─────────────────────────────────────────────

const MOCK_PETS: OngPet[] = [
  {
    id: 'pet-1',
    name: 'Thor',
    image: '/pets/thor.jpg',
    type: 'dog',
    breed: 'Labrador',
    age: '2 anos',
    size: 'large',
    status: 'available',
    pendingAdoptions: 2,
    tags: ['Amigável', 'Brincalhão'],
  },
  {
    id: 'pet-2',
    name: 'Nina',
    image: '/pets/nina.webp',
    type: 'cat',
    breed: 'Siamês',
    age: '1 ano',
    size: 'small',
    status: 'pending',
    pendingAdoptions: 1,
    tags: ['Tímida', 'Carinhosa'],
  },
  {
    id: 'pet-3',
    name: 'Max',
    image: '/pets/max.webp',
    type: 'dog',
    breed: 'Vira-lata',
    age: '3 anos',
    size: 'medium',
    status: 'adopted',
    pendingAdoptions: 0,
    tags: ['Curioso', 'Inteligente'],
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const STATUS_MAP: Record<PetStatus, { label: string; color: string }> = {
  available: { label: 'Disponível', color: 'bg-[#E8F0E6] text-[#2C4A3E]' },
  pending: { label: 'Em análise', color: 'bg-[#F4C542]/20 text-[#2C4A3E]' },
  adopted: { label: 'Adotado', color: 'bg-gray-100 text-gray-400' },
};

const SIZE_LABEL: Record<OngPet['size'], string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function PainelPetsPage() {
  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <OngHeader />
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Navegação de volta */}
        <div className="mb-6">
          <BackButton href="/painel" label="Voltar ao painel" />
        </div>

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#2C4A3E]">Meus Pets</h1>
            <p className="text-gray-400 text-sm mt-1">
              {MOCK_PETS.length} pet{MOCK_PETS.length !== 1 ? 's' : ''} cadastrado{MOCK_PETS.length !== 1 ? 's' : ''}
            </p>
          </div>
          <a
            href="/painel/pets/novo"
            className="bg-[#3A5B4F] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#2C4A3E] transition-all text-sm flex items-center gap-2 w-fit"
          >
            + Cadastrar novo pet
          </a>
        </div>

        {/* Lista vazia */}
        {MOCK_PETS.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center border border-gray-100 shadow-sm">
            <p className="text-5xl mb-4">🐾</p>
            <p className="font-bold text-[#2C4A3E] text-xl mb-2">Nenhum pet cadastrado ainda</p>
            <p className="text-gray-400 text-sm mb-8">
              Cadastre o primeiro pet da sua ONG para começar a receber solicitações de adoção.
            </p>
            <a
              href="/painel/pets/novo"
              className="bg-[#3A5B4F] text-white font-bold px-8 py-3 rounded-2xl hover:bg-[#2C4A3E] transition-all text-sm"
            >
              Cadastrar primeiro pet
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PETS.map((pet) => {
              const petStatus = STATUS_MAP[pet.status];
              return (
                <div
                  key={pet.id}
                  data-testid="pet-item"
                  className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Foto */}
                  <div className="relative h-52">
                    <Image
                      src={pet.image}
                      alt={pet.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Badge de status */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${petStatus.color}`}>
                        {petStatus.label}
                      </span>
                    </div>
                    {/* Badge de pedidos pendentes */}
                    {pet.pendingAdoptions > 0 && (
                      <div className="absolute top-3 right-3 bg-[#F4C542] text-[#2C4A3E] text-xs font-black px-3 py-1.5 rounded-full">
                        {pet.pendingAdoptions} pedido{pet.pendingAdoptions > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-black text-[#2C4A3E]">{pet.name}</h3>
                      <span className="text-xl">{pet.type === 'dog' ? '🐶' : '🐱'}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-0.5">{pet.breed}</p>
                    <p className="text-sm text-gray-400 mb-4">
                      {pet.age} · {SIZE_LABEL[pet.size]}
                    </p>

                    {/* Tags */}
                    {pet.tags && pet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {pet.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-semibold bg-[#E8F0E6] text-[#2C4A3E] px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      {/* TODO (Lucas): navegar para /painel/pets/:id/editar */}
                      <a
                        href={`/painel/pets/${pet.id}/editar`}
                        data-testid="edit-pet-btn"
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#3A5B4F] bg-[#E8F0E6] hover:bg-[#d4e4d0] transition-all text-center"
                      >
                        ✏️ Editar
                      </a>
                      {/* TODO (Lucas): confirmar e chamar DELETE /pets/:id */}
                      <button
                        data-testid="delete-pet-btn"
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-50 hover:bg-red-100 transition-all"
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-20" />
            {/* ── MINI FOOTER ── */}
      <footer className="mt-12 border-t border-gray-100 py-6">
        <p className="text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} AdotaPET. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}