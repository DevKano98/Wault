import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api/api';

export function useBeneficiaries() {
  const queryClient = useQueryClient();

  const beneficiariesQuery = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: api.beneficiary.getAll,
  });

  const grantsQuery = useQuery({
    queryKey: ['grants'],
    queryFn: api.access.getGrants,
  });

  const addBeneficiary = useMutation({
    mutationFn: api.beneficiary.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  const removeBeneficiary = useMutation({
    mutationFn: api.beneficiary.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['grants'] });
    },
  });

  const grantAccess = useMutation({
    mutationFn: ({ vaultItemId, beneficiaryId }) =>
      api.access.grant(vaultItemId, beneficiaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grants'] });
    },
  });

  const revokeAccess = useMutation({
    mutationFn: api.access.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grants'] });
    },
  });

  return {
    beneficiaries: beneficiariesQuery.data ?? [],
    grants: grantsQuery.data ?? [],
    beneficiariesQuery,
    grantsQuery,
    addBeneficiary,
    removeBeneficiary,
    grantAccess,
    revokeAccess,
  };
}
