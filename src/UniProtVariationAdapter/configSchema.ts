import { ConfigurationSchema } from '@jbrowse/core/configuration'

const UniProtVariationAdapter = ConfigurationSchema(
  'UniProtVariationAdapter',
  {
    /**
     * #slot
     */
    location: {
      type: 'fileLocation',
      defaultValue: { uri: '/path/to/my.bed.gz', locationType: 'UriLocation' },
    },
    /**
     * #slot
     */
    scoreField: {
      type: 'string',
      defaultValue: '',
    },
  },
  { explicitlyTyped: true },
)
export default UniProtVariationAdapter
