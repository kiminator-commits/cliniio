#!/usr/bin/env node

import { execSync } from 'child_process';

// Configuration
const PROJECT_REF = 'psqwgebhxfuzqqgdzcmm';

// Check if access token is available
function checkAccessToken() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('❌ SUPABASE_ACCESS_TOKEN environment variable not set');
    console.log('Please set your access token:');
    console.log('1. Go to https://supabase.com/dashboard/account/tokens');
    console.log('2. Generate a new access token');
    console.log('3. Set it as: $env:SUPABASE_ACCESS_TOKEN="your_token_here"');
    process.exit(1);
  }
  return token;
}

// Link to project
function linkProject() {
  try {
    console.log('🔗 Linking to Supabase project...');
    execSync(`npx supabase link --project-ref ${PROJECT_REF}`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('✅ Project linked successfully');
  } catch (error) {
    console.error('❌ Failed to link project:', error.message);
    process.exit(1);
  }
}

// Push migrations
function pushMigrations() {
  try {
    console.log('🚀 Pushing migrations...');
    execSync(`npx supabase db push --project-ref ${PROJECT_REF}`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('✅ Migrations deployed successfully');
  } catch (error) {
    console.error('❌ Failed to push migrations:', error.message);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log('🏥 Cliniio Migration Deployment');
  console.log('===============================\n');

  checkAccessToken();
  linkProject();
  pushMigrations();

  console.log('\n🎉 Deployment completed successfully!');
}

// ES module equivalent
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, checkAccessToken, linkProject, pushMigrations };
