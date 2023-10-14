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

If you're using another interface other than the ones [listed below](#compatible-interfaces), you need to add them to the udev rule manually

```bash
# Get all usb devices and find your interface
$ lsusb
Bus 003 Device 021: ID 16c0:088b Van Ooijen Technische Informatica USB DMX
[...]

# First copy the existing udev rules-file like mentioned above, then edit:
$ sudo nano /etc/udev/rules.d/50-usbdmx.rules

# Duplicate the last line and change "idVendor" and "idProduct" to match the ID returned by lsusb
# In this example:
KERNEL=="hidraw*", SUBSYSTEM=="hidraw", ATTRS{idVendor}=="16c0", ATTRS{idProduct}=="088b", MODE="0666"
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
