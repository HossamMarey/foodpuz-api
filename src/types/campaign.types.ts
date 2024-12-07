export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignDTO {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
}

export interface UpdateCampaignDTO {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}
