import { updateEmailHistory } from './activities/updateEmailHistory'

import { getNextEmails as signalsGetNextEmails } from './activities/signals-digest/getNextEmails'
import { sendEmail as signalsSendEmail } from './activities/signals-digest/sendEmail'
import { updateNextEmailAt as signalsUpdateNextEmailAt } from './activities/signals-digest/updateEmailHistory'
import {
  buildEmailContent as signalsBuildEmailContent,
  fetchFromDatabase as signalsFetchFromDatabase,
  fetchFromSignals as signalsFetchFromSignals,
} from './activities/signals-digest/buildEmail'

import { sendEmail as weeklySendEmail } from './activities/weekly-analytics/sendEmail'
import {
  getTotalMembersThisWeek,
  getTotalMembersPreviousWeek,
  getActiveMembersThisWeek,
  getActiveMembersPreviousWeek,
  getNewMembersThisWeek,
  getNewMembersPreviousWeek,
  getTotalOrganizationsThisWeek,
  getTotalOrganizationsPreviousWeek,
  getActiveOrganizationsThisWeek,
  getActiveOrganizationsPreviousWeek,
  getNewOrganizationsThisWeek,
  getNewOrganizationsPreviousWeek,
  getTotalActivitiesThisWeek,
  getTotalActivitiesPreviousWeek,
  getNewActivitiesThisWeek,
  getNewActivitiesPreviousWeek,
} from './activities/weekly-analytics/buildEmailFromCube'

import {
  getTenantUsers,
  getSegments,
  getMostActiveMembers,
  getMostActiveOrganizations,
  getTopActivityTypes,
  getConversations,
  getActiveTenantIntegrations,
} from './activities/weekly-analytics/buildEmailFromDatabase'

export {
  updateEmailHistory,
  signalsGetNextEmails,
  signalsBuildEmailContent,
  signalsUpdateNextEmailAt,
  signalsSendEmail,
  signalsFetchFromDatabase,
  signalsFetchFromSignals,
  getTotalMembersThisWeek,
  getTotalMembersPreviousWeek,
  getActiveMembersThisWeek,
  getActiveMembersPreviousWeek,
  getNewMembersThisWeek,
  getNewMembersPreviousWeek,
  getTotalOrganizationsThisWeek,
  getTotalOrganizationsPreviousWeek,
  getActiveOrganizationsThisWeek,
  getActiveOrganizationsPreviousWeek,
  getNewOrganizationsThisWeek,
  getNewOrganizationsPreviousWeek,
  getTotalActivitiesThisWeek,
  getTotalActivitiesPreviousWeek,
  getNewActivitiesThisWeek,
  getNewActivitiesPreviousWeek,
  getTenantUsers,
  getSegments,
  getMostActiveMembers,
  getMostActiveOrganizations,
  getTopActivityTypes,
  getConversations,
  getActiveTenantIntegrations,
  weeklySendEmail,
}
