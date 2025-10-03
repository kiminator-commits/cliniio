-- =====================================================
-- INVENTORY MODULE MIGRATION
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- INVENTORY CORE TABLES
-- =====================================================

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    location VARCHAR(255),
    room VARCHAR(100),
    shelf VARCHAR(100),
    bin VARCHAR(100),
    unit_of_measure VARCHAR(50) DEFAULT 'piece',
    current_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 0,
    maximum_quantity DECIMAL(10,2) DEFAULT 0,
    reorder_point DECIMAL(10,2) DEFAULT 0,
    reorder_quantity DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued', 'quarantine')),
    condition_status VARCHAR(50) DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
    expiration_date DATE,
    last_audit_date TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'transfer', 'audit', 'disposal', 'return')),
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    reference_number VARCHAR(100),
    reference_type VARCHAR(50),
    reference_id UUID,
    location_from VARCHAR(255),
    location_to VARCHAR(255),
    reason VARCHAR(255),
    notes TEXT,
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiration_date DATE,
    supplier VARCHAR(255),
    po_number VARCHAR(100),
    invoice_number VARCHAR(100),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Inventory suppliers table
CREATE TABLE IF NOT EXISTS inventory_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    website VARCHAR(255),
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Inventory categories table
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES inventory_categories(id),
    color VARCHAR(7),
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Inventory audits table
CREATE TABLE IF NOT EXISTS inventory_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    audit_name VARCHAR(255) NOT NULL,
    audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN ('full', 'partial', 'cycle', 'random')),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    total_items INTEGER DEFAULT 0,
    audited_items INTEGER DEFAULT 0,
    discrepancies INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Inventory audit items table
CREATE TABLE IF NOT EXISTS inventory_audit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES inventory_audits(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    expected_quantity DECIMAL(10,2) NOT NULL,
    actual_quantity DECIMAL(10,2),
    variance DECIMAL(10,2),
    variance_percentage DECIMAL(5,2),
    notes TEXT,
    audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    audited_by UUID REFERENCES users(id)
);

-- Inventory alerts table
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock', 'discrepancy')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Inventory reports table
CREATE TABLE IF NOT EXISTS inventory_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('stock_level', 'movement', 'value', 'aging', 'turnover', 'supplier', 'category')),
    report_name VARCHAR(255) NOT NULL,
    parameters JSONB,
    file_path VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    generated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Inventory items indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_facility_id ON inventory_items(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiration_date ON inventory_items(expiration_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_last_audit_date ON inventory_items(last_audit_date);

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_facility_id ON inventory_transactions(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);

-- Inventory suppliers indexes
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_facility_id ON inventory_suppliers(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_status ON inventory_suppliers(status);
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_name ON inventory_suppliers(name);

-- Inventory categories indexes
CREATE INDEX IF NOT EXISTS idx_inventory_categories_facility_id ON inventory_categories(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent ON inventory_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_active ON inventory_categories(is_active);

-- Inventory audits indexes
CREATE INDEX IF NOT EXISTS idx_inventory_audits_facility_id ON inventory_audits(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audits_status ON inventory_audits(status);
CREATE INDEX IF NOT EXISTS idx_inventory_audits_date ON inventory_audits(start_date, end_date);

-- Inventory audit items indexes
CREATE INDEX IF NOT EXISTS idx_inventory_audit_items_audit_id ON inventory_audit_items(audit_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_items_item_id ON inventory_audit_items(item_id);

-- Inventory alerts indexes
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_facility_id ON inventory_alerts(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_item_id ON inventory_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type ON inventory_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_severity ON inventory_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_read ON inventory_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(is_resolved);

-- Inventory reports indexes
CREATE INDEX IF NOT EXISTS idx_inventory_reports_facility_id ON inventory_reports(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reports_type ON inventory_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_inventory_reports_status ON inventory_reports(status);
CREATE INDEX IF NOT EXISTS idx_inventory_reports_created_at ON inventory_reports(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reports ENABLE ROW LEVEL SECURITY;

-- Inventory items policies
CREATE POLICY "Users can view inventory items in their facilities" ON inventory_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_items.facility_id
        )
    );

CREATE POLICY "Users can insert inventory items in their facilities" ON inventory_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_items.facility_id
        )
    );

CREATE POLICY "Users can update inventory items in their facilities" ON inventory_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_items.facility_id
        )
    );

CREATE POLICY "Users can delete inventory items in their facilities" ON inventory_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_items.facility_id
        )
    );

-- Inventory transactions policies
CREATE POLICY "Users can view inventory transactions in their facilities" ON inventory_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_transactions.facility_id
        )
    );

