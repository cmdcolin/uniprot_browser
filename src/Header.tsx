import { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'

import Button from './Button'
import { generateConfig } from './generateConfig'
import type { JBrowseConfig } from './types'

function Header({ setConfig }: { setConfig: (config: JBrowseConfig) => void }) {
  const [val, setVal] = useState('')
  const [error, setError] = useState<unknown>()

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
          className="bg-gray-200 shadow-sm border rounded-sm"
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
    </>
  )
}

export default Header
