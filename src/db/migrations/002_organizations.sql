-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organization_role enum type
DO $$ BEGIN
    CREATE TYPE organization_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(255),
    address TEXT,
    phone VARCHAR(20),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT organizations_name_unique UNIQUE (name)
);

-- Create organization_users junction table
CREATE TABLE IF NOT EXISTS organization_users (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role organization_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (organization_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_role ON organization_users(role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically add owner as OWNER role
CREATE OR REPLACE FUNCTION add_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO organization_users (organization_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'OWNER');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically add owner
DROP TRIGGER IF EXISTS add_organization_owner_trigger ON organizations;
CREATE TRIGGER add_organization_owner_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION add_organization_owner();

-- Create policies for Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY organizations_select_policy ON organizations
    FOR SELECT
    USING (
        id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY organizations_insert_policy ON organizations
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY organizations_update_policy ON organizations
    FOR UPDATE
    USING (
        id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY organizations_delete_policy ON organizations
    FOR DELETE
    USING (owner_id = auth.uid());

-- Organization users policies
CREATE POLICY organization_users_select_policy ON organization_users
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY organization_users_insert_policy ON organization_users
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY organization_users_update_policy ON organization_users
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT o.id 
            FROM organizations o 
            WHERE o.owner_id = auth.uid()
        )
    );

CREATE POLICY organization_users_delete_policy ON organization_users
    FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'ADMIN')
        )
        AND user_id != (
            SELECT owner_id 
            FROM organizations 
            WHERE id = organization_id
        )
    );

-- Create helper functions
CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name VARCHAR,
    user_role organization_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.name, ou.role
    FROM organizations o
    JOIN organization_users ou ON o.id = ou.organization_id
    WHERE ou.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
