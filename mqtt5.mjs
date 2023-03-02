import { Command, Option } from "commander";

const program = new Command();
const connectOptions = [
  new Option("-b --broker-url <url>", "The MQTT host", "tcp://localhost:1883"),
  new Option("-c --client-id <string>", "The Client Identifier identifies the Client to the Server"),
  new Option("--no-clean-start", "whether the Connection starts a new Session or is a continuation of an existing Session"),
  new Option("--session-expiry-interval <number>", "Session Expiry Interval in seconds, If the Session Expiry Interval is absent the value 0 is used. If it is set to 0, or is absent, the Session ends when the Network Connection is closed.")
    .default(0)
    .argParser(parseInt),
]

program
  .name("mqtt5")
  .description("CLI to publish and/or subscribe messages with MQTT v5 protocol")
  .version("0.0.1");

const subCmd = program.command("sub")
  .description("Subscribes a client to one or more topics.")
connectOptions.forEach(opt => subCmd.addOption(opt))
subCmd.option("-t --topic <topic>", "The MQTT topic the client will subscribe to")
  .addOption(new Option("-q --qos <number>", "Define the quality of service level").choices(["0", "1", "2"]).default(0).argParser(parseInt))
  .action((options) => {
    console.info(options)
  });

program.parse();