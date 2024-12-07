export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  phone?: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationUser {
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: Date;
}

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  phone?: string;
}

export interface UpdateOrganizationDTO extends Partial<CreateOrganizationDTO> {}

export interface AddOrganizationUserDTO {
  user_id: string;
  role: OrganizationRole;
}
