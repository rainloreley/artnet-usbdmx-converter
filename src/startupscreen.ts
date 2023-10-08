import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "inquirer";
import {defaultConvertHandler} from "./index";
import modeToString from "./helpers/modeToString";
var pjson = require('../package.json');

interface StartupScreenResponse {
    serial: string,
    mode: string
    manufacturer: string | undefined,
    product: string | undefined
}
export default async function renderStartupScreen(): Promise<StartupScreenResponse> {
    clear();
    console.log(
        chalk.cyan(
            figlet.textSync("ArtNet => USBDMX", {horizontalLayout: "full"})
        )
    );

    printCreditHeader();
    const scannedInterfaces = defaultConvertHandler.scanForInterfaces();

    const interfaceSelectionResponse = await inquirer.prompt(
        [
            {
                type: "list",
                name: "interfaceserial",
                message: "Welches Interface soll verwendet werden?",
                choices: scannedInterfaces.map((e) => {
                    var name;
                    /*
                    * checks if a manufacturer or a product name are defined
                    * if so, format the string like this: manufacturer product (serial)
                    * if not, just print the serial number without brackets
                    *
                    * we need to do a map here instead of offloading this somewhere else because by creating these special strings,
                    * we can't take the actual value as the serial number anymore (because it could contain the manufacturer and the product name).
                    * This is why we set the serial number inside the value structure to be able to access it later without showing it
                    * */
                    if (e.product === undefined && e.manufacturer === undefined) {
                        name = e.serial;
                    }
                    else {
                        name = `${e.manufacturer + " " ?? ""}${e.product + " " ?? ""}(${e.serial})`
                    }
                    return {
                        name: name,
                        value: {
                            serial: e.serial,

                        }
                    }
                }).concat([new inquirer.Separator(), {name: "Erneut suchen", value: { serial: "retry"}}, {name: "Programm schließen", value: { serial: "exit"}}] as any),
                default: 0
            }
        ]
    );

    if (scannedInterfaces.findIndex((e) => e.serial === interfaceSelectionResponse.interfaceserial.serial) === -1) {
        switch (interfaceSelectionResponse.interfaceserial.serial) {
            case "retry":
                return renderStartupScreen();
            case "exit":
                return process.exit(0)
            default:
                return renderStartupScreen();

        }
    }
    else {
        const selectedInterface = interfaceSelectionResponse.interfaceserial.serial as string;

        const modeScelectionResponse = await inquirer.prompt(
            [
                {
                    type: "list",
                    name: "interfacemode",
                    message: "Welcher Modus soll verwendet werden?",
                    choices: [0, 1, 2, 3, 4, 5, 6, 7].map((mode) => modeToString(mode)),
                    default: 0,
                    loop: false
                }
            ]
        );

        const selectedMode = modeScelectionResponse.interfacemode.split("-")[0].replace(" ", "");

        return {
            serial: selectedInterface,
            mode: selectedMode,
            manufacturer: scannedInterfaces.find((e) => e.serial === selectedInterface)?.manufacturer,
            product: scannedInterfaces.find((e) => e.serial === selectedInterface)?.product
        }
    }
}

function printCreditHeader() {
    console.log("=================")
    console.log(
        chalk.yellowBright("Version:"),
        `v${pjson.version}`);
    console.log(
        chalk.yellowBright("Autor:"),
        `${pjson.author}`)
    console.log(
        chalk.yellowBright("Lizenz:"),
        `${pjson.license}`);
    console.log(
        chalk.yellowBright("Code:"),
        `${pjson.repository}`);
    console.log("=================")
    console.log("")

}