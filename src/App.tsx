import { useEffect, useMemo, useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import { JBrowseApp, createViewState } from '@jbrowse/react-app2'
import { useQueryState } from 'nuqs'

import Header from './Header'
import UniprotPlugin from './UniprotPlugin/UniprotPlugin'
import { loadUniprotId } from './loadUniprotId'

import type { JBrowseConfig } from './types'

export type ViewModel = ReturnType<typeof createViewState>

function View() {
  const [config, setConfig] = useState<JBrowseConfig>()
  const [error, setError] = useState<unknown>()
  const [uniprotId, setUniprotId] = useQueryState('id', { defaultValue: '' })

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadUniprotId({
      uniprotId,
      setError,
      setConfig,
    })
  }, [uniprotId])

  const viewState = useMemo(() => {
    if (!config) {
      return null
    }
    return createViewState({
      config,
      plugins: [UniprotPlugin],
    })
  }, [config])

  useEffect(() => {
    try {
      if (viewState) {
        // eslint-disable-next-line  @typescript-eslint/no-unsafe-call
        viewState.session.views[0].activateTrackSelector()
      }
    } catch (error_) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(error_)
      console.error(error_)
    }
  }, [viewState])

  return (
    <>
      <Header
        setUniprotId={arg => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          setUniprotId(arg)
        }}
      />
      {error ? <ErrorMessage error={error} /> : null}

      <div className="mt-10">
        {viewState ? <JBrowseApp viewState={viewState} /> : null}
      </div>
    </>
  )
}

export default View
