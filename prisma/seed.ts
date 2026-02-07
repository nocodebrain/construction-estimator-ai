import { PrismaClient, QuantityCategory, RateSource } from '@prisma/client';

const prisma = new PrismaClient();

// Australian construction industry rates (2026 estimates - per unit costs in AUD)
const industryRates: Array<{
  description: string;
  unit: string;
  laborRate: number;
  materialRate: number;
  totalRate: number;
  category: QuantityCategory;
  source: RateSource;
}> = [
  // WALLS
  {
    description: 'Plasterboard walls - supply & install',
    unit: 'm2',
    laborRate: 45,
    materialRate: 35,
    totalRate: 80,
    category: QuantityCategory.WALLS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Brick wall - single skin',
    unit: 'm2',
    laborRate: 120,
    materialRate: 80,
    totalRate: 200,
    category: QuantityCategory.WALLS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Stud wall framing - timber',
    unit: 'm',
    laborRate: 55,
    materialRate: 35,
    totalRate: 90,
    category: QuantityCategory.WALLS,
    source: RateSource.INDUSTRY,
  },
  
  // FLOORS
  {
    description: 'Concrete slab - 100mm thick',
    unit: 'm2',
    laborRate: 65,
    materialRate: 85,
    totalRate: 150,
    category: QuantityCategory.FLOORS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Timber flooring - hardwood',
    unit: 'm2',
    laborRate: 75,
    materialRate: 125,
    totalRate: 200,
    category: QuantityCategory.FLOORS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Vinyl flooring - commercial grade',
    unit: 'm2',
    laborRate: 35,
    materialRate: 45,
    totalRate: 80,
    category: QuantityCategory.FLOORS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Carpet tiles - commercial',
    unit: 'm2',
    laborRate: 25,
    materialRate: 55,
    totalRate: 80,
    category: QuantityCategory.FLOORS,
    source: RateSource.INDUSTRY,
  },
  
  // CEILINGS
  {
    description: 'Plasterboard ceiling - suspended',
    unit: 'm2',
    laborRate: 55,
    materialRate: 45,
    totalRate: 100,
    category: QuantityCategory.CEILINGS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Acoustic ceiling tiles - 600x600',
    unit: 'm2',
    laborRate: 45,
    materialRate: 65,
    totalRate: 110,
    category: QuantityCategory.CEILINGS,
    source: RateSource.INDUSTRY,
  },
  
  // DOORS
  {
    description: 'Solid core door - standard',
    unit: 'each',
    laborRate: 250,
    materialRate: 450,
    totalRate: 700,
    category: QuantityCategory.DOORS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Fire rated door - FRL 60/30',
    unit: 'each',
    laborRate: 350,
    materialRate: 850,
    totalRate: 1200,
    category: QuantityCategory.DOORS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Aluminium sliding door - standard',
    unit: 'each',
    laborRate: 400,
    materialRate: 1100,
    totalRate: 1500,
    category: QuantityCategory.DOORS,
    source: RateSource.INDUSTRY,
  },
  
  // WINDOWS
  {
    description: 'Aluminium window - standard',
    unit: 'm2',
    laborRate: 200,
    materialRate: 400,
    totalRate: 600,
    category: QuantityCategory.WINDOWS,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Double glazed window',
    unit: 'm2',
    laborRate: 250,
    materialRate: 600,
    totalRate: 850,
    category: QuantityCategory.WINDOWS,
    source: RateSource.INDUSTRY,
  },
  
  // ELECTRICAL
  {
    description: 'Power point - standard',
    unit: 'each',
    laborRate: 85,
    materialRate: 35,
    totalRate: 120,
    category: QuantityCategory.ELECTRICAL,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Light fitting - standard',
    unit: 'each',
    laborRate: 95,
    materialRate: 65,
    totalRate: 160,
    category: QuantityCategory.ELECTRICAL,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Data point - Cat6',
    unit: 'each',
    laborRate: 120,
    materialRate: 45,
    totalRate: 165,
    category: QuantityCategory.ELECTRICAL,
    source: RateSource.INDUSTRY,
  },
  
  // PLUMBING
  {
    description: 'Toilet suite - standard',
    unit: 'each',
    laborRate: 350,
    materialRate: 450,
    totalRate: 800,
    category: QuantityCategory.PLUMBING,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Basin - wall mounted',
    unit: 'each',
    laborRate: 280,
    materialRate: 320,
    totalRate: 600,
    category: QuantityCategory.PLUMBING,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Kitchen sink - stainless steel',
    unit: 'each',
    laborRate: 250,
    materialRate: 350,
    totalRate: 600,
    category: QuantityCategory.PLUMBING,
    source: RateSource.INDUSTRY,
  },
  
  // HVAC
  {
    description: 'Split system AC - 2.5kW',
    unit: 'each',
    laborRate: 550,
    materialRate: 950,
    totalRate: 1500,
    category: QuantityCategory.HVAC,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Ducted AC - per 100m2',
    unit: 'each',
    laborRate: 2500,
    materialRate: 4500,
    totalRate: 7000,
    category: QuantityCategory.HVAC,
    source: RateSource.INDUSTRY,
  },
  
  // FINISHES
  {
    description: 'Paint - interior walls (2 coats)',
    unit: 'm2',
    laborRate: 15,
    materialRate: 8,
    totalRate: 23,
    category: QuantityCategory.FINISHES,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Ceramic tiles - floor/wall',
    unit: 'm2',
    laborRate: 55,
    materialRate: 65,
    totalRate: 120,
    category: QuantityCategory.FINISHES,
    source: RateSource.INDUSTRY,
  },
  {
    description: 'Skirting - timber',
    unit: 'm',
    laborRate: 12,
    materialRate: 18,
    totalRate: 30,
    category: QuantityCategory.FINISHES,
    source: RateSource.INDUSTRY,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing rates (optional - remove if you want to preserve custom rates)
  // await prisma.rate.deleteMany({ where: { source: RateSource.INDUSTRY } });

  // Insert industry rates
  for (const rate of industryRates) {
    await prisma.rate.create({
      data: rate,
    });
  }

  console.log(`✅ Created ${industryRates.length} industry standard rates`);
  
  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
