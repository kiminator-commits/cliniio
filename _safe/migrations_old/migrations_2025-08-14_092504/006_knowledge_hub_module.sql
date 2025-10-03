-- =====================================================
-- KNOWLEDGE HUB MODULE MIGRATION
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- KNOWLEDGE HUB CORE TABLES
-- =====================================================

-- Knowledge categories table
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES knowledge_categories(id),
    icon VARCHAR(50),
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Knowledge articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'review')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
    author_id UUID REFERENCES users(id),
    editor_id UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    reading_time_minutes INTEGER,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    featured BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Knowledge article versions table
CREATE TABLE IF NOT EXISTS knowledge_article_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[],
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Knowledge article attachments table
CREATE TABLE IF NOT EXISTS knowledge_article_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Knowledge article comments table
CREATE TABLE IF NOT EXISTS knowledge_article_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES knowledge_article_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    edited_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge article ratings table
CREATE TABLE IF NOT EXISTS knowledge_article_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- Knowledge article views table
CREATE TABLE IF NOT EXISTS knowledge_article_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    view_duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge search logs table
CREATE TABLE IF NOT EXISTS knowledge_search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    search_results_count INTEGER,
    clicked_article_id UUID REFERENCES knowledge_articles(id) ON DELETE SET NULL,
    search_filters JSONB,
    search_duration_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge bookmarks table
