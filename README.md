# text-matcher

A simple text matching library.

- 🚫 Zero-dependencies
- 🪶 Simple and lightweight
- 😴 Matches are lazily evaluated
- 🧩 Support for custom non-regex rules

## 🚀 Getting Started

### Installation

```console
npm install text-matcher
```

---

## 🗒️ Notes

- All regex rules must have the [global](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/global) (`g`) and [multiline](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/multiline) flags (`m`) in the expression.
- Rules can either a be [Regular Expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) or a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) that yields a `Match` object.

---

## 💡 Usage

### Match a single rule with `matchRule`

```typescript
import { matchRule } from 'text-matcher';

const matches = matchRule(/\n/gm, 'Line1\nLine2\nLine3');

console.log(Array.from(matches));

/*
Output: [
    {
        "start": 5,
        "end": 5,
        "value": "\n"
    },
    {
        "start": 11,
        "end": 11,
        "value": "\n"
    }
]
*/
```

### Match multiple rules with `matchAllRules`

The `left` property is a reference to the match with the smallest `start` value, selecting the lengthiest match if multiple matches share the same value. The `right` property follows the same logic, referencing the match with the largest `end` value.

```typescript
import { matchAllRules } from 'text-matcher';

const matches = matchAllRules('/* // Comment */ Text', {
  slashStarComments: /(\/\*[\s\S]*?\*\/)(\n?)/gm,
  // It's recommended to name your capture groups `(?<name>)` for easier extraction
  doubleSlashComments: /(\/\/)(?<message>.*)(\n?)/gm,
});

console.log(Array.from(matches));

/*
Output: [
    {
        "start": 0,
        "end": 20,
        "left": {
            "rule": "slashStarComments",
            "start": 0,
            "end": 15,
            "value": "/* // Comment *\/"
        },
        "right": {
            "rule": "doubleSlashComments",
            "start": 3,
            "end": 20,
            "value": "// Comment *\/ Text",
            "groups": {
                "message": " Comment *\/ Text"
            }
        },
        "matches": [
            {
                "rule": "slashStarComments",
                "start": 0,
                "end": 15,
                "value": "/* // Comment *\/"
            },
            {
                "rule": "doubleSlashComments",
                "start": 3,
                "end": 20,
                "value": "// Comment *\/ Text",
                "groups": {
                    "message": " Comment *\/ Text"
                }
            }
        ]
    }
]
*/
```

### Lazy matching

```typescript
import { matchRule } from 'text-matcher';

const matches = matchRule(/\n/gm, 'Line1\nLine2\nLine3');

const firstMatch = matches.next();
await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
const secondMatch = matches.next();
```

Alternatively, you can use a `for-of` or `while` loop to iterate over each match or store all matches as an array by using [`Array.from()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)

### Custom rules

> [!NOTE]
> Developers are responsible for ensuring that matches from custom rules are accurate.

```typescript
import { matchRule } from 'text-matcher';

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

const matches = matchRule(customRule, 'abc');

console.log(Array.from(matches));

/*
Output: [
    {
        start: 0,
        end: 0,
        value: 'a'
      },
      {
        start: 1,
        end: 1,
        value: 'b'
      },
      {
        start: 2,
        end: 2,
        value: 'c'
      },
]
*/
```

---

## 📃 License

MIT License. See [LICENSE](https://github.com/itskyedo/text-matcher/blob/main/LICENSE) for details.
