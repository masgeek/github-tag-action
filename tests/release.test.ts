import action from '../src/action';
import * as utils from '../src/utils';
import * as github from '../src/github';
import * as core from '@actions/core';
import {
  loadDefaultInputs,
  setBranch,
  setCommitSha,
  setInput,
  setRepository,
} from './helper.test';

jest.spyOn(core, 'debug').mockImplementation(() => {});
jest.spyOn(core, 'info').mockImplementation(() => {});
jest.spyOn(core, 'warning').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});

const mockCreateTag = jest
  .spyOn(github, 'createTag')
  .mockResolvedValue(undefined);
const mockCreateRelease = jest
  .spyOn(github, 'createRelease')
  .mockResolvedValue(undefined);
const mockSetOutput = jest
  .spyOn(core, 'setOutput')
  .mockImplementation(() => {});
const mockSetFailed = jest.spyOn(core, 'setFailed');

const tag = (name: string) => ({
  name,
  commit: { sha: '012345', url: '' },
  zipball_url: '',
  tarball_url: 'string',
  node_id: 'string',
});

function givenRepo(messages: string[]) {
  // run the real normalization over the raw GitHub API commits
  jest.spyOn(github, 'compareCommits').mockResolvedValue(
    messages.map((message, i) => ({
      sha: `sha${i}`,
      commit: { message },
    })) as any
  );
  jest.spyOn(utils, 'getValidTags').mockResolvedValue([tag('v1.2.3')]);
}

beforeAll(() => {
  setRepository('https://github.com', 'org/repo');
});

beforeEach(() => {
  jest.clearAllMocks();
  setBranch('master');
  setCommitSha('79e0ea271c26aa152beef77c3275ff7b8f8d8274');
  loadDefaultInputs();
});

describe('gitmoji commits', () => {
  it('bumps minor for ✨ feat', async () => {
    givenRepo(['✨ feat(cli): add x']);
    await action();
    expect(mockSetOutput).toHaveBeenCalledWith('release_type', 'minor');
    expect(mockSetOutput).toHaveBeenCalledWith('new_version', '1.3.0');
    expect(mockSetOutput).toHaveBeenCalledWith('breaking', 'false');
    expect(mockSetOutput).toHaveBeenLastCalledWith('released', 'true');
    expect(mockCreateTag).toHaveBeenCalledTimes(1);
    expect(mockSetFailed).not.toBeCalled();
  });

  it('bumps major for 💥 and type!:', async () => {
    givenRepo(['💥 feat(api)!: drop y']);
    await action();
    expect(mockSetOutput).toHaveBeenCalledWith('new_version', '2.0.0');
    expect(mockSetOutput).toHaveBeenCalledWith('breaking', 'true');

    jest.clearAllMocks();
    givenRepo(['fix(api)!: drop y']);
    await action();
    expect(mockSetOutput).toHaveBeenCalledWith('release_type', 'major');
  });

  it('bumps major for a BREAKING CHANGE footer', async () => {
    givenRepo(['✨ feat: a\n\nBREAKING CHANGE: gone']);
    await action();
    expect(mockSetOutput).toHaveBeenCalledWith('new_version', '2.0.0');
  });

  it('can be disabled', async () => {
    setInput('gitmoji', 'false');
    setInput('default_bump', 'false');
    givenRepo(['✨ feat(cli): add x']);
    await action();
    expect(mockCreateTag).not.toBeCalled();
    expect(mockSetOutput).toHaveBeenCalledWith('released', 'false');
  });
});

describe('extended release rules', () => {
  it.each([
    ['accessibility: improve contrast', 'minor', '1.3.0'],
    ['removal: drop old flag', 'minor', '1.3.0'],
    ['🔒 security: patch xss', 'patch', '1.2.4'],
    ['♻️ refactor: simplify', 'patch', '1.2.4'],
    ['🛠️ build: bump deps', 'patch', '1.2.4'],
  ])('%s -> %s', async (message, releaseType, version) => {
    setInput('extended_release_rules', 'true');
    setInput('default_bump', 'false');
    givenRepo([message]);
    await action();
    expect(mockSetOutput).toHaveBeenCalledWith('release_type', releaseType);
    expect(mockSetOutput).toHaveBeenCalledWith('new_version', version);
  });

  it.each(['docs: a', 'test: b', 'ci: c', 'style: d', 'chore: e'])(
    '%s does not release with default_bump false',
    async (message) => {
      setInput('extended_release_rules', 'true');
      setInput('default_bump', 'false');
      givenRepo([message]);
      await action();
      expect(mockCreateTag).not.toBeCalled();
    }
  );

  it('is off by default', async () => {
    setInput('default_bump', 'false');
    givenRepo(['security: patch xss']);
    await action();
    expect(mockCreateTag).not.toBeCalled();
  });

  it('lets custom_release_rules win', () => {
    const rules = utils.buildReleaseRules('security:minor', true)!;
    expect(rules.find((r) => r.type === 'security')!.release).toBe('minor');
    expect(rules.find((r) => r.type === 'removal')!.release).toBe('minor');
    expect(utils.buildReleaseRules('', false)).toBeUndefined();
  });

  it('adds changelog sections', () => {
    const sections = utils
      .mergeWithDefaultChangelogRules()
      .map((rule) => rule.section);
    expect(sections).toEqual(
      expect.arrayContaining(['Security', 'Accessibility', 'Removed'])
    );
  });
});

describe('github release', () => {
  it('is not created by default', async () => {
    givenRepo(['feat: a']);
    await action();
    expect(mockCreateRelease).not.toBeCalled();
  });

  it('is created after the tag with the changelog', async () => {
    setInput('create_release', 'true');
    setInput('release_draft', 'true');
    givenRepo(['✨ feat: add a thing']);
    await action();
    expect(mockCreateRelease).toHaveBeenCalledWith(
      'v1.3.0',
      expect.stringContaining('add a thing'),
      false,
      true
    );
    expect(mockCreateTag.mock.invocationCallOrder[0]).toBeLessThan(
      mockCreateRelease.mock.invocationCallOrder[0]
    );
  });

  it('is skipped on dry run', async () => {
    setInput('create_release', 'true');
    setInput('dry_run', 'true');
    givenRepo(['feat: a']);
    await action();
    expect(mockCreateTag).not.toBeCalled();
    expect(mockCreateRelease).not.toBeCalled();
    expect(mockSetOutput).toHaveBeenCalledWith('released', 'false');
  });

  it('is marked prerelease on prerelease branches', async () => {
    setBranch('beta');
    setInput('create_release', 'true');
    setInput('pre_release_branches', 'beta');
    givenRepo(['feat: a']);
    await action();
    expect(mockCreateRelease).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      true,
      false
    );
  });
});
