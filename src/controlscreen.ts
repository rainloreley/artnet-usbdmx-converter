import {Sparkline} from "clui";
import {defaultConvertHandler} from "./index";
import clear from "clear";
import chalk from "chalk";
import figlet from "figlet";
import modeToString from "./helpers/modeToString";

/**
 * Renders the control screen
 */
export default async function renderControlScreen() {
    clear({fullClear: true});
    console.log(
        chalk.cyan(
            figlet.textSync("ArtNet => USBDMX", {horizontalLayout: "full"})
        )
    );
    let interfaceDisplayName;
    if (defaultConvertHandler.dmxInterface?.product === undefined && defaultConvertHandler.dmxInterface?.manufacturer === undefined) {
        interfaceDisplayName = defaultConvertHandler.dmxInterface?.serial;
    }
    else {
        interfaceDisplayName = `${defaultConvertHandler.dmxInterface?.manufacturer + " " ?? ""}${defaultConvertHandler.dmxInterface?.product + " " ?? ""}(${defaultConvertHandler.dmxInterface?.serial})`
    }

    console.log("=================")
    console.log(
        chalk.yellowBright(
            "Interface:"
        ),
        `${interfaceDisplayName}`);
    console.log(
        chalk.yellowBright(
            "Mode:"
        ),
        `${modeToString(defaultConvertHandler.dmxInterface?.currentMode ?? 0)}`)
    console.log("=================")

    const artnetInSparkline = Sparkline(defaultConvertHandler.artnetInCountHistory, "req/sec");
    const artnetOutSparkline = Sparkline(defaultConvertHandler.artnetOutCountHistory, "req/sec");
    const usbdmxInSparkline = Sparkline(defaultConvertHandler.usbdmxInCountHistory, "req/sec");
    const usbdmxOutSparkline = Sparkline(defaultConvertHandler.usbdmxOutCountHistory, "req/sec");

    process.stdout.write("ArtNet In\t")
    process.stdout.write(artnetInSparkline);
    process.stdout.write("\nArtNet Out\t")
    process.stdout.write(artnetOutSparkline);
    process.stdout.write("\nUSBDMX In\t")
    process.stdout.write(usbdmxInSparkline);
    process.stdout.write("\nUSBDMX Out\t")
    process.stdout.write(usbdmxOutSparkline);

    console.log("\n");
    console.log(chalk.yellow(
        "Close the window or click Ctrl+C to terminate the program"
    ))
}