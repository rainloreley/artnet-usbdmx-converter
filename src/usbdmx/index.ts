//import HID from "node-hid";
var HID = require('node-hid');

// Digital Enlightenment USB-DMX Interface
const DMX_INTERFACE_VENDOR_ID = 0x4B4
const DMX_INTERFACE_PRODUCT_ID = 0xF1F

// FX5 DMX Interface
const DMX_INTERFACE_VENDOR_ID_2 = 0x16C0
const DMX_INTERFACE_PRODUCT_ID_2 = 0x88B

// DMXControl Projects e.V. Nodle U1
const DMX_INTERFACE_VENDOR_ID_3 = 0x16D0
const DMX_INTERFACE_PRODUCT_ID_3 = 0x0830

// DMXControl Projects e.V. Nodle R4S
const DMX_INTERFACE_VENDOR_ID_4 = 0x16D0
const DMX_INTERFACE_PRODUCT_ID_4 = 0x0833

export interface DetectedInterface {
    vid: number,
    pid: number,
    path: string,
    serial: string,
    manufacturer: string | undefined,
    product: string | undefined
}
const getConnectedInterfaces = (): DetectedInterface[] => {
    var _interfaces: DetectedInterface[] = [];
    const _connectedHIDDevices = HID.devices();
    for (var _device of _connectedHIDDevices) {
        // check for first VID + PID combo
        if (_device.vendorId === DMX_INTERFACE_VENDOR_ID && _device.productId === DMX_INTERFACE_PRODUCT_ID) {
            _interfaces.push({
                vid: _device.vendorId,
                pid: _device.productId,
                path: _device.path!,
                serial: _device.serialNumber ?? "0000000000000000",
                manufacturer: _device.manufacturer,
                product: _device.product
            })
        }

        // check for second VID + PID combo
        else if (_device.vendorId === DMX_INTERFACE_VENDOR_ID_2 && _device.productId === DMX_INTERFACE_PRODUCT_ID_2) {
            _interfaces.push({
                vid: _device.vendorId,
                pid: _device.productId,
                path: _device.path!,
                serial: _device.serialNumber ?? "0000000000000000",
                manufacturer: _device.manufacturer,
                product: _device.product
            })
        }
        else if (_device.vendorId === DMX_INTERFACE_VENDOR_ID_3 && _device.productId === DMX_INTERFACE_PRODUCT_ID_3) {
            _interfaces.push({
                vid: _device.vendorId,
                pid: _device.productId,
                path: _device.path!,
                serial: _device.serialNumber ?? "0000000000000000",
                manufacturer: _device.manufacturer,
                product: _device.product
            })
        }
        else if (_device.vendorId === DMX_INTERFACE_VENDOR_ID_4 && _device.productId === DMX_INTERFACE_PRODUCT_ID_4) {
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
export * from "./DMXInterface";
export {getConnectedInterfaces}