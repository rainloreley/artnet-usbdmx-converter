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
- Technically any interface which uses the [usbdmx driver](https://github.com/fx5/usbdmx) by Frank Sievertsen
  - Won't work out of the box, vendor ID and product ID need to be added manually

# Develop & Build

## Development
```bash
git clone https://github.com/rainloreley/artnet-usbdmx-converter.git
cd artnet-usbdmx-converter
yarn
yarn dev
```

## Compiling
```bash
# edit package.json -> pkg to add more targets for various platforms
yarn make
```

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
