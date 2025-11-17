#!/usr/bin/env ts-node

/* eslint-disable no-console */

import { Command } from 'commander';
import { db } from '../src/infra/db/database';
import { getDefaultWeightsForSeeding } from '../src/config/default-category-weights';

// Global flag to track if db is already disconnected
let isDbDisconnected = false;

const program = new Command();

async function disconnectDb(): Promise<void> {
  if (!isDbDisconnected) {
    await db.$disconnect();
    isDbDisconnected = true;
    console.log('Database disconnected.');
  }
}

async function seedDefaultCategoryWeights(): Promise<void> {
  try {
    console.log('Starting default category weights seeding...');

    // Get default weights for seeding
    const defaultWeights = getDefaultWeightsForSeeding();

    console.log(
      `Found ${defaultWeights.length} default category weights to seed.`
    );

    // Check if weights already exist
    const existingCount = await db.defaultCategoryWeight.count();

    if (existingCount > 0) {
      console.log(
        `Found ${existingCount} existing default weights. Skipping seeding.`
      );
      console.log('Use --force flag to overwrite existing data.');
      return;
    }

    // Seed default category weights
    const result = await db.defaultCategoryWeight.createMany({
      data: defaultWeights,
      skipDuplicates: true,
    });

    console.log(
      `Successfully seeded ${result.count} default category weights.`
    );

    // Log seeded data for verification
    const allWeights = await db.defaultCategoryWeight.findMany({
      orderBy: { category: 'asc' },
    });

    console.log('\\nSeeded weights:');
    allWeights.forEach((weight) => {
      const percentage = (parseFloat(weight.weight.toString()) * 100).toFixed(
        1
      );
      console.log(`  ${weight.category}: ${percentage}%`);
    });
  } catch (error) {
    console.error('Error seeding default category weights:', error);
    throw error;
  }
}

async function forceSeedDefaultCategoryWeights(): Promise<void> {
  try {
    console.log('Force seeding default category weights...');

    // Delete existing weights
    const deletedCount = await db.defaultCategoryWeight.deleteMany({});
    console.log(`Deleted ${deletedCount.count} existing default weights.`);

    // Proceed with normal seeding
    await seedDefaultCategoryWeights();
  } catch (error) {
    console.error('Error force seeding default category weights:', error);
    throw error;
  }
}

program
  .name('seed-default-category-weights')
  .description(
    'Seed the database with default category weights for spending allocation analysis'
  )
  .option('--force', 'Force overwrite existing default weights')
  .action(async (options) => {
    try {
      if (options.force) {
        await forceSeedDefaultCategoryWeights();
      } else {
        await seedDefaultCategoryWeights();
      }

      console.log(
        '\\n✅ Default category weights seeding completed successfully!'
      );
    } catch (error) {
      console.error('\\n❌ Seeding failed:', error);
      process.exit(1);
    } finally {
      await disconnectDb();
    }
  });

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\\nReceived SIGINT. Gracefully shutting down...');
  await disconnectDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\\nReceived SIGTERM. Gracefully shutting down...');
  await disconnectDb();
  process.exit(0);
});

program.parse();
