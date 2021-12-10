import typeorm, { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm"

@Entity("event")
export class Event {
    @PrimaryGeneratedColumn("increment")
    id!: number

    @Column({type: "text", nullable: false})
    startTime: string

    @Column({type: "text", nullable: false})
    eventId: string

    @Column({type: "text", nullable: false})
    endTime: string

    @Column({type: "text", nullable: false})
    title: string

    @Column({type: "text", nullable: true, default: "NeosVR"})
    place: string

    @Column({type: "text", nullable: true, default: ""})
    detail: string

    @Column({type: "text", nullable: true, default: 0})
    discordEventId: string
}

export interface NeosEvent {
    // id? :number
    title: string
    // eventId?: string
    startTime: number
    endTime: number
    place?: string
    detail?: string
    discordEventId?: string
}