CREATE TABLE IF NOT EXISTS knowledge_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    folder_name VARCHAR(100) DEFAULT 'Default',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Knowledge learning paths table
CREATE TABLE IF NOT EXISTS knowledge_learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Knowledge learning path steps table
CREATE TABLE IF NOT EXISTS knowledge_learning_path_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES knowledge_learning_paths(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    article_id UUID REFERENCES knowledge_articles(id) ON DELETE SET NULL,
    step_type VARCHAR(50) DEFAULT 'article' CHECK (step_type IN ('article', 'quiz', 'video', 'assignment')),
    estimated_duration_minutes INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge user progress table
CREATE TABLE IF NOT EXISTS knowledge_user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES knowledge_learning_paths(id) ON DELETE CASCADE,
    step_id UUID REFERENCES knowledge_learning_path_steps(id) ON DELETE CASCADE,
    article_id UUID REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    progress_status VARCHAR(50) DEFAULT 'not_started' CHECK (progress_status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge quizzes table
CREATE TABLE IF NOT EXISTS knowledge_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    time_limit_minutes INTEGER,
    passing_score_percentage INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Knowledge quiz questions table
CREATE TABLE IF NOT EXISTS knowledge_quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES knowledge_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay')),
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    question_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge quiz attempts table
CREATE TABLE IF NOT EXISTS knowledge_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES knowledge_quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    score_percentage DECIMAL(5,2),
    total_points INTEGER,
    earned_points INTEGER,
    time_taken_minutes INTEGER,
    answers JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Knowledge feedback table
CREATE TABLE IF NOT EXISTS knowledge_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('article', 'quiz', 'learning_path', 'general', 'bug_report', 'feature_request')),
    reference_id UUID,
    reference_type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'rejected')),
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Knowledge categories indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_facility_id ON knowledge_categories(facility_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_parent ON knowledge_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_active ON knowledge_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_sort ON knowledge_categories(sort_order);

-- Knowledge articles indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_facility_id ON knowledge_articles(facility_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category_id ON knowledge_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_status ON knowledge_articles(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_visibility ON knowledge_articles(visibility);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_author ON knowledge_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_published ON knowledge_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_featured ON knowledge_articles(featured);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tags ON knowledge_articles USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_title_gin ON knowledge_articles USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_content_gin ON knowledge_articles USING GIN (to_tsvector('english', content));

-- Knowledge article versions indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_article_versions_article_id ON knowledge_article_versions(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_versions_version ON knowledge_article_versions(version_number);

-- Knowledge article attachments indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_article_attachments_article_id ON knowledge_article_attachments(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_attachments_public ON knowledge_article_attachments(is_public);

-- Knowledge article comments indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_article_comments_article_id ON knowledge_article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_comments_parent ON knowledge_article_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_comments_user ON knowledge_article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_comments_approved ON knowledge_article_comments(is_approved);

-- Knowledge article ratings indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_article_ratings_article_id ON knowledge_article_ratings(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_ratings_user ON knowledge_article_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_ratings_rating ON knowledge_article_ratings(rating);

-- Knowledge article views indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_article_views_article_id ON knowledge_article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_views_user ON knowledge_article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_views_created ON knowledge_article_views(created_at);

-- Knowledge search logs indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_search_logs_facility_id ON knowledge_search_logs(facility_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_search_logs_user ON knowledge_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_search_logs_query ON knowledge_search_logs USING GIN (to_tsvector('english', search_query));
CREATE INDEX IF NOT EXISTS idx_knowledge_search_logs_created ON knowledge_search_logs(created_at);

-- Knowledge bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_bookmarks_user ON knowledge_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bookmarks_article ON knowledge_bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bookmarks_folder ON knowledge_bookmarks(folder_name);

-- Knowledge learning paths indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_learning_paths_facility_id ON knowledge_learning_paths(facility_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_learning_paths_category ON knowledge_learning_paths(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_learning_paths_active ON knowledge_learning_paths(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_learning_paths_featured ON knowledge_learning_paths(featured);

-- Knowledge learning path steps indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_learning_path_steps_path_id ON knowledge_learning_path_steps(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_learning_path_steps_order ON knowledge_learning_path_steps(step_order);
CREATE INDEX IF NOT EXISTS idx_knowledge_learning_path_steps_article ON knowledge_learning_path_steps(article_id);

-- Knowledge user progress indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_user_progress_user ON knowledge_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_progress_path ON knowledge_user_progress(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_progress_step ON knowledge_user_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_progress_article ON knowledge_user_progress(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_progress_status ON knowledge_user_progress(progress_status);

-- Knowledge quizzes indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_quizzes_facility_id ON knowledge_quizzes(facility_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_quizzes_category ON knowledge_quizzes(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_quizzes_active ON knowledge_quizzes(is_active);

-- Knowledge quiz questions indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_quiz_questions_quiz_id ON knowledge_quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_quiz_questions_order ON knowledge_quiz_questions(question_order);
CREATE INDEX IF NOT EXISTS idx_knowledge_quiz_questions_active ON knowledge_quiz_questions(is_active);

-- Knowledge quiz attempts indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_quiz_attempts_user ON knowledge_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_quiz_attempts_quiz ON knowledge_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_quiz_attempts_status ON knowledge_quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_quiz_attempts_completed ON knowledge_quiz_attempts(completed_at);

-- Knowledge feedback indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_facility_id ON knowledge_feedback(facility_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_user ON knowledge_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_type ON knowledge_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_status ON knowledge_feedback(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_priority ON knowledge_feedback(priority);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_learning_path_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_feedback ENABLE ROW LEVEL SECURITY;

-- Knowledge categories policies
CREATE POLICY "Users can view knowledge categories in their facilities" ON knowledge_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_categories.facility_id
        )
    );

CREATE POLICY "Users can manage knowledge categories in their facilities" ON knowledge_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_categories.facility_id
        )
    );

-- Knowledge articles policies
CREATE POLICY "Users can view published knowledge articles in their facilities" ON knowledge_articles
    FOR SELECT USING (
        status = 'published' AND (
            visibility = 'public' OR 
            (visibility = 'restricted' AND EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = knowledge_articles.facility_id
            )) OR
            (visibility = 'private' AND author_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage knowledge articles in their facilities" ON knowledge_articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_articles.facility_id
        )
    );

-- Knowledge article versions policies
CREATE POLICY "Users can view knowledge article versions" ON knowledge_article_versions
    FOR SELECT USING (
        article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE status = 'published' AND (
                visibility = 'public' OR 
                (visibility = 'restricted' AND EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND facility_id = knowledge_articles.facility_id
                )) OR
                (visibility = 'private' AND author_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can manage knowledge article versions in their facilities" ON knowledge_article_versions
    FOR ALL USING (
        article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = knowledge_articles.facility_id
            )
        )
    );

-- Knowledge article attachments policies
CREATE POLICY "Users can view public knowledge article attachments" ON knowledge_article_attachments
    FOR SELECT USING (
        is_public = true AND article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE status = 'published' AND visibility = 'public'
        )
    );

CREATE POLICY "Users can manage knowledge article attachments in their facilities" ON knowledge_article_attachments
    FOR ALL USING (
        article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = knowledge_articles.facility_id
            )
        )
    );

-- Knowledge article comments policies
CREATE POLICY "Users can view approved knowledge article comments" ON knowledge_article_comments
    FOR SELECT USING (
        is_approved = true AND article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE status = 'published' AND visibility = 'public'
        )
    );

CREATE POLICY "Users can create knowledge article comments" ON knowledge_article_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE status = 'published' AND allow_comments = true
        )
    );

CREATE POLICY "Users can update their own knowledge article comments" ON knowledge_article_comments
    FOR UPDATE USING (user_id = auth.uid());

-- Knowledge article ratings policies
CREATE POLICY "Users can view knowledge article ratings" ON knowledge_article_ratings
    FOR SELECT USING (
        article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE status = 'published' AND visibility = 'public'
        )
    );

CREATE POLICY "Users can manage their own knowledge article ratings" ON knowledge_article_ratings
    FOR ALL USING (user_id = auth.uid());

-- Knowledge article views policies
CREATE POLICY "Users can view knowledge article views" ON knowledge_article_views
    FOR SELECT USING (
        article_id IN (
            SELECT id FROM knowledge_articles 
            WHERE status = 'published'
        )
    );

CREATE POLICY "Users can create knowledge article views" ON knowledge_article_views
    FOR INSERT WITH CHECK (true);

-- Knowledge search logs policies
CREATE POLICY "Users can view their own knowledge search logs" ON knowledge_search_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create knowledge search logs" ON knowledge_search_logs
    FOR INSERT WITH CHECK (true);

-- Knowledge bookmarks policies
CREATE POLICY "Users can manage their own knowledge bookmarks" ON knowledge_bookmarks
    FOR ALL USING (user_id = auth.uid());

-- Knowledge learning paths policies
CREATE POLICY "Users can view active knowledge learning paths in their facilities" ON knowledge_learning_paths
    FOR SELECT USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_learning_paths.facility_id
        )
    );

CREATE POLICY "Users can manage knowledge learning paths in their facilities" ON knowledge_learning_paths
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_learning_paths.facility_id
        )
    );

-- Knowledge learning path steps policies
CREATE POLICY "Users can view knowledge learning path steps" ON knowledge_learning_path_steps
    FOR SELECT USING (
        learning_path_id IN (
            SELECT id FROM knowledge_learning_paths 
            WHERE is_active = true AND EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = knowledge_learning_paths.facility_id
            )
        )
    );

CREATE POLICY "Users can manage knowledge learning path steps in their facilities" ON knowledge_learning_path_steps
    FOR ALL USING (
        learning_path_id IN (
            SELECT id FROM knowledge_learning_paths 
            WHERE EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = knowledge_learning_paths.facility_id
            )
        )
    );

