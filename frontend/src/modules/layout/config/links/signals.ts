import { MenuLink } from '@/modules/layout/types/MenuLink';
import { SignalsPermissions } from '@/premium/signals/signals-permissions';

const signals: MenuLink = {
  id: 'signals',
  label: 'Signals',
  icon: 'ri-search-eye-line',
  routeName: 'signals',
  display: ({ user, tenant }) => {
    const signalsPermissions = new SignalsPermissions(
      tenant,
      user,
    );
    return signalsPermissions.read || signalsPermissions.lockedForCurrentPlan;
  },
  disable: ({ user, tenant }) => new SignalsPermissions(tenant, user).lockedForCurrentPlan,
};

export default signals;
