'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/layout/Header';
import CampaignTable from '@/components/campaigns/CampaignTable';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Campaign, getAllCampaigns, deleteCampaign } from '@/lib/api/client';
import { initializeResourceId } from '@/lib/api/resourceManager';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { userId, logout } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resourceIdStatus, setResourceIdStatus] = useState<string>('');

  // Initialize resource ID first, then fetch campaigns
  useEffect(() => {
    async function initializeAndFetch() {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Step 1: Initialize/validate resource ID
        setResourceIdStatus('Validating CrudCrud connection...');
        console.log('🔄 Initializing resource ID...');
        
        const resourceId = await initializeResourceId();
        console.log('✅ Resource ID ready:', resourceId);
        
        // Step 2: Fetch campaigns
        setResourceIdStatus('Loading campaigns...');
        const allCampaigns = await getAllCampaigns();
        
        // Client-side filter: only show campaigns for the current user
        const userCampaigns = allCampaigns.filter(
          (campaign) => campaign.user_id === userId
        );
        
        setCampaigns(userCampaigns);
        setResourceIdStatus('');
      } catch (err) {
        console.error('Error during initialization:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        if (errorMessage.includes('Failed to obtain') || errorMessage.includes('fetch')) {
          setError('Unable to connect to CrudCrud. Please check your internet connection and try again.');
        } else {
          setError(`Failed to load dashboard. ${errorMessage}`);
        }
        setResourceIdStatus('');
      } finally {
        setLoading(false);
      }
    }

    initializeAndFetch();
  }, [userId]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateNew = () => {
    router.push('/dashboard/new');
  };

  const handleEdit = (campaignId: string) => {
    router.push(`/dashboard/edit/${campaignId}`);
  };

  const handleDelete = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId);
      setCampaigns(campaigns.filter((c) => c._id !== campaignId));
      toast.success('Campaign deleted successfully');
    } catch (err) {
      console.error('Error deleting campaign:', err);
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header userId={userId || ''} onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                My Campaigns
              </h2>
              <Button
                onClick={handleCreateNew}
                variant="default"
              >
                Create New Campaign
              </Button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">
                  {resourceIdStatus || 'Loading campaigns...'}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <CampaignTable
                campaigns={campaigns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreateNew={handleCreateNew}
              />
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
