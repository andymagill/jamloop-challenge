// Campaign data model
export interface Campaign {
  _id?: string; // crudcrud.com provides this
  user_id: string; // 'user_A' or 'user_B'
  name: string;
  budget_goal_usd: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  target_age_min: number;
  target_age_max: number;
  target_gender: 'Male' | 'Female' | 'All';
  geo_countries: string[];
  geo_states: string;
  geo_cities: string;
  geo_zip_codes: string;
  inventory: string[]; // Hulu, Discovery, ABC, A&E, TLC, Fox News, Fox Sports
  screens: string[]; // CTV, Mobile Device, Web Browser
}

// CrudCrud.com API URL - hardcoded as per PoC requirements
const BASE_URL = 'https://crudcrud.com/api/7a9ddccaf6e347b7b161e8c1a4d8c394';

const CAMPAIGNS_ENDPOINT = '/campaigns';

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // DELETE requests typically return no content
    if (response.status === 204 || options?.method === 'DELETE') {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Get all campaigns (will be filtered client-side by user_id)
export async function getAllCampaigns(): Promise<Campaign[]> {
  return apiRequest<Campaign[]>(CAMPAIGNS_ENDPOINT);
}

// Get a single campaign by ID
export async function getCampaignById(id: string): Promise<Campaign> {
  return apiRequest<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}`);
}

// Create a new campaign
export async function createCampaign(campaign: Omit<Campaign, '_id'>): Promise<Campaign> {
  return apiRequest<Campaign>(CAMPAIGNS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(campaign),
  });
}

// Update an existing campaign
export async function updateCampaign(id: string, campaign: Omit<Campaign, '_id'>): Promise<Campaign> {
  return apiRequest<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(campaign),
  });
}

// Delete a campaign
export async function deleteCampaign(id: string): Promise<void> {
  return apiRequest<void>(`${CAMPAIGNS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
