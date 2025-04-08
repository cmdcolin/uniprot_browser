import { useState, useEffect } from 'react'
import { createViewState, JBrowseApp } from '@jbrowse/react-app2'

import { ErrorMessage } from '@jbrowse/core/ui'
import PluginManager from '@jbrowse/core/PluginManager'
import UniProtVariationAdapterF from './UniProtVariationAdapter'
import AlphaFoldConfidenceAdapterF from './AlphaFoldConfidenceAdapter'
import AlphaMissensePathogenicityAdapterF from './AlphaMissensePathogenicityAdapter'
import Plugin from '@jbrowse/core/Plugin'
import { generateConfig } from './generateConfig'
import Button from './Button'

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

function View() {
  const [viewState, setViewState] = useState<ViewModel>()
  const [val, setVal] = useState('')
  const [error, setError] = useState<unknown>()
  const [config, setConfig] = useState<any>()

  useEffect(() => {
    try {
      setError(undefined)
      if (config) {
        const state = createViewState({
          config,
          // @ts-expect-error
          plugins: [UniprotPlugin],
        })
        setViewState(state)
        state.session.views[0].activateTrackSelector()
      }
    } catch (e) {
      setError(e)
    }
  }, [config])

  return (
    <>
      <h1 className="text-3xl">UniProt browser</h1>

      {error ? <ErrorMessage error={error} /> : null}

      <form
        onSubmit={async e => {
          e.preventDefault()
          setError(undefined)
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
        <Button type="submit">Submit</Button>
        <Button
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
        </Button>
      </form>

      <div className="mt-10">
        {viewState ? <JBrowseApp viewState={viewState} /> : null}
      </div>
    </>
  )
}

export default View
