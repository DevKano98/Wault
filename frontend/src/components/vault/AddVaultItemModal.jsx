import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';

import { useVault } from '../../hooks/useVault';

const itemTypes = [
  { value: 'PASSWORD', label: 'Password', icon: KeyRoundedIcon },
  { value: 'NOTE', label: 'Note', icon: NoteAltOutlinedIcon },
  { value: 'DOCUMENT', label: 'Document', icon: DescriptionOutlinedIcon },
];

export default function AddVaultItemModal({ open, onOpenChange }) {
  const { createVaultItem } = useVault();
  const [type, setType] = useState('PASSWORD');
  const [title, setTitle] = useState('');
  const [data, setData] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setType('PASSWORD');
      setTitle('');
      setData('');
      setFile(null);
      setError('');
    }
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (type === 'DOCUMENT' && !file) {
      setError('Please choose a file.');
      return;
    }

    if (type !== 'DOCUMENT' && !data.trim()) {
      setError('Please enter the content for this item.');
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('title', title.trim());
    formData.append('data', type === 'DOCUMENT' ? file.name : data);

    if (file) {
      formData.append('file', file);
    }

    try {
      await createVaultItem.mutateAsync(formData);
      onOpenChange(false);
    } catch (mutationError) {
      setError(mutationError.response?.data?.error || 'Failed to save vault item.');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white p-5 shadow-card outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Add Vault Item
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <CloseRoundedIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="field-label">Type</span>
              <div className="grid grid-cols-3 gap-2">
                {itemTypes.map((itemType) => {
                  const Icon = itemType.icon;
                  const active = itemType.value === type;

                  return (
                    <button
                      key={itemType.value}
                      type="button"
                      onClick={() => setType(itemType.value)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                        active
                          ? 'border-brand bg-brand text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{itemType.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="vault-title">
                Title
              </label>
              <input
                id="vault-title"
                className="field-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Netflix login, last letter, passport..."
              />
            </div>

            {type === 'DOCUMENT' ? (
              <div>
                <label className="field-label" htmlFor="vault-file">
                  Document
                </label>
                <input
                  id="vault-file"
                  type="file"
                  className="field-input"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </div>
            ) : (
              <div>
                <label className="field-label" htmlFor="vault-data">
                  {type === 'PASSWORD' ? 'Password or Secret' : 'Note'}
                </label>
                {type === 'PASSWORD' ? (
                  <input
                    id="vault-data"
                    type="password"
                    className="field-input"
                    value={data}
                    onChange={(event) => setData(event.target.value)}
                    placeholder="Enter the encrypted content"
                  />
                ) : (
                  <textarea
                    id="vault-data"
                    className="field-input min-h-[120px]"
                    value={data}
                    onChange={(event) => setData(event.target.value)}
                    placeholder="Write the note you want stored safely"
                  />
                )}
              </div>
            )}

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <button
              type="submit"
              className="primary-button w-full"
              disabled={createVaultItem.isPending}
            >
              {createVaultItem.isPending ? 'Saving...' : 'Save Vault Item'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
