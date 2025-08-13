export type Rule = RegExp | MatcherFunction;

export interface Match {
  start: number;
  end: number;
  value: string;
  groups?: Record<string, string>;
}

export interface MatchGroup {
  start: number;
  end: number;
  left: RuleMatch;
  right: RuleMatch;
  matches: [RuleMatch, ...RuleMatch[]];
}

export interface RuleMatch extends Match {
  rule: string;
}

export type MatcherFunction = (text: string) => Generator<Match, undefined>;

interface RuleState {
  rule: string;
  iterator: Generator<Match, undefined>;
  current: Match;
}

/**
 * Gets all matches for a rule.
 *
 * @param rule - A rule.
 * @param text - The text to parse.
 * @yields
 */
export function* matchRule(
  rule: Rule,
  text: string,
): Generator<Match, undefined> {
  if (rule instanceof RegExp) {
    if (!rule.flags.includes('g') || !rule.flags.includes('m')) {
      console.warn(
        'RegEx rules must have a global and multiline flag in the expression.',
      );
      return;
    }
  }

  if (rule instanceof RegExp) {
    for (const match of text.matchAll(rule)) {
      if (match[0]) {
        yield {
          start: match.index,
          end: match.index + match[0].length - 1,
          value: match[0],
          groups: match.groups,
        };
      }
    }
  } else {
    yield* rule(text);
  }
}

/**
 * Gets all match groups for a set of rules.
 *
 * @param text - The text to parse.
 * @param rules - An object mapping each rule to a name.
 * @yields
 */
export function* matchAllRules(
  text: string,
  rules: Record<string, Rule>,
): Generator<MatchGroup, undefined> {
  const ruleStates: RuleState[] = [];
  let currentStart: number = Infinity;
  let currentEnd: number = -Infinity;

  for (const [name, rule] of Object.entries(rules)) {
    const iterator = matchRule(rule, text);
    const iteration = iterator.next();
    const match = iteration.value;
    if (iteration.done || !match?.value) {
      continue;
    }

    if (match.start <= currentEnd && match.end >= currentStart) {
      currentStart = Math.min(currentStart, match.start);
      currentEnd = Math.max(currentEnd, match.end);
    } else if (match.start <= currentStart) {
      currentStart = match.start;
      currentEnd = match.end;
    }

    ruleStates.push({
      rule: name,
      iterator,
      current: match,
    });
  }

  while (ruleStates.length > 0) {
    const matches: RuleMatch[] = [];
    let nextStart: number = Infinity;
    let nextEnd: number = -Infinity;
    let left: RuleMatch | null = null;
    let right: RuleMatch | null = null;
    let index: number = 0;

    while (index < ruleStates.length) {
      const state = ruleStates[index];
      const { end, start } = state.current;

      if (start <= currentEnd && end >= currentStart) {
        const match: RuleMatch = {
          rule: state.rule,
          start: state.current.start,
          end: state.current.end,
          value: state.current.value,
          groups: state.current.groups,
        };

        const isLengthiestLeft =
          !left ||
          start < left.start ||
          (start === left.start && end > left.end);
        const isLengthiestRight =
          !right ||
          end > right.end ||
          (end === right.end && start < right.start);
        if (isLengthiestLeft) left = match;
        if (isLengthiestRight) right = match;

        matches.push(match);

        const nextText = state.iterator.next();
        if (nextText.done) {
          ruleStates.splice(index, 1);
          continue;
        } else {
          state.current = nextText.value;
        }
      } else {
        if (start <= nextEnd && end >= nextStart) {
          nextStart = Math.min(nextStart, start);
          nextEnd = Math.max(nextEnd, end);
        } else if (start <= nextStart) {
          nextStart = start;
          nextEnd = end;
        }

        index++;
      }
    }

    if (isArrayWithItems(matches) && left && right) {
      yield {
        matches,
        start: currentStart,
        end: currentEnd,
        left,
        right,
      };

      currentStart = nextStart;
      currentEnd = nextEnd;
    } else {
      break;
    }
  }
}

function isArrayWithItems<T>(value: T[]): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}
