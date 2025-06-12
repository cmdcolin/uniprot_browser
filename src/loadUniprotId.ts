import { generateConfig } from './generateConfig'

export async function loadUniprotId({
  uniprotId,
  setError,
  setConfig,
}: {
  setError: (a: unknown) => void
  setConfig: (a: any) => void
  uniprotId: string
}) {
  try {
    setError(undefined)
    if (uniprotId) {
      const conf = await generateConfig(uniprotId)
      setConfig(conf)
    }
  } catch (error) {
    console.error(error)
    setError(error)
  }
}
