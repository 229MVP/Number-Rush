# FAQ — Number Rush Template

**Does this include a backend or online leaderboard?**
No. This template is Classic-only and fully local (AsyncStorage). Backend,
accounts, and live-leaderboard code exist in source as disabled reference
architecture — see `KNOWN_LIMITATIONS.md` and `CUSTOMIZATION_GUIDE.md`.

**Does this include ads or in-app purchases?**
No. No ad SDK is initialized and no purchase flow is active. The reference
code for AdMob/RevenueCat integration remains in source but is disabled.

**Can I reskin this for a client project?**
Yes — see `CUSTOMIZATION_GUIDE.md` for renaming, re-theming, replacing
audio/icons, and adjusting gameplay constants (target value, strikes, tile
range, lane count, scoring, power-up quantities).

**Can I republish this exact template as my own template for resale?**
That depends on the license terms of the marketplace you purchased it from
— see `LICENSE_TEMPLATE.md`. Typically a standard license covers building
and publishing your own end product, not reselling the source template
itself.

**Will you build App Store / Google Play submission for me?**
No — that is outside the support policy. See `marketplace/SUPPORT_POLICY.md`.
Custom development/reskin/publishing help is available as a separate paid
service (see `DIRECT_SALES_PAGE.md`).

**Why do Bomb/Freeze/Shield/Wild power-ups exist in the code but not in the app?**
They are implemented but intentionally disabled for this SKU to ship only
the two most stable, thoroughly tested power-ups (Multiplier, Swap). Flip
`ADVANCED_POWER_UPS_ENABLED` (derived from `TEMPLATE_FEATURES.shop`) in
`src/config/templateFeatures.ts` if you want to re-enable and test them
yourself.

**What Expo SDK / React Native version does this use?**
Expo SDK 57, React Native 0.86, React 19, TypeScript. See `DOCUMENTATION.md`
for setup and build instructions.

**Does it work on web?**
Yes — `npx expo start --web` or `npx expo export --platform web`.

**What license covers the fonts, icons, and audio?**
See `ASSET_LICENSES.md` for a full breakdown (all commercially safe: Google
Fonts under OFL, Lucide icons under ISC, and 100% original generated audio).
