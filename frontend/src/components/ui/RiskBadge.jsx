import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const riskMap = {
  LOW: {
    className: 'bg-teal-100 text-teal-800',
    label: 'LOW RISK',
    icon: ShieldRoundedIcon,
  },
  MEDIUM: {
    className: 'bg-amber-100 text-amber-800',
    label: 'MEDIUM RISK',
    icon: WarningAmberRoundedIcon,
  },
  HIGH: {
    className: 'bg-red-100 text-red-800 animate-pulse',
    label: 'HIGH RISK',
    icon: ReportGmailerrorredRoundedIcon,
  },
};

export default function RiskBadge({ risk = 'LOW', size = 'sm' }) {
  const config = riskMap[risk] || riskMap.LOW;
  const Icon = config.icon;
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-lg' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${config.className} ${sizeClass}`}
    >
      <Icon className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      {config.label}
    </span>
  );
}