-- Knowledge user progress policies
CREATE POLICY "Users can manage their own knowledge progress" ON knowledge_user_progress
    FOR ALL USING (user_id = auth.uid());

-- Knowledge quizzes policies
CREATE POLICY "Users can view active knowledge quizzes in their facilities" ON knowledge_quizzes
    FOR SELECT USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_quizzes.facility_id
        )
    );

CREATE POLICY "Users can manage knowledge quizzes in their facilities" ON knowledge_quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_quizzes.facility_id
        )
    );

-- Knowledge quiz questions policies
CREATE POLICY "Users can view knowledge quiz questions" ON knowledge_quiz_questions
    FOR SELECT USING (
        is_active = true AND quiz_id IN (
            SELECT id FROM knowledge_quizzes 
            WHERE is_active = true AND EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = knowledge_quizzes.facility_id
            )
        )
    );

CREATE POLICY "Users can manage knowledge quiz questions in their facilities" ON knowledge_quiz_questions
    FOR ALL USING (
        quiz_id IN (
            SELECT id FROM knowledge_quizzes 
            WHERE EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = knowledge_quizzes.facility_id
            )
        )
    );

-- Knowledge quiz attempts policies
CREATE POLICY "Users can manage their own knowledge quiz attempts" ON knowledge_quiz_attempts
    FOR ALL USING (user_id = auth.uid());

-- Knowledge feedback policies
CREATE POLICY "Users can view knowledge feedback in their facilities" ON knowledge_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_feedback.facility_id
        )
    );

CREATE POLICY "Users can create knowledge feedback in their facilities" ON knowledge_feedback
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_feedback.facility_id
        )
    );

