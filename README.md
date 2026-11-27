# GitHub Tag Action

A GitHub Action that bumps and pushes a SemVer git tag on merge, generates a changelog, and can create the GitHub Release. Fully deterministic: no AI, no external tools to install. Works on any runner (Node 24 runtime, single bundled `dist/index.js`).

It understands plain [Conventional Commits](https://www.conventionalcommits.org) and the **gitmoji conventional commits** style (`✨ feat(cli): add x`, `💥 feat(api)!: drop y`).

- [Quick start](#quick-start)
- [Inputs](#-inputs)
- [Outputs](#-outputs)
- [How the version is chosen](#how-the-version-is-chosen)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## Quick start

```yaml
name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write # create tags and releases

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Bump version, tag and release
        id: tag
        uses: masgeek/github-tag-action@2.0.0 # pin to a tag of this repo
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          tag_prefix: ""            # tags like 1.2.3 (default is v1.2.3)
          create_release: true      # also create the GitHub Release
      - run: echo "Released ${{ steps.tag.outputs.new_tag }}"
        if: steps.tag.outputs.released == 'true'
```

Notes:

- Tags of this action have **no `v` prefix** (`2.0.0`, not `v2.0.0`).
- `actions/checkout` is only needed if later steps use the repo; the action itself talks to the GitHub API.
- The default `GITHUB_TOKEN` needs `contents: write`.
- By default only `main` produces release tags and `develop` produces pre-release runs (see [`release_branches`](#filter-branches)); set `release_branches: "main,master"` to include `master`.

## 📥 Inputs

| Input | Default | Description |
|---|---|---|
| `github_token` | _(required)_ | Token used to read tags/commits and create the tag and release. Usually `${{ secrets.GITHUB_TOKEN }}`. |
| `commit_sha` | `GITHUB_SHA` | Commit to tag. Use it when a previous step merged a branch into `github.ref`. |
| `fetch_all_tags` | `false` | Fetch every tag instead of the last 100. Turn on for repos with more than 100 tags. |
| `release_branches` | `main` | Comma separated branches (JavaScript regex accepted) that create tags. Other branches and pull requests never create a tag. |
| `pre_release_branches` | `develop` | Comma separated branches (regex) treated as pre-release branches. To disable, set it to a branch name that does not exist. |
| `default_bump` | `patch` | Bump used when no commit calls for one: `patch`, `minor`, `major`, or `false` to skip the release. |
| `default_prerelease_bump` | `prerelease` | Same as `default_bump` for pre-release branches: `prerelease`, `prepatch`, `preminor`, `premajor` or `false`. |
| `tag_prefix` | `v` | Prefix of the tag name. Use `""` for no prefix. |
| `custom_tag` | _(none)_ | Use this exact tag and skip bump calculation. |
| `append_to_pre_release_tag` | `<branch>` | Identifier used when matching pre-release tags. |
| `create_annotated_tag` | `false` | Create an annotated tag instead of a lightweight one. |
| `custom_release_rules` | _(none)_ | Extra rules `<type>:<release>[:<changelog section>]`, comma separated. |
| `gitmoji` | `true` | Understand gitmoji-prefixed and `type!:` commits. |
| `extended_release_rules` | `false` | Enable the extra rules `accessibility`, `removal`, `security`, `refactor`, `build`. |
| `create_release` | `false` | Create a GitHub Release (body = changelog) after the tag exists. |
| `release_draft` | `false` | Create that release as a draft. |
| `dry_run` | `false` | Compute version and changelog only; create nothing. |

### Filter branches

`release_branches` and `pre_release_branches` are JavaScript regular expressions matched against the branch name (`release.*,hotfix.*,main`, `.*`, …). A branch matching neither list never creates a tag, so the action is safe to run on pull requests.

### Customize the tag

- **`default_bump: false`** skips the run when no commit triggers a release. Combine it with the [extended rules](#gitmoji--extended-release-rules) so `docs`, `test`, `ci`, `style` and `chore` commits do not release.
- **`custom_tag`** overrides everything; `release_type` is then `custom`.
- **`create_annotated_tag: true`** creates a tag object (message = tag name) instead of a bare ref.
- **Pre-release branches** compute the same plain version as release branches (for example `2.0.0`); the pre-release suffix is never added to the tag. If the tag already exists the run is skipped.

### Custom release rules

`custom_release_rules` is a comma separated list of `<type>:<release>` or `<type>:<release>:<changelog section>`.

```yaml
with:
  custom_release_rules: "hotfix:patch:Hotfixes,pre-feat:preminor,chore:patch:Chores"
```

- `<release>` is `major`, `minor`, `patch` (or `premajor`/`preminor`/`prepatch` for pre-release branches).
- Without a section, the [Angular default section](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) is used; a type with no section is omitted from the changelog.
- Custom rules win over the extended rules for the same type.

### Gitmoji & extended release rules

**`gitmoji`** (default `true`) normalizes commits before analysis, so the bump and the changelog both see clean conventional messages:

| Commit | Read as | Release |
|---|---|---|
| `✨ feat(cli): add x` | `feat(cli): add x` | minor |
| `:bug: fix: y` | `fix: y` | patch |
| `💥 feat(api)!: drop y` | `feat(api): drop y` + `BREAKING CHANGE: drop y` | major |
| `fix(api)!: drop y` | `fix(api): drop y` + `BREAKING CHANGE: drop y` | major |
| `feat: x` with a `BREAKING CHANGE:` footer | unchanged | major |
| `📝 docs: update readme` | `docs: update readme` | none |

A leading emoji or `:shortcode:` is stripped; a leading `💥`/`:boom:` or `!` marks the commit breaking and adds the footer if missing. Set `gitmoji: false` to use the raw messages.

**`extended_release_rules`** (default `false`) adds these rules (merged under `custom_release_rules`):

| Type | Release | Changelog section |
|---|---|---|
| `accessibility` | minor | Accessibility |
| `removal` | minor | Removed |
| `security` | patch | Security |
| `refactor` | patch | Code Refactoring |
| `build` | patch | Build Systems |

`feat` is minor, `fix`/`perf`/`revert` are patch, breaking is major. `docs`, `test`, `ci`, `style` and `chore` never release on their own.

### GitHub Release

With `create_release: true` the action calls the GitHub API after the tag is created (the tag must exist first, which also works with immutable releases):

- name and tag = the new tag, body = the generated changelog;
- `prerelease` is `true` on pre-release branches;
- `release_draft: true` creates a draft;
- skipped on `dry_run`, when the tag already exists, or when no tag is created.

This replaces a separate `ncipollo/release-action` step.

## 📤 Outputs

| Output | Description |
|---|---|
| `new_tag` | New tag including the prefix. |
| `new_version` | New version without the prefix. |
| `previous_tag` | Previous tag (or `<prefix>0.0.0` if none). Unset with `custom_tag`. |
| `previous_version` | Previous version without the prefix. Unset with `custom_tag`. |
| `release_type` | `major`, `minor`, `patch` or `custom` (can be prefixed with `pre`). |
| `changelog` | Conventional changelog (Markdown) since the previous tag. |
| `breaking` | `true` for a major release or when a breaking-change commit was seen. |
| `released` | `true` only when a tag was actually created (`false` for dry runs, skips and existing tags). |

Outputs such as `new_tag` are also set on a dry run, but `released` stays `false`.

## How the version is chosen

1. Find the latest valid SemVer tag matching `tag_prefix` (or `<prefix>0.0.0`).
2. Take the commits between that tag and `commit_sha`.
3. Normalize them (gitmoji), then pick the highest release type from the rules.
4. If no rule matches, use `default_bump` (`false` = skip).
5. Increment the version, skip if that tag already exists, otherwise create it.

Examples with the defaults (`gitmoji: true`, `extended_release_rules: false`):

| Commit message | Release |
|---|---|
| `fix(pencil): stop graphite breaking when too much pressure applied` | patch |
| `feat(pencil): add 'graphiteWidth' option` | minor |
| `perf(pencil): remove graphiteWidth option` + footer `BREAKING CHANGE: ...` | major |
| `💥 feat(pencil)!: remove graphiteWidth option` | major |
| `docs: update readme` | `default_bump` |

## Examples

### Skip releases for docs/chore only (recommended with gitmoji)

```yaml
- uses: masgeek/github-tag-action@2.0.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    tag_prefix: ""
    default_bump: false          # nothing to release => no tag
    extended_release_rules: true
    create_release: true
```

### Dry run: preview the next version in a pull request

```yaml
on: pull_request
jobs:
  preview:
    runs-on: ubuntu-latest
    permissions: { contents: read }
    steps:
      - id: tag
        uses: masgeek/github-tag-action@2.0.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          dry_run: true
          release_branches: ".*"   # let the PR branch compute a version
      - run: |
          echo "Next: ${{ steps.tag.outputs.new_tag }} (${{ steps.tag.outputs.release_type }})"
          echo "Breaking: ${{ steps.tag.outputs.breaking }}"
```

### Annotated tags and a draft release

```yaml
- uses: masgeek/github-tag-action@2.0.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    create_annotated_tag: true
    create_release: true
    release_draft: true
```

### Use outputs in later steps (build only when released)

```yaml
- id: tag
  uses: masgeek/github-tag-action@2.0.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
- if: steps.tag.outputs.released == 'true'
  run: ./deploy.sh "${{ steps.tag.outputs.new_version }}"
- if: steps.tag.outputs.breaking == 'true'
  run: echo "::warning::Breaking release ${{ steps.tag.outputs.new_tag }}"
```

### Keep using ncipollo/release-action

Leave `create_release` off and use the outputs:

```yaml
- id: tag
  uses: masgeek/github-tag-action@2.0.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
- if: steps.tag.outputs.released == 'true'
  uses: ncipollo/release-action@v1
  with:
    tag: ${{ steps.tag.outputs.new_tag }}
    body: ${{ steps.tag.outputs.changelog }}
```

### Several release branches and pre-release branches

```yaml
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  release_branches: "main,release/.*,hotfix/.*"
  pre_release_branches: "develop"   # the default
  default_prerelease_bump: prerelease
```

On `develop`, `prerelease: true` is set on any created GitHub Release.

### Tag a specific commit or use a fixed tag

```yaml
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  commit_sha: ${{ steps.merge.outputs.sha }}   # tag this commit, not GITHUB_SHA
  # custom_tag: "2024.06.1"                     # or force the tag name
```

### Large repositories

```yaml
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  fetch_all_tags: true   # more than 100 tags
```

## Troubleshooting

- **`Resource not accessible by integration`**: add `permissions: contents: write` to the job.
- **`This tag already exists. Skipping`**: the computed version was already tagged; make a commit that bumps (`feat`, `fix`, …) or use `custom_tag`.
- **`released` is `false` and nothing was tagged**: no commit triggered a release and `default_bump` is `false`, the branch is not in `release_branches`/`pre_release_branches`, it was a dry run, or the tag existed.
- **Emoji commits not bumping**: keep `gitmoji: true` and use `<emoji> <type>(scope): description`. Types without a rule (for example `security`, `accessibility`, `removal`, `refactor`, `build`) need `extended_release_rules: true` or a custom rule.
- **Squash merges**: the squash title is the commit message; make sure it follows the same format.
- **First run**: with no tags the previous version is `<prefix>0.0.0`.

## Development

The repository uses pnpm and ships a single `ncc` bundle in `dist/` (`node_modules/` and `lib/` are not committed).

```bash
pnpm install
pnpm test
pnpm run build      # tsc -> lib/, then ncc -> dist/ (commit dist/)
```

CI fails when `dist/` is out of date. See [docs/how-to-publish-new-version.md](docs/how-to-publish-new-version.md) for releasing a new version.

## Credits

Based on [mathieudutour/github-tag-action](https://github.com/mathieudutour/github-tag-action). See also [anothrNick/github-tag-action](https://github.com/anothrNick/github-tag-action).
