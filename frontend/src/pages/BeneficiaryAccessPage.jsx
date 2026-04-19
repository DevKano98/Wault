import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'react-router-dom';

import { api } from '../api/api';

export default function BeneficiaryAccessPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const accessQuery = useQuery({
    queryKey: ['beneficiary-access', id, token],
    queryFn: () => api.access.getShared(id, token),
    enabled: Boolean(token && id),
    retry: false,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card">
        {!token ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">Missing access token</p>
            <p className="mt-2 text-sm text-gray-500">
              Open the original beneficiary link again to continue.
            </p>
          </div>
        ) : accessQuery.isPending ? (
          <div className="text-center">
            <AutorenewRoundedIcon className="mx-auto h-8 w-8 animate-spin text-brand" />
            <p className="mt-3 text-sm text-gray-500">Opening secure vault access...</p>
          </div>
        ) : accessQuery.isError ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">This access link is unavailable</p>
            <p className="mt-2 text-sm text-gray-500">
              The link may be expired, revoked, or already invalid.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Beneficiary Access</p>
                <h1 className="mt-2 text-xl font-semibold text-gray-900">
                  {accessQuery.data.vaultItem.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Shared with {accessQuery.data.beneficiary.name}
                </p>
              </div>
              <div className="rounded-full bg-purple-50 p-3 text-brand">
                <LockOpenRoundedIcon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Content</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-800">
                {accessQuery.data.vaultItem.data}
              </p>
            </div>

            {accessQuery.data.vaultItem.fileUrl ? (
              <a
                className="primary-button mt-4 w-full"
                href={accessQuery.data.vaultItem.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Linked Document
              </a>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
