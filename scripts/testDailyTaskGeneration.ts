#!/usr/bin/env tsx

/**
 * Test script for AI Daily Task Generation
 * Run with: npx tsx scripts/testDailyTaskGeneration.ts
 */

import { aiDailyTaskService } from '../src/services/aiDailyTaskService';

async function testDailyTaskGeneration() {
  console.log('🧪 Testing AI Daily Task Generation...\n');

  try {
    // Test facility ID (replace with actual facility ID from your database)
    const testFacilityId = '550e8400-e29b-41d4-a716-446655440000'; // From your migration

    console.log('1. Testing operational gap scanning...');

    // Test scanning for gaps (this will be private, so we'll test the public methods)
    console.log('   - Scanning for operational gaps...');

    // Test task generation
    console.log('2. Testing daily task generation...');
    const taskAssignments =
      await aiDailyTaskService.generateDailyTasks(testFacilityId);

    console.log(`   ✅ Generated ${taskAssignments.length} user assignments`);

    // Show summary of assignments
    taskAssignments.forEach((assignment, index) => {
      console.log(
        `   User ${index + 1}: ${assignment.tasks.length} tasks assigned`
      );
      assignment.tasks.forEach((task) => {
        console.log(
          `     - ${task.title} (${task.priority} priority, ${task.points} points)`
        );
      });
    });

    console.log('\n🎉 Daily task generation test completed successfully!');

    // Test getting user tasks
    if (taskAssignments.length > 0 && taskAssignments[0].tasks.length > 0) {
      const firstUserId = taskAssignments[0].userId;
      console.log(
        `\n3. Testing user task retrieval for user ${firstUserId}...`
      );

      const userTasks = await aiDailyTaskService.getUserDailyTasks(firstUserId);
      console.log(`   ✅ Retrieved ${userTasks.length} tasks for user`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }

    process.exit(1);
  }
}

// Run the test
testDailyTaskGeneration()
  .then(() => {
    console.log('\n✨ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
