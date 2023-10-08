var HID = require('node-hid');

/*
Return codes
* 0: OK
* 1: invalid channel
* 2: invalid value
* 3: invalid mode
* 4: invalid array size
* 5: other error
*/

class DMXInterface {

    path: string;
    serial: string;
    manufacturer: string | undefined;
    product: string | undefined;
    currentMode: number = 0;
    // @ts-ignore
    hidDevice: HID.HID;
    dmxout: number[];
    dataCallback: (value: DMXCommand) => void;

    constructor(
        path: string,
        serial: string,
        manufacturer: string | undefined = undefined,
        product: string | undefined = undefined
    ) {
        this.path = path;
        this.serial = serial;
        this.manufacturer = manufacturer;
        this.product = product;

        this.dataCallback = () => {};
        this.hidDevice = new HID.HID(path);
        this.hidDevice.on("data", (data: Buffer) => {
            // received buffer contains 33 bytes, the first one (data[0]) is the page and the rest are the dmx channel values
            // this means we get 32 dmx channels in one package
            for (var i = 1; i < 33; i++) {
                this.dataCallback({channel: data[0] * 32 + i, value: data[i]});
            }

        })
        this.dmxout = Array(512).fill(0);
    }

    static open = (
        path: string,
        serial: string,
        manufacturer: string | undefined = undefined,
        product: string | undefined = undefined
    ): Promise<DMXInterface> => {
        return new Promise<DMXInterface>((resolve) => {
            resolve(new DMXInterface(path, serial, manufacturer, product));
        });
    }

    close = () => {
        this.setMode(0);
        this.hidDevice.close();
    }

    /*
    Description of how DMX + HID works:
    Each HID buffer sent contains 33 bytes.
    The first byte (buffer[0]) is the "page", the rest are 32 DMX channels.
    To get to the other DMX channels, increase the first byte
    e.g. DMX channel = 33 -> buffer[0] = 1; buffer[1] = value for ch. 33

    * Buffer values
    * Index 0 (buffer[0])
    *   - 0-15: DMX?
    *   - 16: Mode
    *   - 17: Config?
    *
    */

    /*
    * Modes:
        * 0: Do nothing - Standby
        * 1: DMX In -> DMX Out
        * 2: PC Out -> DMX Out
        * 3: DMX In + PC Out -> DMX Out
        * 4: DMX In -> PC In
        * 5: DMX In -> DMX Out & DMX In -> PC In
        * 6: PC Out -> DMX Out & DMX In -> PC In
        * 7: DMX In + PC Out -> DMX Out & DMX In -> PC In
    */

    setMode = (mode: number): number => {
        // check if mode is between 0 and 7
        if (mode > 7 || mode < 0) return 3;

        // create data buffer
        let _buffer = Buffer.alloc(34);
        _buffer[1] = 16;
        _buffer[2] = mode;

        try {
            this.hidDevice.write(_buffer);
            this.currentMode = mode;
            return 0;
        }
        catch (err) {
            console.log(err);
            return 5;
        }
    }

    write = (data: DMXCommand[] | undefined): number => {
        let returnStatus = 0;

        if (data !== undefined) {
            // update dmx out array with new values
            for (var _entry of data) {
                if (_entry.channel < 1 || _entry.channel > 512) {
                    returnStatus = 1;
                    continue;
                }
                if (_entry.value < 0 || _entry.value > 255) {
                    returnStatus = 2;
                    continue;
                }
                this.dmxout[_entry.channel - 1] = _entry.value
            }
        }

        // loop through the 16 "pages" of commands (each write command can hold 32 channels)
        for (var i = 0; i < 16; i++) {
            const _buffer = Buffer.alloc(34);
            // first byte needs to be 0 according to node-hid documentation (reportId)
            _buffer[0] = 0x00;
            // set second byte to page number
            _buffer[1] = i;
            for (var j = 2; j < 34; j++) {
                // get value for corresponding channel (i * 32 for the page)
                _buffer[j] = this.dmxout[(i * 32) + j - 2];
            }
            //console.log(_buffer);
            const _res = this.hidDevice.write(_buffer);
            //console.log(_res)
        }
        return returnStatus;

    }

    writeMap = (array: number[]): number => {
        if (array.length !== 512) return 4;
        this.dmxout = array;
        this.write(undefined);
        return 0;
    }

}

interface DMXCommand {
    channel: number;
    value: number;
}

export { DMXInterface, DMXCommand };