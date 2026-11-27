# How to publish a new version of the action

The action runs from a single ncc bundle in `dist/` (`action.yml` -> `dist/index.js`).
`node_modules/` and `lib/` are **not** committed.

```bash
pnpm install
pnpm test
pnpm run build   # tsc -> lib/, then ncc -> dist/ (commit dist/)
git add dist
git commit -m "build: rebuild dist"
git tag -a 2.1.0 -m "2.1.0"   # no `v` prefix
git push origin release 2.1.0
```

CI fails when `dist/` is out of date, so always rebuild before committing source changes.

Reference the action by tag, e.g. `uses: masgeek/github-tag-action@2.1.0`.
