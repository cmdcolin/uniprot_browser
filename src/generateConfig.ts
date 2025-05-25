export async function generateConfig(uniprotId: string) {
  const url = `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`)
  }
  const data = await res.text()
  const types = [
    ...new Set(
      data
        .split('\n')
        .filter(f => !f.startsWith('#'))
        .map(f => f.trim())
        .filter(f => !!f)
        .map(f => f.split('\t')[2]),
    ),
  ]
  return {
    assemblies: [
      {
        name: uniprotId,
        sequence: {
          type: 'ReferenceSequenceTrack',
          trackId: `${uniprotId}-ReferenceSequenceTrack`,
          sequenceType: 'pep',
          adapter: {
            type: 'UnindexedFastaAdapter',
            rewriteRefNames: "jexl:split(refName,'|')[1]",
            fastaLocation: {
              uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.fasta`,
            },
          },
        },
      },
    ],
    tracks: [
      ...types.map(type => {
        const s = `${uniprotId}-${type}`
        return {
          type: 'FeatureTrack',
          trackId: s,
          name: type,
          adapter: {
            type: 'Gff3Adapter',
            gffLocation: {
              uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`,
            },
          },
          assemblyNames: [uniprotId],
          displays: [
            {
              displayId: `${s}-LinearBasicDisplay`,
              type: 'LinearBasicDisplay',
              jexlFilters: [`get(feature,'type')=='${type}'`],
            },
          ],
        }
      }),
      {
        type: 'FeatureTrack',
        trackId: `${uniprotId}-Antigen`,
        name: 'Antigen',
        adapter: {
          type: 'Gff3Adapter',
          gffLocation: {
            uri: `https://www.ebi.ac.uk/proteins/api/antigen/${uniprotId}?format=gff`,
          },
        },
        assemblyNames: [uniprotId],
      },
      {
        type: 'FeatureTrack',
        trackId: `${uniprotId}-Variation`,
        name: 'Variation',
        adapter: {
          type: 'UniProtVariationAdapter',
          location: {
            uri: `https://www.ebi.ac.uk/proteins/api/variation/${uniprotId}.json`,
          },
        },
        assemblyNames: [uniprotId],
      },
      {
        type: 'QuantitativeTrack',
        trackId: `${uniprotId}-AlphaFold-confidence`,
        name: 'AlphaFold confidence',
        adapter: {
          type: 'AlphaFoldConfidenceAdapter',
          location: {
            uri: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-confidence_v4.json`,
          },
        },
        assemblyNames: [uniprotId],
      },
      {
        type: 'MultiQuantitativeTrack',
        trackId: `${uniprotId}-AlphaMissense-scores`,
        name: 'AlphaMissense scores',
        assemblyNames: [uniprotId],
        adapter: {
          type: 'AlphaMissensePathogenicityAdapter',
          location: {
            uri: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-aa-substitutions.csv`,
          },
        },
        displays: [
          {
            type: 'MultiLinearWiggleDisplay',
            displayId: `${uniprotId}-AlphaMissense-scores-MultiLinearWiggleDisplay`,
            defaultRendering: 'multirowdensity',
            renderers: {
              MultiDensityRenderer: {
                type: 'MultiDensityRenderer',
                bicolorPivotValue: 0.5,
                posColor: 'red',
                negColor: 'blue',
              },
            },
          },
        ],
      },
    ],
    defaultSession: {
      name: uniprotId,
      views: [
        {
          id: 'integration_test',
          type: 'LinearGenomeView',
          init: {
            assembly: uniprotId,
            loc: uniprotId,
            tracks: [`${uniprotId}-Domain`],
          },
        },
      ],
    },
  }
}
