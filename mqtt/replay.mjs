import { program } from "commander";

program
  .name("replay")
  .description("Start the replay of messages to the MQTT client.")
  .version("0.0.1")
  .option("-u --admin-url <url>", "URL to access the management endpoint of the broker", "http://localhost:8080")
  .option("-u --admin-user <user name>", "The username of the management user", "admin")
  .option("-p --admin-password <password>", "The password of the management user", "admin")
  .requiredOption("-c --client-id <string>", "The Client Identifier identifies the Client to replay messages")
  .option("-f --from-time <time>", "The time to begin replaying messages from, in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Do Not set this option if you want to play back all messages")
  .action((cliOpts) => {
    if (cliOpts.fromTime) {
      const fromTime = new Date(cliOpts.fromTime)
      if (isNaN(fromTime.getTime())) {
        console.error(`The fromTime ${cliOpts.fromTime} is invalid`)
        return;
      }
      cliOpts["secondsSinceEpoch"] = Math.round(fromTime.getTime() / 1000)
    } else {
      cliOpts["secondsSinceEpoch"] = NaN
    }
    cliOpts["basicAuthorization"] = 'Basic ' + Buffer.from(cliOpts.adminUser + ":" + cliOpts.adminPassword).toString('base64')
    console.info(cliOpts)
    getDurableQueueNameFromClientId(cliOpts)
      .then(queueName => replayOnQueue(cliOpts, queueName))
      .catch(error => console.error(error))
  });

program.parse()

async function replayOnQueue(cliOpts, queueName) {
  let replayUrl = `${cliOpts.adminUrl}/SEMP/v2/action/msgVpns/default/queues/${percentEncoding(queueName)}/startReplay`
  console.info(replayUrl)
  const replayBody = isNaN(cliOpts.secondsSinceEpoch) ? {} : { fromTime: cliOpts.secondsSinceEpoch }

  const response = await fetch(replayUrl, {
    method: "PUT",
    headers: {
      Authorization: cliOpts.basicAuthorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(replayBody),
  });
  if (response.status !== 200) {
    throw (`${response.status}: ${response.statusText} -> ${await response.text()}`);
  }
  console.info(`Successfully replay messages on Client ID: ${cliOpts.clientId} -> ${await response.text()}`)
}

async function getDurableQueueNameFromClientId(cliOpts) {
  let mqttSessionsUrl = `${cliOpts.adminUrl}/SEMP/v2/monitor/msgVpns/default/mqttSessions`
  mqttSessionsUrl = mqttSessionsUrl + `?where=${percentEncoding("mqttSessionClientId==" + cliOpts.clientId)}`
  mqttSessionsUrl = mqttSessionsUrl + "&select=queueName"

  const response = await fetch(mqttSessionsUrl, {
    headers: {
      Authorization: cliOpts.basicAuthorization
    },
  });
  if (response.status !== 200) {
    throw (`${response.status}: ${response.statusText} -> ${await response.text()}`);
  }
  const json = await response.json();
  if (!json["data"] || json["data"].length === 0) {
    throw (new Error(`There is NO mqtt sessions of clientID: ${cliOpts.clientId}`));
  }
  return json["data"][0]["queueName"];
}

function percentEncoding(input) {
  const out = [];
  for (var i = 0; i < input.length; i++) {
    const c = input.charAt(i)
    if (
      (c >= '0' && c <= '9') ||
      (c >= 'A' && c <= 'Z') ||
      (c >= 'a' && c <= 'z') ||
      c === '.' ||
      c === '-' ||
      c === '_'
    ) {
      out.push(c);
    } else {
      out.push(`%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
    }
  }
  return out.join('');
}

