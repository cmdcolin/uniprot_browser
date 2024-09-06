import { ungzip } from 'pako'

async function unzipfetch(url: string, arg?: RequestInit) {
  const res = await fetch(url, arg)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${await res.text()}`)
  }
  return ungzip(await res.arrayBuffer(), { to: 'string' })
}

export async function treeFamFetcher(id: string) {
  return id
    ? {
        msa: await unzipfetch(
          `https://jbrowse.org/demos/treefam_family_data/${id}.aln.emf.gz`,
        ),
        tree: await unzipfetch(
          `https://jbrowse.org/demos/treefam_family_data/${id}.nh.emf.gz`,
        ),
      }
    : undefined
}
