import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home', icon: HomeRoundedIcon },
  { to: '/vault', label: 'Vault', icon: LockRoundedIcon },
  { to: '/family', label: 'Family', icon: PeopleAltRoundedIcon },
  { to: '/settings', label: 'Settings', icon: SettingsRoundedIcon },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 pb-safe py-3">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-w-[64px] flex-col items-center gap-1 text-xs font-medium ${
                isActive ? 'text-brand' : 'text-gray-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
