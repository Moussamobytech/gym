import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  // Default Super Admin
  const adminPhone = 'admin';
  const existingAdmin = await prisma.user.findUnique({ where: { phoneNumber: adminPhone } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: adminPhone,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      }
    });
    console.log('Default super admin created (admin / admin123)');
  }

  // Default trainings
  const count = await prisma.training.count();
  if (count === 0) {
    await prisma.training.createMany({
      data: [
        { name: 'Musculation', description: 'Salle complete avec machines guidees et poids libres. Ideal pour developper votre force.', imageUrl: 'musculation.jpg', active: true },
        { name: 'Cardio', description: 'Espace equipe de tapis de course, velos et rameurs de derniere generation.', imageUrl: 'cardio.jpg', active: true },
        { name: 'Yoga', description: 'Seances encadrees pour ameliorer votre souplesse, concentration et relaxation.', imageUrl: 'yoga.jpg', active: false },
        { name: 'CrossFit', description: 'Entrainement fonctionnel a haute intensite pour un developpement complet.', imageUrl: 'crossfit.jpg', active: false },
        { name: 'Zumba', description: 'Fitness sur des rythmes latinos et internationaux pour bruler des calories en s amusant.', imageUrl: 'zumba.jpg', active: false },
      ]
    });
    console.log('Default trainings seeded');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });