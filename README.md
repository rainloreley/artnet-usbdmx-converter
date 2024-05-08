# ArtNet-USBDMX-Converter

<img src="./repo/screenshot.png" alt="Screenshot of main app window">

Send incoming ArtNet signals to the FX5 DMX interface (and other [compatible interfaces](#compatible-interfaces)) to make it compatible with most DMX control programs.
# Use case

This application opens an ArtNet receiver, to which various DMX control programs (e.g. ChamSys MagicQ) can send DMX signals to.
It then forwards these signals to the FX5 USBDMX interface, and therefore opens it up to a variety of programs, not only the few that support it (QLC+, DMXControl).

# Setup on Linux

To use USBDMX-Interfaces on Linux without root privileges you need to add a udev rule:

```bash
$ sudo cp 50-usbdmx.rules /etc/udev/rules.d/
# Unplug the interface, then run:
$ sudo udevadm control --reload-rules
```

## Use another interface
If you're using another interface other than the ones [listed below](#compatible-interfaces), you need to add them to the udev rule manually

First, get all USB devices connected to the computer and find your interface
```bash
$ lsusb
Bus 003 Device 021: ID 16c0:088b Van Ooijen Technische Informatica USB DMX
[...]
```

Then copy the existing udev rules-file like mentioned above, and edit it

```bash
$ sudo nano /etc/udev/rules.d/50-usbdmx.rules
```

Duplicate the last line and change the values after "idVendor" and "idProduct" to match the ID returned by lsusb

Example for ID `1234:5678`
```bash
KERNEL=="hidraw*", SUBSYSTEM=="hidraw", ATTRS{idVendor}=="1234", ATTRS{idProduct}=="5678", MODE="0666"
```

Save, disconnect the interface and reload the udev rules

```bash
$ sudo udevadm control --reload-rules
```

# Compatible interfaces

- [Digital Enlightenment USB-DMX Interface](http://www.digital-enlightenment.de/usbdmx.htm)
- FX5 DMX Interface (Frank Sievertsen)
- [Nodle U1](https://www.dmxcontrol.de/interfaces/nodle-u1-interface.html) (DMXControl e.V.)
- [Nodle R4S](https://www.dmxcontrol.de/interfaces/nodle-r4s-interface.html) (DMXControl e.V.)
- Technically any interface that uses the [usbdmx driver](https://github.com/fx5/usbdmx) by Frank Sievertsen
  - Won't work out of the box, vendor ID and product ID need to be [added manually](./src/usbdmx/index.ts)

# Automatic restart

To restart the program automatically in case of a crash or another exception, add `--autoretry` as a command line argument.
This does not apply in the following cases:
- Intentional exit (Crtl+C, "kill" command, closing the terminal)
- Invalid configuration file
# Configuration File
You can optionally add a configuration file containing parameters for the default USBDMX interface
and options regarding the ArtNet transceiver.

To use a configuration file, create a file on your system with the options below. Then start the program with `--config=<path>`
as a command line argument. Replace `<path> ` with the absolute path to the file.

## Full config

You can omit any options that you don't want to change, the program will use the default options instead (except for `"interface"`).
```javascript
{
  "interface": {}, // see below
  "dmxnet": { // config for ArtNet transceiver
    "main": { // general options
      "log": {
        "level": "info", // available: error, warn, info, verbose, debug, silly
        "oem": 0, // OEM Code from artisticlicense, default to dmxnet OEM.
        "sName": "Text", // 17 char long node description, default to "usbdmx"
        "lName": "Long description", // 63 char long node description, default to "ArtNet-USBDMX-Converter"
        "hosts": ["127.0.0.1"] // Interfaces to listen to, defaults to ["0.0.0.0"]
      }
    },
    "transmitter": { // ArtNet transmitter options (USBDMX In)
      "ip": "127.0.0.1", // IP to send to, default 255.255.255.255
      "subnet": 0, // Destination subnet, default 0
      "universe": 0, // Destination universe, default 0
      "net": 0, // Destination net, default 0
      "port": 6454, // Destination UDP Port, default 6454
      "base_refresh_interval": 1000 // Default interval for sending unchanged ArtDmx
    },
    "receiver": { // ArtNet receiver options (USBDMX Out)
      "subnet": 0, //Destination subnet, default 0
      "universe": 0, //Destination universe, default 0
      "net": 0, //Destination net, default 0
    }
  }
}
```
## Generate config for interface
To automatically select a USBDMX Interface on startup you need to set its parameters in the configuration file under `"interfaces"`.

You can generate these parameters by running:
```bash
$ ./artnet-usbdmx-converter outputconfig
```

Select the interface and mode to use and copy the output to `"interface"` the configuration file.

Example:
```javascript
{
  "interface": {
    "serial": "0000000010000492",
    "mode": "6",
    "manufacturer": "Digital Enlightenment",
    "product": "USB DMX"
  },
  [...]
}
```

# Develop & Build

## Development
```bash
$ git clone https://github.com/rainloreley/artnet-usbdmx-converter.git
$ cd artnet-usbdmx-converter
$ yarn
$ yarn dev
```

## Compiling
```bash
# edit package.json -> pkg to add more targets for various platforms
$ yarn make
```

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
