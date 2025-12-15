/* eslint-disable class-methods-use-this */

import FieldTranslator from './fieldTranslator'
import { OrganizationsOpensearch } from './models/organizations'

export default class OrganizationTranslator extends FieldTranslator {
  constructor() {
    super()

    this.model = new OrganizationsOpensearch()

    const fields = this.model.getAllFields()

    // set translations for static fields
    this.translations = Object.keys(fields).reduce((acc, f) => {
      acc[f] = `${fields[f].type}_${f}`
      return acc
    }, {})

    // identities
    this.translations.platform = 'string_platform'
    this.translations.name = 'string_name'
    this.translations.url = 'string_url'

    this.setTranslationMaps()
  }

  override gitmeshToOpensearch(gitmeshKey: string): string {
    if (this.model.fieldExists(gitmeshKey)) {
      return super.gitmeshToOpensearch(gitmeshKey)
    }

    throw new Error(`Unknown filter key: ${gitmeshKey}`)
  }
}
