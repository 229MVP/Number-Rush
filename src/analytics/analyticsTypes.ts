export type AnalyticsEventName =
  | 'app_opened'
  | 'screen_viewed'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'run_started'
  | 'run_completed'
  | 'powerup_used'
  | 'daily_attempt_started'
  | 'daily_attempt_completed'
  | 'ranked_match_started'
  | 'ranked_match_completed'
  | 'ranked_promotion'
  | 'mission_claimed'
  | 'virtual_item_purchased'
  | 'theme_selected'
  | 'setting_changed'
  | 'error_caught';

export type AnalyticsPayload = Record<string, string | number | boolean | null>;

export type AnalyticsAdapter = {
  track: (event: AnalyticsEventName, payload?: AnalyticsPayload) => void;
};
