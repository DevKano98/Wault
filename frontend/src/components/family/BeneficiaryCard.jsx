import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

export default function BeneficiaryCard({
  beneficiary,
  onManageAccess,
  onRemove,
}) {
  const initials = beneficiary.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="surface-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-brand">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{beneficiary.name}</h3>
              <p className="truncate text-sm text-gray-500">{beneficiary.email}</p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                beneficiary.isVerified
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {beneficiary.isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="secondary-button flex-1"
              onClick={() => onManageAccess(beneficiary)}
            >
              <VerifiedUserRoundedIcon className="mr-2 h-4 w-4" />
              Manage Access
            </button>
            <button
              type="button"
              className="rounded-xl border border-red-100 px-3 py-3 text-danger hover:bg-red-50"
              onClick={() => onRemove(beneficiary)}
            >
              <DeleteOutlineRoundedIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
