/***********************************
 * src/config/ConfigStorage.ts
 *
 * Created on 08.05.24 by adrian
 * Project: artnet-usbdmx-converter
 *************************************/

import * as fs from "fs";
import {StartupScreenResponse} from "../startupscreen";
import {DmxnetOptions, ReceiverOptions, SenderOptions} from "dmxnet";

export default class ConfigStorage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private data: any

    loadConfig(path: string) {
        let filedata: string
        try {
            filedata = fs.readFileSync(path, "utf-8")
        } catch (e) {
            console.error("Failed to read file!")
            console.error(e)
            process.exit(1)
        }

        try {
            this.data = JSON.parse(filedata);
        } catch (e) {
            console.error("JSON file contains error!")
            console.error(e)
            process.exit(1)
        }
    }

    getInterface(): StartupScreenResponse | undefined {
        return this.data?.interface as StartupScreenResponse ?? undefined;
    }

    getDmxNetConfig(): DmxnetOptions {
        const mainConfig = this.data?.dmxnet?.main;
        return {
            log: mainConfig?.log ?? {level: "error"},
            oem: mainConfig?.oem ?? undefined,
            sName: mainConfig?.sName ?? "usbdmx",
            lName: mainConfig?.lName ?? "ArtNet-USBDMX-Converter",
            hosts: mainConfig?.hosts ?? ["0.0.0.0"]
        }
    }

    getDmxNetReceiverConfig(): ReceiverOptions {
        const receiverConfig = this.data?.dmxnet?.receiver;
        return {
            subnet: receiverConfig?.subnet ?? 0,
            universe: receiverConfig?.universe ?? 0,
            net: receiverConfig?.net ?? 0,
        }
    }

    getDmxNetSenderConfig(): SenderOptions {
        const transmitterConfig = this.data?.dmxnet?.transmitter;
        return {
            ip: transmitterConfig?.ip ?? "255.255.255.255",
            subnet: transmitterConfig?.subnet ?? 0,
            universe: transmitterConfig?.universe ?? 0,
            net: transmitterConfig?.net ?? 0,
            port: transmitterConfig?.port ?? 6454,
            base_refresh_interval: transmitterConfig?.base_refresh_interval ?? 1000
        }
    }
}