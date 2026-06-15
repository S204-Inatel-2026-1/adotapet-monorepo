'use client';

// src/app/resgate/page.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/layout/Navbar';
import PrivateHeader from '@/components/layout/PrivateHeader';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/ui/BackToHome';
import { useAuth } from '@/contexts/AuthContext';

const resgateSchema = z.object({
  // Endereço
  street: z.string().min(3, 'Informe a rua'),
  neighborhood: z.string().min(2, 'Informe o bairro'),
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().min(2, 'Informe o estado'),
  reference: z.string().optional(),

  // Info do animal
  animalType: z.enum(['dog', 'cat', 'other'], { error: 'Selecione o tipo de animal' }),
  animalCondition: z.enum(['injured', 'abandoned', 'sick', 'other'], {
    error: 'Selecione a condição do animal',
  }),
  animalCount: z.string().min(1, 'Informe quantos animais'),

  // Situação
  description: z.string().min(20, 'Descreva a situação com pelo menos 20 caracteres'),

  // Contato (opcional)
  anonymous: z.boolean(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

type ResgateForm = z.infer<typeof resgateSchema>;

export default function ResgatePage() {
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ResgateForm>({
    resolver: zodResolver(resgateSchema),
    defaultValues: { anonymous: false },
  });

  const onSubmit = async (data: ResgateForm) => {
    await new Promise((r) => setTimeout(r, 1200));
    console.log('Solicitação de resgate:', data);
    setSubmitted(true);
    reset();
  };

  const handleAnonymousToggle = () => {
    const next = !isAnonymous;
    setIsAnonymous(next);
    setValue('anonymous', next);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] ${
      hasError ? 'ring-2 ring-red-400' : ''
    }`;

  const sectionClass = 'bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-5';

  if (submitted) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen font-sans">
        {isAuthenticated ? <PrivateHeader /> : <Navbar />}
        <div className="h-20" />
        <div className="max-w-2xl mx-auto px-8 py-32 text-center">
          <span className="text-6xl mb-6 block">🐾</span>
          <h1 className="text-3xl font-black text-[#2C4A3E] mb-4">Solicitação enviada!</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Recebemos o seu pedido de resgate. Voluntários e ONGs parceiras serão notificados e
            entrarão em ação o mais rápido possível. Obrigada por cuidar!
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-[#3A5B4F] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#2C4A3E] transition-all"
          >
            Nova solicitação
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      {isAuthenticated ? <PrivateHeader /> : <Navbar />}
      <div className="h-20" />
      <BackToHome />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 py-16 text-center">
        <span className="text-[#3A5B4F] font-bold bg-[#E8F0E6] px-4 py-1.5 rounded-full text-xs inline-flex items-center gap-2 mb-6">
          🚨 Pedido de Resgate
        </span>
        <h1 className="text-5xl font-extrabold text-[#2C4A3E] mb-4">Solicitar ajuda para resgate</h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Informe os dados abaixo para que ONGs e voluntários possam ajudar no resgate.
          <strong className="text-[#2C4A3E]"> Toda informação ajuda!</strong>
        </p>
        <p className="text-gray-400 text-sm mt-3">
          Quanto mais detalhes você fornecer sobre a localização e condição do animal, mais rápido
          conseguiremos enviar ajuda.
        </p>
      </section>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto px-8 pb-20 space-y-8">

        {/* 1. Endereço */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold text-[#2C4A3E] flex items-center gap-3">
            <span className="bg-[#F4C542] w-9 h-9 rounded-full flex items-center justify-center text-sm font-black">1</span>
            Localização do animal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Rua / Avenida *</label>
              <input type="text" placeholder="Ex: Rua das Flores, 123" {...register('street')} className={inputClass(!!errors.street)} />
              {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
            </div>

            <div>
              <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Bairro *</label>
              <input type="text" placeholder="Ex: Centro" {...register('neighborhood')} className={inputClass(!!errors.neighborhood)} />
              {errors.neighborhood && <p className="text-xs text-red-500 mt-1">{errors.neighborhood.message}</p>}
            </div>

            <div>
              <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Cidade *</label>
              <input type="text" placeholder="Ex: Santa Rita do Sapucaí" {...register('city')} className={inputClass(!!errors.city)} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Estado *</label>
              <input type="text" placeholder="Ex: MG" {...register('state')} className={inputClass(!!errors.state)} />
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Ponto de referência</label>
              <input type="text" placeholder="Ex: Próximo ao mercado" {...register('reference')} className={inputClass(false)} />
            </div>
          </div>
        </div>

        {/* 2. Informações do animal */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold text-[#2C4A3E] flex items-center gap-3">
            <span className="bg-[#F4C542] w-9 h-9 rounded-full flex items-center justify-center text-sm font-black">2</span>
            Informações do animal
          </h2>

          <div>
            <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-3">Tipo de animal *</label>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'dog', label: '🐶 Cachorro' },
                { value: 'cat', label: '🐱 Gato' },
                { value: 'other', label: '🐦 Outro' },
              ].map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input type="radio" value={opt.value} {...register('animalType')} className="sr-only peer" />
                  <span className="px-6 py-3 rounded-2xl bg-[#F9F7F2] font-bold text-[#2C4A3E] border-2 border-transparent peer-checked:border-[#3A5B4F] peer-checked:bg-[#E8F0E6] transition-all block">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.animalType && <p className="text-xs text-red-500 mt-1">{errors.animalType.message}</p>}
          </div>

          <div>
            <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-3">Condição do animal *</label>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'injured', label: '🩹 Ferido' },
                { value: 'abandoned', label: '😢 Abandonado' },
                { value: 'sick', label: '🤒 Doente' },
                { value: 'other', label: '❓ Outro' },
              ].map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input type="radio" value={opt.value} {...register('animalCondition')} className="sr-only peer" />
                  <span className="px-5 py-3 rounded-2xl bg-[#F9F7F2] font-bold text-[#2C4A3E] border-2 border-transparent peer-checked:border-[#3A5B4F] peer-checked:bg-[#E8F0E6] transition-all block text-sm">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.animalCondition && <p className="text-xs text-red-500 mt-1">{errors.animalCondition.message}</p>}
          </div>

          <div className="max-w-xs">
            <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Número de animais *</label>
            <input type="number" min="1" placeholder="Ex: 2" {...register('animalCount')} className={inputClass(!!errors.animalCount)} />
            {errors.animalCount && <p className="text-xs text-red-500 mt-1">{errors.animalCount.message}</p>}
          </div>
        </div>

        {/* 3. Descrever a situação */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold text-[#2C4A3E] flex items-center gap-3">
            <span className="bg-[#F4C542] w-9 h-9 rounded-full flex items-center justify-center text-sm font-black">3</span>
            Descreva a situação
          </h2>
          <textarea
            rows={5}
            placeholder="Descreva o que está acontecendo com o animal. Quanto mais detalhes, melhor para os voluntários..."
            {...register('description')}
            className={`${inputClass(!!errors.description)} resize-none`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        {/* 4. Fotos e vídeos */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold text-[#2C4A3E] flex items-center gap-3">
            <span className="bg-[#F4C542] w-9 h-9 rounded-full flex items-center justify-center text-sm font-black">4</span>
            Fotos e vídeos <span className="text-sm font-normal text-gray-400">(opcional)</span>
          </h2>
          <div className="border-2 border-dashed border-[#3A5B4F]/30 rounded-2xl p-10 text-center bg-[#F9F7F2] cursor-pointer hover:border-[#3A5B4F] transition-colors">
            <p className="text-3xl mb-3">📷</p>
            <p className="font-bold text-[#2C4A3E] mb-1">Clique para anexar arquivos</p>
            <p className="text-xs text-gray-400">PNG, JPG, MP4 — máx. 20MB cada</p>
            <input type="file" multiple accept="image/*,video/*" className="hidden" />
          </div>
        </div>

        {/* 5. Contato */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold text-[#2C4A3E] flex items-center gap-3">
            <span className="bg-[#F4C542] w-9 h-9 rounded-full flex items-center justify-center text-sm font-black">5</span>
            Seus dados de contato
          </h2>

          {/* Toggle anônimo */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              onClick={handleAnonymousToggle}
              className={`w-12 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-[#3A5B4F]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAnonymous ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="font-bold text-[#2C4A3E]">Fazer pedido de forma anônima</span>
          </label>
          <p className="text-xs text-gray-400 -mt-2">
            Se anônimo, os voluntários não poderão entrar em contato para mais informações.
          </p>

          {!isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Nome</label>
                <input type="text" placeholder="Seu nome" {...register('contactName')} className={inputClass(false)} />
              </div>
              <div>
                <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Telefone</label>
                <input type="tel" placeholder="(00) 00000-0000" {...register('contactPhone')} className={inputClass(false)} />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#3A5B4F] text-white font-bold py-5 rounded-2xl hover:bg-[#2C4A3E] transition-all shadow-lg hover:shadow-xl text-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando solicitação...' : '🚨 Enviar solicitação de resgate'}
        </button>

        {/* Rodapé inspiracional */}
        <p className="text-center text-[#3A5B4F] font-bold text-lg pt-4">
          Juntos, salvamos vidas 🐾
        </p>
      </form>
      <BackToHome centered />

      <Footer />
      
    </main>
  );
}