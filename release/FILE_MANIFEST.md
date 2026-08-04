# Number Rush Template — Release File Manifest

**Generated:** 2026-08-02 · **Total files:** 304

Every file below is included in `release/number-rush-neon-template/`.

## What's excluded, and why

- `node_modules/`, `.expo/`, `dist/`, `coverage/` — build artifacts and installed
  dependencies (buyer runs `npm install`).
- `.git/` — git history is not part of the source deliverable.
- Personal environment files (`.env`) — none were ever committed; only
  `.env.example` (names only, no values) ships.
- Access tokens, database passwords, Supabase link metadata — none exist in
  this repository (see `docs/SECURITY_AND_PRIVACY_CHECK.md`).
- `AGENTS.md`, `CLAUDE.md`, `.claude/` — AI coding-agent workspace
  configuration, irrelevant to a template buyer.
- `project.godot`, `ui/`, `autoload/`, `tools/*.gd*`, `scripts/ui/`,
  `assets/fonts/*.ttf`, `assets/icons/*.png|svg`, and their `.import`
  sidecar files — an unrelated Godot 4 port of an earlier version of this
  game concept, not part of this Expo/React Native template (see
  `KNOWN_LIMITATIONS.md`).
- Root `LICENSE` (MIT, Expo-starter boilerplate copyright) — replaced by
  `LICENSE_TEMPLATE.md`, which correctly describes the marketplace-license
  posture instead of implying the whole game is MIT-licensed by Expo.
- The majority of `docs/*.md` (60+ files) — historical/technical planning
  documents for connected-backend, monetization, and live-ops phases that are
  **disabled** in this SKU. A curated subset relevant to the template buyer
  is included below; the rest remain in the source git history for anyone
  who wants to re-enable that architecture (see `CUSTOMIZATION_GUIDE.md`).
- Temporary/incomplete screenshots — none; every file under `screenshots/`
  is a final, real capture (see `docs/SCREENSHOT_PLAN.md`).
- Apple / EAS credentials — none exist in this repository; buyers configure
  their own via `eas login` / `eas credentials`.

