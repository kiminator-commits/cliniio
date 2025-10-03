#!/usr/bin/env node

/**
 * LIBRARY SEED DATA SCRIPT
 *
 * This script populates the knowledge_hub_content table with comprehensive
 * library content for the Cliniio sterilization management system.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  seedFile: './supabase/seed_library_data.sql',
  backupFile: './database-backups/library_seed_backup.sql',
  confirmBeforeRun: true,
};

class LibrarySeeder {
  constructor() {
    this.isProduction = this.checkEnvironment();
  }

  checkEnvironment() {
    const envFile = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      return (
        envContent.includes('PRODUCTION') || envContent.includes('production')
      );
    }
    return false;
  }

  async createBackup() {
    console.log('💾 Creating backup before seeding...');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `${CONFIG.backupFile}_${timestamp}.sql`;

      // Create backup directory if it doesn't exist
      const backupDir = path.dirname(backupFile);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Create backup of current knowledge_hub_content table
      execSync(
        `npx supabase db dump --linked --table knowledge_hub_content > "${backupFile}"`,
        {
          stdio: 'inherit',
        }
      );

      console.log(`✅ Backup created: ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.warn('⚠️ Could not create backup:', error.message);
      return null;
    }
  }

  async runSeedData() {
    console.log('🌱 Running library seed data...');

    try {
      // Check if seed file exists
      if (!fs.existsSync(CONFIG.seedFile)) {
        throw new Error(`Seed file not found: ${CONFIG.seedFile}`);
      }

      // Run the seed SQL file
      execSync(`npx supabase db reset --linked --file "${CONFIG.seedFile}"`, {
        stdio: 'inherit',
      });

      console.log('✅ Library seed data inserted successfully!');
    } catch (error) {
      console.error('❌ Failed to run seed data:', error.message);
      throw error;
    }
  }

  async verifySeedData() {
    console.log('🔍 Verifying seed data...');

    try {
      // Check if content was inserted
      const result = execSync(
        'npx supabase db shell --command "SELECT COUNT(*) as total_content FROM knowledge_hub_content;"',
        {
          encoding: 'utf8',
        }
      );

      const count = result.match(/\d+/)?.[0] || '0';
      console.log(`📊 Total content items in database: ${count}`);

      if (parseInt(count) > 0) {
        console.log('✅ Seed data verification successful!');
        return true;
      } else {
        console.log('❌ No content found in database');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to verify seed data:', error.message);
      return false;
    }
  }

  async showContentSummary() {
    console.log('\n📚 LIBRARY CONTENT SUMMARY');
    console.log('==========================');

    try {
      // Get content by category
      const categoryResult = execSync(
        'npx supabase db shell --command "SELECT category, COUNT(*) as count FROM knowledge_hub_content GROUP BY category ORDER BY count DESC;"',
        {
          encoding: 'utf8',
        }
      );

      console.log('\nContent by Category:');
      console.log(categoryResult);

      // Get content by difficulty level
      const difficultyResult = execSync(
        'npx supabase db shell --command "SELECT difficulty_level, COUNT(*) as count FROM knowledge_hub_content GROUP BY difficulty_level ORDER BY count DESC;"',
        {
          encoding: 'utf8',
        }
      );

      console.log('\nContent by Difficulty Level:');
      console.log(difficultyResult);

      // Get content by department
      const departmentResult = execSync(
        'npx supabase db shell --command "SELECT department, COUNT(*) as count FROM knowledge_hub_content GROUP BY department ORDER BY count DESC;"',
        {
          encoding: 'utf8',
        }
      );

      console.log('\nContent by Department:');
      console.log(departmentResult);
    } catch (error) {
      console.warn('⚠️ Could not fetch content summary:', error.message);
    }
  }

  async run() {
    console.log('🌱 LIBRARY SEED DATA SCRIPT');
    console.log('============================');
    console.log(
      `Environment: ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`
    );
    console.log(`Seed file: ${CONFIG.seedFile}`);
    console.log('');

    if (this.isProduction) {
      console.log('🚨 PRODUCTION ENVIRONMENT DETECTED');
      console.log('   Extra caution required');
      console.log('');
    }

    // Confirm before running
    if (CONFIG.confirmBeforeRun) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const confirmation = await new Promise((resolve) => {
        rl.question(
          'Do you want to proceed with seeding library data? (yes/no): ',
          (answer) => {
            rl.close();
            resolve(answer.toLowerCase());
          }
        );
      });

      if (confirmation !== 'yes') {
        console.log('❌ Operation cancelled');
        return;
      }
    }

    try {
      // Create backup
      await this.createBackup();

      // Run seed data
      await this.runSeedData();

      // Verify seed data
      const verified = await this.verifySeedData();

      if (verified) {
        // Show summary
        await this.showContentSummary();

        console.log('\n🎉 LIBRARY SEEDING COMPLETED SUCCESSFULLY!');
        console.log('==========================================');
        console.log('Your library now contains comprehensive content for:');
        console.log('• Sterilization courses and procedures');
        console.log('• Infection control policies');
        console.log('• Learning pathways and certifications');
        console.log('• Compliance and regulatory guidelines');
        console.log('• Technology and innovation content');
        console.log('• Management and leadership training');
        console.log('');
        console.log(
          'You can now access the library through the Knowledge Hub!'
        );
      } else {
        console.log('❌ Seed data verification failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Library seeding failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new LibrarySeeder();
  seeder.run().catch(console.error);
}

module.exports = LibrarySeeder;
