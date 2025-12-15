import { SignalsSettings } from '@gitmesh/types'

export interface UserTenant {
  userId?: string
  tenantId: string
  email?: string
  firstName?: string
  settings?: {
    signals: SignalsSettings
  }
}

export interface UserTenantWithEmailSent extends UserTenant {
  type: string
  sentAt: Date
  emails: string[]
}