CREATE POLICY "Users can update knowledge feedback in their facilities" ON knowledge_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = knowledge_feedback.facility_id
        )
    );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create article version on update
CREATE OR REPLACE FUNCTION create_article_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a new version when article content changes
    IF OLD.content != NEW.content OR OLD.title != NEW.title THEN
        INSERT INTO knowledge_article_versions (
            article_id, version_number, title, content, summary, tags, author_id, created_by
        ) VALUES (
            NEW.id, NEW.version, OLD.title, OLD.content, OLD.summary, OLD.tags, OLD.author_id, NEW.updated_by
        );
        
        -- Increment version number
        NEW.version = OLD.version + 1;
        NEW.last_modified_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_article_version
    BEFORE UPDATE ON knowledge_articles
    FOR EACH ROW
    EXECUTE FUNCTION create_article_version();

-- Update article view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would update view count in the articles table
    -- For now, we'll just log the view
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_article_view_count
    AFTER INSERT ON knowledge_article_views
    FOR EACH ROW
    EXECUTE FUNCTION update_article_view_count();

-- Update attachment download count
CREATE OR REPLACE FUNCTION update_attachment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would update download count
    -- For now, we'll just log the download
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Search knowledge articles
CREATE OR REPLACE FUNCTION search_knowledge_articles(
    facility_uuid UUID,
    search_query TEXT,
    category_filter UUID DEFAULT NULL,
    status_filter VARCHAR(50) DEFAULT 'published',
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    summary TEXT,
    category_name VARCHAR(255),
    author_name VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    rating_avg DECIMAL(3,2),
    view_count BIGINT,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ka.id,
        ka.title,
        ka.summary,
        kc.name as category_name,
        u.full_name as author_name,
        ka.published_at,
        COALESCE(AVG(kar.rating), 0) as rating_avg,
        COUNT(DISTINCT kav.id) as view_count,
        ts_rank(to_tsvector('english', ka.title || ' ' || COALESCE(ka.content, '')), plainto_tsquery('english', search_query)) as relevance_score
    FROM knowledge_articles ka
    LEFT JOIN knowledge_categories kc ON ka.category_id = kc.id
    LEFT JOIN users u ON ka.author_id = u.id
    LEFT JOIN knowledge_article_ratings kar ON ka.id = kar.article_id
    LEFT JOIN knowledge_article_views kav ON ka.id = kav.article_id
    WHERE ka.facility_id = facility_uuid
        AND ka.status = status_filter
        AND (category_filter IS NULL OR ka.category_id = category_filter)
        AND (
            ka.title ILIKE '%' || search_query || '%'
            OR ka.content ILIKE '%' || search_query || '%'
            OR ka.tags && string_to_array(search_query, ' ')
        )
    GROUP BY ka.id, ka.title, ka.summary, kc.name, u.full_name, ka.published_at
    ORDER BY relevance_score DESC, ka.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get knowledge analytics
CREATE OR REPLACE FUNCTION get_knowledge_analytics(facility_uuid UUID, days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_articles', COUNT(*),
        'published_articles', COUNT(*) FILTER (WHERE status = 'published'),
        'total_views', COALESCE(SUM(view_count), 0),
        'total_ratings', COALESCE(SUM(rating_count), 0),
        'average_rating', COALESCE(AVG(average_rating), 0),
        'popular_articles', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'title', title,
                'view_count', view_count,
                'rating_avg', average_rating
            ))
            FROM (
                SELECT 
                    ka.id,
                    ka.title,
                    COUNT(DISTINCT kav.id) as view_count,
                    COALESCE(AVG(kar.rating), 0) as average_rating
                FROM knowledge_articles ka
                LEFT JOIN knowledge_article_views kav ON ka.id = kav.article_id
                LEFT JOIN knowledge_article_ratings kar ON ka.id = kar.article_id
                WHERE ka.facility_id = facility_uuid 
                    AND ka.status = 'published'
                    AND kav.created_at >= CURRENT_DATE - (days || ' days')::INTERVAL
                GROUP BY ka.id, ka.title
                ORDER BY view_count DESC
                LIMIT 10
            ) subq
        ),
        'recent_articles', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'title', title,
                'published_at', published_at,
                'author_name', author_name
            ))
            FROM (
                SELECT 
                    ka.id,
                    ka.title,
                    ka.published_at,
                    u.full_name as author_name
                FROM knowledge_articles ka
                LEFT JOIN users u ON ka.author_id = u.id
                WHERE ka.facility_id = facility_uuid 
                    AND ka.status = 'published'
                    AND ka.published_at >= CURRENT_DATE - (days || ' days')::INTERVAL
                ORDER BY ka.published_at DESC
                LIMIT 10
            ) subq
        ),
        'search_analytics', (
            SELECT jsonb_build_object(
                'total_searches', COUNT(*),
                'popular_queries', (
                    SELECT jsonb_agg(jsonb_build_object(
                        'query', search_query,
                        'count', query_count
                    ))
                    FROM (
                        SELECT 
                            search_query,
                            COUNT(*) as query_count
                        FROM knowledge_search_logs
                        WHERE facility_id = facility_uuid
                            AND created_at >= CURRENT_DATE - (days || ' days')::INTERVAL
                        GROUP BY search_query
                        ORDER BY query_count DESC
                        LIMIT 10
                    ) subq
                )
            )
            FROM knowledge_search_logs
            WHERE facility_id = facility_uuid
                AND created_at >= CURRENT_DATE - (days || ' days')::INTERVAL
        )
    ) INTO result
    FROM (
        SELECT 
            ka.id,
            ka.status,
            COUNT(DISTINCT kav.id) as view_count,
            COUNT(DISTINCT kar.id) as rating_count,
            AVG(kar.rating) as average_rating
        FROM knowledge_articles ka
        LEFT JOIN knowledge_article_views kav ON ka.id = kav.article_id
        LEFT JOIN knowledge_article_ratings kar ON ka.id = kar.article_id
        WHERE ka.facility_id = facility_uuid
        GROUP BY ka.id, ka.status
    ) article_stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user learning progress