CREATE POLICY "Users can insert inventory transactions in their facilities" ON inventory_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_transactions.facility_id
        )
    );

-- Inventory suppliers policies
CREATE POLICY "Users can view inventory suppliers in their facilities" ON inventory_suppliers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_suppliers.facility_id
        )
    );

CREATE POLICY "Users can manage inventory suppliers in their facilities" ON inventory_suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_suppliers.facility_id
        )
    );

-- Inventory categories policies
CREATE POLICY "Users can view inventory categories in their facilities" ON inventory_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_categories.facility_id
        )
    );

CREATE POLICY "Users can manage inventory categories in their facilities" ON inventory_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_categories.facility_id
        )
    );

-- Inventory audits policies
CREATE POLICY "Users can view inventory audits in their facilities" ON inventory_audits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_audits.facility_id
        )
    );

CREATE POLICY "Users can manage inventory audits in their facilities" ON inventory_audits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_audits.facility_id
        )
    );

-- Inventory audit items policies
CREATE POLICY "Users can view inventory audit items in their facilities" ON inventory_audit_items
    FOR SELECT USING (
        audit_id IN (
            SELECT id FROM inventory_audits 
            WHERE facility_id IN (
                SELECT facility_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage inventory audit items in their facilities" ON inventory_audit_items
    FOR ALL USING (
        audit_id IN (
            SELECT id FROM inventory_audits 
            WHERE facility_id IN (
                SELECT facility_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Inventory alerts policies
CREATE POLICY "Users can view inventory alerts in their facilities" ON inventory_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_alerts.facility_id
        )
    );

CREATE POLICY "Users can manage inventory alerts in their facilities" ON inventory_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_alerts.facility_id
        )
    );

-- Inventory reports policies
CREATE POLICY "Users can view inventory reports in their facilities" ON inventory_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_reports.facility_id
        )
    );

CREATE POLICY "Users can manage inventory reports in their facilities" ON inventory_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = inventory_reports.facility_id
        )
    );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update inventory item quantities on transaction
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current quantity based on transaction type
    IF NEW.transaction_type = 'in' THEN
        UPDATE inventory_items 
        SET current_quantity = current_quantity + NEW.quantity,
            total_value = (current_quantity + NEW.quantity) * unit_cost,
            updated_at = NOW(),
            updated_by = NEW.created_by
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type = 'out' THEN
        UPDATE inventory_items 
        SET current_quantity = current_quantity - NEW.quantity,
            total_value = (current_quantity - NEW.quantity) * unit_cost,
            updated_at = NOW(),
            updated_by = NEW.created_by
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type = 'adjustment' THEN
        UPDATE inventory_items 
        SET current_quantity = NEW.quantity,
            total_value = NEW.quantity * unit_cost,
            updated_at = NOW(),
            updated_by = NEW.created_by
        WHERE id = NEW.item_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_quantity
    AFTER INSERT ON inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_quantity();

