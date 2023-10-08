import chalk from "chalk";
import ConvertHandler from "./ConvertHandler";
import renderStartupScreen from "./startupscreen";
import renderControlScreen from "./controlscreen";
import {clearInterval} from "timers";
import {exec} from "child_process";

export const defaultConvertHandler = new ConvertHandler();
var renderControlScreenTimer: NodeJS.Timeout;
async function main() {
    setTerminalTitle("ArtNet => USBDMX")
    const selectedInfo = await renderStartupScreen();
    console.log(chalk.blueBright(
        "Starte ArtNet..."
    ));
    console.log(chalk.yellow(
        "Nimm bitte eventuell erscheinende Firewall-Hinweise an"
    ))
    defaultConvertHandler.startArtNetReceiver();

    console.log(
        chalk.blueBright(
            `Öffne ${selectedInfo.serial} mit Modus ${selectedInfo.mode}...`
        )
    );
    const openInterfaceResponse = await defaultConvertHandler.openInterface(selectedInfo.serial, selectedInfo.mode, selectedInfo.manufacturer, selectedInfo.product);
    if (openInterfaceResponse.length > 0) {
        console.log(
            chalk.red(
                openInterfaceResponse
            )
        )
        return process.exit(1);
    }
    else {
        console.log(
            chalk.green("✅ System bereit")
        );
        renderControlScreenTimer = setInterval(() => {
            renderControlScreen();
        }, 1000);
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
        chalk.red(`⛔ Ein fataler Fehler ist aufgetreten.`)
    );
    console.log(err);
    exec("pause press [enter]");
    process.exit(0);
})
main();

function setTerminalTitle(title: string){
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
}