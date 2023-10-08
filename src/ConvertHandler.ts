import {dmxnet, receiver} from "dmxnet";
import {DetectedInterface, DMXInterface, getConnectedInterfaces} from "./usbdmx";
import {clearInterval} from "timers";

export default class ConvertHandler {
    dmxnetManager: dmxnet;
    artNetReceiver: receiver;

    recentDMXArray: number[] = Array(512).fill(0);

    availableInterfaces: DetectedInterface[] = [];

    dmxInterface: DMXInterface | undefined;
    outputAllowed = false;

    incomingDataCounter = 0;
    sentDataCounter = 0;
    dataPerSecTimer: NodeJS.Timeout;
    incomingDataHistory: number[] = [];
    sentDataHistory: number[] = [];

    constructor() {
        //this.startArtNetReceiver();
    }

    startArtNetReceiver = () => {
        this.dmxnetManager = new dmxnet({
            log: {level: "error"}
        });
        this.artNetReceiver = this.dmxnetManager.newReceiver();
        // @ts-ignore
        this.artNetReceiver.on("data", this.handleIncomingArtNetData);
    }

    handleIncomingArtNetData = (data: any) => {
        this.incomingDataCounter++;
        if (JSON.stringify(data) != JSON.stringify(this.recentDMXArray)) {
            if (this.dmxInterface && this.outputAllowed) {
                this.sentDataCounter++;
                this.dmxInterface.writeMap(data);
            }
            this.recentDMXArray = data;
        }
    }

    scanForInterfaces = (): DetectedInterface[] => {
        this.availableInterfaces = getConnectedInterfaces();
        return this.availableInterfaces;
        /*return this.availableInterfaces.map((e) => {
            return e.serial;
        })*/
    }

    openInterface = async (serial: string, mode: string, manufacturer: string | undefined = undefined, product: string | undefined = undefined): Promise<string> => {
        if (isNaN(parseInt(mode))) return "Invalid mode";

        const interfaceIndex = this.availableInterfaces.findIndex((e) => e.serial == serial);
        if (interfaceIndex === -1) return "Interface nicht gefunden, scanne erneut";
        const interfacePath = this.availableInterfaces[interfaceIndex].path;
        try {
            this.dmxInterface = await DMXInterface.open(interfacePath, serial, manufacturer, product);
            return new Promise<string>((resolve) => {
                setTimeout( () => {
                    // @ts-ignore
                    const response = this.dmxInterface.setMode(parseInt(mode));
                    this.outputAllowed = true;
                    this.dataPerSecTimer = setInterval(this.parseRequestTimer, 1000);
                    resolve(response === 0 ? "" : `Fehlercode ${response}`);
                }, 1000);
            })
        }
        catch(err) {
            console.log(err);
            return (err as Error).message;
        }
    }

    closeInterface = () => {
        if (this.dmxInterface) {
            this.dmxInterface.close();
            this.outputAllowed = false;
            clearInterval(this.dataPerSecTimer);
            this.dmxInterface = undefined;
        }
    }

    parseRequestTimer = () => {
        this.incomingDataHistory.push(this.incomingDataCounter);
        if (this.incomingDataHistory.length > 20) {
            this.incomingDataHistory = this.incomingDataHistory.slice(1)
        }

        this.sentDataHistory.push(this.sentDataCounter);
        if (this.sentDataHistory.length > 20) {
            this.sentDataHistory = this.sentDataHistory.slice(1)
        }
        this.incomingDataCounter = 0;
        this.sentDataCounter = 0;
    }
}