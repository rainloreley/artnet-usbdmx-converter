import {dmxnet, receiver, sender} from "dmxnet";
import {DetectedInterface, DMXInterface, getConnectedInterfaces} from "./usbdmx";
import {clearInterval} from "timers";

/**
 * Responsible for converting incoming Art-Net data to an USBDMX output
 */
export default class ConvertHandler {
    dmxnetManager: dmxnet;
    artNetReceiver: receiver;
    artNetSender: sender;

    recentDMXArray: number[] = Array(512).fill(0);

    availableInterfaces: DetectedInterface[] = [];

    dmxInterface: DMXInterface | undefined;
    outputAllowed = false;

    dataPerSecTimer: NodeJS.Timeout;

    private artnetInCounter = 0;
    private artnetOutCounter = 0;
    private usbdmxInCounter = 0;
    private usbdmxOutCounter = 0;

    artnetInCountHistory: number[] = [];
    artnetOutCountHistory: number[] = [];
    usbdmxInCountHistory: number[] = [];
    usbdmxOutCountHistory: number[] = [];

    /**
     * Starts up the Art-Net receiver
     */
    startArtNetReceiver = () => {
        this.dmxnetManager = new dmxnet({
            log: {level: "error"},
            sName: "usbdmx",
            lName: "ArtNet-USBDMX-Converter",
        });
        this.artNetReceiver = this.dmxnetManager.newReceiver();
        this.artNetSender = this.dmxnetManager.newSender({
            ip: "255.255.255.255", //IP to send to, default 255.255.255.255
            subnet: 0, //Destination subnet, default 0
            universe: 0, //Destination universe, default 0
            net: 0, //Destination net, default 0
            port: 6454, //Destination UDP Port, default 6454
            base_refresh_interval: 1000 // Default interval for sending unchanged ArtDmx
        });
        this.artNetReceiver.on("data", this.handleIncomingArtNetData);
    }

    /**
     * Handles incoming Art-Net data and writes it to the DMX interface.
     * @param data Art-Net data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleIncomingArtNetData = (data: any) => {
        this.artnetInCounter++;
        if (JSON.stringify(data) != JSON.stringify(this.recentDMXArray)) {
            if (this.dmxInterface && this.outputAllowed) {
                this.usbdmxOutCounter++;
                this.dmxInterface.writeMap(data);
            }
            this.recentDMXArray = data;
        }
    }

    /**
     * Handles incoming data from the interface and sends it out via Art-Net.
     * @param startChannel first channel number of the data array
     * @param data Array with dmx values
     */
    sendIncomingUSBDMXData = (startChannel: number, data: number[]) => {
        this.usbdmxInCounter++;
        if (this.outputAllowed) {
            for (let i = 0; i < data.length; i++) {
                this.artNetSender.prepChannel(startChannel + i, data[i]);
            }
            this.artnetOutCounter++;
            this.artNetSender.transmit();
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
            this.dmxInterface.usbdmxInputCallback = this.sendIncomingUSBDMXData;
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
        this.artnetInCountHistory.push(this.artnetInCounter);
        if (this.artnetInCountHistory.length > 20) {
            this.artnetInCountHistory = this.artnetInCountHistory.slice(1)
        }

        this.artnetOutCountHistory.push(this.artnetOutCounter);
        if (this.artnetOutCountHistory.length > 20) {
            this.artnetOutCountHistory = this.artnetOutCountHistory.slice(1)
        }

        this.usbdmxInCountHistory.push(this.usbdmxInCounter);
        if (this.usbdmxInCountHistory.length > 20) {
            this.usbdmxInCountHistory = this.usbdmxInCountHistory.slice(1)
        }

        this.usbdmxOutCountHistory.push(this.usbdmxOutCounter);
        if (this.usbdmxOutCountHistory.length > 20) {
            this.usbdmxOutCountHistory = this.usbdmxOutCountHistory.slice(1)
        }

        this.artnetInCounter = 0;
        this.artnetOutCounter = 0;
        this.usbdmxInCounter = 0;
        this.usbdmxOutCounter = 0;
    }
}