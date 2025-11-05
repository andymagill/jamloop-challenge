'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { getCampaignById, updateCampaign, deleteCampaign, Campaign } from '@/lib/api/client';
import { toast } from 'sonner';

// Options for multi-select fields
const INVENTORY_OPTIONS = [
  'Hulu',
  'Discovery',
  'ABC',
  'A&E',
  'TLC',
  'Fox News',
  'Fox Sports'
];

const SCREEN_OPTIONS = [
  'CTV',
  'Mobile Device',
  'Web Browser'
];

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Mexico'
];

export default function EditCampaignPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    budget_goal_usd: '',
    start_date: '',
    end_date: '',
    target_age_min: '',
    target_age_max: '',
    target_gender: 'All' as 'Male' | 'Female' | 'All',
    geo_countries: [] as string[],
    geo_states: '',
    geo_cities: '',
    geo_zip_codes: '',
    inventory: [] as string[],
    screens: [] as string[]
  });

  // Fetch campaign data on mount
  useEffect(() => {
    async function fetchCampaign() {
      if (!campaignId || !userId) return;

      try {
        setIsLoading(true);
        const campaign = await getCampaignById(campaignId);

        // Client-side check: ensure the campaign belongs to the current user
        if (campaign.user_id !== userId) {
          setUnauthorized(true);
          toast.error('You do not have permission to edit this campaign');
          return;
        }

        // Pre-populate the form with fetched data
        setFormData({
          name: campaign.name,
          budget_goal_usd: campaign.budget_goal_usd.toString(),
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          target_age_min: campaign.target_age_min.toString(),
          target_age_max: campaign.target_age_max.toString(),
          target_gender: campaign.target_gender,
          geo_countries: campaign.geo_countries,
          geo_states: campaign.geo_states,
          geo_cities: campaign.geo_cities,
          geo_zip_codes: campaign.geo_zip_codes,
          inventory: campaign.inventory,
          screens: campaign.screens
        });
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setNotFound(true);
        toast.error('Campaign not found');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaign();
  }, [campaignId, userId]);

  // Handle text/number/date input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes for arrays
  const handleCheckboxChange = (field: 'geo_countries' | 'inventory' | 'screens', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Campaign name
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    // Budget
    const budget = parseFloat(formData.budget_goal_usd);
    if (!formData.budget_goal_usd || isNaN(budget)) {
      newErrors.budget_goal_usd = 'Budget is required';
    } else if (budget <= 0) {
      newErrors.budget_goal_usd = 'Budget must be greater than 0';
    }

    // Start date
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    } else {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.start_date = 'Start date must be today or in the future';
      }
    }

    // End date
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    // Age range
    const minAge = parseInt(formData.target_age_min);
    const maxAge = parseInt(formData.target_age_max);
    
    if (!formData.target_age_min || isNaN(minAge)) {
      newErrors.target_age_min = 'Minimum age is required';
    } else if (minAge < 0 || minAge > 120) {
      newErrors.target_age_min = 'Age must be between 0 and 120';
    }

    if (!formData.target_age_max || isNaN(maxAge)) {
      newErrors.target_age_max = 'Maximum age is required';
    } else if (maxAge < 0 || maxAge > 120) {
      newErrors.target_age_max = 'Age must be between 0 and 120';
    }

    if (formData.target_age_min && formData.target_age_max && !isNaN(minAge) && !isNaN(maxAge)) {
      if (minAge > maxAge) {
        newErrors.target_age_max = 'Maximum age must be greater than or equal to minimum age';
      }
    }

    // Geo countries
    if (formData.geo_countries.length === 0) {
      newErrors.geo_countries = 'At least one country must be selected';
    }

    // Inventory
    if (formData.inventory.length === 0) {
      newErrors.inventory = 'At least one inventory/publisher must be selected';
    }

    // Screens
    if (formData.screens.length === 0) {
      newErrors.screens = 'At least one screen/device type must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!userId) {
      setErrors({ submit: 'User not authenticated' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare campaign data with user_id injection to maintain security
      const campaignData: Omit<Campaign, '_id'> = {
        user_id: userId,
        name: formData.name.trim(),
        budget_goal_usd: parseFloat(formData.budget_goal_usd),
        start_date: formData.start_date,
        end_date: formData.end_date,
        target_age_min: parseInt(formData.target_age_min),
        target_age_max: parseInt(formData.target_age_max),
        target_gender: formData.target_gender,
        geo_countries: formData.geo_countries,
        geo_states: formData.geo_states,
        geo_cities: formData.geo_cities,
        geo_zip_codes: formData.geo_zip_codes,
        inventory: formData.inventory,
        screens: formData.screens
      };

      await updateCampaign(campaignId, campaignData);

      // Success - show toast and redirect to dashboard
      toast.success('Campaign updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      toast.error(errorMessage);
      setErrors({ 
        submit: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete campaign';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading campaign...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error states
  if (notFound || unauthorized) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                {unauthorized ? 'Unauthorized' : 'Not Found'}
              </h1>
              <p className="text-gray-600 mb-6">
                {unauthorized 
                  ? 'You do not have permission to edit this campaign.'
                  : 'The campaign you are looking for could not be found.'}
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting || isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Delete Campaign
              </button>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this campaign? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Summer Ad Launch"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget_goal_usd" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Goal (USD) *
                </label>
                <input
                  type="number"
                  id="budget_goal_usd"
                  name="budget_goal_usd"
                  value={formData.budget_goal_usd}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.budget_goal_usd ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000.00"
                />
                {errors.budget_goal_usd && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget_goal_usd}</p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.start_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.end_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="target_age_min" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Age *
                  </label>
                  <input
                    type="number"
                    id="target_age_min"
                    name="target_age_min"
                    value={formData.target_age_min}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.target_age_min ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="18"
                  />
                  {errors.target_age_min && (
                    <p className="mt-1 text-sm text-red-600">{errors.target_age_min}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="target_age_max" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Age *
                  </label>
                  <input
                    type="number"
                    id="target_age_max"
                    name="target_age_max"
                    value={formData.target_age_max}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.target_age_max ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="65"
                  />
                  {errors.target_age_max && (
                    <p className="mt-1 text-sm text-red-600">{errors.target_age_max}</p>
                  )}
                </div>
              </div>

              {/* Target Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Gender *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="target_gender"
                      value="Male"
                      checked={formData.target_gender === 'Male'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="target_gender"
                      value="Female"
                      checked={formData.target_gender === 'Female'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Female
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="target_gender"
                      value="All"
                      checked={formData.target_gender === 'All'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    All
                  </label>
                </div>
              </div>

              {/* Geo Targeting - Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Countries *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {COUNTRY_OPTIONS.map(country => (
                    <label key={country} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.geo_countries.includes(country)}
                        onChange={() => handleCheckboxChange('geo_countries', country)}
                        className="mr-2"
                      />
                      <span className="text-sm">{country}</span>
                    </label>
                  ))}
                </div>
                {errors.geo_countries && (
                  <p className="mt-1 text-sm text-red-600">{errors.geo_countries}</p>
                )}
              </div>

              {/* Geo Targeting - States, Cities, Zip Codes */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="geo_states" className="block text-sm font-medium text-gray-700 mb-1">
                    Target States (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="geo_states"
                    name="geo_states"
                    value={formData.geo_states}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CA, NY, TX"
                  />
                </div>

                <div>
                  <label htmlFor="geo_cities" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Cities (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="geo_cities"
                    name="geo_cities"
                    value={formData.geo_cities}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Los Angeles, New York, Austin"
                  />
                </div>

                <div>
                  <label htmlFor="geo_zip_codes" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Zip Codes (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="geo_zip_codes"
                    name="geo_zip_codes"
                    value={formData.geo_zip_codes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="90210, 10001, 73301"
                  />
                </div>
              </div>

              {/* Inventory / Publishers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inventory / Publishers *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INVENTORY_OPTIONS.map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.inventory.includes(option)}
                        onChange={() => handleCheckboxChange('inventory', option)}
                        className="mr-2"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.inventory && (
                  <p className="mt-1 text-sm text-red-600">{errors.inventory}</p>
                )}
              </div>

              {/* Screens / Devices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screens / Devices *
                </label>
                <div className="flex flex-wrap gap-4">
                  {SCREEN_OPTIONS.map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.screens.includes(option)}
                        onChange={() => handleCheckboxChange('screens', option)}
                        className="mr-2"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.screens && (
                  <p className="mt-1 text-sm text-red-600">{errors.screens}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Campaign'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isSubmitting || isDeleting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
