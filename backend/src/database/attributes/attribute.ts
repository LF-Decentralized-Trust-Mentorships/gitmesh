import { IMemberAttribute } from '@gitmesh/types'

export interface AttributeData extends IMemberAttribute {
  id: string
  createdAt: string
  updatedAt: string
}
