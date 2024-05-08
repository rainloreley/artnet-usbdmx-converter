import chalk from "chalk";
import ConvertHandler from "./ConvertHandler";
import renderStartupScreen from "./startupscreen";
import renderControlScreen from "./controlscreen";
import {clearInterval} from "timers";
import {exec} from "child_process";
import ConfigStorage from "./config/ConfigStorage";

import minimist from "minimist";
const argv = minimist(process.argv.slice(2));

export const defaultConvertHandler = new ConvertHandler();
export const defaultConfigStorage = new ConfigStorage();
let renderControlScreenTimer: NodeJS.Timeout;

/**
 * Entry point of the program
 */
async function main() {

    if (typeof argv["config"] === "string") {
        defaultConfigStorage.loadConfig(argv["config"]);
    }

    setTerminalTitle("ArtNet => USBDMX")

    defaultConvertHandler.scanForInterfaces();

    const selectedInfo = defaultConfigStorage.getInterface() ?? await renderStartupScreen();

    if (argv._.includes("outputconfig")) {
        console.log(JSON.stringify(selectedInfo, null, 2));
        return;
    }
    console.log(chalk.blueBright(
        "Starting ArtNet..."
    ));
    console.log(chalk.yellow(
        "Please accept any firewall requests"
    ))
    defaultConvertHandler.startArtNetReceiver();

    console.log(
        chalk.blueBright(
            `Open ${selectedInfo.serial} using mode ${selectedInfo.mode}...`
        )
    );
    const openInterfaceResponse = await defaultConvertHandler.openInterface(selectedInfo.serial, selectedInfo.mode, selectedInfo.manufacturer, selectedInfo.product);
    if (openInterfaceResponse.length > 0) {
        console.log(
            chalk.red(
                openInterfaceResponse
            )
        )
        throw "MissingInterfaceError"
    }
    else {
        console.log(
            chalk.green("✅ System ready")
        );
        renderControlScreenTimer = setInterval(() => {
            renderControlScreen();
        }, 1000)
    }
}

process.on('SIGINT', () => {
    clearInterval(renderControlScreenTimer);
    defaultConvertHandler.closeInterface();
    process.exit(0);
});  // CTRL+C
process.on('SIGQUIT', () => {
    clearInterval(renderControlScreenTimer);
    defaultConvertHandler.closeInterface();
    process.exit(0);
}); // Keyboard quit
process.on('SIGTERM', () => {
    clearInterval(renderControlScreenTimer);
    defaultConvertHandler.closeInterface();
    process.exit(0);
}); // `kill` command
process.on('SIGHUP', () => {
    clearInterval(renderControlScreenTimer);
    defaultConvertHandler.closeInterface();
    process.exit(0);
}); // close window

process.on('uncaughtException', (err) => {
    clearInterval(renderControlScreenTimer);
    console.log(
        chalk.red(`⛔ A fatal error has occurred`)
    );
    console.log(err);
    if (argv["autoretry"] === true) {
        console.log("Auto-restart enabled, will restart now...")
        setTimeout(() => {
            main();
        }, 2000);
    } else {
        exec("pause press [enter]");
        process.exit(0);
    }
})

main();

/**
 * Sets the title of the terminal
 * @param title new title
 */
function setTerminalTitle(title: string) {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
}