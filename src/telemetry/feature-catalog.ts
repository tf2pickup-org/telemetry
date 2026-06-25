export interface FeatureMeta {
  key: string
  label: string
}

/**
 * Known configuration features, in the order they are shown on the dashboard.
 * Adding a key here surfaces it; instances may report keys not listed here
 * (e.g. after a client upgrade) and those are shown after the known ones.
 */
export const featureCatalog: FeatureMeta[] = [
  { key: 'games.skill_suggestions', label: 'Skill suggestions (experimental)' },
  { key: 'games.skill_step', label: 'Skill adjustment step' },
  { key: 'games.logs_tf_upload_method', label: 'logs.tf upload method' },
  { key: 'games.hide_server_info_from_spectators', label: 'Hide server info from spectators' },
  { key: 'games.voice_server_type', label: 'Voice server' },
  { key: 'games.auto_force_end_threshold', label: 'Auto force-end threshold' },
  { key: 'players.etf2l_account_required', label: 'ETF2L account required' },
  { key: 'players.minimum_in_game_hours', label: 'Minimum in-game hours' },
  { key: 'queue.player_skill_threshold', label: 'Queue skill threshold' },
  { key: 'queue.require_player_verification', label: 'Require player verification' },
  { key: 'queue.map_cooldown', label: 'Map cooldown' },
  { key: 'serveme_tf.preferred_region', label: 'serveme.tf preferred region' },
  { key: 'announcements.active', label: 'Active announcement' },
  { key: 'players.registered_bucket', label: 'Registered players' },
  { key: 'documents.customized', label: 'Custom rules / privacy policy' },
  { key: 'games.cooldown_levels.customized', label: 'Custom cooldown levels' },
  { key: 'games.default_player_skill.customized', label: 'Custom default skill' },
  { key: 'games.execute_extra_commands.set', label: 'Extra rcon commands' },
]

export const integrationCatalog: FeatureMeta[] = [
  { key: 'discord', label: 'Discord' },
  { key: 'serveme', label: 'serveme.tf' },
  { key: 'tf2QuickServer', label: 'TF2 Quick Server' },
  { key: 'twitch', label: 'Twitch' },
  { key: 'logsTf', label: 'logs.tf' },
  { key: 'umami', label: 'Umami analytics' },
]

export const usageCatalog: FeatureMeta[] = [
  { key: 'skillSuggestionsApplied30d', label: 'Skill suggestions applied (30d)' },
  { key: 'adminSkillChanges30d', label: 'Admin skill changes (30d)' },
  { key: 'gamesLaunchedLifetime', label: 'Games launched (lifetime)' },
  { key: 'staticGameServers', label: 'Static game servers' },
]
