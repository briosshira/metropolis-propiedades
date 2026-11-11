-- ============================================================================
-- CRM INMOBILIARIO & MARKETPLACE MULTI-TENANT: SCHEMA & ROW-LEVEL SECURITY (RLS)
-- Database: PostgreSQL 14+ / Supabase
-- Target: High Concurrency Multi-Tenant Architecture with Commissions & Properties
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TENANTS TABLE (Root Entity for Tenant Isolation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'pro',
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- ----------------------------------------------------------------------------
-- 2. USERS / TENANT MEMBERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent', 'captador', 'viewer')),
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- ----------------------------------------------------------------------------
-- 3. CONTACTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    company VARCHAR(120),
    job_title VARCHAR(80),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contacts_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_email ON contacts(tenant_id, email);

-- ----------------------------------------------------------------------------
-- 4. PROPERTIES TABLE (Terrenos, Casas, Departamentos, Locales)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    description TEXT NOT NULL,
    property_type VARCHAR(30) NOT NULL CHECK (
        property_type IN ('TERRENO', 'CASA', 'DEPARTAMENTO', 'LOCAL_COMERCIAL', 'BODEGA', 'OFICINA')
    ),
    operation_type VARCHAR(20) NOT NULL CHECK (
        operation_type IN ('VENTA', 'RENTA', 'TRASPASO')
    ),
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (
        status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED', 'ARCHIVED')
    ),
    address VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    postal_code VARCHAR(10),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    land_area NUMERIC(10, 2), -- Metros cuadrados de terreno
    construction_area NUMERIC(10, 2), -- Metros cuadrados de construcción
    bedrooms INT NOT NULL DEFAULT 0,
    bathrooms NUMERIC(3, 1) NOT NULL DEFAULT 0,
    parking_spaces INT NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Captador (quien refirió o subió la propiedad para ganar comisión)
    captador_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- Asesor asignado para atender visitas y cerrar el trato
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00, -- % total convenido (ej. 5%)
    captador_commission_pct NUMERIC(5, 2) NOT NULL DEFAULT 30.00, -- % del total para el captador
    featured BOOLEAN NOT NULL DEFAULT false,
    virtual_tour_url TEXT,
    floor_plans JSONB DEFAULT '[]'::jsonb,
    reservation_deposit NUMERIC(14, 2),
    is_reserved BOOLEAN NOT NULL DEFAULT false,
    reserved_until TIMESTAMPTZ,
    reserved_by VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_properties_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_properties_tenant_status ON properties(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_tenant_type ON properties(tenant_id, property_type, operation_type);
CREATE INDEX IF NOT EXISTS idx_properties_tenant_price ON properties(tenant_id, price);
CREATE INDEX IF NOT EXISTS idx_properties_captador ON properties(tenant_id, captador_user_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(tenant_id, assigned_agent_id);

-- ----------------------------------------------------------------------------
-- 5. PROPERTY MEDIA TABLE (Fotos, Planos, Videos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'IMAGE' CHECK (type IN ('IMAGE', 'VIDEO', 'FLOORPLAN', 'DOCUMENT')),
    is_cover BOOLEAN NOT NULL DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_media_property ON property_media(property_id, order_index ASC);

-- ----------------------------------------------------------------------------
-- 6. LEADS TABLE (Prospectos y Oportunidades de Compra/Renta)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    value NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (value >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    stage VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (
        stage IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST')
    ),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (
        priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    ),
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source VARCHAR(60), -- 'WhatsApp Web', 'Formulario Propiedad', 'Agenda Visita', etc.
    expected_close_date TIMESTAMPTZ,
    loss_reason VARCHAR(250),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_tenant_stage ON leads(tenant_id, stage);
CREATE INDEX IF NOT EXISTS idx_leads_property ON leads(tenant_id, property_id);

-- ----------------------------------------------------------------------------
-- 7. COMMISSIONS TABLE (Control de Comisiones: Captador vs Asesor de Ventas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    deal_value NUMERIC(15, 2) NOT NULL CHECK (deal_value >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    total_commission_amount NUMERIC(15, 2) NOT NULL CHECK (total_commission_amount >= 0),
    -- Aliado / Captador
    captador_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    captador_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    captador_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        captador_status IN ('PENDING', 'APPROVED', 'PAID', 'CANCELLED')
    ),
    -- Asesor que cerró la operación
    agent_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    agent_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        agent_status IN ('PENDING', 'APPROVED', 'PAID', 'CANCELLED')
    ),
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_tenant ON commissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commissions_captador ON commissions(tenant_id, captador_user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_agent ON commissions(tenant_id, agent_user_id);

-- ----------------------------------------------------------------------------
-- 8. PROPERTY VISITS TABLE (Agendador de Citas & Visitas Presenciales)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    visitor_name VARCHAR(120) NOT NULL,
    visitor_phone VARCHAR(30) NOT NULL,
    visitor_email VARCHAR(255),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (
        status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    ),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_visits_tenant ON property_visits(tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_property_visits_property ON property_visits(property_id);

-- ----------------------------------------------------------------------------
-- 9. TRIGGERS (updated_at)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS trg_tenants_updated_at ON tenants;
    CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

    DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

    DROP TRIGGER IF EXISTS trg_contacts_updated_at ON contacts;
    CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

    DROP TRIGGER IF EXISTS trg_properties_updated_at ON properties;
    CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

    DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
    CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

    DROP TRIGGER IF EXISTS trg_commissions_updated_at ON commissions;
    CREATE TRIGGER trg_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

    DROP TRIGGER IF EXISTS trg_property_visits_updated_at ON property_visits;
    CREATE TRIGGER trg_property_visits_updated_at BEFORE UPDATE ON property_visits FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
END $$;

-- ----------------------------------------------------------------------------
-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('app.current_tenant_id', true), '')::UUID,
        NULLIF(current_setting('request.jwt.claim.tenant_id', true), '')::UUID
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 9. PROPERTY RESERVATIONS (Apartados y Depósitos de Garantía en Línea / Stripe)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    client_name VARCHAR(120) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(30) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'MXN',
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'REFUNDED', 'EXPIRED')),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'STRIPE_CARD' CHECK (payment_method IN ('STRIPE_CARD', 'SPEI', 'SIMULATION')),
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    folio VARCHAR(30) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON property_reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_property ON property_reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_reservations_folio ON property_reservations(folio);

ALTER TABLE property_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_reservations ON property_reservations;
CREATE POLICY tenant_isolation_reservations ON property_reservations
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS public_read_approved_properties ON properties;
CREATE POLICY public_read_approved_properties ON properties
    FOR SELECT
    USING (status = 'APPROVED' OR tenant_id = current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_properties ON properties;
CREATE POLICY tenant_isolation_properties ON properties
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_commissions ON commissions;
CREATE POLICY tenant_isolation_commissions ON commissions
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_visits ON property_visits;
CREATE POLICY tenant_isolation_visits ON property_visits
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
