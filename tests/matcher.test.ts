/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { describe, expect, test } from 'vitest';

import { type Match, matchAllRules, matchRule } from '../src';

const slashStarComments = /(\/\*[\s\S]*?\*\/)(\n?)/gm;
const doubleSlashComments = /(\/\/)(?<message>.*)(\n?)/gm;
const newlines = /\n/gm;
const spaces = /\s+/gm;
const numbers = /[0-9]+/gm;

describe('matchRule', () => {
  test('single rule', () => {
    expect(Array.from(matchRule(spaces, '   aa  bb '))).toEqual([
      {
        start: 0,
        end: 2,
        value: '   ',
        groups: undefined,
      },
      {
        start: 5,
        end: 6,
        value: '  ',
        groups: undefined,
      },
      {
        start: 9,
        end: 9,
        value: ' ',
        groups: undefined,
      },
    ]);
  });

  test('multiple lines', () => {
    expect(
      Array.from(
        matchRule(
          newlines,
          '/**\n * JSDoc\n * Comment\n */\nText A\n/* // Comment */ Text\nText B',
        ),
      ),
    ).toEqual([
      {
        start: 3,
        end: 3,
        value: '\n',
        groups: undefined,
      },
      {
        start: 12,
        end: 12,
        value: '\n',
        groups: undefined,
      },
      {
        start: 23,
        end: 23,
        value: '\n',
        groups: undefined,
      },
      {
        start: 27,
        end: 27,
        value: '\n',
        groups: undefined,
      },
      {
        start: 34,
        end: 34,
        value: '\n',
        groups: undefined,
      },
      {
        start: 56,
        end: 56,
        value: '\n',
        groups: undefined,
      },
    ]);
  });
});

