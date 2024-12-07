-- Create enum for organization roles
CREATE TYPE organization_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar NOT NULL,
  description text,
  website varchar,
  logo varchar,
  address text,
  phone varchar,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create organization_users junction table
CREATE TABLE IF NOT EXISTS organization_users (
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role organization_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_organization_users_user_id ON organization_users(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
