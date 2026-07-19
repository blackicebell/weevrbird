# Weevrbird Policy Hosting Fallback

Date: 2026-07-19

Google Play needs a public privacy policy URL. The repo already contains static pages:

- `public/privacy.html`
- `public/terms.html`
- `public/index.html`

## Preferred Option: GitHub Pages

Use this if you want the policy pages hosted from the same GitHub repo.

1. Open `https://github.com/blackicebell/weevrbird/settings/pages`.
2. Set Source to GitHub Actions.
3. Save.
4. Wait for the workflow named Deploy static policy pages.
5. Verify:
   - `https://blackicebell.github.io/weevrbird/privacy.html`
   - `https://blackicebell.github.io/weevrbird/terms.html`

Only paste the privacy URL into Google Play after it returns a real page instead of 404.

## Fast Manual Option: Any Static Host

Use this if GitHub Pages is slow or blocked.

Upload the contents of the `public/` folder to any static host that gives public HTTPS URLs. The privacy URL should point directly to `privacy.html`.

Acceptable examples:

- Netlify static deploy
- Vercel static project
- Cloudflare Pages
- Your own domain or hosting account

Required public URLs:

- Privacy policy URL
- Terms URL if you decide to publish Terms for testers

## What Not To Do

- Do not paste a local file path into Google Play.
- Do not paste the GitHub repository file view URL as the privacy policy.
- Do not use a URL that returns 404, requires sign-in, or downloads the file instead of showing the page.
- Do not use the draft markdown files as the public policy unless they are rendered on a public website.

## Final Play Console Privacy URL

Use this once it works:

`https://blackicebell.github.io/weevrbird/privacy.html`
