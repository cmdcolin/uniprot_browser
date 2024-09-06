async function jsonfetch(url: string, arg?: RequestInit) {
  const res = await fetch(url, arg)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${await res.text()}`)
  }
  return res.json()
}

async function textfetch(url: string, arg?: RequestInit) {
  const res = await fetch(url, arg)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${await res.text()}`)
  }
  return res.text()
}

interface TreeNode {
  children?: TreeNode[]
  sequence?: {
    mol_seq: {
      seq: string
      location?: string
    }
    id: {
      accession: string
    }[]
  }
  taxonomy: {
    common_name: string
    scientific_name: string
  }
}

interface Row {
  id: string
  seq: string
  species: string
  genomicLocString?: string
}

function gatherSequencesFromTree(tree: TreeNode, arr: Row[]) {
  if (tree.children) {
    for (const child of tree.children) {
      if (child.sequence) {
        const seq = child.sequence.mol_seq.seq
        const id = child.sequence.id[0]?.accession
        console.log({ child })
        if (id) {
          arr.push({
            id,
            seq,
            species:
              child.taxonomy.common_name || child.taxonomy.scientific_name,
            genomicLocString: child.sequence.mol_seq.location,
          })
        }
      }
      gatherSequencesFromTree(child, arr)
    }
  }
}
export async function geneTreeFetcher(id: string) {
  const r = localStorage.getItem(`${id}-msa`)
  const s = localStorage.getItem(`${id}-tree`)
  const msa = r
    ? JSON.parse(r)
    : await jsonfetch(
        `https://rest.ensembl.org/genetree/id/${id}?content-type=application/json;aligned=1;sequence=pep`,
      )
  const tree = s
    ? JSON.parse(s)
    : await textfetch(
        `https://rest.ensembl.org/genetree/id/${id}?nh_format=simple;content-type=text/x-nh`,
      )
  localStorage.setItem(`${id}-tree`, JSON.stringify(tree))
  localStorage.setItem(`${id}-msa`, JSON.stringify(msa))
  const result = [] as Row[]
  gatherSequencesFromTree(msa.tree, result)

  return {
    tree,
    msa: result.map(r => `>${r.id}\n${r.seq}`).join('\n'),
    treeMetadata: JSON.stringify(
      Object.fromEntries(result.map(r => [r.id, { genome: r.species }])),
    ),
  }
}
