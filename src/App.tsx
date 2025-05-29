import { useEffect, useState } from 'react'

import { JBrowseApp, createViewState } from '@jbrowse/react-app2'

import Header from './Header'

import { ErrorMessage } from '@jbrowse/core/ui'
import UniprotPlugin from './UniprotPlugin'
import type { JBrowseConfig } from './types'

type ViewModel = ReturnType<typeof createViewState>

function View() {
  const [viewState, setViewState] = useState<ViewModel>()
  const [config, setConfig] = useState<JBrowseConfig>()
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    try {
      if (config) {
        const state = createViewState({
          config,
          plugins: [UniprotPlugin],
        })
        setViewState(state)
        // eslint-disable-next-line  @typescript-eslint/no-unsafe-call
        state.session.views[0].activateTrackSelector()
      }
    } catch (e) {
      setError(e)
      console.error(e)
    }
  }, [config])

  return (
    <>
      <Header setConfig={setConfig} />
      {error ? <ErrorMessage error={error} /> : null}

      <div className="mt-10">
        {viewState ? <JBrowseApp viewState={viewState} /> : null}
      </div>
    </>
  )
}

export default View
