const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.replace('DATABASE_URL=', '').trim().replace(/^["']|["']$/g, '');
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const sql = neon(dbUrl);

async function runMigration() {
  console.log('--- NEON DATABASE INITIALIZATION ---');

  // 1. Create Schema and Tables
  console.log('Creating tables in Neon...');
  
  await sql`CREATE SCHEMA IF NOT EXISTS "public";`;

  await sql`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "fullName" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'STUDENT',
      "faculty" TEXT,
      "groupName" TEXT,
      "phone" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Test" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "category" TEXT NOT NULL DEFAULT 'Umumiy',
      "timeLimit" INTEGER NOT NULL DEFAULT 20,
      "passingScore" INTEGER NOT NULL DEFAULT 60,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "accessCode" TEXT NOT NULL,
      "allowedGroups" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Group" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "faculty" TEXT,
      "description" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Question" (
      "id" TEXT NOT NULL,
      "testId" TEXT NOT NULL,
      "questionText" TEXT NOT NULL,
      "points" INTEGER NOT NULL DEFAULT 1,
      "optionA" TEXT NOT NULL,
      "optionB" TEXT NOT NULL,
      "optionC" TEXT NOT NULL,
      "optionD" TEXT NOT NULL,
      "correctAnswer" TEXT NOT NULL,
      "orderIndex" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "TestResult" (
      "id" TEXT NOT NULL,
      "testId" TEXT NOT NULL,
      "userId" TEXT,
      "guestName" TEXT,
      "guestGroup" TEXT,
      "totalQuestions" INTEGER NOT NULL,
      "correctAnswers" INTEGER NOT NULL,
      "scorePercent" DOUBLE PRECISION NOT NULL,
      "passed" BOOLEAN NOT NULL,
      "timeSpentSeconds" INTEGER NOT NULL,
      "answersJson" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
    );
  `;

  console.log('Tables created successfully!');

  // 2. Create Indexes
  console.log('Creating indexes...');
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`;
  await sql`CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");`;
  await sql`CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");`;

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "Test_accessCode_key" ON "Test"("accessCode");`;
  await sql`CREATE INDEX IF NOT EXISTS "Test_accessCode_idx" ON "Test"("accessCode");`;
  await sql`CREATE INDEX IF NOT EXISTS "Test_category_idx" ON "Test"("category");`;

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "Group_name_key" ON "Group"("name");`;
  await sql`CREATE INDEX IF NOT EXISTS "Group_name_idx" ON "Group"("name");`;

  await sql`CREATE INDEX IF NOT EXISTS "Question_testId_idx" ON "Question"("testId");`;
  await sql`CREATE INDEX IF NOT EXISTS "TestResult_testId_idx" ON "TestResult"("testId");`;
  await sql`CREATE INDEX IF NOT EXISTS "TestResult_userId_idx" ON "TestResult"("userId");`;

  // 3. Add Foreign Keys safely
  console.log('Adding foreign key constraints...');
  await sql`
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Question_testId_fkey'
        ) THEN
            ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'TestResult_testId_fkey'
        ) THEN
            ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'TestResult_userId_fkey'
        ) THEN
            ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END $$;
  `;

  // 4. Seed Admin
  console.log('Seeding default administrator into Neon...');
  await sql`
    INSERT INTO "User" ("id", "username", "password", "fullName", "role", "faculty", "groupName", "phone", "createdAt", "updatedAt")
    VALUES (
      'admin-1',
      'adminuniver',
      '$2b$10$4TvrJV1wfqtw6FmjKdWlE..XwiL2dzuKeRrocgdRwvyoJ2Tixy2DW',
      'Universitet Bosh Administratori',
      'ADMIN',
      'Rektorat',
      'Admin',
      '+998 90 123 45 67',
      NOW(),
      NOW()
    )
    ON CONFLICT ("username") DO UPDATE 
    SET "role" = 'ADMIN', "fullName" = EXCLUDED."fullName", "password" = EXCLUDED."password";
  `;

  // 5. Verify created tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('SUCCESS! Tables now in Neon database:', tables.map(t => t.table_name));

  const adminCount = await sql`SELECT count(*) FROM "User" WHERE role = 'ADMIN';`;
  console.log('Admin count in Neon:', adminCount[0].count);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
