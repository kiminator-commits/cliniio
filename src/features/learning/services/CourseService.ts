import { supabase } from '@/lib/supabaseClient';

export const CourseService = {
  // 🧩 1️⃣ Fetch course data from knowledge_hub_content (flat structure)
  async getCourse(courseId: string) {
    const { data: course, error } = await supabase
      .from('knowledge_hub_content')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;

    // Simulate hierarchical structure for CourseViewer compatibility
    return {
      id: course.id,
      title: course.title,
      description: course.description || '',
      tags: course.tags || [],
      estimated_duration: course.estimated_duration,
      status: course.status,
      knowledge_hub_modules: [
        {
          id: `${course.id}-module-1`,
          title: 'Main Content',
          position: 1,
          knowledge_hub_lessons: [
            {
              id: course.id,
              title: course.title,
              content: course.content || { body: course.description || '' },
              position: 1,
              estimated_duration: course.estimated_duration,
            },
          ],
        },
      ],
    };
  },

  // ✅ 2️⃣ Track lesson completion and award XP
  async markLessonComplete(userId: string, lessonId: string) {
    try {
      // --- 1️⃣  Mark the lesson complete in progress table ---
      const { error: progressError } = await supabase
        .from('knowledge_hub_user_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            status: 'completed',
            progress: 100,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );

      if (progressError) throw progressError;

      // --- 2️⃣  Fetch XP value from lesson/course ---
      // Since we're using knowledge_hub_content table, we'll use a default point value
      // In a real implementation, you might want to add a points field to knowledge_hub_content
      const { data: lessonData, error: lessonError } = await supabase
        .from('knowledge_hub_content')
        .select('id, title, difficulty_level, estimated_duration')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      // Calculate points based on difficulty and duration (fallback since no points field exists)
      const difficultyMultiplier =
        lessonData?.difficulty_level === 'advanced'
          ? 3
          : lessonData?.difficulty_level === 'intermediate'
            ? 2
            : 1;
      const durationMultiplier = lessonData?.estimated_duration
        ? Math.min(lessonData.estimated_duration / 30, 3)
        : 1; // 30 min = 1x, max 3x
      const pointsEarned = Math.round(
        25 * difficultyMultiplier * durationMultiplier
      );

      // --- 3️⃣  Check for duplicate XP awards ---
      const { data: existingAward } = await supabase
        .from('home_challenge_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', lessonId)
        .maybeSingle();

      if (existingAward) {
        console.log('⚠️ XP already awarded for this lesson.');
        return { success: true, pointsEarned: 0 };
      }

      // --- 4️⃣  Award XP points ---
      const { error: xpError } = await supabase
        .from('home_challenge_completions')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          challenge_id: lessonId, // Using challenge_id as the related record identifier
          points_earned: pointsEarned,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

      if (xpError) throw xpError;

      // --- 5️⃣  Sync XP to global gamification stats ---
      const { error: statsError } = await supabase.rpc('increment_user_xp', {
        user_id_input: userId,
        xp_increment: pointsEarned,
      });

      if (statsError) {
        console.warn(
          '⚠️ Failed to sync XP to global stats:',
          statsError.message
        );
      }

      console.log(`🏆 ${pointsEarned} XP awarded for lesson ${lessonId}`);

      return { success: true, pointsEarned };
    } catch (error) {
      console.error('Error marking lesson complete and awarding XP:', error);
      return { success: false, pointsEarned: 0 };
    }
  },

  // ✅ 3️⃣ Compute user progress per course
  async getUserProgress(userId: string, courseId: string) {
    // For flat structure, each course has only 1 lesson
    const { data, error } = await supabase
      .from('knowledge_hub_user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', courseId);

    if (error) throw error;

    const completedLessons = data.length > 0 ? 1 : 0;
    const totalLessons = 1;
    const progressPercent = completedLessons > 0 ? 100 : 0;

    return {
      completedLessons,
      totalLessons,
      progressPercent,
    };
  },

  // ✅ 4️⃣ Resume from last incomplete lesson
  async resumeCourse(userId: string, courseId: string) {
    // For flat structure, return the course ID as the lesson ID
    return courseId;
  },
};
