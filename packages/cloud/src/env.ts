import { subscribeMessage, publishMessage } from "./messages"
import { cloud } from "./client"
import { readSetting, writeSetting } from "@devicescript/settings"
import { ObservableValue, register } from "@devicescript/observables"

const ENV_TOPIC = "env"
let _env: ObservableValue<any>

/**
 * Gets an observable environment register that may get updated by the cloud.
 * @param defaultValues default values if no cloud values are available
 * @returns environment
 */
export async function environment<T = object>(
    defaultValues?: T
): Promise<ObservableValue<T>> {
    if (_env) return _env

    const old = await readSetting(ENV_TOPIC, defaultValues || {})
    _env = register(old || {})

    // receive env messages
    subscribeMessage(ENV_TOPIC, async (newValue: any) => {
        console.log(`cloud: received env`)
        console.debug(newValue)
        await writeSetting(ENV_TOPIC, newValue)
        await _env.emit(newValue)
    })
    // query env when cloud restarts
    cloud.connected.subscribe(async curr => {
        if (curr) {
            await publishMessage(ENV_TOPIC, {})
        }
    })
    if (await cloud.connected.read()) {
        await publishMessage(ENV_TOPIC, {})
    }
    return _env
}
