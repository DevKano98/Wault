import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { Link } from 'react-router-dom';

import BottomNav from '../components/layout/BottomNav';
import PageWrapper from '../components/layout/PageWrapper';
import RiskBadge from '../components/ui/RiskBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../hooks/useActivity';
import { useBeneficiaries } from '../hooks/useBeneficiaries';
import { useVault } from '../hooks/useVault';

export default function HomePage() {
  const { user } = useAuth();
  const { items, isPending: isVaultLoading } = useVault();
  const { beneficiaries, grants } = useBeneficiaries();
  const { risk, rule, logs, riskQuery, ruleQuery, logQuery } = useActivity();

  const activeGrantCount = grants.filter((grant) => grant.status === 'ACTIVE').length;
  const daysInactive = Math.floor(risk?.details?.days_inactive || 0);

  return (
    <PageWrapper>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Hello, {user?.name}</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">Your legacy pulse</h1>
        </div>
        <div className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white">
          WAULT
        </div>
      </header>

      <section className="surface-card mb-4 p-5">
        {riskQuery.isPending ? (
          <SkeletonLoader className="h-36" />
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Risk Status</p>
                <div className="mt-3">
                  <RiskBadge risk={risk?.risk} size="lg" />
                </div>
                <p className="mt-3 text-sm text-gray-500">{daysInactive} days inactive</p>
              </div>
              <div className="rounded-full bg-purple-50 p-3 text-brand">
                <SecurityRoundedIcon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">Your vault is actively monitored.</p>
          </>
        )}
      </section>

      <section className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Vault Items', value: isVaultLoading ? '...' : items.length },
          { label: 'Beneficiaries', value: beneficiaries.length },
          { label: 'Active Grants', value: activeGrantCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-purple-50 p-3">
            <div className="text-xl font-semibold text-brand">{stat.value}</div>
            <div className="mt-1 text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="surface-card mb-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Guardian Protocol</p>
            {ruleQuery.isPending ? (
              <SkeletonLoader className="mt-3 h-10" />
            ) : rule ? (
              <>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  Trigger after {rule.thresholdDays} days
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Warning window: {rule.warningDays} days
                </p>
              </>
            ) : (
              <Link
                to="/settings"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700"
              >
                Set up your Guardian Protocol
                <ChevronRightRoundedIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <span className="text-xs text-gray-400">Last 3 events</span>
        </div>

        <div className="mt-4 space-y-3">
          {logQuery.isPending ? (
            <>
              <SkeletonLoader className="h-14" />
              <SkeletonLoader className="h-14" />
              <SkeletonLoader className="h-14" />
            </>
          ) : logs.length ? (
            logs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity recorded yet.</p>
          )}
        </div>
      </section>

      <BottomNav />
    </PageWrapper>
  );
}
