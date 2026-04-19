import * as Dialog from '@radix-ui/react-dialog';

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  isLoading = false,
}) {
  const toneClass =
    tone === 'danger'
      ? 'bg-danger text-white hover:bg-danger/95'
      : 'bg-brand text-white hover:bg-brand/95';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-card outline-none">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            {description}
          </Dialog.Description>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="secondary-button flex-1"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${toneClass}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
