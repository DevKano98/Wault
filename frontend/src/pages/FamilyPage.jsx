import { useState } from 'react';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';

import BottomNav from '../components/layout/BottomNav';
import PageWrapper from '../components/layout/PageWrapper';
import AssignItemsModal from '../components/family/AssignItemsModal';
import BeneficiaryCard from '../components/family/BeneficiaryCard';
import InviteModal from '../components/family/InviteModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useBeneficiaries } from '../hooks/useBeneficiaries';
import { useVault } from '../hooks/useVault';

export default function FamilyPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const { items } = useVault();
  const {
    beneficiaries,
    grants,
    beneficiariesQuery,
    addBeneficiary,
    removeBeneficiary,
    grantAccess,
    revokeAccess,
  } = useBeneficiaries();

  async function handleAssignSave({ beneficiary, selectedIds }) {
    const existingGrants = grants.filter(
      (grant) => grant.beneficiaryId === beneficiary.id && grant.status !== 'REVOKED',
    );

    const existingItemIds = existingGrants.map((grant) => grant.vaultItemId);
    const toAdd = selectedIds.filter((id) => !existingItemIds.includes(id));
    const toRemove = existingGrants.filter((grant) => !selectedIds.includes(grant.vaultItemId));

    await Promise.all([
      ...toAdd.map((vaultItemId) =>
        grantAccess.mutateAsync({ vaultItemId, beneficiaryId: beneficiary.id })),
      ...toRemove.map((grant) => revokeAccess.mutateAsync(grant.id)),
    ]);
  }

  return (
    <PageWrapper>
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Trusted People</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the people who can step in if you go silent.
          </p>
        </div>
        <button
          type="button"
          className="primary-button shrink-0 px-4"
          onClick={() => setInviteOpen(true)}
        >
          <PersonAddAltRoundedIcon className="mr-2 h-4 w-4" />
          Invite
        </button>
      </header>

      <section className="space-y-3">
        {beneficiariesQuery.isPending ? (
          <>
            <SkeletonLoader className="h-28" />
            <SkeletonLoader className="h-28" />
          </>
        ) : beneficiaries.length ? (
          beneficiaries.map((beneficiary) => (
            <BeneficiaryCard
              key={beneficiary.id}
              beneficiary={beneficiary}
              onManageAccess={(person) => {
                setSelectedBeneficiary(person);
                setAssignOpen(true);
              }}
              onRemove={(person) => setRemoveTarget(person)}
            />
          ))
        ) : (
          <div className="surface-card px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-gray-900">No trusted people yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Invite a beneficiary so your guardian protocol has someone to notify.
            </p>
          </div>
        )}
      </section>

      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={(data) => addBeneficiary.mutateAsync(data)}
        isLoading={addBeneficiary.isPending}
      />

      <AssignItemsModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        beneficiary={selectedBeneficiary}
        vaultItems={items}
        grants={grants}
        onSave={handleAssignSave}
        isLoading={grantAccess.isPending || revokeAccess.isPending}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveTarget(null);
          }
        }}
        title="Remove trusted contact?"
        description={
          removeTarget
            ? `${removeTarget.name} will lose all assigned access links.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={() =>
          removeBeneficiary.mutate(removeTarget.id, {
            onSuccess: () => setRemoveTarget(null),
          })
        }
        isLoading={removeBeneficiary.isPending}
      />

      <BottomNav />
    </PageWrapper>
  );
}
