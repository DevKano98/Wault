import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api/api';

export function useActivity() {
  const queryClient = useQueryClient();

  const riskQuery = useQuery({
    queryKey: ['risk'],
    queryFn: api.activity.getRisk,
  });

  const ruleQuery = useQuery({
    queryKey: ['rule'],
    queryFn: api.activity.getRule,
  });

  const logQuery = useQuery({
    queryKey: ['activity-log'],
    queryFn: api.activity.getLog,
  });

  const saveRule = useMutation({
    mutationFn: ({ thresholdDays, warningDays }) =>
      api.activity.setRule(thresholdDays, warningDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rule'] });
    },
  });

  return {
    risk: riskQuery.data,
    rule: ruleQuery.data,
    logs: logQuery.data ?? [],
    riskQuery,
    ruleQuery,
    logQuery,
    saveRule,
  };
}
