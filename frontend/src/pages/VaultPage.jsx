import { useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import BottomNav from '../components/layout/BottomNav';
import PageWrapper from '../components/layout/PageWrapper';
import AddVaultItemModal from '../components/vault/AddVaultItemModal';
import VaultItemCard from '../components/vault/VaultItemCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useVault } from '../hooks/useVault';

const filters = [
  { label: 'All', value: 'ALL' },
  { label: 'Passwords', value: 'PASSWORD', icon: KeyRoundedIcon },
  { label: 'Notes', value: 'NOTE', icon: NoteAltOutlinedIcon },
  { label: 'Documents', value: 'DOCUMENT', icon: DescriptionOutlinedIcon },
];

export default function VaultPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { items, isPending, deleteVaultItem } = useVault();

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === 'ALL' || item.type === activeFilter;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const emptyLabel =
    activeFilter === 'ALL' ? 'vault item' : activeFilter.toLowerCase();

  return (
    <PageWrapper>
      <header className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Your Vault</h1>
        <p className="mt-1 text-sm text-gray-500">
          Secure the records your loved ones may need later.
        </p>
      </header>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const Icon = filter.icon;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                activeFilter === filter.value
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-500 shadow-card'
              }`}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <SearchRoundedIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className="field-input pl-11"
          placeholder="Search your vault"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <section className="space-y-3">
        {isPending ? (
          <>
            <SkeletonLoader className="h-28" />
            <SkeletonLoader className="h-28" />
            <SkeletonLoader className="h-28" />
          </>
        ) : filteredItems.length ? (
          filteredItems.map((item) => (
            <VaultItemCard
              key={item.id}
              item={item}
              onDelete={(id) => deleteVaultItem.mutate(id)}
              isDeleting={deleteVaultItem.isPending}
            />
          ))
        ) : (
          <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
            <div className="rounded-full bg-purple-50 p-4 text-brand">
              <AddRoundedIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Nothing here yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Add your first {emptyLabel} to start building your secure vault.
            </p>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-20 right-4 z-20 rounded-full bg-brand p-4 text-white shadow-card"
      >
        <AddRoundedIcon className="h-5 w-5" />
      </button>

      <AddVaultItemModal open={modalOpen} onOpenChange={setModalOpen} />
      <BottomNav />
    </PageWrapper>
  );
}
