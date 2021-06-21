const config = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType : 'module',
  },
  parser: '@babel/eslint-parser',
  env   : { node: true },
  rules : {
    'key-spacing': [
      'error',
      {
        align: {
          beforeColon: false,
          afterColon : true,
          on         : 'colon',
        },
      },
    ],
    semi: [
      'error',
      'never',
      { beforeStatementContinuationChars: 'never' },
    ],
    indent: [
      'error',
      2,
      { SwitchCase: 1 },
    ],
    quotes: [
      'error',
      'single',
      { allowTemplateLiterals: true },
    ],
    'array-bracket-spacing': [
      'error',
      'always',
    ],
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'computed-property-spacing': [
      'error',
      'never',
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'object-curly-newline': [
      'error',
      {
        multiline    : true,
        minProperties: 2,
      },
    ],
    'object-property-newline': [
      'error',
      { allowMultiplePropertiesPerLine: false },
    ],
    'array-bracket-newline': [
      'error',
      {
        multiline: true,
        minItems : 2,
      },
    ],
    'array-element-newline': [
      'error',
      {
        multiline: true,
        minItems : 2,
      },
    ],
    'arrow-parens': [
      'error',
      'as-needed',
    ],
    'import/no-dynamic-require': 0,
    'no-multi-assign'          : 0,
    radix                      : 0,
    camelcase                  : [ 'warn' ],
    'class-methods-use-this'   : 0,
    'no-plusplus'              : 0,
    'no-continue'              : 0,
    'no-prototype-builtins'    : 0,
    'no-underscore-dangle'     : 0,
    'no-cond-assign'           : 0,
    'import/no-unresolved'     : [
      'error',
      {
        ignore: [
          '@*',
          './*',
        ],
      },
    ],
    'import/extensions': 0,
    'import/order'     : [ 'warn' ],
    'max-len'          : [
      'error',
      {
        code                  : 128,
        ignoreStrings         : true,
        ignoreUrls            : true,
        ignoreComments        : false,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals  : true,
      },
    ],
    'no-unused-vars': [
      'warn',
      {
        vars              : 'all',
        args              : 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    'no-console'                       : [ 'warn' ],
    'guard-for-in'                     : 0,
    'no-restricted-syntax'             : 0,
    'no-lonely-if'                     : 0,
    'no-extra-boolean-cast'            : 0,
    'no-await-in-loop'                 : 0,
    'no-loop-in-func'                  : 0,
    'no-case-declarations'             : 0,
    'no-bitwise'                       : 0,
    'import/prefer-default-export'     : 0,
    'consistent-return'                : 0,
    'default-case'                     : 0,
    'no-param-reassign'                : 0,
    'no-return-await'                  : 0,
    'import/no-extraneous-dependencies': 0,
    'lines-between-class-members'      : 0,
    'max-classes-per-file'             : 0,
  },
}

module.exports = config
