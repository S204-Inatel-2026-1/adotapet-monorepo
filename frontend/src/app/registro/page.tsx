"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Mail, Lock, User, Phone, MapPin, PawPrint, CheckCircle2, Building2, FileText, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BackToHome from "@/components/ui/BackToHome";

// ─── Schemas ────────────────────────────────────────────────────────────────

const adotanteSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Digite um e-mail válido"),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/(?=.*[a-z])/, "A senha deve conter pelo menos uma letra minúscula")
      .regex(/(?=.*[A-Z])/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
      .regex(/(?=.*[^A-Za-z0-9])/, "A senha deve conter pelo menos um caractere especial"),
    confirmPassword: z.string(),
    phone: z.string().min(10, "Telefone inválido"),
    city: z.string().min(2, "A cidade é obrigatória"),
    state: z.string().length(2, "Selecione um estado"),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "Você precisa aceitar os termos de responsabilidade",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const ongSchema = z
  .object({
    // Dados do responsável
    fullName: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Digite um e-mail válido"),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/(?=.*[a-z])/, "A senha deve conter pelo menos uma letra minúscula")
      .regex(/(?=.*[A-Z])/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
      .regex(/(?=.*[^A-Za-z0-9])/, "A senha deve conter pelo menos um caractere especial"),
    confirmPassword: z.string(),
    phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
    // Dados da ONG
    legalName: z.string().min(3, "O nome legal deve ter no mínimo 3 caracteres"),
    tradeName: z.string().optional().or(z.literal("")),
    cnpj: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || /^\d{14}$/.test(val.replace(/\D/g, "")), {
        message: "CNPJ inválido (apenas números, 14 dígitos)",
      }),
    description: z.string().optional().or(z.literal("")),
    city: z.string().min(2, "A cidade é obrigatória"),
    state: z.string().length(2, "Selecione um estado"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type AdotanteForm = z.infer<typeof adotanteSchema>;
type OngForm = z.infer<typeof ongSchema>;

// ─── Constantes ─────────────────────────────────────────────────────────────

const brazilianStates = [
  "", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ",
  "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

// ─── Formulário Adotante ─────────────────────────────────────────────────────

function FormAdotante() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdotanteForm>({ resolver: zodResolver(adotanteSchema) });

  const onSubmit = async (data: AdotanteForm) => {
    try {
      setError(null);
      await api.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'ADOPTER'
      });
      alert("Conta criada com sucesso! Você já pode fazer login.");
      router.push("/login");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.";
      setError(errorMsg);
    }
  };


  const stateOptions = brazilianStates.map((s) => ({ value: s, label: s }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
          {error}
        </div>
      )}

      <div className="relative">
        <User className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Nome completo"
          type="text"
          placeholder="Seu nome completo"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Telefone"
          type="tel"
          placeholder="(00) 00000-0000"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <MapPin className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
          <Input
            label="Cidade"
            type="text"
            placeholder="Sua cidade"
            className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>
        <Select
          label="Estado"
          placeholder="UF"
          options={stateOptions}
          className="h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.state?.message}
          {...register("state")}
        />
      </div>

      <Checkbox
        label={
          <>
            Concordo com os{" "}
            <Link href="#" className="text-primary hover:text-primary/80 font-medium">
              termos de responsabilidade de adoção
            </Link>{" "}
            e me comprometo a cuidar do animal com amor e respeito
          </>
        }
        error={errors.agreedToTerms?.message}
        {...register("agreedToTerms")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-6"
      >
        {isSubmitting ? (
          "Criando conta..."
        ) : (
          <>
            <CheckCircle2 className="size-5 mr-2" />
            Criar conta
          </>
        )}
      </button>
    </form>
  );
}

// ─── Formulário ONG ──────────────────────────────────────────────────────────

function FormOng() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OngForm>({ resolver: zodResolver(ongSchema) });

  const onSubmit = async (data: OngForm) => {
    try {
      setError(null);
      await api.registerOrganization(data);
      alert("Conta da ONG criada com sucesso! Você já pode fazer login.");
      router.push("/login");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.";
      setError(errorMsg);
    }
  };

  const stateOptions = brazilianStates.map((s) => ({ value: s, label: s }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
          {error}
        </div>
      )}

      {/* Seção: Responsável */}
      <div className="flex items-center gap-2 pt-1 pb-0.5">
        <User className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Dados do responsável
        </span>
      </div>

      <div className="relative">
        <User className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Nome completo do responsável"
          type="text"
          placeholder="Nome de quem vai gerenciar a conta"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="E-mail"
          type="email"
          placeholder="contato@suaong.org.br"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Lock className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>
      </div>

      <div className="relative">
        <Phone className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Telefone do responsável (opcional)"
          type="tel"
          placeholder="(00) 00000-0000"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      {/* Dados da ONG */}
      <div className="flex items-center gap-2 pt-2 pb-0.5">
        <Building2 className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Dados da ONG
        </span>
      </div>

      <div className="relative">
        <Building2 className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Nome legal da ONG"
          type="text"
          placeholder="Ex.: Instituto AdotaPet LTDA"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.legalName?.message}
          {...register("legalName")}
        />
      </div>

      <div className="relative">
        <Building2 className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Nome fantasia (opcional)"
          type="text"
          placeholder="Ex.: AdotaPet ONG"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.tradeName?.message}
          {...register("tradeName")}
        />
      </div>

      <div className="relative">
        <FileText className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="CNPJ (opcional)"
          type="text"
          placeholder="00.000.000/0000-00"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.cnpj?.message}
          {...register("cnpj")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <MapPin className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
          <Input
            label="Cidade"
            type="text"
            placeholder="Cidade da ONG"
            className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>
        <Select
          label="Estado"
          placeholder="UF"
          options={stateOptions}
          className="h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.state?.message}
          {...register("state")}
        />
      </div>

      <div className="relative">
        <Info className="absolute left-4 top-[38px] size-5 text-muted-foreground z-10" />
        <Input
          label="Descrição da ONG (opcional)"
          type="text"
          placeholder="Breve descrição sobre a missão da ONG"
          className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#E8F0E6] border border-[#2C4A3E]/10">
        <Info className="size-4 text-[#2C4A3E] mt-0.5 shrink-0" />
        <p className="text-xs text-[#2C4A3E]/80 leading-relaxed">
          Após o cadastro, sua ONG passará por uma análise de verificação. Você já poderá cadastrar pets e gerenciar adoções enquanto isso.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-6"
      >
        {isSubmitting ? (
          "Criando conta..."
        ) : (
          <>
            <CheckCircle2 className="size-5 mr-2" />
            Cadastrar ONG
          </>
        )}
      </button>
    </form>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function Register() {
  const [isOng, setIsOng] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-10 left-10 opacity-20">
        <PawPrint className="size-12 text-primary" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-20">
        <PawPrint className="size-16 text-accent" />
      </div>
      <div className="absolute top-1/4 right-1/3 opacity-10">
        <PawPrint className="size-10 text-secondary" />
      </div>
      <div className="absolute bottom-1/4 left-1/4 opacity-15">
        <Heart className="size-8 text-accent" />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-start relative z-10">
        <div className="flex items-center justify-center order-2 md:order-1">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8 md:p-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="bg-accent p-3 rounded-full">
                  <Heart className="size-7 text-accent-foreground fill-accent-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">AdotaPET</span>
              </div>

              <div className="flex rounded-2xl border border-border/50 p-1 mb-6 bg-muted/30">
                <button
                  type="button"
                  onClick={() => setIsOng(false)}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all ${
                    !isOng
                      ? "bg-card shadow text-foreground border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className="size-4" />
                  Quero adotar
                </button>
                <button
                  type="button"
                  onClick={() => setIsOng(true)}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all ${
                    isOng
                      ? "bg-card shadow text-foreground border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="size-4" />
                  Sou uma ONG
                </button>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {isOng ? "Cadastrar minha ONG" : "Criar conta para adoção"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isOng
                    ? "Cadastre sua organização e comece a conectar pets com famílias"
                    : "Comece sua jornada para encontrar um novo amigo"}
                </p>
              </div>

              {isOng ? <FormOng /> : <FormAdotante />}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">ou</span>
                </div>
              </div>

              <Link href="/login" className="block">
                <button
                  type="button"
                  className="w-full h-12 rounded-2xl border-2 border-border/50 hover:border-primary hover:bg-primary/5 text-foreground text-base font-medium transition-colors"
                >
                  Já tenho conta
                </button>
              </Link>

              <div className="mt-6">
                <BackToHome centered />
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              <PawPrint className="size-6 text-accent/60" />
              <PawPrint className="size-5 text-secondary/60" />
              <PawPrint className="size-4 text-primary/60" />
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center order-1 md:order-2 sticky top-8">
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent rounded-full opacity-50 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary rounded-full opacity-40 blur-xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-card">
              <Image
                src="https://images.unsplash.com/photo-1735989967755-706e5edcb44b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRseSUyMGRvZyUyMHdlbGNvbWluZyUyMGhhcHB5fGVufDF8fHx8MTc3MzcwNTExN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Friendly dog"
                width={1080}
                height={500}
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
          <div className="mt-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isOng ? "Faça parte da rede!" : "Junte-se a nós!"}
            </h2>
            <p className="text-muted-foreground">
              {isOng
                ? "Conecte sua ONG a centenas de pessoas prontas para adotar com responsabilidade"
                : "Milhares de pessoas já encontraram seus melhores amigos através da nossa plataforma"}
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Adoções</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">ONGs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}