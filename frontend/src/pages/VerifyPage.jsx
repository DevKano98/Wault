import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { api } from '../api/api';

export default function VerifyPage() {
  const { token } = useParams();
  const verifyQuery = useQuery({
    queryKey: ['beneficiary-verify', token],
    queryFn: () => api.beneficiary.verify(token),
    retry: false,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-card">
        {verifyQuery.isPending ? (
          <>
            <AutorenewRoundedIcon className="mx-auto h-10 w-10 animate-spin text-brand" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Verifying your email</h1>
            <p className="mt-2 text-sm text-gray-500">
              Hold on while we confirm your trusted contact invitation.
            </p>
          </>
        ) : verifyQuery.isError ? (
          <>
            <WarningAmberRoundedIcon className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-500">
              This invite may be expired or already used.
            </p>
          </>
        ) : (
          <>
            <CheckCircleRoundedIcon className="mx-auto h-10 w-10 text-teal-600" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">You&apos;re verified</h1>
            <p className="mt-2 text-sm text-gray-500">
              Your trusted contact role has been confirmed successfully.
            </p>
          </>
        )}

        <Link className="primary-button mt-6 w-full" to="/login">
          Go to WAULT
        </Link>
      </div>
    </div>
  );
}
