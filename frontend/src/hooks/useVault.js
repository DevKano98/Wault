import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api/api';

export function useVault() {
  const queryClient = useQueryClient();

  const vaultQuery = useQuery({
    queryKey: ['vault'],
    queryFn: api.vault.getAll,
  });

  const createVaultItem = useMutation({
    mutationFn: api.vault.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const updateVaultItem = useMutation({
    mutationFn: ({ id, data }) => api.vault.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });

  const deleteVaultItem = useMutation({
    mutationFn: api.vault.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
      queryClient.invalidateQueries({ queryKey: ['grants'] });
    },
  });

  return {
    ...vaultQuery,
    items: vaultQuery.data ?? [],
    createVaultItem,
    updateVaultItem,
    deleteVaultItem,
  };
}
