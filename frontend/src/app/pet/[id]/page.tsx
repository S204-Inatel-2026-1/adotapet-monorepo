'use client';

// src/app/pet/[id]/page.tsx
// Detecta se usuário está logado para mostrar formulário de adoção ou redirecionar

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { Pet } from '@/types/pets';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import PrivateHeader from '@/components/layout/PrivateHeader';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/ui/BackToHome';

const adocaoSchema = z.object({
  motivation: z.string().min(20, 'Conte um pouco mais sobre sua motivação (mín. 20 caracteres)'),
  hasOtherPets: z.enum(['yes', 'no'], { error: 'Selecione uma opção' }),
  hasChildren: z.enum(['yes', 'no'], { error: 'Selecione uma opção' }),
  housingType: z.enum(['house', 'apartment', 'farm'], { error: 'Selecione o tipo de moradia' }),
  acceptTerms: z.literal(true, { error: 'Você precisa aceitar os termos' }),
});

type AdocaoForm = z.infer<typeof adocaoSchema>;

const sizeLabel: Record<Pet['size'], string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
};

export default function PetDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdocaoForm>({ resolver: zodResolver(adocaoSchema) });

  useEffect(() => {
    if (!id) return;
    const fetchPet = async () => {
      try {
        setLoading(true);
        const data = await api.getPetById(Array.isArray(id) ? id[0] : id);
        setPet(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pet');
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const onSubmit = async (data: AdocaoForm) => {
    try {
      const message = `
Motivação: ${data.motivation}
Possui outros pets: ${data.hasOtherPets === 'yes' ? 'Sim' : 'Não'}
Possui crianças: ${data.hasChildren === 'yes' ? 'Sim' : 'Não'}
Tipo de moradia: ${data.housingType === 'house' ? 'Casa' : data.housingType === 'apartment' ? 'Apartamento' : 'Sítio/Fazenda'}
      `.trim();

      await api.createAdoption(String(id), message);
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao enviar solicitação');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] ${
      hasError ? 'ring-2 ring-red-400' : ''
    }`;

  if (loading) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F4C542] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#2C4A3E] font-medium">Carregando detalhes...</p>
        </div>
      </main>
    );
  }

  if (error || !pet) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm max-w-md">
          <p className="text-red-500 mb-4">{error || 'Pet não encontrado'}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#3A5B4F] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#2C4A3E] transition-all"
          >
            ← Voltar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      {/* Header muda conforme autenticação */}
      {isAuthenticated ? <PrivateHeader /> : <Navbar />}
      <div className="h-20" />

      {/* Botão voltar: ao dashboard se logado, senão volta no histórico */}
      {isAuthenticated ? (
        <BackToHome />
      ) : (
        <div className="max-w-6xl mx-auto px-8 pt-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#5E736A] hover:text-[#2C4A3E] transition-colors text-sm font-light"
          >
            <span>←</span> Voltar
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Card do pet */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="relative w-full h-96">
            <Image
              src={pet.image}
              alt={pet.name}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
            <div className="absolute top-6 right-6 bg-[#F4C542] px-4 py-2 rounded-full shadow-md">
              <span className="text-[12px] font-black text-[#2C4A3E] uppercase tracking-widest">
                {pet.type === 'dog' ? '🐶 Cachorro' : '🐱 Gato'}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-black text-[#2C4A3E]">{pet.name}</h1>
                <p className="text-gray-400 font-bold mt-1">{pet.age} — {pet.breed}</p>
              </div>
              <span className="text-3xl" title={pet.gender === 'male' ? 'Macho' : 'Fêmea'}>
                {pet.gender === 'male' ? '♂️' : '♀️'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#F9F7F2] p-4 rounded-2xl">
                <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-1">Porte</p>
                <p className="font-bold text-[#2C4A3E]">{sizeLabel[pet.size]}</p>
              </div>
              <div className="bg-[#F9F7F2] p-4 rounded-2xl">
                <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-1">Idade</p>
                <p className="font-bold text-[#2C4A3E]">{pet.age}</p>
              </div>
              <div className="bg-[#F9F7F2] p-4 rounded-2xl col-span-2 md:col-span-1">
                <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest mb-1">Localização</p>
                <p className="font-bold text-[#2C4A3E]">📍 {pet.location}</p>
              </div>
            </div>

            {pet.tags && pet.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                {pet.tags.map((tag) => (
                  <span key={tag} className="bg-[#E8F0E6] text-[#3A5B4F] text-xs font-black px-5 py-2 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {pet.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#2C4A3E] mb-3">Sobre {pet.name}</h2>
                <p className="text-gray-500 leading-relaxed">{pet.description}</p>
              </div>
            )}

            {/* Botão de adoção */}
            {!isAuthenticated ? (
              <div className="bg-[#F9F7F2] rounded-2xl p-6 text-center">
                <p className="text-[#2C4A3E] font-bold mb-4">
                  Faça login para solicitar a adoção de {pet.name} 🐾
                </p>
                <a
                  href="/login"
                  className="bg-[#3A5B4F] text-white font-bold py-3 px-10 rounded-2xl hover:bg-[#2C4A3E] transition-all inline-block"
                >
                  Entrar na conta
                </a>
              </div>
            ) : !showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-[#3A5B4F] text-white font-bold py-4 rounded-2xl hover:bg-[#2C4A3E] transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Solicitar adoção ♡
              </button>
            ) : null}
          </div>
        </div>

        {/* Formulário de adoção */}
        {isAuthenticated && showForm && (
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 md:p-10">
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-6xl mb-6 block">🐾</span>
                <h2 className="text-2xl font-black text-[#2C4A3E] mb-3">Solicitação enviada!</h2>
                <p className="text-gray-500 mb-8">
                  Sua solicitação para adotar {pet.name} foi enviada. A ONG responsável irá analisar
                  e entrar em contato em breve. Acompanhe em{' '}
                  <a href="/minhas-adocoes" className="text-[#3A5B4F] font-bold underline">
                    Minhas Adoções
                  </a>
                  .
                </p>
                <a
                  href="/dashboard"
                  className="bg-[#3A5B4F] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#2C4A3E] transition-all inline-block"
                >
                  Voltar ao início
                </a>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-[#2C4A3E] mb-2">
                  Solicitar adoção — {pet.name}
                </h2>
                <p className="text-gray-400 mb-8">
                  Conta um pouco sobre você para a ONG conhecer o futuro lar de {pet.name}.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Motivação */}
                  <div>
                    <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">
                      Por que você quer adotar {pet.name}? *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Conte sua história, sua rotina e por que você seria o lar ideal..."
                      {...register('motivation')}
                      className={`${inputClass(!!errors.motivation)} resize-none`}
                    />
                    {errors.motivation && (
                      <p className="text-xs text-red-500 mt-1">{errors.motivation.message}</p>
                    )}
                  </div>

                  {/* Outros pets */}
                  <div>
                    <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-3">
                      Você tem outros animais em casa? *
                    </label>
                    <div className="flex gap-3">
                      {[{ value: 'yes', label: '✅ Sim' }, { value: 'no', label: '❌ Não' }].map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                          <input type="radio" value={opt.value} {...register('hasOtherPets')} className="sr-only peer" />
                          <span className="px-6 py-3 rounded-2xl bg-[#F9F7F2] font-bold text-[#2C4A3E] border-2 border-transparent peer-checked:border-[#3A5B4F] peer-checked:bg-[#E8F0E6] transition-all block">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.hasOtherPets && (
                      <p className="text-xs text-red-500 mt-1">{errors.hasOtherPets.message}</p>
                    )}
                  </div>

                  {/* Crianças */}
                  <div>
                    <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-3">
                      Há crianças na sua casa? *
                    </label>
                    <div className="flex gap-3">
                      {[{ value: 'yes', label: '✅ Sim' }, { value: 'no', label: '❌ Não' }].map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                          <input type="radio" value={opt.value} {...register('hasChildren')} className="sr-only peer" />
                          <span className="px-6 py-3 rounded-2xl bg-[#F9F7F2] font-bold text-[#2C4A3E] border-2 border-transparent peer-checked:border-[#3A5B4F] peer-checked:bg-[#E8F0E6] transition-all block">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.hasChildren && (
                      <p className="text-xs text-red-500 mt-1">{errors.hasChildren.message}</p>
                    )}
                  </div>

                  {/* Tipo de moradia */}
                  <div>
                    <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-3">
                      Tipo de moradia *
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { value: 'house', label: '🏠 Casa' },
                        { value: 'apartment', label: '🏢 Apartamento' },
                        { value: 'farm', label: '🌳 Sítio/Fazenda' },
                      ].map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                          <input type="radio" value={opt.value} {...register('housingType')} className="sr-only peer" />
                          <span className="px-6 py-3 rounded-2xl bg-[#F9F7F2] font-bold text-[#2C4A3E] border-2 border-transparent peer-checked:border-[#3A5B4F] peer-checked:bg-[#E8F0E6] transition-all block">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.housingType && (
                      <p className="text-xs text-red-500 mt-1">{errors.housingType.message}</p>
                    )}
                  </div>

                  {/* Termos */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('acceptTerms')}
                        className="mt-1 w-5 h-5 accent-[#3A5B4F] flex-shrink-0"
                      />
                      <span className="text-sm text-gray-500">
                        Declaro que li e aceito os{' '}
                        <span className="text-[#3A5B4F] font-bold">termos de responsabilidade</span>{' '}
                        e me comprometo a oferecer um lar seguro e amoroso para {pet.name}.
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-xs text-red-500 mt-1">{errors.acceptTerms.message}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-8 py-4 rounded-2xl border border-gray-200 font-bold text-[#2C4A3E] hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#3A5B4F] text-white font-bold py-4 rounded-2xl hover:bg-[#2C4A3E] transition-all shadow-lg text-lg disabled:opacity-70"
                    >
                      {isSubmitting ? 'Enviando...' : `Adotar ${pet.name} ♡`}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}