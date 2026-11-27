# Changelog

All notable changes to this project are documented in this file.

## [3.0.0] - 2026-11-27

### ⚠️ BREAKING CHANGES

- **build:** switch to ncc bundling for distribution — Existing environments restricted to older Node.js versions may fail to execute the action

### 🐛 Bug fixes

- **changelog:** ensure conventional-commits preset is bundled (8d6e187)

### 🛠️ Build

- **dist:** bundle distribution build (10c6d8b)
- **dist:** bundle handlebars templates (d28a082)

## [2.0.0] - 2026-11-27

### ⚠️ BREAKING CHANGES

- **release:** add gitmoji support, extended release rules, and GitHub releases — Existing users who use gitmojis in their commit messages will now have them stripped and potentially have commits flagged as breaking changes automatically, changing the versioning behavior.

### ✨ Features

- **release:** add gitmoji support, extended release rules, and GitHub releases (9e63748)

### 🐛 Bug fixes

- **test:** correct tag creation expectation in action tests (b61203d)

## [1.0.0] - 2026-07-15

### ✨ Features

- **tag fetching:** support for more than a 100 tag at a time (a21ccc4)
- Add release_type to outputs (c7025fc)

### 🐛 Bug fixes

- replace returns a string (8e69e12)
- indentation (3cc0072)
- consistently sanitize identifier (caef8f4)
- issue #81 - sanitize semver in branch name (c443da5)
- allow running the action on a PR (c627331)
- Issue #62 - commits analyzed repeatedly (f8a4419)
- evaluation of dryRun as boolean (37d688c)

### 📝 Documentation

- arguments required to work with latest `actions/checkout` (a845af2)

### Other changes

