export interface ScheduledEvent {
    id: string
    guild_id: string
    name: string
    description?: string
    scheduled_start_time: string
    scheduled_end_time: string
    entity_type: number
    entity_metadata?: {
        location: string
    }
}

export interface Env {
    token: string
    guildId: string
    gcUrl: string
}
