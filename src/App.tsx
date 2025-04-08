import { useState, useEffect } from 'react'
import { createViewState, JBrowseApp } from '@jbrowse/react-app2'

import config from './config'
import { ErrorMessage } from '@jbrowse/core/ui'
import PluginManager from '@jbrowse/core/PluginManager'
import UniProtVariationAdapterF from './UniProtVariationAdapter'
import AlphaFoldConfidenceAdapterF from './AlphaFoldConfidenceAdapter'
import AlphaMissensePathogenicityAdapterF from './AlphaMissensePathogenicityAdapter'
import Plugin from '@jbrowse/core/Plugin'

type ViewModel = ReturnType<typeof createViewState>

class UniprotPlugin extends Plugin {
  name = 'UniprotPlugin'
  version = '0.0.0'
  install(pluginManager: PluginManager) {
    UniProtVariationAdapterF(pluginManager)
    AlphaFoldConfidenceAdapterF(pluginManager)
    AlphaMissensePathogenicityAdapterF(pluginManager)
  }
  configure() {}
}

async function generateConfig(uniprotId: string) {
  const url = `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`)
  }
  const data = await res.text()
  const types = [
    ...new Set(
      data
        .split('\n')
        .filter(f => !f.startsWith('#'))
        .map(f => f.trim())
        .filter(f => !!f)
        .map(f => f.split('\t')[2]),
    ),
  ]
  return {
    assemblies: [
      {
        name: uniprotId,
        sequence: {
          type: 'ReferenceSequenceTrack',
          trackId: `${uniprotId}-ReferenceSequenceTrack`,
          sequenceType: 'pep',
          adapter: {
            type: 'UnindexedFastaAdapter',
            rewriteRefNames: "jexl:split(refName,'|')[1]",
            fastaLocation: {
              uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.fasta`,
            },
          },
        },
      },
    ],
    tracks: [
      ...types.map(type => {
        const s = `${uniprotId}-${type}`
        return {
          type: 'FeatureTrack',
          trackId: s,
          name: type,
          adapter: {
            type: 'Gff3Adapter',
            gffLocation: {
              uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`,
            },
          },
          assemblyNames: [uniprotId],
          displays: [
            {
              displayId: `${s}-LinearBasicDisplay`,
              type: 'LinearBasicDisplay',
              jexlFilters: [`get(feature,'type')=='${type}'`],
            },
          ],
        }
      }),
      {
        type: 'FeatureTrack',
        trackId: `${uniprotId}-Antigen`,
        name: 'Antigen',
        adapter: {
          type: 'Gff3Adapter',
          gffLocation: {
            uri: `https://www.ebi.ac.uk/proteins/api/antigen/${uniprotId}?format=gff`,
          },
        },
        assemblyNames: [uniprotId],
      },
      {
        type: 'FeatureTrack',
        trackId: `${uniprotId}-Variation`,
        name: 'Variation',
        adapter: {
          type: 'UniProtVariationAdapter',
          location: {
            uri: `https://www.ebi.ac.uk/proteins/api/variation/${uniprotId}.json`,
          },
        },
        assemblyNames: [uniprotId],
      },
      {
        type: 'QuantitativeTrack',
        trackId: `${uniprotId}-AlphaFold-confidence`,
        name: 'AlphaFold confidence',
        adapter: {
          type: 'AlphaFoldConfidenceAdapter',
          location: {
            uri: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-confidence_v4.json`,
          },
        },
        assemblyNames: [uniprotId],
      },
      {
        type: 'MultiQuantitativeTrack',
        trackId: `${uniprotId}-AlphaMissense-scores`,
        name: 'AlphaMissense scores',
        assemblyNames: [uniprotId],
        adapter: {
          type: 'AlphaMissensePathogenicityAdapter',
          location: {
            uri: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-aa-substitutions.csv`,
          },
        },
        displays: [
          {
            type: 'MultiLinearWiggleDisplay',
            displayId: `${uniprotId}-AlphaMissense-scores-MultiLinearWiggleDisplay`,
            defaultRendering: 'multirowdensity',
            renderers: {
              MultiDensityRenderer: {
                type: 'MultiDensityRenderer',
                bicolorPivotValue: 0.5,
              },
            },
          },
        ],
      },
    ],
    defaultSession: {
      name: uniprotId,
      views: [
        {
          id: 'integration_test',
          type: 'LinearGenomeView',
          init: {
            assembly: uniprotId,
            loc: uniprotId,
            tracks: [uniprotId + '-Domain'],
          },
        },
      ],
    },
  }
}

function View() {
  const [viewState, setViewState] = useState<ViewModel>()
  const [val, setVal] = useState('')
  const [error, setError] = useState<unknown>()
  const [config, setConfig] = useState<any>()

  useEffect(() => {
    try {
      setError(undefined)
      console.log({ config })
      const state = createViewState({
        config,
        plugins: [UniprotPlugin],
      })
      setViewState(state)
    } catch (e) {
      setError(e)
    }
  }, [config])

  if (!viewState) {
    return null
  }

  return (
    <>
      <h1 className="text-3xl">UniProt browser</h1>

      {error ? <ErrorMessage error={error} /> : null}

      <form
        onSubmit={async e => {
          e.preventDefault()
          setError(undefined)
          console.log('wtf')
          try {
            if (val) {
              const conf = await generateConfig(val)
              setConfig(conf)
            }
          } catch (e) {
            console.error(e)
            setError(e)
          }
        }}
      >
        <label htmlFor="uniprot_id">Enter UniProt ID:</label>
        <input
          type="text"
          className="bg-gray-200 shadow border rounded"
          id="uniprot_id"
          value={val}
          onChange={event => setVal(event.target.value)}
        />
        <button
          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 p-1 m-1 rounded"
          type="submit"
        >
          Submit
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 p-1 m-1 rounded"
          onClick={async e => {
            try {
              e.preventDefault()
              const conf = await generateConfig('P05067')
              setVal('P05067')
              setConfig(conf)
            } catch (e) {
              console.error(e)
              setError(e)
            }
          }}
        >
          Example
        </button>
      </form>

      <div className="mt-10">
        <JBrowseApp viewState={viewState} />
      </div>
    </>
  )
}

export default View
