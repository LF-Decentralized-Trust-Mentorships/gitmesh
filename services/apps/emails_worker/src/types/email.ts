import { SignalsRawPost, SignalsPostWithActions } from '@gitmesh/types'

import { UserTenant } from './user'

export interface Content {
  fromDatabase: SignalsRawPost[]
  fromSignals: SignalsRawPost[]
}

export interface EmailToSend extends UserTenant {
  content: SignalsPostWithActions[] | object
}

export interface EmailSent {
  sentAt: Date
}
