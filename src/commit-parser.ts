/**
 * Deterministic commit normalization for gitmoji + conventional commits.
 *
 * `✨ feat(cli): add x`        -> `feat(cli): add x`
 * `:sparkles: feat: add x`     -> `feat: add x`
 * `💥 feat(api)!: drop y`      -> `feat(api): drop y` + `BREAKING CHANGE: drop y`
 */

const EMOJI_PREFIX =
  /^(?:(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍|\p{Emoji_Modifier}|\p{Extended_Pictographic})*|:[a-z0-9_+-]+:)\s*/u;

const BREAKING_EMOJI = /^(?:💥|:boom:)/u;

const HEADER = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.*)$/;

const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:/m;

export function hasBreakingFooter(message: string): boolean {
  return BREAKING_FOOTER.test(message);
}

export function normalizeCommitMessage(message: string): string {
  const normalized = message.replace(/\r\n/g, '\n');
  const newline = normalized.indexOf('\n');
  let header = newline === -1 ? normalized : normalized.slice(0, newline);
  const body = newline === -1 ? '' : normalized.slice(newline);

  const trimmedHeader = header.trimStart();
  let breaking = BREAKING_EMOJI.test(trimmedHeader);
  header = trimmedHeader.replace(EMOJI_PREFIX, '');

  let description = header;
  const match = header.match(HEADER);
  if (match) {
    const [, type, scope, bang, desc] = match;
    if (bang) {
      breaking = true;
    }
    description = desc;
    header = `${type}${scope !== undefined ? `(${scope})` : ''}: ${desc}`;
  }

  let result = `${header}${body}`;
  if (breaking && !hasBreakingFooter(result)) {
    result = `${result.trimEnd()}\n\nBREAKING CHANGE: ${description}`;
  }
  return result;
}

export function normalizeCommits<T extends { message: string }>(
  commits: T[]
): T[] {
  return commits.map((commit) => ({
    ...commit,
    message: normalizeCommitMessage(commit.message),
  }));
}
