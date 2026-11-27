import {
  hasBreakingFooter,
  normalizeCommitMessage,
  normalizeCommits,
} from '../src/commit-parser';

describe('commit-parser', () => {
  it('leaves plain conventional commits untouched', () => {
    expect(normalizeCommitMessage('fix(core): a bug')).toEqual(
      'fix(core): a bug'
    );
  });

  it('strips a leading emoji', () => {
    expect(normalizeCommitMessage('✨ feat(cli): add x')).toEqual(
      'feat(cli): add x'
    );
    expect(normalizeCommitMessage('🐛️ fix: y')).toEqual('fix: y');
    expect(normalizeCommitMessage('🛠️ build: z')).toEqual('build: z');
  });

  it('strips a leading :shortcode:', () => {
    expect(normalizeCommitMessage(':sparkles: feat: add x')).toEqual(
      'feat: add x'
    );
  });

  it('turns type!: into a BREAKING CHANGE footer', () => {
    expect(normalizeCommitMessage('feat(api)!: drop y')).toEqual(
      'feat(api): drop y\n\nBREAKING CHANGE: drop y'
    );
  });

  it('turns a leading 💥 into a BREAKING CHANGE footer', () => {
    expect(
      normalizeCommitMessage('💥 feat(api)!: drop y\n\nbody text')
    ).toEqual('feat(api): drop y\n\nbody text\n\nBREAKING CHANGE: drop y');
    expect(normalizeCommitMessage('💥 refactor: rewrite')).toEqual(
      'refactor: rewrite\n\nBREAKING CHANGE: rewrite'
    );
    expect(normalizeCommitMessage(':boom: fix: rewrite')).toEqual(
      'fix: rewrite\n\nBREAKING CHANGE: rewrite'
    );
  });

  it('does not duplicate an existing BREAKING CHANGE footer', () => {
    const message = '💥 feat!: drop y\n\nBREAKING CHANGE: old api is gone';
    expect(normalizeCommitMessage(message)).toEqual(
      'feat: drop y\n\nBREAKING CHANGE: old api is gone'
    );
  });

  it('keeps footers of non-breaking commits and handles CRLF', () => {
    expect(
      normalizeCommitMessage('✨ feat: a\r\n\r\nBREAKING-CHANGE: b')
    ).toEqual('feat: a\n\nBREAKING-CHANGE: b');
  });

  it('passes through non conventional messages', () => {
    expect(normalizeCommitMessage('Merge branch main')).toEqual(
      'Merge branch main'
    );
    expect(normalizeCommitMessage('📝 update docs')).toEqual('update docs');
  });

  it('detects breaking footers', () => {
    expect(hasBreakingFooter('a\n\nBREAKING CHANGE: x')).toBe(true);
    expect(hasBreakingFooter('feat: a')).toBe(false);
  });

  it('normalizes a list and keeps other fields', () => {
    expect(normalizeCommits([{ message: '✨ feat: a', hash: 'abc' }])).toEqual([
      { message: 'feat: a', hash: 'abc' },
    ]);
  });
});
