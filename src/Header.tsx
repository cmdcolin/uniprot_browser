import { useState } from 'react'

import Button from './components/Button'

function Header({ setUniprotId }: { setUniprotId: (str: string) => void }) {
  const [val, setVal] = useState('')

  return (
    <>
      <h1 className="text-3xl">UniProt browser</h1>

      <form
        onSubmit={e => {
          e.preventDefault()
          setUniprotId(val)
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
            setUniprotId('P05067')
          }}
        >
          Example
        </Button>
      </form>
    </>
  )
}

export default Header
