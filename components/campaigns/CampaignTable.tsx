'use client';

import { Campaign } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
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

interface CampaignTableProps {
  campaigns: Campaign[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export default function CampaignTable({
  campaigns,
  onEdit,
  onDelete,
  onCreateNew,
}: CampaignTableProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteClick = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(campaignToDelete);
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Empty state
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new campaign.
        </p>
      </div>
    );
  }

  // Table with campaigns
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Campaign Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Budget
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target Age
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <tr
              key={campaign._id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onEdit(campaign._id!)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline cursor-pointer text-left"
                >
                  {campaign.name}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatCurrency(campaign.budget_goal_usd)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(campaign.start_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(campaign.end_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {campaign.target_age_min}-{campaign.target_age_max}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button
                  onClick={() => onEdit(campaign._id!)}
                  variant="default"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteClick(campaign._id!)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