describe('matchAllRules', () => {
  test('multiple non-overlapping rules', () => {
    expect(
      Array.from(
        matchAllRules('   11  22 ', {
          spaces,
          numbers,
        }),
      ),
    ).toEqual([
      {
        start: 0,
        end: 2,
        left: {
          rule: 'spaces',
          start: 0,
          end: 2,
          value: '   ',
          groups: undefined,
        },
        right: {
          rule: 'spaces',
          start: 0,
          end: 2,
          value: '   ',
          groups: undefined,
        },
        matches: expect.arrayContaining([
          {
            rule: 'spaces',
            start: 0,
            end: 2,
            value: '   ',
            groups: undefined,
          },
        ]),
      },
      {
        start: 3,
        end: 4,
        left: {
          rule: 'numbers',
          start: 3,
          end: 4,
          value: '11',
          groups: undefined,
        },
        right: {
          rule: 'numbers',
          start: 3,
          end: 4,
          value: '11',
          groups: undefined,
        },
        matches: expect.arrayContaining([
          {
            rule: 'numbers',
            start: 3,
            end: 4,
            value: '11',
            groups: undefined,
          },
        ]),
      },
      {
        start: 5,
        end: 6,
        left: {
          rule: 'spaces',
          start: 5,
          end: 6,
          value: '  ',
          groups: undefined,
        },
        right: {
          rule: 'spaces',
          start: 5,
          end: 6,
          value: '  ',
          groups: undefined,
        },
        matches: expect.arrayContaining([
          {
            rule: 'spaces',
            start: 5,
            end: 6,
            value: '  ',
            groups: undefined,
          },
        ]),
      },
      {
        start: 7,
        end: 8,
        left: {
          rule: 'numbers',
          start: 7,
          end: 8,
          value: '22',
          groups: undefined,
        },
        right: {
          rule: 'numbers',
          start: 7,
          end: 8,
          value: '22',
          groups: undefined,
        },
        matches: expect.arrayContaining([
          {
            rule: 'numbers',
            start: 7,
            end: 8,
            value: '22',
            groups: undefined,
          },
        ]),
      },
      {
        start: 9,
        end: 9,
        left: {
          rule: 'spaces',
          start: 9,
          end: 9,
          value: ' ',
          groups: undefined,
        },
        right: {
          rule: 'spaces',
          start: 9,
          end: 9,
          value: ' ',
          groups: undefined,
        },
        matches: expect.arrayContaining([
          {
            rule: 'spaces',
            start: 9,
            end: 9,
            value: ' ',
            groups: undefined,
          },
        ]),
      },
    ]);
  });

  test('multiple overlapping rules', () => {
    expect(
      Array.from(
        matchAllRules(
          '/**\n * JSDoc\n * Comment\n */\nText A\n/* // Comment */ Text\nText B',
          {
            slashStarComment: slashStarComments,
            doubleSlashComment: doubleSlashComments,
            newlines,
          },
        ),
      ),
    ).toEqual([
      {
        start: 0,
        end: 27,
        left: {
          rule: 'slashStarComment',
          start: 0,
          end: 27,
          groups: undefined,
          value: '/**\n * JSDoc\n * Comment\n */\n',
        },
        right: {
          rule: 'slashStarComment',
          start: 0,
          end: 27,
          groups: undefined,
          value: '/**\n * JSDoc\n * Comment\n */\n',
        },
        matches: expect.arrayContaining([
          {
            rule: 'slashStarComment',
            start: 0,
            end: 27,
            groups: undefined,
            value: '/**\n * JSDoc\n * Comment\n */\n',
          },
          {
            rule: 'newlines',
            start: 3,
            end: 3,
            groups: undefined,
            value: '\n',
          },
          {
            rule: 'newlines',
            start: 12,
            end: 12,
            groups: undefined,
            value: '\n',
          },
          {
            rule: 'newlines',
            start: 23,
            end: 23,
            groups: undefined,
            value: '\n',
          },
          {
            rule: 'newlines',
            start: 27,
            end: 27,
            groups: undefined,
            value: '\n',
          },
        ]),
      },
      {
        start: 34,
        end: 34,
        left: {
          rule: 'newlines',
          start: 34,
          end: 34,
          groups: undefined,
          value: '\n',
        },
        right: {
          rule: 'newlines',
          start: 34,
          end: 34,
          groups: undefined,
          value: '\n',
        },
        matches: expect.arrayContaining([
          {
            rule: 'newlines',
            start: 34,
            end: 34,
            groups: undefined,
            value: '\n',
          },
        ]),
      },
      {
        start: 35,
        end: 56,
        left: {
          rule: 'slashStarComment',
          start: 35,
          end: 50,
          groups: undefined,
          value: '/* // Comment */',
        },
        right: {
          rule: 'doubleSlashComment',
          start: 38,
          end: 56,
          groups: {
            message: ' Comment */ Text',
          },
          value: '// Comment */ Text\n',
        },
        matches: expect.arrayContaining([
          {
            rule: 'slashStarComment',
            start: 35,
            end: 50,
            groups: undefined,
            value: '/* // Comment */',
          },
          {
            rule: 'doubleSlashComment',
            start: 38,
            end: 56,
            groups: {
              message: ' Comment */ Text',
            },
            value: '// Comment */ Text\n',
          },
          {
            rule: 'newlines',
            start: 56,
            end: 56,
            groups: undefined,
            value: '\n',
          },
        ]),
      },
    ]);
  });
});

describe('rules', () => {
  test('handles generator rules', () => {
    function* customRule(text: string): Generator<Match, void> {
      for (let i = 0; i < text.length; i++) {
        yield {
          start: i,
          end: i,
          value: text[i],
          groups: undefined,
        };
      }
    }

    expect(Array.from(matchRule(customRule, 'abc'))).toEqual([
      {
        start: 0,
        end: 0,
        value: 'a',
        groups: undefined,
      },
      {
        start: 1,
        end: 1,
        value: 'b',
        groups: undefined,
      },
      {
        start: 2,
        end: 2,
        value: 'c',
        groups: undefined,
      },
    ]);
  });
});
