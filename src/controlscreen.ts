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

    const incomingDataSparkline = Sparkline(defaultConvertHandler.incomingDataHistory, "req/sec");
    const sentDataSparkline = Sparkline(defaultConvertHandler.sentDataHistory, "req/sec");

    process.stdout.write("Incoming Data   ")
    process.stdout.write(incomingDataSparkline);
    process.stdout.write("\nOutgoing Data   ")
    process.stdout.write(sentDataSparkline);

    console.log("\n");
    console.log(chalk.yellow(
        "Close the window or click Ctrl+C to terminate the program"
    ))
}