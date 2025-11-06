'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/layout/Header';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createCampaign, Campaign } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function NewCampaignPage() {
  const { userId, logout } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSubmit = async (data: Omit<Campaign, '_id' | 'user_id'>) => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      const campaignData: Omit<Campaign, '_id'> = {
        ...data,
        user_id: userId,
      };

      await createCampaign(campaignData);
      toast.success('Campaign created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header userId={userId || ''} onLogout={handleLogout} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="link"
              className="px-0"
            >
              ← Back to Dashboard
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="mt-1 text-sm text-gray-600">
              Fill out the form below to create a new advertising campaign.
            </p>
          </div>

          <CampaignForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