```
app.config.ts
app.json
App.tsx
ASSET_LICENSES.md
assets/android-icon-background.png
assets/android-icon-foreground.png
assets/android-icon-monochrome.png
assets/audio/music/gameplay.wav
assets/audio/music/menu.wav
assets/audio/music/results.wav
assets/audio/README.md
assets/audio/sfx/bomb.wav
assets/audio/sfx/bust.wav
assets/audio/sfx/buttonTap.wav
assets/audio/sfx/comboUp.wav
assets/audio/sfx/freeze.wav
assets/audio/sfx/gameOver.wav
assets/audio/sfx/missionClaim.wav
assets/audio/sfx/perfect.wav
assets/audio/sfx/purchase.wav
assets/audio/sfx/rankPromotion.wav
assets/audio/sfx/reward.wav
assets/audio/sfx/screenOpen.wav
assets/audio/sfx/shield.wav
assets/audio/sfx/swap.wav
assets/audio/sfx/tilePlace.wav
assets/audio/sfx/victory.wav
assets/audio/sfx/wild.wav
assets/favicon.png
assets/icon.png
assets/splash-icon.png
babel.config.js
CHANGELOG.md
CUSTOMIZATION_GUIDE.md
docs/asset-requirements.md
docs/DEMO_VIDEO_SCRIPT.md
docs/SCREENSHOT_PLAN.md
docs/SECURITY_AND_PRIVACY_CHECK.md
docs/SELLABLE_TEMPLATE_AUDIT.md
docs/store-listing.md
DOCUMENTATION.md
eas.json
.env.example
GAME_RULES.md
.gitignore
index.ts
jest.config.js
KNOWN_LIMITATIONS.md
LICENSE_TEMPLATE.md
.maestro/01-splash-menu.yml
.maestro/02-classic-start.yml
.maestro/03-pause-resume.yml
.maestro/04-navigation.yml
.maestro/05-settings.yml
marketplace/CODECANYON_LISTING.md
marketplace/CODESTER_LISTING.md
marketplace/DIRECT_SALES_PAGE.md
marketplace/FAQ.md
marketplace/SUPPORT_POLICY.md
package.json
package-lock.json
README.md
screenshots/01-splash.png
screenshots/02-main-menu.png
screenshots/03-gameplay.png
screenshots/04-perfect.png
screenshots/05-bust.png
screenshots/06-tutorial.png
screenshots/07-game-over.png
screenshots/08-settings.png
scripts/captureScreenshots.mjs
scripts/generateAudioAssets.mjs
scripts/validateAssets.mjs
src/ads/adConfiguration.ts
src/ads/adService.ts
src/ads/AdsProvider.tsx
src/ads/adsTypes.ts
src/ads/adUnitIds.ts
src/ads/interstitialPolicy.ts
src/ads/loadMobileAds.native.ts
src/ads/loadMobileAds.ts
src/ads/loadMobileAds.web.ts
src/ads/mobileAdsModuleTypes.ts
src/ads/__tests__/interstitialPolicy.test.ts
src/analytics/AnalyticsProvider.tsx
src/analytics/analyticsService.ts
src/analytics/analyticsTypes.ts
src/audio/audioAssets.ts
src/audio/AudioProvider.tsx
src/audio/audioService.ts
src/audio/audioTypes.ts
src/auth/AuthProvider.tsx
src/auth/authService.ts
src/auth/authTypes.ts
src/auth/__tests__/authService.test.ts
src/backend/dailyLeaderboardService.ts
src/backend/rankedLeaderboardService.ts
src/backend/rankedTicketService.ts
src/backend/supabaseClient.ts
src/components/AnimatedNeonBackground.tsx
src/components/BetaBadge.tsx
src/components/BottomNavigation.tsx
src/components/CurrencyChip.tsx
src/components/gameplay/FloatingScorePopup.tsx
src/components/gameplay/GameplayHUD.tsx
src/components/gameplay/index.ts
src/components/gameplay/LaneCard.tsx
src/components/gameplay/NumberTile.tsx
src/components/gameplay/PauseModal.tsx
src/components/gameplay/PowerUpButton.tsx
src/components/gameplay/PowerUpTray.tsx
src/components/gameplay/StrikeDisplay.tsx
src/components/gameplay/TargetPanel.tsx
src/components/gameplay/TutorialOverlay.tsx
src/components/gameplay/WildValuePicker.tsx
src/components/GridBackground.tsx
src/components/monetization/PurchaseSuccessModal.tsx
src/components/monetization/RevivePanel.tsx
src/components/NeonButton.tsx
src/components/NeonIconButton.tsx
src/components/NumberRushLogo.tsx
src/components/PerspectiveGrid.tsx
src/components/RewardSummaryCard.tsx
src/components/ScreenTopBar.tsx
src/components/__tests__/AppErrorBoundary.test.tsx
src/config/environment.ts
src/config/featureFlags.ts
src/config/monetizationEnvironment.ts
src/config/schemaVersions.ts
src/config/supabaseEnvironment.ts
src/config/templateFeatures.ts
src/config/__tests__/environment.test.ts
src/config/__tests__/featureFlags.test.ts
src/config/__tests__/templateFeatures.test.ts
src/config/validateEnvironment.ts
src/consent/adsConsentModuleTypes.ts
src/consent/ConsentProvider.tsx
src/consent/consentService.ts
src/consent/consentTypes.ts
src/consent/loadAdsConsent.native.ts
src/consent/loadAdsConsent.ts
src/consent/loadAdsConsent.web.ts
src/consent/loadTracking.native.ts
src/consent/loadTracking.ts
src/consent/loadTracking.web.ts
src/consent/trackingAuthorization.ts
src/consent/trackingModuleTypes.ts
src/data/dailyLeaderboard.ts
src/dev/dailyDevHelpers.ts
src/dev/progressionDevHelpers.ts
src/errors/AppErrorBoundary.tsx
src/errors/errorReporter.ts
src/errors/errorTypes.ts
src/game/dailyTournament.ts
src/game/gameConstants.ts
src/game/gameEngine.ts
src/game/gameModes.ts
src/game/gameTypes.ts
src/game/powerUpInventory.ts
src/game/runEvents.ts
src/game/runValidator.ts
src/game/scoring.ts
src/game/seedStabilityCheck.ts
src/game/__tests__/gameEngine.test.ts
src/game/__tests__/runValidator.test.ts
src/game/__tests__/scoring.test.ts
src/game/__tests__/tileGenerator.test.ts
src/game/tileGenerator.ts
src/haptics/HapticsProvider.tsx
src/haptics/hapticsService.ts
src/hooks/useAds.ts
src/hooks/useAuth.ts
src/hooks/useCloudSync.ts
src/hooks/useConsent.ts
src/hooks/useDailyCountdown.ts
src/hooks/useNumberRushGame.ts
src/hooks/usePurchases.ts
src/logging/logger.ts
src/missions/missionDefinitions.ts
src/missions/missionTypes.ts
src/missions/__tests__/missionDefinitions.test.ts
src/monetization/economyBalance.ts
src/monetization/monetizationTypes.ts
src/monetization/__tests__/economyBalance.test.ts
src/navigation/AppNavigator.tsx
src/navigation/navigationTypes.ts
src/network/NetworkProvider.tsx
src/progression/applyRunRewards.ts
src/progression/gameRewards.ts
src/progression/progressionTypes.ts
src/progression/__tests__/economyTransactions.test.ts
src/progression/__tests__/gameRewards.test.ts
src/progression/__tests__/xpSystem.test.ts
src/progression/username.ts
src/progression/xpSystem.ts
src/purchases/loadPurchases.native.ts
src/purchases/loadPurchases.ts
src/purchases/loadPurchases.web.ts
src/purchases/productRewardMap.ts
src/purchases/purchaseCatalog.ts
src/purchases/purchaseConfiguration.ts
src/purchases/purchaseService.ts
src/purchases/purchasesModuleTypes.ts
src/purchases/PurchasesProvider.tsx
src/purchases/purchaseTypes.ts
src/purchases/__tests__/productRewardMap.test.ts
src/ranked/rankedPoints.ts
src/screens/auth/AccountScreen.tsx
src/screens/auth/AuthCallbackScreen.tsx
src/screens/auth/CloudSyncScreen.tsx
src/screens/auth/MagicLinkSentScreen.tsx
src/screens/auth/SignInScreen.tsx
src/screens/BetaFeedbackScreen.tsx
src/screens/ComingSoonScreen.tsx
src/screens/DailyResultsScreen.tsx
src/screens/GameOverScreen.tsx
src/screens/GameplayScreen.tsx
src/screens/HowToPlayScreen.tsx
src/screens/LeaderboardScreen.tsx
src/screens/LegalInfoScreen.tsx
src/screens/MainMenuScreen.tsx
src/screens/MissionsScreen.tsx
src/screens/PowerUpsScreen.tsx
src/screens/ProfileScreen.tsx
src/screens/RankedScreen.tsx
src/screens/ReportAdScreen.tsx
src/screens/SettingsScreen.tsx
src/screens/ShopScreen.tsx
src/screens/SplashScreen.tsx
src/screens/StatsScreen.tsx
src/screens/SyncConflictScreen.tsx
src/screens/__tests__/MainMenuScreen.test.tsx
src/screens/__tests__/SettingsScreen.test.tsx
src/screens/__tests__/SplashScreen.test.tsx
src/screens/TournamentScreen.tsx
src/settings/SettingsProvider.tsx
src/settings/settingsTypes.ts
src/shop/purchaseShopItem.ts
src/shop/shopCatalog.ts
src/storage/adFrequencyStorage.ts
src/storage/dailyStorage.ts
src/storage/gameStorage.ts
src/storage/missionStorage.ts
src/storage/pendingPurchaseStorage.ts
src/storage/playerStorage.ts
src/storage/settingsStorage.ts
src/storage/templateStatsStorage.ts
src/storage/__tests__/adFrequencyStorage.test.ts
src/storage/__tests__/gameStorage.test.ts
src/storage/__tests__/missionStorage.test.ts
src/storage/__tests__/playerStorage.test.ts
src/storage/__tests__/settingsStorage.test.ts
src/storage/__tests__/templateStatsStorage.test.ts
src/submissions/pendingSubmissionStorage.ts
src/submissions/SubmissionProvider.tsx
src/submissions/submissionQueue.ts
src/sync/CloudSyncProvider.tsx
src/sync/cloudSyncService.ts
src/sync/deviceId.ts
src/sync/migrationService.ts
src/sync/syncTypes.ts
src/sync/__tests__/migrationService.test.ts
src/test/factories.ts
src/test/renderWithProviders.tsx
src/test/setup.ts
src/test/storageTestUtils.ts
src/theme/colors.ts
src/theme/contrast.ts
src/theme/index.ts
src/themes/GameThemeProvider.tsx
src/themes/gameThemes.ts
src/theme/shadows.ts
src/theme/spacing.ts
src/theme/typography.ts
src/utils/measureTutorialTarget.ts
src/utils/missionCountdown.ts
store.config.example.json
supabase/config.toml
supabase/functions/admob-reward-callback/index.ts
supabase/functions/delete-account/index.ts
supabase/functions/revenuecat-webhook/index.ts
supabase/functions/validate-run/index.ts
supabase/migrations/0001_extensions.sql
supabase/migrations/0002_player_profiles.sql
supabase/migrations/0003_player_progress.sql
supabase/migrations/0004_player_inventory.sql
supabase/migrations/0005_player_statistics.sql
supabase/migrations/0006_daily_challenges.sql
supabase/migrations/0007_daily_submissions.sql
supabase/migrations/0008_ranked_profiles.sql
supabase/migrations/0009_ranked_matches.sql
supabase/migrations/0010_economy_transactions.sql
supabase/migrations/0011_sync_metadata.sql
supabase/migrations/0012_rpc_functions.sql
supabase/migrations/0013_row_level_security.sql
supabase/migrations/0014_indexes.sql
supabase/migrations/0015_seed_current_season.sql
supabase/migrations/0016_ad_reward_opportunities.sql
supabase/migrations/0017_ad_reward_transactions.sql
supabase/migrations/0018_purchase_transactions.sql
supabase/migrations/0019_monetization_entitlements.sql
supabase/migrations/0020_monetization_rpc.sql
supabase/migrations/0021_monetization_rls.sql
tsconfig.json
```
