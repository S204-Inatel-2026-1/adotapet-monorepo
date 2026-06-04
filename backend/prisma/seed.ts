// backend/prisma/seed.ts
import { PrismaClient, Species, Sex, PetSize, PetStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpa pets antigos para não duplicar
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany({ where: { email: 'admin@adotapet.com' } });

  const hash = await bcrypt.hash('senha123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@adotapet.com' },
    update: {},
    create: {
      fullName: 'Admin AdotaPet',
      email: 'admin@adotapet.com',
      password: hash,
      role: UserRole.ADMIN,
    },
  });

  const pets = [
    {
      name: 'Thor',
      species: Species.DOG,
      breed: 'Labrador',
      sex: Sex.MALE,
      ageInMonths: 24,
      size: PetSize.LARGE,
      description: 'Thor é um labrador carinhoso e cheio de energia. Ama brincar e é ótimo com crianças.',
      photoUrl: '/pets/thor.jpg',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: true,
      neutered: false,
      registeredById: admin.id,
      tags: 'Amigável,Brincalhão,Adora crianças',
    },
    {
      name: 'Nina',
      species: Species.CAT,
      breed: 'SRD Frajola',
      sex: Sex.FEMALE,
      ageInMonths: 18,
      size: PetSize.MEDIUM,
      description: 'Nina é uma gatinha tranquila e muito carinhosa. Ideal para apartamento.',
      photoUrl: '/pets/nina.webp',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: true,
      neutered: true,
      registeredById: admin.id,
      tags: 'Tímida,Carinhosa,Ideal p/ apartamento',
    },
    {
      name: 'Max',
      species: Species.CAT,
      breed: 'SRD - Rajado',
      sex: Sex.MALE,
      ageInMonths: 8,
      size: PetSize.MEDIUM,
      description: 'Max é um gatinho alegre e brincalhão. Muito inteligente e curioso.',
      photoUrl: '/pets/max.webp',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: false,
      neutered: false,
      registeredById: admin.id,
      tags: 'Filhote,Curioso,Energético',
    },
    {
      name: 'Mel',
      species: Species.DOG,
      breed: 'Vira-lata',
      sex: Sex.FEMALE,
      ageInMonths: 36,
      size: PetSize.SMALL,
      description: 'Mel é brincalhona e adora colo. Perfeita para quem busca companhia.',
      photoUrl: '/pets/mel.jpg',
      city: 'Itajubá',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: true,
      neutered: true,
      registeredById: admin.id,
      tags: 'Dócil,Tranquila,Adora colo',
    },
    {
      name: 'Bob',
      species: Species.DOG,
      breed: 'Vira-lata',
      sex: Sex.MALE,
      ageInMonths: 12,
      size: PetSize.LARGE,
      description: 'Bob é curioso e adora explorar. Precisa de espaço para correr e brincar.',
      photoUrl: '/pets/bob.png',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: true,
      neutered: false,
      registeredById: admin.id,
      tags: 'Explorador,Brincalhão,Ativo',
    },
    {
      name: 'Luna',
      species: Species.CAT,
      breed: 'SRD',
      sex: Sex.FEMALE,
      ageInMonths: 6,
      size: PetSize.MEDIUM,
      description: 'Luna é uma gatinha esperta e elegante. Muito dócil. Companhia para todos os momentos.',
      photoUrl: '/pets/luna.jpeg',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: false,
      neutered: false,
      registeredById: admin.id,
      tags: 'Elegante,Esperta,Companheira',
    },
    {
      name: 'Mia',
      species: Species.CAT,
      breed: 'SRD',
      sex: Sex.FEMALE,
      ageInMonths: 14,
      size: PetSize.MEDIUM,
      description: 'Mia é curiosa e independente, mas adora uma sessão de carinho no fim do dia.',
      photoUrl: '/pets/mia.jpg',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: true,
      neutered: true,
      registeredById: admin.id,
      tags: 'Independente,Curiosa,Carinhosa',
    },
    {
      name: 'Zeus',
      species: Species.DOG,
      breed: 'Vira-lata',
      sex: Sex.MALE,
      ageInMonths: 10,
      size: PetSize.LARGE,
      description: 'Zeus é inteligente e leal. Aprende rápido e precisa de exercício diário.',
      photoUrl: '/pets/zeus.jpg',
      city: 'Santa Rita do Sapucaí',
      state: 'MG',
      status: PetStatus.AVAILABLE,
      vaccinated: true,
      neutered: false,
      registeredById: admin.id,
      tags: 'Leal,Inteligente,Protetor',
    },
  ];

  for (const pet of pets) {
    await prisma.pet.create({ data: pet });
  }

  console.log(`✅ Seed concluído! ${pets.length} pets criados com fotos.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });