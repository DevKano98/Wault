import { useState } from 'react';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';

import ConfirmDialog from '../ui/ConfirmDialog';

const typeMap = {
  PASSWORD: { icon: KeyRoundedIcon, label: 'Password' },
  NOTE: { icon: NoteAltOutlinedIcon, label: 'Note' },
  DOCUMENT: { icon: DescriptionOutlinedIcon, label: 'Document' },
};

export default function VaultItemCard({ item, onDelete, isDeleting = false }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const config = typeMap[item.type] || typeMap.NOTE;
  const Icon = config.icon;

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(item.data || '');
    } catch (error) {
      window.alert('Copy failed on this device.');
    }
  }

  return (
    <>
      <article className="surface-card overflow-hidden">
        <button
          type="button"
          className="flex w-full items-start gap-3 p-4 text-left"
          onClick={() => setExpanded((value) => !value)}
        >
          <div className="rounded-xl bg-purple-50 p-3 text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="truncate text-sm font-semibold text-gray-900">{item.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-danger"
                onClick={(event) => {
                  event.stopPropagation();
                  setConfirmOpen(true);
                }}
              >
                <DeleteOutlineRoundedIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </button>

        {expanded ? (
          <div className="border-t border-gray-100 px-4 pb-4 pt-3">
            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
              {item.type === 'DOCUMENT' ? item.fileUrl || item.data : item.data}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="secondary-button flex-1"
                onClick={copyValue}
              >
                <ContentCopyRoundedIcon className="mr-2 h-4 w-4" />
                Copy
              </button>
            </div>
          </div>
        ) : null}
      </article>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete vault item?"
        description="This removes the item from your vault and revokes any access tied to it."
        confirmLabel="Delete"
        onConfirm={() => onDelete(item.id)}
        isLoading={isDeleting}
      />
    </>
  );
}
