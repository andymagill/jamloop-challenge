import { getResourceId, clearResourceId } from './resourceManager';

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

const CAMPAIGNS_ENDPOINT = '/campaigns';

/**
 * Gets the base URL with a valid resource ID
 * Dynamically fetches or retrieves cached resource ID
 */
async function getBaseUrl(): Promise<string> {
  const resourceId = await getResourceId();
  return `https://crudcrud.com/api/${resourceId}`;
}

// Generic API request handler with retry logic for expired resources
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  retryCount: number = 0
): Promise<T> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle expired resource (400, 404, or 410)
    // 400 often comes with CORS errors when resource is expired
    if ((response.status === 400 || response.status === 404 || response.status === 410) && retryCount === 0) {
      console.warn(`Resource appears to be expired (status: ${response.status}), fetching new resource ID...`);
      clearResourceId();
      // Retry once with a new resource ID
      return apiRequest<T>(endpoint, options, retryCount + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      
      // Provide user-friendly error messages
      if (response.status === 400) {
        throw new Error('Resource expired or invalid. Please refresh the page.');
      } else if (response.status === 404) {
        throw new Error('Resource not found. The CrudCrud endpoint may have expired. Please refresh the page.');
      } else if (response.status === 410) {
        throw new Error('Resource has been deleted or expired. Please refresh the page.');
      } else if (response.status >= 500) {
        throw new Error('CrudCrud service is currently unavailable. Please try again later.');
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // DELETE requests typically return no content
    if (response.status === 204 || options?.method === 'DELETE') {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    // Handle CORS errors which often indicate expired resources
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // If this is the first attempt, try clearing resource ID and retrying
      if (retryCount === 0) {
        console.log('⚠️ Network/CORS error detected (likely expired resource), retrying with new ID...');
        clearResourceId();
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }
      throw new Error('Network error: Unable to connect to CrudCrud. The resource may have expired. Please refresh the page.');
    }
    
    // For other errors, log and re-throw
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