-- Create low stock alerts
CREATE OR REPLACE FUNCTION create_low_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if quantity is below reorder point
    IF NEW.current_quantity <= NEW.reorder_point AND NEW.current_quantity > 0 THEN
        INSERT INTO inventory_alerts (
            facility_id, item_id, alert_type, severity, title, message, created_by
        ) VALUES (
            NEW.facility_id, NEW.id, 'low_stock', 
            CASE 
                WHEN NEW.current_quantity = 0 THEN 'critical'
                WHEN NEW.current_quantity <= NEW.reorder_point * 0.5 THEN 'high'
                ELSE 'medium'
            END,
            'Low Stock Alert: ' || NEW.name,
            'Item ' || NEW.name || ' is running low on stock. Current quantity: ' || NEW.current_quantity || ' ' || NEW.unit_of_measure,
            NEW.updated_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_low_stock_alert
    AFTER UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION create_low_stock_alert();

-- Create expiration alerts
CREATE OR REPLACE FUNCTION create_expiration_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if item is expiring soon (within 30 days)
    IF NEW.expiration_date IS NOT NULL AND NEW.expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN
        INSERT INTO inventory_alerts (
            facility_id, item_id, alert_type, severity, title, message, created_by
        ) VALUES (
            NEW.facility_id, NEW.id, 'expiring_soon', 
            CASE 
                WHEN NEW.expiration_date <= CURRENT_DATE THEN 'critical'
                WHEN NEW.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'high'
                ELSE 'medium'
            END,
            'Expiration Alert: ' || NEW.name,
            'Item ' || NEW.name || ' expires on ' || NEW.expiration_date,
            NEW.updated_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_expiration_alert
    AFTER INSERT OR UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION create_expiration_alert();

-- Update audit date on audit completion
CREATE OR REPLACE FUNCTION update_audit_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last audit date when audit is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE inventory_items 
        SET last_audit_date = NOW(),
            updated_at = NOW(),
            updated_by = NEW.updated_by
        WHERE id IN (
            SELECT item_id FROM inventory_audit_items WHERE audit_id = NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_audit_date
    AFTER UPDATE ON inventory_audits
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_date();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Get inventory analytics
CREATE OR REPLACE FUNCTION get_inventory_analytics(facility_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_items', COUNT(*),
        'low_stock_items', COUNT(*) FILTER (WHERE current_quantity <= reorder_point),
        'out_of_stock_items', COUNT(*) FILTER (WHERE current_quantity = 0),
        'expiring_soon_items', COUNT(*) FILTER (WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days'),
        'total_value', COALESCE(SUM(total_value), 0),
        'categories_count', COUNT(DISTINCT category),
        'suppliers_count', COUNT(DISTINCT supplier)
    ) INTO result
    FROM inventory_items
    WHERE facility_id = facility_uuid AND status = 'active';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get inventory turnover rate
CREATE OR REPLACE FUNCTION get_inventory_turnover(facility_uuid UUID, days INTEGER DEFAULT 365)
RETURNS TABLE (
    item_id UUID,
    item_name VARCHAR(255),
    category VARCHAR(100),
    avg_quantity DECIMAL(10,2),
    total_out DECIMAL(10,2),
    turnover_rate DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.id,
        ii.name,
        ii.category,
        AVG(ii.current_quantity) as avg_quantity,
        COALESCE(SUM(it.quantity), 0) as total_out,
        CASE 
            WHEN AVG(ii.current_quantity) > 0 THEN COALESCE(SUM(it.quantity), 0) / AVG(ii.current_quantity)
            ELSE 0
        END as turnover_rate
    FROM inventory_items ii
    LEFT JOIN inventory_transactions it ON ii.id = it.item_id 
        AND it.transaction_type = 'out' 
        AND it.transaction_date >= CURRENT_DATE - (days || ' days')::INTERVAL
    WHERE ii.facility_id = facility_uuid AND ii.status = 'active'
    GROUP BY ii.id, ii.name, ii.category
    ORDER BY turnover_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get inventory movement summary
CREATE OR REPLACE FUNCTION get_inventory_movement_summary(facility_uuid UUID, start_date DATE, end_date DATE)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_transactions', COUNT(*),
        'ins', COUNT(*) FILTER (WHERE transaction_type = 'in'),
        'outs', COUNT(*) FILTER (WHERE transaction_type = 'out'),
        'adjustments', COUNT(*) FILTER (WHERE transaction_type = 'adjustment'),
        'transfers', COUNT(*) FILTER (WHERE transaction_type = 'transfer'),
        'total_value_in', COALESCE(SUM(total_cost) FILTER (WHERE transaction_type = 'in'), 0),
        'total_value_out', COALESCE(SUM(total_cost) FILTER (WHERE transaction_type = 'out'), 0),
        'most_active_items', (
            SELECT jsonb_agg(jsonb_build_object(
                'item_id', item_id,
                'item_name', name,
                'transaction_count', transaction_count
            ))
            FROM (
                SELECT 
                    it.item_id,
                    ii.name,
                    COUNT(*) as transaction_count
                FROM inventory_transactions it
                JOIN inventory_items ii ON it.item_id = ii.id
                WHERE it.facility_id = facility_uuid 
                    AND it.transaction_date::DATE BETWEEN start_date AND end_date
                GROUP BY it.item_id, ii.name
                ORDER BY transaction_count DESC
                LIMIT 10
            ) subq
        )
    ) INTO result
    FROM inventory_transactions
    WHERE facility_id = facility_uuid 
        AND transaction_date::DATE BETWEEN start_date AND end_date;
    
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