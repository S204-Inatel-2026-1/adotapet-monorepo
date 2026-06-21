'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { Mail, ArrowLeft, Heart, PawPrint } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import BackToHome from '@/components/ui/BackToHome';

const schema = z.object({
  email: z.string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um formato de e-mail válido'),
});

type FormValues = z.infer<typeof schema>;

export default function EsqueceuSenha() {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError(null);
      await api.requestPasswordReset(data.email);
      setSubmitted(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao processar solicitação.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-accent p-3 rounded-full">
              <Heart className="size-7 text-accent-foreground fill-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">AdotaPET</span>
          </div>

          {submitted ? (
            <div className="text-center py-4">
              <span className="text-5xl mb-6 block animate-bounce">✉️</span>
              <h2 className="text-2xl font-bold text-foreground mb-3">E-mail de recuperação enviado!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Enviamos um link com as instruções para o seu endereço de e-mail cadastrado.
                Verifique também sua caixa de spam se não receber em alguns minutos.
              </p>
              <Link href="/login" className="block w-full">
                <button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors">
                  Ir para Login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Recuperar Senha</h1>
                <p className="text-muted-foreground text-sm">
                  Informe o seu e-mail para receber um link de redefinição de senha
                </p>
              </div>

              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-4 top-9.5 size-5 text-muted-foreground z-10" />
                  <Input
                    label="E-mail cadastrado"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>

                <div className="text-center">
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                    <ArrowLeft className="size-4" />
                    Voltar para o Login
                  </Link>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 border-t border-border/40 pt-6">
            <BackToHome centered />
          </div>
        </div>

        {/* Patinhas decorativas */}
        <div className="mt-6 flex justify-center gap-2 opacity-50">
          <PawPrint className="size-6 text-accent/60" />
          <PawPrint className="size-5 text-secondary/60" />
          <PawPrint className="size-4 text-primary/60" />
        </div>
      </div>
    </div>
  );
}
