import HID from "node-hid";

/**
 * Array of interfaces compatible with this program
 */
const DMX_INTERFACES: HIDObject[] = [
    // Digital Enlightenment USB-DMX Interface
    {vendorId: 0x4B4, productId: 0xF1F},
    // FX5 DMX Interface
    {vendorId: 0x16C0, productId: 0x88B},
    // DMXControl Projects e.V. Nodle U1
    {vendorId: 0x16D0, productId: 0x0830},
    // DMXControl Projects e.V. Nodle R4S
    {vendorId: 0x16D0, productId: 0x0833}
]

/**
 * A data structure for a connected interface
 */
export interface DetectedInterface {
    vid: number,
    pid: number,
    path: string,
    serial: string,
    manufacturer: string | undefined,
    product: string | undefined
}

/**
 * Gets all interfaces that are defined in {@link DMX_INTERFACES} and connected
 */
const getConnectedInterfaces = (): DetectedInterface[] => {
    const _interfaces: DetectedInterface[] = [];
    const _connectedHIDDevices = HID.devices();
    for (const _device of _connectedHIDDevices) {
        // check for first VID + PID combo
        if (DMX_INTERFACES.find(e => e.vendorId == _device.vendorId && e.productId == _device.productId) != undefined) {
            _interfaces.push({
                vid: _device.vendorId,
                pid: _device.productId,
                path: _device.path!,
                serial: _device.serialNumber ?? "0000000000000000",
                manufacturer: _device.manufacturer,
                product: _device.product
            })
        }
    }
    return _interfaces;
}

/**
 * Data structure for a single HID object
 */
interface HIDObject {
    vendorId: number;
    productId: number;
}

export * from "./DMXInterface";
export {getConnectedInterfaces}