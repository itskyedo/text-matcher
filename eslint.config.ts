import createConfig from '@itskyedo/eslint-config';

export default createConfig({
  library: true,
  typescript: true,
  prettier: true,
  jsdoc: true,
  import: true,
  promise: true,
  stylistic: false,
  sort: true,
});
