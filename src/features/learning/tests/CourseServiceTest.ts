import { CourseService } from '../services/CourseService';
import { supabase } from '@/lib/supabaseClient';

async function runCourseServiceTest() {
  try {
    console.log('🚀 Starting CourseService integration test...\n');

    // 1️⃣ Find a sample course
    const { data: courses } = await supabase
      .from('knowledge_hub_courses')
      .select('id, title')
      .limit(1);

    if (!courses || courses.length === 0) {
      console.error('❌ No courses found in Supabase.');
      return;
    }

    const courseId = courses[0].id;
    console.log(`✅ Found course: ${courses[0].title} (${courseId})\n`);

    // 2️⃣ Load full course structure
    const course = await CourseService.getCourse(courseId);
    console.log('📚 Course data loaded:');
    console.log(JSON.stringify(course, null, 2));

    // 3️⃣ Fetch user for test
    const { data: users } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
    const userId = users?.[0]?.id || '00000000-0000-0000-0000-000000000000';
    console.log(`👤 Using test user: ${userId}`);

    // 4️⃣ Check user progress before completion
    const initialProgress = await CourseService.getUserProgress(
      userId,
      courseId
    );
    console.log('📊 Initial Progress:', initialProgress);

    // 5️⃣ Mark first lesson complete
    const firstLessonId = course.knowledge_hub_modules?.[0]?.knowledge_hub_lessons?.[0]?.id;
    if (!firstLessonId) {
      console.error('❌ No lessons found in the first module.');
      return;
    }

    console.log(`🧩 Marking lesson complete: ${firstLessonId}`);
    await CourseService.markLessonComplete(firstLessonId, userId);

    // 6️⃣ Verify updated progress
    const updatedProgress = await CourseService.getUserProgress(
      userId,
      courseId
    );
    console.log('✅ Updated Progress:', updatedProgress);

    // 7️⃣ Test resumeCourse()
    const nextLesson = await CourseService.resumeCourse(userId, courseId);
    console.log(`⏩ Resume should start at lesson ID: ${nextLesson}`);

    console.log('\n🎉 All CourseService methods executed successfully.');
  } catch (error: any) {
    console.error('💥 CourseService test failed:', error.message);
  }
}

runCourseServiceTest();
