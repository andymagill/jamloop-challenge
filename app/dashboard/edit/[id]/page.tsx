'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/layout/Header';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCampaignById, updateCampaign, deleteCampaign, Campaign } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EditCampaignPage() {
  const { userId, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function fetchCampaign() {
      if (!campaignId || !userId) return;

      try {
        setIsLoading(true);
        const fetchedCampaign = await getCampaignById(campaignId);

        if (fetchedCampaign.user_id !== userId) {
          setUnauthorized(true);
          toast.error('You do not have permission to edit this campaign');
          return;
        }

        setCampaign(fetchedCampaign);
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSubmit = async (data: Omit<Campaign, '_id' | 'user_id'>) => {
    if (!userId || !campaignId) {
      toast.error('Invalid request');
      return;
    }

    setIsSubmitting(true);

    try {
      const campaignData: Omit<Campaign, '_id'> = {
        ...data,
        user_id: userId,
      };

      await updateCampaign(campaignId, campaignData);
      toast.success('Campaign updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!campaignId) return;

    setIsDeleting(true);

    try {
      await deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header userId={userId || ''} onLogout={handleLogout} />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="link"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (unauthorized) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header userId={userId || ''} onLogout={handleLogout} />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
              <p className="text-gray-600 mb-4">You do not have permission to edit this campaign.</p>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="link"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

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

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600">Loading campaign...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Update the campaign details below.
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  disabled={isDeleting}
                >
                  Delete Campaign
                </Button>
              </div>

              {campaign && (
                <CampaignForm
                  campaign={campaign}
                  onSubmit={handleSubmit}
                  isLoading={isSubmitting}
                />
              )}
            </>
          )}
        </main>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this campaign? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}