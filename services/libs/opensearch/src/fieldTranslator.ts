import OpensearchModelBase from './models/base'
import { OpenSearchIndex, OpensearchField, OpensearchFieldType } from '@gitmesh/types'

export default abstract class FieldTranslator {
  index: OpenSearchIndex

  gitmeshToOpensearchMap: Map<string, string>

  opensearchToGitmeshMap: Map<string, string>

  model: OpensearchModelBase

  translations: Record<string, string>

  constructor() {
    this.gitmeshToOpensearchMap = new Map<string, string>()
    this.opensearchToGitmeshMap = new Map<string, string>()
  }

  gitmeshToOpensearch(gitmeshKey: string): string {
    return this.gitmeshToOpensearchMap.get(gitmeshKey)
  }

  opensearchToGitmesh(opensearchKey: string): string {
    return this.opensearchToGitmeshMap.get(opensearchKey)
  }

  setTranslationMaps(): void {
    for (const key of Object.keys(this.translations)) {
      if (this.model.fieldExists(key) && this.model.getField(key).customTranslation) {
        this.gitmeshToOpensearchMap.set(key, this.model.getField(key).customTranslation.toOpensearch)
        this.opensearchToGitmeshMap.set(
          this.model.getField(key).customTranslation.fromOpensearch,
          key,
        )
      } else {
        this.gitmeshToOpensearchMap.set(key, this.translations[key])
        this.opensearchToGitmeshMap.set(this.translations[key], key)
      }
    }
  }

  fieldExists(key: string): boolean {
    return this.model.fieldExists(key)
  }

  convertIfInt(modelField: OpensearchField, value: unknown): unknown {
    if (modelField?.type === OpensearchFieldType.INT) {
      return parseInt(value as string, 10)
    }
    return value
  }

  isNestedField(field: string): boolean {
    return field.startsWith('nested_')
  }

  translateObjectToGitmesh(object: unknown): unknown {
    const translated = {}

    if (typeof object !== 'object' || object === null) {
      return object
    }

    if (Array.isArray(object)) {
      const translatedArray = []

      for (const objItem of object) {
        translatedArray.push(this.translateObjectToGitmesh(objItem))
      }
      return translatedArray
    }

    for (const key of Object.keys(object)) {
      const gitmeshKey = this.opensearchToGitmesh(key)
      if (gitmeshKey) {
        const modelField = this.model.getField(gitmeshKey)
        if (!modelField || !modelField.preventNestedFieldTranslation) {
          translated[gitmeshKey] = this.convertIfInt(
            modelField,
            this.translateObjectToGitmesh(object[key]),
          )
        } else {
          translated[gitmeshKey] = object[key]
        }
      }
    }

    return translated
  }
}
