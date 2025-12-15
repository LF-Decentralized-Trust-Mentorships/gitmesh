import shared from '@/shared/shared-module';
import auth from '@/modules/auth/auth-module';
import layout from '@/modules/layout/layout-module';
import dashboard from '@/modules/dashboard/dashboard-module';
import onboard from '@/modules/onboard/onboard-module';
import tenant from '@/modules/tenant/tenant-module';
import settings from '@/modules/settings/settings-module';
import integration from '@/modules/integration/integration-module';
import member from '@/modules/member/member-module';
import tag from '@/modules/tag/tag-module';
import activity from '@/modules/activity/activity-module';
import widget from '@/modules/widget/widget-module';
import report from '@/modules/report/report-module';
import automation from '@/modules/automation/automation-module';
import organization from '@/modules/organization/organization-module';
import task from '@/modules/task/task-module';
import quickstart from '@/modules/quickstart/quickstart-module';
import chat from '@/modules/chat/chat-module';

import user from '@/modules/user/user-module';
import landing from '@/modules/landing/landing-module';

// Dynamically import premium modules to allow removing the premium directory
const premiumModulesGlob = import.meta.glob('../premium/*/*-module.js', { eager: true });
const premiumModules = Object.keys(premiumModulesGlob).reduce((acc, key) => {
  // Extract module name from path (e.g., ../premium/signals/signals-module.js -> signals)
  // key is like "../premium/signals/signals-module.js"
  const parts = key.split('/');
  // parts = ["..", "premium", "signals", "signals-module.js"]
  // We want "signals" which is at index 2 (or length - 2)
  const moduleName = parts[parts.length - 2];
  acc[moduleName] = (premiumModulesGlob[key] as any).default;
  return acc;
}, {} as Record<string, any>);

const modules: Record<string, any> = {
  landing, // Register landing first so / route takes precedence
  shared,
  dashboard,
  onboard,
  settings,
  auth,
  tenant,
  layout,
  integration,
  member,
  activity,
  tag,
  widget,
  report,
  automation,
  organization,
  task,
  quickstart,
  chat,
  user,
  ...premiumModules,
};

export default modules;
