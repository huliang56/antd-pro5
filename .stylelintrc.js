const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.stylelint,
  extends: ['stylelint-config-rational-order'],
  plugins: ['stylelint-order', 'stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,
  },
};
