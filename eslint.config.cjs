const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
        },
      ],
    },
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
];
