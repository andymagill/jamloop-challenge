'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Campaign } from '@/lib/api/client';

interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: Omit<Campaign, '_id' | 'user_id'>) => Promise<void>;
  isLoading?: boolean;
}

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

export default function CampaignForm({ campaign, onSubmit, isLoading = false }: CampaignFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state - initialize with campaign data if in edit mode
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    budget_goal_usd: campaign?.budget_goal_usd.toString() || '',
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || '',
    target_age_min: campaign?.target_age_min.toString() || '',
    target_age_max: campaign?.target_age_max.toString() || '',
    target_gender: campaign?.target_gender || 'All' as 'Male' | 'Female' | 'All',
    geo_countries: campaign?.geo_countries || [] as string[],
    geo_states: campaign?.geo_states || '',
    geo_cities: campaign?.geo_cities || '',
    geo_zip_codes: campaign?.geo_zip_codes || '',
    inventory: campaign?.inventory || [] as string[],
    screens: campaign?.screens || [] as string[]
  });

  // Handle text/number/date input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Campaign name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Campaign name must be less than 100 characters';
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
    } else if (minAge < 18 || minAge > 99) {
      newErrors.target_age_min = 'Age must be between 18 and 99';
    }

    if (!formData.target_age_max || isNaN(maxAge)) {
      newErrors.target_age_max = 'Maximum age is required';
    } else if (maxAge < 18 || maxAge > 99) {
      newErrors.target_age_max = 'Age must be between 18 and 99';
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
      newErrors.inventory = 'At least one publisher must be selected';
    }

    // Screens
    if (formData.screens.length === 0) {
      newErrors.screens = 'At least one screen type must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare campaign data
    const campaignData: Omit<Campaign, '_id' | 'user_id'> = {
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

    await onSubmit(campaignData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="space-y-4">
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
              disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Targeting Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Targeting</h2>
        
        <div className="space-y-4">
          {/* Age Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="target_age_min" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Age * (18-99)
              </label>
              <input
                type="number"
                id="target_age_min"
                name="target_age_min"
                value={formData.target_age_min}
                onChange={handleInputChange}
                min="18"
                max="99"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.target_age_min ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="18"
                disabled={isLoading}
              />
              {errors.target_age_min && (
                <p className="mt-1 text-sm text-red-600">{errors.target_age_min}</p>
              )}
            </div>

            <div>
              <label htmlFor="target_age_max" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Age * (18-99)
              </label>
              <input
                type="number"
                id="target_age_max"
                name="target_age_max"
                value={formData.target_age_max}
                onChange={handleInputChange}
                min="18"
                max="99"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.target_age_max ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="65"
                disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                All
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Targeting Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Geographic Targeting</h2>
        
        <div className="space-y-4">
          {/* Countries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Countries *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COUNTRY_OPTIONS.map((country) => (
                <label key={country} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.geo_countries.includes(country)}
                    onChange={() => handleCheckboxChange('geo_countries', country)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm">{country}</span>
                </label>
              ))}
            </div>
            {errors.geo_countries && (
              <p className="mt-1 text-sm text-red-600">{errors.geo_countries}</p>
            )}
          </div>

          {/* States */}
          <div>
            <label htmlFor="geo_states" className="block text-sm font-medium text-gray-700 mb-1">
              States/Provinces (comma-separated, optional)
            </label>
            <input
              type="text"
              id="geo_states"
              name="geo_states"
              value={formData.geo_states}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CA, NY, TX"
              disabled={isLoading}
            />
          </div>

          {/* Cities */}
          <div>
            <label htmlFor="geo_cities" className="block text-sm font-medium text-gray-700 mb-1">
              Cities (comma-separated, optional)
            </label>
            <input
              type="text"
              id="geo_cities"
              name="geo_cities"
              value={formData.geo_cities}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Los Angeles, New York, Chicago"
              disabled={isLoading}
            />
          </div>

          {/* Zip Codes */}
          <div>
            <label htmlFor="geo_zip_codes" className="block text-sm font-medium text-gray-700 mb-1">
              Zip Codes (comma-separated, optional)
            </label>
            <input
              type="text"
              id="geo_zip_codes"
              name="geo_zip_codes"
              value={formData.geo_zip_codes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="90210, 10001, 60601"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Inventory & Devices Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory & Devices</h2>
        
        <div className="space-y-4">
          {/* Publishers/Inventory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publishers *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INVENTORY_OPTIONS.map((publisher) => (
                <label key={publisher} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.inventory.includes(publisher)}
                    onChange={() => handleCheckboxChange('inventory', publisher)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm">{publisher}</span>
                </label>
              ))}
            </div>
            {errors.inventory && (
              <p className="mt-1 text-sm text-red-600">{errors.inventory}</p>
            )}
          </div>

          {/* Screens/Devices */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screen Types *
            </label>
            <div className="flex flex-col gap-2">
              {SCREEN_OPTIONS.map((screen) => (
                <label key={screen} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.screens.includes(screen)}
                    onChange={() => handleCheckboxChange('screens', screen)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm">{screen}</span>
                </label>
              ))}
            </div>
            {errors.screens && (
              <p className="mt-1 text-sm text-red-600">{errors.screens}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
        </button>
      </div>
    </form>
  );
}
