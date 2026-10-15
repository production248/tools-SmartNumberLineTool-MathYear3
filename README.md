# Smart Number Line Tool - Math Year 3

Independent Math Year 3 edition generated from the shared Smart Number Line Tool source.

- Fixed curriculum level: Math Year 3
- Fixed number range: 0 to 10000
- Modes: number exploration, comparison, rounding, and number patterns
- Languages: Bahasa Melayu, Chinese, and English
- Input: mouse, touch, and keyboard friendly

The range and level selectors are intentionally hidden in this edition. Shared interface and
interaction changes should be made in the source project and exported again so all editions stay consistent.

## EdCloud authentication

The learning interface starts only after the EdCloud Tool protocol v1 handshake succeeds.
`auth-bootstrap.js` accepts the trusted EdCloud web launchers and the opaque parent used by the
native StudentApp wrapper, validates the short-lived Tools token through the same-origin
`/api/auth/me` endpoint, and then loads `app.js`.

The token remains in memory only. Do not add it to URLs, browser storage, logs, analytics, or
error messages. Any future protected request should use `createToolsAuthorizationHeader()` from
`edcloud-tool-auth.js` and a server endpoint protected by the EdCloud Tools authorization policy.

Direct navigation is intentionally denied. Local browser testing requires an EdCloud-compatible
launcher on the same `localhost` origin and a reverse proxy for `/api/auth/me`; serving these
static files by themselves is not enough to complete authentication.
