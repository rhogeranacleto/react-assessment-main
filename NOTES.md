# Notes

## `npm install` fails with E401 (private registry in the lockfile)

### Problem

`npm install` (including `npm install -D @commitlint/cli @commitlint/config-conventional husky`) failed with:

```
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
```

The new packages were found on the public registry, but npm also had to fetch the tarballs already pinned in `package-lock.json`.

### Cause

`package-lock.json` had 408 `resolved` URLs pointing to a private AWS CodeArtifact registry (`ct-codeartifact-domain-prd01-…eu-west-1.amazonaws.com`, repository `npm-public`) instead of `https://registry.npmjs.org`. Likely reasons:

- The starter was generated on a machine whose npm was configured to use CodeArtifact, and npm recorded those URLs in the lockfile.
- CodeArtifact auth tokens are short-lived (about 12 hours), so the login had expired, and npm answered 401.
- The AWS CLI needed to refresh the token (`aws codeartifact login …`) was not available in the environment.
- Anyone without access to that registry (for example reviewers of the assessment) would hit the same error.

### Solution

Deleted `package-lock.json` and ran `npm install` again. npm re-resolved every dependency from the public registry and generated a new lockfile: all `resolved` URLs now point to `https://registry.npmjs.org` (0 CodeArtifact references left, 408 before). Install completed without errors.

### Follow-ups

- The lockfile change is uncommitted. Review the diff and commit it (suggested: `build(deps): resolve lockfile from the public npm registry`).
- Re-resolving can bump transitive versions within the ranges in `package.json`; run `npm run lint`, `npm test` and `npm run build` to confirm nothing regressed.
- `@commitlint/cli`, `@commitlint/config-conventional` and `husky` are not installed yet. `commitlint.config.js` and `.husky/commit-msg` exist, but the hook stays inactive until you run:
  ```bash
  npm install -D @commitlint/cli @commitlint/config-conventional husky
  npm pkg set scripts.prepare="husky"
  npm run prepare
  ```
- To avoid this in the future, don't commit a lockfile generated against a private registry; check `grep -c codeartifact package-lock.json` is `0` before submitting.
