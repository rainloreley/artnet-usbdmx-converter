import {Sparkline} from "clui";
import {defaultConvertHandler} from "./index";
import clear from "clear";
import chalk from "chalk";
import figlet from "figlet";
import modeToString from "./helpers/modeToString";

export default async function renderControlScreen() {
    clear({fullClear: true});
    console.log(
        chalk.cyan(
            figlet.textSync("ArtNet => USBDMX", {horizontalLayout: "full"})
        )
    );
    /*var Line          = CLI.Line,
        LineBuffer    = CLI.LineBuffer;

    var outputBuffer = new LineBuffer({
        x: 0,
        y: 0,
        width: 'console',
        height: 'console'
    });


    var message = new Line(outputBuffer)
        .column('ArtNet => USBDMX', 20, [clc.green])
        .fill()
        .store();

    var blankLine = new Line(outputBuffer)
        .fill()
        .store();*/

    /*var header = new Line(outputBuffer)
        .column('Suscipit', 20, [clc.cyan])
        .column('Voluptatem', 20, [clc.cyan])
        .column('Nesciunt', 20, [clc.cyan])
        .column('Laudantium', 11, [clc.cyan])
        .fill()
        .store();

    var line;
    for(var l = 0; l < 20; l++)
    {
        line = new Line(outputBuffer)
            .column((Math.random()*100).toFixed(3), 20)
            .column((Math.random()*100).toFixed(3), 20)
            .column((Math.random()*100).toFixed(3), 20)
            .column((Math.random()*100).toFixed(3), 11)
            .fill()
            .store();
    }*/

    //outputBuffer.output();

    var interfaceDisplayName;
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
            "Modus:"
        ),
        `${modeToString(defaultConvertHandler.dmxInterface?.currentMode ?? 0)}`)
    console.log("=================")

    const incomingDataSparkline = Sparkline(defaultConvertHandler.incomingDataHistory, "req/sec");
    const sentDataSparkline = Sparkline(defaultConvertHandler.sentDataHistory, "req/sec");

    process.stdout.write("Eingehende Daten   ")
    process.stdout.write(incomingDataSparkline);
    process.stdout.write("\nAusgehende Daten   ")
    process.stdout.write(sentDataSparkline);

    console.log("\n");
    console.log(chalk.yellow(
        "Schließe das Fenster oder klicke Strg+C um das Programm zu beenden"
    ))
}