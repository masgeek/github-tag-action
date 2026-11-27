# How to publish a new version of the action

## Branch flow

`feature branch` -> pull request into `develop` -> pull request into `release`.

- Pull requests into `develop` and `release` and pushes to `develop` run the tests (`test.yml`).
- A push (merge) to `release` that changes action code runs `release.yml` and publishes.

## Automated release

Releases are automated by `.github/workflows/release.yml` on every push to `release` (the default branch; `main` is the upstream mirror and is ignored):

1. `pnpm run check`, `pnpm run test` and `pnpm run build` (produces `dist/`, which is git-ignored on branches).
2. This action runs on itself with `dry_run: true` to compute the next tag and changelog from the commits (gitmoji rules, `default_bump: false`, `extended_release_rules: true`). `docs`/`test`/`ci`/`style`/`chore` alone do not release.
3. If a tag is due and does not exist yet, the workflow creates a detached commit that force-adds `dist/`, tags it (for example `2.1.0`, no `v` prefix), moves the major tag (`2`) to it, and pushes only the tags. Branches never contain `dist/`.
4. A GitHub Release is created with the changelog as body.

Users reference the action by tag: `uses: masgeek/github-tag-action@2` (moving major) or `@2.1.0` (fixed).

## Manual release (fallback)

```bash
pnpm install
pnpm test
pnpm run build
git checkout --detach
git add -f dist
git commit -m "build: dist for 2.1.0"
git tag -a 2.1.0 -m 2.1.0
git tag -fa 2 -m 2
git push origin 2.1.0 && git push --force origin 2
```
