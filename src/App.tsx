import { useState } from 'react'
import { observer } from 'mobx-react'
import { createJBrowseTheme } from '@jbrowse/core/ui/theme'
import { ThemeProvider } from '@mui/material/styles'
import { ErrorMessage } from '@jbrowse/core/ui'

import useSWR from 'swr'

import ReactMSAView from './ReactMSAView'
import Button from './Button'
import Link from './Link'
import { geneTreeFetcher } from './ensemblGeneTreeUtils'
import { treeFamFetcher } from './treeFamUtils'

const App = observer(function () {
  const [val, setVal] = useState('')
  const [id, setId] = useState('')
  const [type, setType] = useState<'treeFam' | 'geneTree'>('geneTree')

  const str = type === 'treeFam' ? 'TreeFam ID' : 'GeneTree ID'
  return (
    <div>
      <div className="m-2 p-2">
        <div>
          <div className="m-2">
            <div>
              <input
                id="genetree"
                type="radio"
                checked={type === 'geneTree'}
                value="geneTree"
                onChange={event => {
                  // @ts-expect-error
                  setType(event.target.value)
                  setId('')
                }}
              />
              <label htmlFor="genetree">Ensembl Compara GeneTree</label>
            </div>
            <div>
              <input
                id="treefam"
                type="radio"
                checked={type === 'treeFam'}
                value="treeFam"
                onChange={event => {
                  // @ts-expect-error
                  setType(event.target.value)
                  setId('')
                }}
              />
              <label htmlFor="treefam">TreeFam (historical)</label>
            </div>
            <div>
              <label htmlFor="query">Enter {str}:</label>
              <input
                id="query"
                className="bg-gray-200 shadow border rounded"
                type="text"
                value={val}
                onChange={event => {
                  setVal(event.target.value)
                  setId('')
                }}
              />

              <Button
                onClick={() => {
                  if (type === 'treeFam') {
                    setVal('TF105041')
                    setId('TF105041')
                  } else {
                    setVal('ENSGT00390000003602')
                    setId('ENSGT00390000003602')
                  }
                }}
              >
                Example
              </Button>
              <Button
                onClick={() => {
                  setId(val)
                }}
              >
                Submit
              </Button>
              {id ? (
                type === 'geneTree' ? (
                  <Link
                    href={`https://useast.ensembl.org/Multi/GeneTree/Image?gt=${id}`}
                  >
                    See at Ensembl
                  </Link>
                ) : (
                  <Link href={`http://www.treefam.org/family/${id}`}>
                    See at TreeFam
                  </Link>
                )
              ) : null}
            </div>
          </div>
        </div>
        {id ? (
          type === 'geneTree' ? (
            <GeneTreeId geneTreeId={id} />
          ) : (
            <TreeFamId treeFamId={id} />
          )
        ) : null}
      </div>
    </div>
  )
})

function TreeFamId({ treeFamId }: { treeFamId: string }) {
  const { data, isLoading, error } = useSWR(treeFamId, treeFamFetcher)
  return error ? (
    <ErrorMessage error={error} />
  ) : isLoading ? (
    <div>Loading...</div>
  ) : data ? (
    <ReactMSAView msa={data.msa} tree={data.tree} />
  ) : null
}

function GeneTreeId({ geneTreeId }: { geneTreeId: string }) {
  const { data, isLoading, error } = useSWR(geneTreeId, geneTreeFetcher)
  return error ? (
    <ErrorMessage error={error} />
  ) : isLoading ? (
    <div>Loading...</div>
  ) : data ? (
    <ReactMSAView
      msa={data.msa}
      tree={data.tree}
      treeMetadata={data.treeMetadata}
    />
  ) : null
}

const MainApp = () => {
  const theme = createJBrowseTheme()
  return (
    <ThemeProvider theme={theme}>
      <App />
      <div style={{ height: 300 }} />
    </ThemeProvider>
  )
}

export default MainApp
