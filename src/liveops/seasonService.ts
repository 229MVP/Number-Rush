import { isSupabaseConfigured } from '../config/supabaseEnvironment';
import { getSupabaseClient } from '../backend/supabaseClient';
import { logger } from '../logging/logger';
import type {
  AnnouncementSummary,
  LiveEventSummary,
  RankedSeasonSummary,
} from './liveOpsTypes';

function mapSeason(row: Record<string, unknown>): RankedSeasonSummary | null {
  if (typeof row.id !== 'string' || typeof row.season_key !== 'string') return null;
  return {
    id: row.id,
    seasonKey: row.season_key,
    name: typeof row.name === 'string' ? row.name : row.season_key,
    description: typeof row.description === 'string' ? row.description : null,
    startsAt: String(row.starts_at ?? ''),
    endsAt: String(row.ends_at ?? ''),
    status: (row.status as RankedSeasonSummary['status']) ?? 'draft',
  };
}

export async function fetchCurrentRankedSeason(): Promise<RankedSeasonSummary | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client.rpc('get_current_ranked_season');
    if (error) throw error;
    if (!data || typeof data !== 'object') return null;
    return mapSeason(data as Record<string, unknown>);
  } catch (error) {
    logger.warn('current season fetch failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function fetchActiveLiveEvents(): Promise<LiveEventSummary[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client.rpc('get_active_live_events');
    if (error) throw error;
    if (!Array.isArray(data)) return [];
    return data
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const r = row as Record<string, unknown>;
        if (typeof r.id !== 'string' || typeof r.event_key !== 'string') return null;
        return {
          id: r.id,
          eventKey: r.event_key,
          name: String(r.name ?? r.event_key),
          description: String(r.description ?? ''),
          eventType: (r.event_type as LiveEventSummary['eventType']) ?? 'score_challenge',
          startsAt: String(r.starts_at ?? ''),
          endsAt: String(r.ends_at ?? ''),
          status: (r.status as LiveEventSummary['status']) ?? 'draft',
          accentColor: typeof r.accent_color === 'string' ? r.accent_color : null,
          bannerAssetUrl:
            typeof r.banner_asset_url === 'string' ? r.banner_asset_url : null,
        } satisfies LiveEventSummary;
      })
      .filter((e): e is LiveEventSummary => e != null);
  } catch (error) {
    logger.warn('live events fetch failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function fetchActiveAnnouncements(): Promise<AnnouncementSummary[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data, error } = await client.rpc('get_active_announcements');
    if (error) throw error;
    if (!Array.isArray(data)) return [];
    return data
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const r = row as Record<string, unknown>;
        if (typeof r.id !== 'string' || typeof r.title !== 'string') return null;
        const actionTypeRaw = r.action_type;
        const actionType: AnnouncementSummary['actionType'] =
          actionTypeRaw === 'internal_route' ||
          actionTypeRaw === 'external_url' ||
          actionTypeRaw === 'none'
            ? actionTypeRaw
            : 'none';
        const summary: AnnouncementSummary = {
          id: r.id,
          title: r.title,
          body: String(r.body ?? ''),
          announcementType:
            (r.announcement_type as AnnouncementSummary['announcementType']) ?? 'news',
          audience: String(r.audience ?? 'all'),
          startsAt: String(r.starts_at ?? ''),
          endsAt: typeof r.ends_at === 'string' ? r.ends_at : null,
          priority: typeof r.priority === 'number' ? r.priority : 0,
          dismissible: r.dismissible !== false,
          actionType,
          actionValue: typeof r.action_value === 'string' ? r.action_value : null,
          imageUrl: typeof r.image_url === 'string' ? r.image_url : null,
        };
        return summary;
      })
      .filter((a): a is AnnouncementSummary => a != null);
  } catch (error) {
    logger.warn('announcements fetch failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
