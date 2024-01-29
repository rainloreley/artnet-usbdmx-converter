import {dmxnet, receiver} from "dmxnet";
import {DetectedInterface, DMXInterface, getConnectedInterfaces} from "./usbdmx";
import {clearInterval} from "timers";

/**
 * Responsible for converting incoming Art-Net data to an USBDMX output
 */
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

    /**
     * Starts up the Art-Net receiver
     */
    startArtNetReceiver = () => {
        this.dmxnetManager = new dmxnet({
            log: {level: "error"}
        });
        this.artNetReceiver = this.dmxnetManager.newReceiver();
        this.artNetReceiver.on("data", this.handleIncomingArtNetData);
    }

    /**
     * Handles incoming Art-Net dara and writes it to the DMX interface
     * @param data Art-Net data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    /**
     * Gets available DMX interfaces connected to the computer
     */
    scanForInterfaces = (): DetectedInterface[] => {
        this.availableInterfaces = getConnectedInterfaces();
        return this.availableInterfaces;
    }

    /**
     * Tries to open the connection to a DMX interface
     * @param serial Serial number of the interface
     * @param mode Operating mode
     * @param manufacturer Interface manufacturer ID
     * @param product Interface product ID
     * @returns an empty string if the connection was successful or the error message
     */
    openInterface = async (serial: string, mode: string, manufacturer: string | undefined = undefined, product: string | undefined = undefined): Promise<string> => {
        if (isNaN(parseInt(mode))) return "Invalid mode";

        const interfaceIndex = this.availableInterfaces.findIndex((e) => e.serial == serial);
        if (interfaceIndex === -1) return "Interface not found, please scan again";

        const interfacePath = this.availableInterfaces[interfaceIndex].path;

        try {
            this.dmxInterface = await DMXInterface.open(interfacePath, serial, manufacturer, product);
            return new Promise<string>((resolve) => {
                setTimeout( () => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const response = this.dmxInterface.setMode(parseInt(mode));
                    this.outputAllowed = true;
                    this.dataPerSecTimer = setInterval(this.parseRequestTimer, 1000);
                    resolve(response === 0 ? "" : `Error Code ${response}`);
                }, 1000);
            })
        }
        catch(err) {
            console.log(err);
            return (err as Error).message;
        }
    }

    /**
     * Closes the connection to a DMX interface
     */
    closeInterface = () => {
        if (this.dmxInterface) {
            this.dmxInterface.close();
            this.outputAllowed = false;
            clearInterval(this.dataPerSecTimer);
            this.dmxInterface = undefined;
        }
    }

    /**
     * Processes incoming and sent data history for visualization
     */
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