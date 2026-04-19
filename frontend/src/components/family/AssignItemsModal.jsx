import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function AssignItemsModal({
  open,
  onOpenChange,
  beneficiary,
  vaultItems,
  grants,
  onSave,
  isLoading = false,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!beneficiary) {
      setSelectedIds([]);
      return;
    }

    const currentIds = grants
      .filter(
        (grant) =>
          grant.beneficiaryId === beneficiary.id && grant.status !== 'REVOKED',
      )
      .map((grant) => grant.vaultItemId);

    setSelectedIds(currentIds);
  }, [beneficiary, grants, open]);

  function toggleItem(itemId) {
    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((value) => value !== itemId)
        : [...current, itemId],
    );
  }

  async function handleSave() {
    if (!beneficiary) {
      return;
    }

    await onSave({
      beneficiary,
      selectedIds,
    });
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white p-5 shadow-card outline-none">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Assign Vault Items
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-500">
                {beneficiary ? `Choose what ${beneficiary.name} can receive.` : ''}
              </p>
            </div>
            <Dialog.Close className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <CloseRoundedIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto">
            {vaultItems.length ? (
              vaultItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.type}</p>
                  </div>
                </label>
              ))
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                Add vault items first so you can assign them here.
              </div>
            )}
          </div>

          <button
            type="button"
            className="primary-button mt-5 w-full"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving access...' : 'Save Access'}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
