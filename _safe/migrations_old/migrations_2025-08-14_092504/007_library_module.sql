-- =====================================================
-- LIBRARY MODULE MIGRATION
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- LIBRARY CORE TABLES
-- =====================================================

-- Library collections table
CREATE TABLE IF NOT EXISTS library_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Library assets table
CREATE TABLE IF NOT EXISTS library_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES library_collections(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('document', 'image', 'video', 'audio', 'presentation', 'spreadsheet', 'other')),
    tags TEXT[],
    metadata JSONB,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Library asset versions table
CREATE TABLE IF NOT EXISTS library_asset_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES library_assets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    change_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Library asset downloads table
CREATE TABLE IF NOT EXISTS library_asset_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES library_assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Library asset views table
CREATE TABLE IF NOT EXISTS library_asset_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES library_assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    view_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Library collections indexes
CREATE INDEX IF NOT EXISTS idx_library_collections_facility_id ON library_collections(facility_id);
CREATE INDEX IF NOT EXISTS idx_library_collections_public ON library_collections(is_public);
CREATE INDEX IF NOT EXISTS idx_library_collections_featured ON library_collections(is_featured);

-- Library assets indexes
CREATE INDEX IF NOT EXISTS idx_library_assets_facility_id ON library_assets(facility_id);
CREATE INDEX IF NOT EXISTS idx_library_assets_collection_id ON library_assets(collection_id);
CREATE INDEX IF NOT EXISTS idx_library_assets_type ON library_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_library_assets_public ON library_assets(is_public);
CREATE INDEX IF NOT EXISTS idx_library_assets_tags ON library_assets USING GIN (tags);

-- Library asset versions indexes
CREATE INDEX IF NOT EXISTS idx_library_asset_versions_asset_id ON library_asset_versions(asset_id);
CREATE INDEX IF NOT EXISTS idx_library_asset_versions_version ON library_asset_versions(version_number);

-- Library asset downloads indexes
CREATE INDEX IF NOT EXISTS idx_library_asset_downloads_asset_id ON library_asset_downloads(asset_id);
CREATE INDEX IF NOT EXISTS idx_library_asset_downloads_user ON library_asset_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_library_asset_downloads_date ON library_asset_downloads(download_date);

-- Library asset views indexes
CREATE INDEX IF NOT EXISTS idx_library_asset_views_asset_id ON library_asset_views(asset_id);
CREATE INDEX IF NOT EXISTS idx_library_asset_views_user ON library_asset_views(user_id);
CREATE INDEX IF NOT EXISTS idx_library_asset_views_date ON library_asset_views(view_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE library_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_asset_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_asset_views ENABLE ROW LEVEL SECURITY;

-- Library collections policies
CREATE POLICY "Users can view public library collections in their facilities" ON library_collections
    FOR SELECT USING (
        is_public = true AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = library_collections.facility_id
        )
    );

CREATE POLICY "Users can manage library collections in their facilities" ON library_collections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = library_collections.facility_id
        )
    );

-- Library assets policies
CREATE POLICY "Users can view public library assets in their facilities" ON library_assets
    FOR SELECT USING (
        is_public = true AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = library_assets.facility_id
        )
    );

CREATE POLICY "Users can manage library assets in their facilities" ON library_assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = library_assets.facility_id
        )
    );

-- Library asset versions policies
CREATE POLICY "Users can view library asset versions" ON library_asset_versions
    FOR SELECT USING (
        asset_id IN (
            SELECT id FROM library_assets 
            WHERE is_public = true AND EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = library_assets.facility_id
            )
        )
    );

CREATE POLICY "Users can manage library asset versions in their facilities" ON library_asset_versions
    FOR ALL USING (
        asset_id IN (
            SELECT id FROM library_assets 
            WHERE EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND facility_id = library_assets.facility_id
            )
        )
    );

-- Library asset downloads policies
CREATE POLICY "Users can view library asset downloads" ON library_asset_downloads
    FOR SELECT USING (
        asset_id IN (
            SELECT id FROM library_assets 
            WHERE is_public = true
        )
    );

CREATE POLICY "Users can create library asset downloads" ON library_asset_downloads
    FOR INSERT WITH CHECK (true);

-- Library asset views policies
CREATE POLICY "Users can view library asset views" ON library_asset_views
    FOR SELECT USING (
        asset_id IN (
            SELECT id FROM library_assets 
            WHERE is_public = true
        )
    );

CREATE POLICY "Users can create library asset views" ON library_asset_views
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update asset download count
CREATE OR REPLACE FUNCTION update_asset_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE library_assets 
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = NEW.asset_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asset_download_count
    AFTER INSERT ON library_asset_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_asset_download_count();

-- Update asset view count
CREATE OR REPLACE FUNCTION update_asset_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE library_assets 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = NEW.asset_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asset_view_count
    AFTER INSERT ON library_asset_views
    FOR EACH ROW
    EXECUTE FUNCTION update_asset_view_count();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Get library analytics
CREATE OR REPLACE FUNCTION get_library_analytics(facility_uuid UUID, days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_assets', COUNT(*),
        'total_collections', (
            SELECT COUNT(*) FROM library_collections WHERE facility_id = facility_uuid
        ),
        'total_downloads', COALESCE(SUM(download_count), 0),
        'total_views', COALESCE(SUM(view_count), 0),
        'assets_by_type', (
            SELECT jsonb_object_agg(asset_type, count)
            FROM (
                SELECT asset_type, COUNT(*) as count
                FROM library_assets
                WHERE facility_id = facility_uuid
                GROUP BY asset_type
            ) subq
        ),
        'popular_assets', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'title', title,
                'download_count', download_count,
                'view_count', view_count
            ))
            FROM (
                SELECT id, title, download_count, view_count
                FROM library_assets
                WHERE facility_id = facility_uuid
                ORDER BY download_count DESC
                LIMIT 10
            ) subq
        ),
        'recent_assets', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'title', title,
                'asset_type', asset_type,
                'created_at', created_at
            ))
            FROM (
                SELECT id, title, asset_type, created_at
                FROM library_assets
                WHERE facility_id = facility_uuid
                ORDER BY created_at DESC
                LIMIT 10
            ) subq
        )
    ) INTO result
    FROM library_assets
    WHERE facility_id = facility_uuid;
    
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