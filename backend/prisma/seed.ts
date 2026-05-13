import { PrismaClient, Category } from "@prisma/client";
import { destinations } from "../src/constants/destinations"; // your dataset file
import prisma from "../src/config/db.config";

async function main() {
  console.log("🌱 Seeding started...");

  // Optional: Clear existing data (VERY useful during development)
  await prisma.destination.deleteMany();

  // Insert new data
  await prisma.destination.createMany({
    data: destinations.map((item) => ({
      name: item.name,
      description: item.description,
      region: item.region,
      category: item.category as Category,
      latitude: item.latitude,
      longitude: item.longitude,
      rating: item.rating,
      tags: item.tags,
      images: item.images,
    })),
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });