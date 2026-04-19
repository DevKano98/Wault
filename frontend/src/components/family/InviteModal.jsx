import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function InviteModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setError('');
    }
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError('Please fill in both name and email.');
      return;
    }

    try {
      await onSubmit({ name: name.trim(), email: email.trim() });
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Failed to send invite.');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white p-5 shadow-card outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Invite Trusted Contact
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <CloseRoundedIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="invite-name">
                Name
              </label>
              <input
                id="invite-name"
                className="field-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Aditi Sharma"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="invite-email">
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                className="field-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="aditi@example.com"
              />
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <button className="primary-button w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Sending invite...' : 'Send Invite'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