- Update test.yml (d345f4f)
- WIP (b6cb667)
- WIP (b311978)
- WIP (7e55b1b)
- WIP (4c54958)
- WIP (a817a5b)
- WIP (f31773b)
- WIP (be3f51c)
- WIP (7420dde)
- WIP (9de61ed)
- WIP (6a3372c)
- Revert "Use `${{github.token}}` as default" (#167) (86301c8)
- Bump minimatch from 3.0.4 to 3.1.2 (#162) (5bd9038)
- getValidTags() should exclude tags that do not match the prefixRegex (#158) (ac8cb38)
- Bump json5 from 2.1.3 to 2.2.3 (#161) (6644374)
- Use `${{github.token}}` as default (#154) (87d9c10)
- version 6.1 (dbd80d2)
- Correctly parse `create_annotated_tag` (#137) (a1afa11)
- Update `@actions/core` to v1.10.0 (923acce)
- Update to Node.js 16 (c5ababc)
- Bump @actions/core from 1.6.0 to 1.9.1 (8bee2b2)
- Bump node-fetch from 2.6.1 to 2.6.7 (15886d3)
- Bump minimist from 1.2.5 to 1.2.6 (672968b)
- Create FUNDING.yml (ba54fd7)
- fix assignment (4cf1d6f)
- Updated README.md (aff4bff)
- Fixed code style and documentation (1b8ac6a)
- prepare version 6.0 (917867a)
- update deps (6f05ce1)
- Run prettier (f26971f)
- Updated action to include default_prerelease_bump to separate out options. (8614426)
- Added more tags to prerelease test (a5ae58c)
- Test setting default_bump to prerelease increments prerelease number when no bump encountered (204025a)
- Make sure we are only changing the bump var if it is a known prerelease commit. (c52d722)
- Support for incrementing the prerelease number when no automatic bumps are encountered. (c791a95)
- use GITHUB_SERVER_URL instead of hardcoded url (f050418)
- Update outdated example in README.md (c5cc34d)
- v5.6 (f5c2b14)
- Updated README.md (58d61ff)
- Added 'commit_sha' input to use this commit SHA instead GITHUB_SHA. (aca73cf)
- add doc (7450810)
- v5.5 (d02237e)
- v5.4 (77da703)
- Update action.ts (514c51b)
- actually need ? (08141c4)
- use mappedReleaseRules directly (8fe3864)
- remove unused types (ddafd83)
- move type in defaults (f1313dc)
- clean rules parsing (ca34e57)
- reword doc (b0dfd30)
- Bump y18n from 4.0.0 to 4.0.1 (e0a61d8)
- Add unit tests (7654e2d)
- Fix unit tests + Remove unwanted types (85ae005)
- Update README (2cfa3f0)
- Fix prettier issues (413032f)
- Custom Release rule changelog (4b936d9)
- v5.3 (87322e4)
- fix typo (5961cf9)
- v5.2 (7037405)
- add previous_version output (2d739a6)
- fix prettier error (63ff928)
- Fix(Compare GITHUB_SHA instead of 'HEAD' to baseRef/latest tag ref) (93b037f)
- fix custom tag prefix (f9c1f55)
- try renaming files (4011b0c)
- fix tests (27ff796)
- fix more types (c713842)
- fix types (2abed9d)
- Bump node-notifier from 8.0.0 to 8.0.1 (d2337ee)
- Update README.md (1db9b7f)
- I was hoping for MORE readability... (d2826f6)
- consistency (a500a89)
- mock debug and refactor mapping function (a4b921e)
- ignore lib with prettier (243e30c)
- add prettier and warning for invalid release types (485c833)
- add README (44796f5)
- add custom_release_rules and more tests (158d2b0)
- more tests (169b215)
- forgot package.json (79e0ea2)
- more tests (953789d)
- add some initial tests (c9d9702)
- Improve doc (#39) (39fb694)
- let's stay on v5 (808cb0b)
- Fix issue when append_to_pre_release_tag is set (#38) (bcf1629)
- Prereleases (#37) (a2cbb4e)
- Update README.md (6f71c79)
- Bump @actions/core from 1.2.4 to 1.2.6 (3c98f71)
- custom_tag not required (5a7ee26)
- Bump node-fetch from 2.6.0 to 2.6.1 (dcaf347)
- Update README.md (5e9c060)
- Update README.md (6f346ca)
- Introduce 'custom_tag' input (e4ab737)
- Bump lodash from 4.17.15 to 4.17.19 (f80379c)
- Replace "Github" with "GitHub" (b246e02)
- fix when data is empty (378af74)
- get commit hash as well (0b57d04)
- add a `false` option for default_bump (1ba75e9)
- v4.3 (f498350)
- update readme (fcbdb49)
- v4.2 (9862d97)
- update deps (0c680c5)
- Always set previous_tag output (3093d78)
- Added dry_run option (dbe810a)
- wait for changelog (8a2b37b)
- don't create tag if already exists (e33b12f)
- update lock file (84a0a2a)
- add changelog output (db3f178)
- v3.1.0 (eaba27d)
- v0.3.1 (466c73e)
- for some reason there is a ' at the beginning (76537e6)
- use console because we need string substitution (575d299)
- make sure to trim the commit messages (83c4cf4)
- get latest tag fix #4 (00d74c7)
- fetch tags before looking for them in case tags were created outside this action (see #5) (1308fda)
- add new_version output (861ef9e)
- Fix annotated tag check (891051c)
- add annotated tag support and update docs to reference new version (5a380ff)
- update package-lock (7c5c50e)
- v0.2.0 (5308ace)
- use semantic-release to get the bump (085ca3e)
- add previous_tag output (f6b1bf3)
- fix syntax highlight (ed5ada4)
- fix typo (54afd1e)
- fix typo (f87f1ca)
- fix typo (e05737e)
- try to fix stuff (a10f1b3)
- fix action (12a73e5)
- update readme (2f76d60)
- update instructions (5d21da2)
- update instructions (7f883d0)
- update readme (78c657a)
- fix typo (78aab39)
- fix typo (0f411a5)
- first commit :tada: (8d6e41c)
