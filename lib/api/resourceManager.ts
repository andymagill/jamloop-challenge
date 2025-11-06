/**
 * CrudCrud Resource ID Manager
 * 
 * Manages dynamic CrudCrud resource IDs.
 * Validates resource IDs by testing against the API.
 */

const STORAGE_KEY_RESOURCE_ID = 'crudcrud_resource_id';

export interface ResourceIdData {
  resourceId: string;
}

/**
 * Prompts user to provide a new resource ID
 * This is needed because CrudCrud doesn't support programmatic resource ID generation
 */
function promptForResourceId(): string | null {
  const message = `
⚠️ CrudCrud Resource ID Needed

Your current resource ID has expired or is invalid.

To get a new resource ID:
1. Visit https://crudcrud.com in a new tab
2. Copy the resource ID from the URL (the part after /api/)
3. Paste it below

Example: If you see https://crudcrud.com/api/abc123def456...
Copy: abc123def456...
  `.trim();

  const resourceId = window.prompt(message);
  
  if (resourceId && resourceId.trim()) {
    return resourceId.trim();
  }
  
  return null;
}

/**
 * Validates that a resource ID has the correct format
 */
function isValidResourceId(resourceId: string): boolean {
  // CrudCrud resource IDs are typically 32 character hex strings
  return /^[a-f0-9]{32,}$/i.test(resourceId);
}

/**
 * Tests if a resource ID is still valid by making a test request to CrudCrud
 * Returns true if the resource ID is active, false if expired (400/404/410 or CORS errors)
 */
async function testResourceId(resourceId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://crudcrud.com/api/${resourceId}/campaigns`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // 400 = expired (CORS error), 404/410 = not found/gone
    if (response.status === 400 || response.status === 404 || response.status === 410) {
      console.log(`❌ Resource ID ${resourceId} is expired or invalid (status: ${response.status})`);
      return false;
    }

    if (response.ok || response.status === 200) {
      console.log(`✓ Resource ID ${resourceId} is valid`);
      return true;
    }

    // For other statuses (500, etc), assume the resource might be valid
    // but CrudCrud is having issues
    console.warn(`⚠️ Unexpected status ${response.status} when testing resource ID`);
    return true;
  } catch (error) {
    // CORS errors or network failures often indicate expired resource
    // This is expected behavior, so we handle it silently without console.error
    // Check if it's a CORS/fetch error which typically means expired
    if (error instanceof TypeError) {
      console.log(`❌ Resource ID ${resourceId} appears expired (CORS/network error)`);
      return false;
    }
    
    // Other unexpected errors - log them
    console.warn('Unexpected error testing resource ID:', error);
    return true;
  }
}

/**
 * Fetches a new resource ID by loading the CrudCrud homepage
 * CrudCrud generates a unique resource ID when you visit their homepage
 */
async function fetchNewResourceId(): Promise<string> {
  try {
    console.log('🔄 Fetching new resource ID from CrudCrud...');
    
    // Fetch the CrudCrud homepage - they generate a resource ID on each visit
    const response = await fetch('https://crudcrud.com/', {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CrudCrud homepage: ${response.status}`);
    }

    const html = await response.text();
    
    // Look for the resource ID in the HTML
    // CrudCrud displays it in various places like:
    // - https://crudcrud.com/api/{RESOURCE_ID}
    // - In JavaScript variables
    // - In the page content
    const patterns = [
      /crudcrud\.com\/api\/([a-f0-9]{32,})/gi,
      /api\/([a-f0-9]{32,})/gi,
      /"([a-f0-9]{32,})"/gi,
    ];

    for (const pattern of patterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && isValidResourceId(match[1])) {
          console.log('✅ Successfully fetched new resource ID from CrudCrud');
          return match[1];
        }
      }
    }

    throw new Error('Could not extract resource ID from CrudCrud homepage HTML');
  } catch (error) {
    console.error('Error fetching new CrudCrud resource ID:', error);
    throw new Error('Failed to obtain a new CrudCrud resource ID. Please check your internet connection and try again.');
  }
}

/**
 * Stores resource ID in localStorage
 */
function storeResourceId(resourceId: string): void {
  localStorage.setItem(STORAGE_KEY_RESOURCE_ID, resourceId);
  console.log(`🔑 CrudCrud resource ID stored: ${resourceId}`);
}

/**
 * Retrieves stored resource ID from localStorage
 */
function getStoredResourceId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(STORAGE_KEY_RESOURCE_ID);
}

/**
 * Clears stored resource ID from localStorage
 */
export function clearResourceId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY_RESOURCE_ID);
  console.log('🗑️ CrudCrud resource ID cleared');
}

/**
 * Gets the current resource ID from storage or fetches a new one
 * This is the main function used by the API client
 */
export async function getResourceId(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Resource ID management requires browser environment');
  }

  const stored = getStoredResourceId();

  // If we have a stored resource ID, test if it's still valid
  if (stored) {
    console.log(`🔍 Testing stored resource ID: ${stored}`);
    const isValid = await testResourceId(stored);
    
    if (isValid) {
      console.log(`✓ Resource ID is valid: ${stored}`);
      return stored;
    }

    console.warn(`❌ Stored resource ID is expired: ${stored}`);
    console.log('🔄 Fetching new resource ID...');
    clearResourceId();
  } else {
    console.log('🔍 No resource ID in storage, fetching new one...');
  }

  // Fetch a new resource ID from CrudCrud homepage
  const newResourceId = await fetchNewResourceId();
  storeResourceId(newResourceId);
  return newResourceId;
}

/**
 * Initializes or refreshes the resource ID
 * Can be called on app startup or after login
 */
export async function initializeResourceId(): Promise<string> {
  return getResourceId();
}

/**
 * Gets info about the current resource ID without fetching a new one
 */
export function getResourceIdInfo(): ResourceIdData | null {
  const resourceId = getStoredResourceId();
  if (!resourceId) {
    return null;
  }
  return { resourceId };
}

/**
 * Manually set a resource ID (e.g., from user input or settings)
 * Users should visit https://crudcrud.com to get a fresh resource ID
 */
export function setResourceId(resourceId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!resourceId || !isValidResourceId(resourceId)) {
    console.error('Invalid resource ID format. Expected 32+ character hex string.');
    return false;
  }

  storeResourceId(resourceId);
  console.log('✅ Resource ID updated successfully!');
  return true;
}

/**
 * Helper function to set resource ID with user prompt
 * Can be called from browser console: setResourceIdFromPrompt()
 */
export function setResourceIdFromPrompt(): boolean {
  const resourceId = promptForResourceId();
  if (resourceId) {
    return setResourceId(resourceId);
  }
  console.log('❌ Resource ID update cancelled');
  return false;
}

// Make functions available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).setResourceId = setResourceId;
  (window as any).setResourceIdFromPrompt = setResourceIdFromPrompt;
  (window as any).clearResourceId = clearResourceId;
  (window as any).getResourceIdInfo = getResourceIdInfo;
  (window as any).testResourceId = testResourceId;
  (window as any).fetchNewResourceId = fetchNewResourceId;
  
  console.log('💡 Resource ID utilities available in console:');
  console.log('  - setResourceId("your-id") - Set a resource ID manually');
  console.log('  - testResourceId("id-to-test") - Test if a resource ID is valid');
  console.log('  - getResourceIdInfo() - View current resource ID info');
  console.log('  - clearResourceId() - Clear stored resource ID');
  console.log('  - fetchNewResourceId() - Fetch a fresh resource ID from CrudCrud');
}
