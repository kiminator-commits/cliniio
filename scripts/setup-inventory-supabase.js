#!/usr/bin/env node

/**
 * Setup script for Inventory Supabase connection
 * Run with: node scripts/setup-inventory-supabase.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupInventorySupabase() {
  console.log('🏪 Inventory Supabase Setup\n');
  console.log(
    'This script will help you configure your environment variables for the Inventory module.\n'
  );

  // Check if .env.local already exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    console.log('⚠️  .env.local file already exists');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('Please provide your Supabase configuration:\n');

  // Get Supabase URL
  const supabaseUrl = await question(
    'Supabase Project URL (e.g., https://your-project.supabase.co): '
  );
  if (!supabaseUrl) {
    console.log('❌ Supabase URL is required');
    rl.close();
    return;
  }

  // Get Supabase Anon Key
  const supabaseAnonKey = await question('Supabase Anon Key: ');
  if (!supabaseAnonKey) {
    console.log('❌ Supabase Anon Key is required');
    rl.close();
    return;
  }

  // Optional: Debug mode
  const debugMode = await question('Enable debug mode? (y/N): ');
  const enableDebug = debugMode.toLowerCase() === 'y';

  // Create .env.local content
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Debug mode for development
VITE_SUPABASE_DEBUG=${enableDebug}

# App Configuration
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3001
`;

  try {
    // Write .env.local file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local file created successfully!');

    // Provide next steps
    console.log('\n📋 Next Steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log(
      '2. Test the connection: npx tsx scripts/testInventorySupabase.ts'
    );
    console.log('3. Navigate to the Inventory page to verify everything works');

    // Check if migrations need to be run
    console.log('\n🔧 Database Setup:');
    console.log("If you haven't run the database migrations yet, run:");
    console.log('npx supabase db push');

    console.log(
      '\n🎉 Setup complete! Your inventory module is ready to use with Supabase.'
    );
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
  }

  rl.close();
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupInventorySupabase().catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupInventorySupabase };
