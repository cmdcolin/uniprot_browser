import AlphaFoldConfidenceAdapterF from './AlphaFoldConfidenceAdapter'
import AlphaMissensePathogenicityAdapterF from './AlphaMissensePathogenicityAdapter'
import UniProtVariationAdapterF from './UniProtVariationAdapter'

import type PluginManager from '@jbrowse/core/PluginManager'
import Plugin from '@jbrowse/core/Plugin'

export default class UniprotPlugin extends Plugin {
  name = 'UniprotPlugin'
  version = '0.0.0'
  install(pluginManager: PluginManager) {
    UniProtVariationAdapterF(pluginManager)
    AlphaFoldConfidenceAdapterF(pluginManager)
    AlphaMissensePathogenicityAdapterF(pluginManager)
  }
  configure() {}
}
