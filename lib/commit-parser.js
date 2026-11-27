"use strict";
/**
 * Deterministic commit normalization for gitmoji + conventional commits.
 *
 * `✨ feat(cli): add x`        -> `feat(cli): add x`
 * `:sparkles: feat: add x`     -> `feat: add x`
 * `💥 feat(api)!: drop y`      -> `feat(api): drop y` + `BREAKING CHANGE: drop y`
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCommits = exports.normalizeCommitMessage = exports.hasBreakingFooter = void 0;
const EMOJI_PREFIX = /^(?:(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍|\p{Emoji_Modifier}|\p{Extended_Pictographic})*|:[a-z0-9_+-]+:)\s*/u;
const BREAKING_EMOJI = /^(?:💥|:boom:)/u;
const HEADER = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.*)$/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:/m;
function hasBreakingFooter(message) {
    return BREAKING_FOOTER.test(message);
}
exports.hasBreakingFooter = hasBreakingFooter;
function normalizeCommitMessage(message) {
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
exports.normalizeCommitMessage = normalizeCommitMessage;
function normalizeCommits(commits) {
    return commits.map((commit) => (Object.assign(Object.assign({}, commit), { message: normalizeCommitMessage(commit.message) })));
}
exports.normalizeCommits = normalizeCommits;
