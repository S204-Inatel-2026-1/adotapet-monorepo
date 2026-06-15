'use client';

// src/app/painel/pets/novo/page.tsx
// Formulário de cadastro de pet pela ONG

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Camera, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import OngHeader from '@/components/layout/OngHeader';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/ui/BackButton';
import { api } from '@/services/api';

// ─────────────────────────────────────────────
// SCHEMA DE VALIDAÇÃO
// Campos obrigatórios espelhados no Cypress (ong_create_pet.cy.ts)
// ─────────────────────────────────────────────

const novoPetSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  species: z.enum(['DOG', 'CAT', 'OTHER'], { error: 'Espécie é obrigatória' }),
  sex: z.enum(['MALE', 'FEMALE'], { error: 'Selecione o sexo' }),
  breed: z.string().optional(),
  ageInMonths: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ error: 'Informe a idade' }).min(0, 'Idade inválida').max(300, 'Idade inválida')
  ),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE'], { error: 'Selecione o porte' }),
  description: z.string().min(10, 'Descreva o pet com pelo menos 10 caracteres'),
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().min(2, 'Selecione o estado'),
  vaccinated: z.boolean().optional(),
  neutered: z.boolean().optional(),
  tags: z.string().optional(),
});

type NovoPetForm = z.infer<typeof novoPetSchema>;

// ─────────────────────────────────────────────
// ESTADOS DO BRASIL
// ─────────────────────────────────────────────

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

// ─────────────────────────────────────────────
// HELPERS VISUAIS
// ─────────────────────────────────────────────

const inputClass = (hasError: boolean) =>
  `w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium text-[#2C4A3E] transition-all focus:ring-2 focus:ring-[#F4C542] ${
    hasError ? 'ring-2 ring-red-400' : ''
  }`;

