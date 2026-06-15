'use client';

// src/app/painel/pets/page.tsx
// Lista de pets cadastrados pela ONG — dados mockados
// TODO (Lucas): substituir mocks pelos endpoints reais

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Search, Filter, Loader2, Pencil, Trash2 } from 'lucide-react';
import OngHeader from '@/components/layout/OngHeader';
import BackButton from '@/components/ui/BackButton';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<PetStatus, { label: string; color: string }> = {
  available: { label: 'Disponível',  color: 'bg-[#E8F0E6] text-[#2C4A3E]' },
  pending:   { label: 'Em análise',  color: 'bg-[#F4C542]/20 text-[#2C4A3E]' },
  adopted:   { label: 'Adotado',     color: 'bg-gray-100 text-gray-400' },
};

const SIZE_LABEL: Record<OngPet['size'], string> = {
  small: 'Pequeno', medium: 'Médio', large: 'Grande',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PainelPetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<OngPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [petToDelete, setPetToDelete] = useState<OngPet | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPets = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await api.getPets({ registeredById: user.id });
      setPets(data.map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        type: p.type,
        breed: p.breed,
        age: p.age,
        size: p.size,
        status: p.status || 'available',
        pendingAdoptions: p.pendingAdoptions || 0,
        tags: p.tags,
      })));
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleDelete = async () => {
    if (!petToDelete) return;
    try {
      setDeleting(true);
      await api.deletePet(petToDelete.id);
      setPets((prev) => prev.filter((p) => p.id !== petToDelete.id));
      setPetToDelete(null);
    } catch (err) {
      alert('Erro ao remover pet');
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 text-[#3A5B4F] animate-spin" />
      </main>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <OngHeader />
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-8 py-10">

        <div className="mb-6">
          <BackButton href="/painel" label="Voltar ao painel" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#2C4A3E]">Meus Pets</h1>
            <p className="text-gray-400 text-sm mt-1">
              {pets.length} pet{pets.length !== 1 ? 's' : ''} cadastrado{pets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <a
            href="/painel/pets/novo"
            className="bg-[#3A5B4F] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#2C4A3E] transition-all text-sm flex items-center gap-2 w-fit"
          >
            + Cadastrar novo pet
          </a>
        </div>

        {pets.length === 0 ? (
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
            {pets.map((pet) => {
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
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${petStatus.color}`}>
                        {petStatus.label}
                      </span>
                    </div>
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

                    {pet.tags && pet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {pet.tags.map((tag) => (
                          <span key={tag} className="text-xs font-semibold bg-[#E8F0E6] text-[#2C4A3E] px-3 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <a
                        href={`/painel/pets/${pet.id}/editar`}
                        data-testid="edit-pet-btn"
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#3A5B4F] bg-[#E8F0E6] hover:bg-[#d4e4d0] transition-all text-center"
                      >
                        ✏️ Editar
                      </a>
                      <button
                        data-testid="delete-pet-btn"
                        onClick={() => setPetToDelete(pet)}
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

      {/* ── Modal de confirmação de remoção ── */}
      {petToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-8">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#2C4A3E]">Remover pet</h2>
              <button
                onClick={() => setPetToDelete(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="size-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#F9F7F2] rounded-2xl mb-6">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                <Image src={petToDelete.image} alt={petToDelete.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-black text-[#2C4A3E]">{petToDelete.name}</p>
                <p className="text-sm text-gray-400">{petToDelete.breed} · {SIZE_LABEL[petToDelete.size]}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Tem certeza que deseja remover <strong className="text-[#2C4A3E]">{petToDelete.name}</strong>? Essa ação não pode ser desfeita e todas as solicitações de adoção vinculadas serão canceladas.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPetToDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold hover:border-gray-300 transition-all text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all text-sm disabled:opacity-70"
              >
                {deleting ? 'Removendo...' : '🗑️ Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 border-t border-gray-100 py-6">
        <p className="text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} AdotaPET. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}