#!/usr/bin/env ts-node

/* eslint-disable no-console */

import { Command } from 'commander';
import jwt from 'jsonwebtoken';
import { db } from '../src/infra/db/database';

import { createClerkClient } from '@clerk/backend';

interface TokenPayload {
  sub: string; // user ID
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

interface UserForToken {
  id: string;
  email: string;
  name?: string | null;
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Global flag to track if db is already disconnected
let isDbDisconnected = false;

const safeDisconnect = async () => {
  if (!isDbDisconnected) {
    try {
      await db.$disconnect();
      isDbDisconnected = true;
    } catch {
      // Ignore disconnect errors as they're not critical
    }
  }
};

const formatOutput = (token: string) => {
  let decoded: TokenPayload = { sub: '', email: '', iat: 0, exp: 0 };
  try {
    decoded = jwt.decode(token) as TokenPayload;

    console.log('🎉 JWT Token Generated Successfully!');
  } catch {
    console.log('   (Unable to decode expiration time)');
  }
  const expiresAt = new Date(decoded.exp * 1000);

  console.log('🎉 JWT Token Generated Successfully!');
  console.log(`Token: ${token}`);
  console.log(`Expires At: ${expiresAt ? expiresAt.toISOString() : 'Unknown'}`);
  console.log('');
  console.log(`User decoded from token: ${JSON.stringify(decoded)}`);
};

class TokenGenerator {
  async findUser(userId: string): Promise<UserForToken | null> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true }, // Only select needed fields
      });
      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  async generateToken(userId: string): Promise<string> {
    try {
      const session = await clerk.sessions.createSession({
        userId,
      });

      console.log('✅ Clerk session created successfully!');

      const tokenRes = await clerk.sessions.getToken(session.id);

      console.log('✅ Clerk session token created successfully!');

      return tokenRes.jwt;
    } catch (error) {
      console.error('Error generating token:', error);
      throw new Error(`Failed to generate token for user ${userId}`);
    }
  }
}

async function main() {
  const program = new Command();
  const generator = new TokenGenerator();

  program
    .name('generate-session-token')
    .description(
      'Generate Clerk JWT session tokens for testing protected endpoints'
    )
    .version('1.0.0')
    .requiredOption('-u, --user-id <userId>', 'Clerk user ID (required)')
    .parse();

  const options = program.opts();

  try {
    // Use existing user
    console.log(`🔄 Looking for user: ${options.userId}`);
    const user = await generator.findUser(options.userId);

    if (!user) {
      console.error(`❌ User with ID "${options.userId}" not found.`);
      console.log('');
      console.log(
        '💡 Tip: Check the user ID or ensure the user exists in your database.'
      );

      throw new Error('User not found');
    }

    console.log('✅ User found!');
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log(`   Email: ${user.email}`);
    console.log('');

    // Generate token
    console.log('🔄 Generating Clerk JWT token...');
    const token = await generator.generateToken(user.id);

    // Output results
    formatOutput(token);
  } catch (error) {
    console.error('❌ Error generating token:', error);
  }
  await safeDisconnect();
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await safeDisconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await safeDisconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(async (error) => {
    console.error('❌ Unhandled error:', error);
    await safeDisconnect();
    process.exit(1);
  });
}

export { TokenGenerator };
