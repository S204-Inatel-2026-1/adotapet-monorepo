'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileText, MapPin, Info, Save, Loader2 } from 'lucide-react';
import OngHeader from '@/components/layout/OngHeader';
import BackButton from '@/components/ui/BackButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/services/api';

const orgSchema = z.object({
  legalName: z.string().min(3, 'O nome legal deve ter no mínimo 3 caracteres'),
  tradeName: z.string().min(2, 'O nome fantasia deve ter no mínimo 2 caracteres'),
  cnpj: z.string().refine((val) => /^\d{14}$/.test(val.replace(/\D/g, '')), {
    message: 'CNPJ inválido (14 dígitos)',
  }),
  description: z.string().min(10, 'A descrição deve ser um pouco mais detalhada'),
  city: z.string().min(2, 'A cidade é obrigatória'),
  state: z.string().length(2, 'UF inválida'),
});

type OrgForm = z.infer<typeof orgSchema>;

const brazilianStates = [
  "", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ",
  "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function OrganizacaoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
  });

  useEffect(() => {
    async function loadOrg() {
      try {
        setIsLoading(true);
        const data = await api.getOrganizationMe();
        reset({
          legalName: data.legalName,
          tradeName: data.tradeName,
          cnpj: data.cnpj,
          description: data.description,
          city: data.city,
          state: data.state,
        });
      } catch (error) {
        console.error('Erro ao carregar organização:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrg();
  }, [reset]);

  const onSubmit = async (data: OrgForm) => {
    try {
      setIsSaving(true);
      setMessage(null);
      await api.updateOrganizationMe(data);
      setMessage({ type: 'success', text: 'Dados da organização atualizados com sucesso!' });
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar dados.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <Loader2 className="size-8 text-[#3A5B4F] animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans pb-20">
      <OngHeader />
      <div className="h-20" />

      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="mb-6">
          <BackButton href="/painel" label="Voltar ao painel" />
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#3A5B4F] p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                🏢
              </div>
              <div>
                <h1 className="text-2xl font-black">Minha Organização</h1>
                <p className="text-white/60 text-sm">Gerencie os dados públicos da sua ONG</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {message && (
              <div className={`p-4 rounded-2xl text-sm font-medium ${
                message.type === 'success' ? 'bg-[#E8F0E6] text-[#2C4A3E]' : 'bg-red-50 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <Building2 className="absolute left-4 top-[38px] size-5 text-gray-400 z-10" />
                <Input
                  label="Razão Social"
                  className="pl-12 h-12 rounded-2xl bg-[#F9F7F2] border-none"
                  error={errors.legalName?.message}
                  {...register('legalName')}
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-4 top-[38px] size-5 text-gray-400 z-10" />
                <Input
                  label="Nome Fantasia"
                  className="pl-12 h-12 rounded-2xl bg-[#F9F7F2] border-none"
                  error={errors.tradeName?.message}
                  {...register('tradeName')}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <FileText className="absolute left-4 top-[38px] size-5 text-gray-400 z-10" />
                <Input
                  label="CNPJ"
                  className="pl-12 h-12 rounded-2xl bg-[#F9F7F2] border-none"
                  error={errors.cnpj?.message}
                  {...register('cnpj')}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 relative">
                  <MapPin className="absolute left-4 top-[38px] size-5 text-gray-400 z-10" />
                  <Input
                    label="Cidade"
                    className="pl-12 h-12 rounded-2xl bg-[#F9F7F2] border-none"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                </div>
                <Select
                  label="UF"
                  options={brazilianStates.map(s => ({ value: s, label: s }))}
                  className="h-12 rounded-2xl bg-[#F9F7F2] border-none"
                  error={errors.state?.message}
                  {...register('state')}
                />
              </div>
            </div>

            <div className="relative">
              <Info className="absolute left-4 top-[38px] size-5 text-gray-400 z-10" />
              <div className="space-y-1">
                <label className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest ml-1">
                  Descrição da ONG
                </label>
                <textarea
                  className="w-full min-h-[120px] p-4 pl-12 rounded-2xl bg-[#F9F7F2] border-none focus:ring-2 focus:ring-[#3A5B4F] text-sm resize-none"
                  placeholder="Conte um pouco sobre o trabalho de vocês..."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 ml-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-14 bg-[#3A5B4F] hover:bg-[#2C4A3E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3A5B4F]/20 disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
              Salvar alterações
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