CREATE OR REPLACE FUNCTION get_user_learning_progress(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_learning_paths', COUNT(DISTINCT klp.id),
        'completed_learning_paths', COUNT(DISTINCT klp.id) FILTER (WHERE progress_status = 'completed'),
        'in_progress_learning_paths', COUNT(DISTINCT klp.id) FILTER (WHERE progress_status = 'in_progress'),
        'total_articles_read', COUNT(DISTINCT kup.article_id) FILTER (WHERE kup.progress_status = 'completed'),
        'total_time_spent_hours', COALESCE(SUM(kup.time_spent_minutes), 0) / 60.0,
        'learning_paths', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', klp.id,
                'title', klp.title,
                'description', klp.description,
                'difficulty_level', klp.difficulty_level,
                'progress_status', kup.progress_status,
                'completion_percentage', kup.completion_percentage,
                'total_steps', step_count,
                'completed_steps', completed_step_count
            ))
            FROM (
                SELECT 
                    klp.id,
                    klp.title,
                    klp.description,
                    klp.difficulty_level,
                    COALESCE(kup.progress_status, 'not_started') as progress_status,
                    COALESCE(kup.completion_percentage, 0) as completion_percentage,
                    COUNT(klps.id) as step_count,
                    COUNT(klps.id) FILTER (WHERE kup_step.progress_status = 'completed') as completed_step_count
                FROM knowledge_learning_paths klp
                LEFT JOIN knowledge_user_progress kup ON klp.id = kup.learning_path_id AND kup.user_id = user_uuid
                LEFT JOIN knowledge_learning_path_steps klps ON klp.id = klps.learning_path_id
                LEFT JOIN knowledge_user_progress kup_step ON klps.id = kup_step.step_id AND kup_step.user_id = user_uuid
                WHERE klp.is_active = true
                GROUP BY klp.id, klp.title, klp.description, klp.difficulty_level, kup.progress_status, kup.completion_percentage
            ) subq
        )
    ) INTO result
    FROM knowledge_learning_paths klp
    LEFT JOIN knowledge_user_progress kup ON klp.id = kup.learning_path_id AND kup.user_id = user_uuid
    LEFT JOIN knowledge_user_progress kup_article ON kup_article.user_id = user_uuid
    WHERE klp.is_active = true;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (COMMENTED OUT - REQUIRES FACILITIES TO BE CREATED FIRST)
-- =====================================================

-- Sample data will be inserted after facilities are created
-- This ensures foreign key constraints are satisfied

-- =====================================================
-- MIGRATION COMPLETE
-- ===================================================== 