import { useEffect, useState } from 'react'

import Plugin from '@jbrowse/core/Plugin'
import { ErrorMessage } from '@jbrowse/core/ui'
import { JBrowseApp, createViewState } from '@jbrowse/react-app2'

import AlphaFoldConfidenceAdapterF from './AlphaFoldConfidenceAdapter'
import AlphaMissensePathogenicityAdapterF from './AlphaMissensePathogenicityAdapter'
import Button from './Button'
import UniProtVariationAdapterF from './UniProtVariationAdapter'
import { generateConfig } from './generateConfig'

import type PluginManager from '@jbrowse/core/PluginManager'

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

interface JBrowseConfig {
  assemblies: any[]
  tracks: any[]
}

function View() {
  const [viewState, setViewState] = useState<ViewModel>()
  const [val, setVal] = useState('')
  const [error, setError] = useState<unknown>()
  const [config, setConfig] = useState<JBrowseConfig>()

  useEffect(() => {
    try {
      setError(undefined)
      if (config) {
        const state = createViewState({
          config,
          plugins: [UniprotPlugin],
        })
        setViewState(state)
        // eslint-disable-next-line  @typescript-eslint/no-unsafe-call
        state.session.views[0].activateTrackSelector()
      }
    } catch (error_) {
      setError(error_)
    }
  }, [config])

  return (
    <>
      <h1 className="text-3xl">UniProt browser</h1>

      {error ? <ErrorMessage error={error} /> : null}

      <form
        onSubmit={e => {
          e.preventDefault()
          setError(undefined)
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          ;(async () => {
            try {
              if (val) {
                const conf = await generateConfig(val)
                setConfig(conf)
              }
            } catch (error_) {
              console.error(error_)
              setError(error_)
            }
          })()
        }}
      >
        <label htmlFor="uniprot_id">Enter UniProt ID:</label>
        <input
          type="text"
          className="bg-gray-200 shadow border rounded"
          id="uniprot_id"
          value={val}
          onChange={event => {
            setVal(event.target.value)
          }}
        />
        <Button type="submit">Submit</Button>
        <Button
          onClick={e => {
            e.preventDefault()
            setError(undefined)
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            ;(async () => {
              try {
                const conf = await generateConfig('P05067')
                setVal('P05067')
                setConfig(conf)
              } catch (error_) {
                console.error(error_)
                setError(error_)
              }
            })()
          }}
        >
          Example
        </Button>
      </form>

      <div className="mt-10">
        {viewState ? <JBrowseApp viewState={viewState} /> : null}
      </div>
    </>
  )
}

export default View