const labelClass = 'text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2';

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function NovoPetPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<NovoPetForm, any, NovoPetForm>({
    resolver: zodResolver(novoPetSchema) as any,
    defaultValues: {
      vaccinated: false,
      neutered: false,
    },
  });

  const onSubmit = async (data: NovoPetForm) => {
    try {
      const pet = await api.createPet({
        ...data,
        ageInMonths: Number(data.ageInMonths),
      });

      if (selectedFile && pet.id) {
        await api.uploadPetPhoto(pet.id, selectedFile);
      }

      setSubmitted(true);
    } catch (err) {
      alert('Erro ao cadastrar pet. Tente novamente.');
    }
  };

  // Tela de sucesso
  if (submitted) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen font-sans">
        <OngHeader />
        <div className="h-20" />
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm">
            <p className="text-6xl mb-6">🐾</p>
            <h2 className="text-3xl font-black text-[#2C4A3E] mb-3">Pet cadastrado com sucesso!</h2>
            <p className="text-gray-400 mb-8">
              O pet já está visível na plataforma e pronto para receber solicitações de adoção.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-3 rounded-2xl border-2 border-[#E8F0E6] text-[#3A5B4F] font-bold hover:bg-[#E8F0E6] transition-all text-sm"
              >
                Cadastrar outro pet
              </button>
              <button
                onClick={() => router.push('/painel/pets')}
                className="px-8 py-3 rounded-2xl bg-[#3A5B4F] text-white font-bold hover:bg-[#2C4A3E] transition-all text-sm"
              >
                Ver meus pets →
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <OngHeader />
      <div className="h-20" />

      <div className="max-w-2xl mx-auto px-8 py-10">

        {/* Navegação */}
        <div className="mb-6">
          <BackButton href="/painel/pets" label="Voltar aos meus pets" />
        </div>

        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#2C4A3E] mb-2">Cadastrar novo pet</h1>
          <p className="text-gray-400 text-sm">
            Preencha as informações do animal para que ele apareça disponível para adoção.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── FOTO ── */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-black text-[#2C4A3E] mb-5">Foto do pet</h2>

            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-2xl bg-[#F9F7F2] border-2 border-dashed border-[#E8F0E6] flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🐾</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2C4A3E] mb-1">Adicionar foto</p>
                <p className="text-xs text-gray-400 mb-3">JPG, PNG ou WEBP. Máximo 5MB.</p>
                <label className="cursor-pointer bg-[#E8F0E6] text-[#3A5B4F] font-bold px-5 py-2.5 rounded-2xl hover:bg-[#d4e4d0] transition-all text-xs inline-block">
                  Escolher foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── INFORMAÇÕES BÁSICAS ── */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-5">
            <h2 className="text-lg font-black text-[#2C4A3E] mb-1">Informações básicas</h2>

            {/* Nome */}
            <div>
              <label htmlFor="name" className={labelClass}>Nome do pet</label>
              <input
                id="name"
                type="text"
                placeholder="Ex: Thor"
                {...register('name')}
                className={inputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Espécie */}
            <div>
              <label htmlFor="species" className={labelClass}>Espécie</label>
              <select
                id="species"
                {...register('species')}
                className={inputClass(!!errors.species)}
              >
                <option value="">Selecione a espécie</option>
                <option value="DOG">Cachorro</option>
                <option value="CAT">Gato</option>
                <option value="OTHER">Outro</option>
              </select>
              {errors.species && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.species.message}</p>
              )}
            </div>

            {/* Sexo */}
            <div>
              <label className={labelClass}>Sexo</label>
              <div className="flex gap-4">
                {[
                  { value: 'MALE', label: '♂ Macho', id: 'sex-male' },
                  { value: 'FEMALE', label: '♀ Fêmea', id: 'sex-female' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    htmlFor={opt.id}
                    className="flex items-center gap-3 bg-[#F9F7F2] px-5 py-4 rounded-2xl cursor-pointer hover:bg-[#E8F0E6] transition-all flex-1"
                  >
                    <input
                      id={opt.id}
                      type="radio"
                      value={opt.value}
                      {...register('sex')}
                      className="accent-[#3A5B4F] w-4 h-4"
                    />
                    <span className="font-bold text-[#2C4A3E] text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.sex && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.sex.message}</p>
              )}
            </div>

            {/* Raça e Idade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="breed" className={labelClass}>Raça (opcional)</label>
                <input
                  id="breed"
                  type="text"
                  placeholder="Ex: Labrador"
                  {...register('breed')}
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label htmlFor="ageInMonths" className={labelClass}>Idade (em meses)</label>
                <input
                  id="ageInMonths"
                  type="number"
                  placeholder="Ex: 12"
                  min={0}
                  {...register('ageInMonths')}
                  className={inputClass(!!errors.ageInMonths)}
                />
                {errors.ageInMonths && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.ageInMonths.message}</p>
                )}
              </div>
            </div>

            {/* Porte */}
            <div>
              <label htmlFor="size" className={labelClass}>Porte</label>
              <select
                id="size"
                {...register('size')}
                className={inputClass(!!errors.size)}
              >
                <option value="">Selecione o porte</option>
                <option value="SMALL">Pequeno</option>
                <option value="MEDIUM">Médio</option>
                <option value="LARGE">Grande</option>
              </select>
              {errors.size && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.size.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className={labelClass}>Descrição</label>
              <textarea
                id="description"
                rows={4}
                placeholder="Conte sobre a personalidade, histórico e necessidades do pet..."
                {...register('description')}
                className={`${inputClass(!!errors.description)} resize-none`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* ── LOCALIZAÇÃO ── */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-5">
            <h2 className="text-lg font-black text-[#2C4A3E] mb-1">Localização</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className={labelClass}>Cidade</label>
                <input
                  id="city"
                  type="text"
                  placeholder="Ex: Santa Rita do Sapucaí"
                  {...register('city')}
                  className={inputClass(!!errors.city)}
                />
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="state" className={labelClass}>Estado</label>
                <select
                  id="state"
                  {...register('state')}
                  className={inputClass(!!errors.state)}
                >
                  <option value="">UF</option>
                  {STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.state.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── CARACTERÍSTICAS ── */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-black text-[#2C4A3E] mb-5">Características</h2>

            <div className="space-y-3">
              {[
                { field: 'vaccinated' as const, label: 'Vacinado', icon: '💉' },
                { field: 'neutered' as const, label: 'Castrado', icon: '✂️' },
              ].map((item) => (
                <label
                  key={item.field}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9F7F2] cursor-pointer hover:bg-[#E8F0E6] transition-all"
                >
                  <input
                    type="checkbox"
                    {...register(item.field)}
                    className="accent-[#3A5B4F] w-5 h-5 rounded"
                  />
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-bold text-[#2C4A3E] text-sm">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-5">
              <label className={labelClass}>Tags (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Amigável, Brincalhão, Adora crianças"
                {...register('tags')}
                className={inputClass(false)}
              />
              <p className="text-xs text-gray-400 mt-2">Separe as tags por vírgula.</p>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <div className="flex gap-3 pb-4">
            <button
              type="button"
              onClick={() => router.push('/painel/pets')}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold hover:border-gray-300 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl bg-[#3A5B4F] text-white font-bold hover:bg-[#2C4A3E] transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Cadastrando...' : '🐾 Cadastrar pet'}
            </button>
          </div>

        </form>
      </div>
            {/* ── MINI FOOTER ── */}
      <footer className="mt-12 border-t border-gray-100 py-6">
        <p className="text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} AdotaPET. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}