import axios from "axios"
import {Event, NeosEvent} from "./entity/event"
import _ from "lodash"
import express from "express";
import cors from "cors"
import {Env, ScheduledEvent} from "./types";


/// API
const app = express()
app.use(express.json())
app.use(cors())
const server = app.listen(3000, () => console.log("API OK"))
app.get("/", async (req, res) => {
    console.log("API Request")
    const result = await getNeosCalender()
    res.json(result)
})


/// Bot
const api = `https://discord.com/api/v8/guilds/${getEnv().guildId}/scheduled-events`
const headers = {
    "Authorization": "Bot " + getEnv().token,
}


async function getNeosCalender(): Promise<NeosEvent[]> {
    const url = getEnv().gcUrl
    try {
        console.log("Google Calender Getting")
        const {data} = await axios.get<NeosEvent[]>(url)
        console.log("Google events: " + data.length)
        return data
    } catch {
        console.log("Google Calender Get Error")
        throw new Error("Google Calender Get Error")
    }
}

setInterval(async () => {
    try {
        const newCal = await getNeosCalender()
        await updateDiscordEvent(newCal)
    } catch (e) {
        console.log("error")
    }
}, 60000)

async function init() {
    if (!(process.env.DISCORD_GUILD_ID && process.env.DISCORD_TOKEN && process.env.GC_URL)) {
        throw new Error("Environment not provided!")
    }
    const data = await getNeosCalender()
    await updateDiscordEvent(data)
}

init()

function getEnv(): Env {
    return {
        gcUrl: process.env.GC_URL || "",
        guildId: process.env.DISCORD_GUILD_ID || "",
        token: process.env.DISCORD_TOKEN || "",
        botId: process.env.DISCORD_BOT_ID || "",
    }
}


async function updateDiscordEvent(googleEvent: NeosEvent[]) {
    const discordEvent = await getDiscordEvent()
    const originalDiscordEvent = _.cloneDeep(discordEvent)
    const addDiff = _.differenceWith(formatEvent(googleEvent), formatEvent(discordEvent), _.isEqual)
    for (const evt of addDiff) {
        await addDiscordEvent(evt.title, new Date(evt.startTime).toISOString(), new Date(evt.endTime).toISOString(), evt.place || "NeosVR", evt.detail)
        console.log("Event Created " + evt.title)
    }
    const delDiff = _.differenceWith(formatEvent(discordEvent), formatEvent(googleEvent), _.isEqual)
    for (const evt of delDiff) {
        const evtId = originalDiscordEvent.find((e) => e.title === evt.title && e.startTime === evt.startTime && e.endTime === evt.endTime)
        if (evtId?.discordEventId) {
            await deleteDiscordEvent(evtId?.discordEventId)
            console.log("Event Deleted " + evtId.title)
        }
    }
}

async function addDiscordEvent(name: string, start: string, end: string, place: string, description: string = "") {
    const body = {
        name: name,
        privacy_level: 2,
        scheduled_start_time: start,
        scheduled_end_time: end,
        entity_type: 3,
        description: description,
        entity_metadata: {
            "location": place
        }
    }
    await axios.post(api, body, {headers})
}

async function getDiscordEvent(): Promise<NeosEvent[]> {
    try {
        console.log("Discord Event Getting")
        const {data} = await axios.get<ScheduledEvent[]>(api, {headers})
        console.log("discord events :" + data.length)
        const format: NeosEvent[] = data.filter((d) => d.creator_id === getEnv().botId).map((data) => {
                let t: NeosEvent = {
                    title: data.name,
                    startTime: new Date(data.scheduled_start_time).getTime(),
                    endTime: new Date(data.scheduled_end_time).getTime(),
                    detail: data.description || "",
                    place: data.entity_metadata?.location,
                    discordEventId: data.id
                }
                return t
            }
        )
        return format
    } catch(e) {
        console.log("Discord Event Get Error" + e)
        throw new Error("Discord Event Get Error" + e)
    }
}

async function deleteDiscordEvent(id: string) {
    const deleteApi = api + "/" + id
    await axios.delete(deleteApi, {headers})
}

function formatEvent(evt: NeosEvent[]) {
    let evtClone = _.cloneDeep(evt)
    let result = []
    for (let e of evtClone) {
        if (e.discordEventId) {
            delete e.discordEventId
        }
        result.push(e)
    }
    return result
}

