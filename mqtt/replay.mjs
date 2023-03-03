import { program } from "commander";

program
  .name("replay")
  .description("Start the replay of messages to the MQTT client.")
  .version("0.0.1")
  .option("-u --admin-url <url>", "URL to access the management endpoint of the broker", "http://localhost:8080")
  .option("-u --admin-user <user name>", "The username of the management user", "admin")
  .option("-p --admin-password <password>", "The password of the management user", "admin")
  .requiredOption("-c --client-id <string>", "The Client Identifier identifies the Client to replay messages", "hkjc")
  .option("-f --from-time <time>", "The time to begin replaying messages from, in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)")
  .action((cliOpts) => {
    if (cliOpts.fromTime) {
      const fromTime = new Date(cliOpts.fromTime)
      if (isNaN(fromTime.getTime())) {
        console.error(`The fromTime ${cliOpts.fromTime} is invalid`)
        return;
      }
      cliOpts["secondsSinceEpoch"] = Math.round(fromTime.getTime() / 100)
    } else {
      cliOpts["secondsSinceEpoch"] = NaN
    }
    console.info(cliOpts)
    getDurableQueueNameFromClientId(cliOpts)
  });

program.parse()

function replay(cliOpts) {

}

function getDurableQueueNameFromClientId(cliOpts) {
  let mqttSessionsUrl = `${cliOpts.adminUrl}/SEMP/v2/monitor/msgVpns/default/mqttSessions`
  mqttSessionsUrl = mqttSessionsUrl + `?where=${percentEncoding("mqttSessionClientId==" + cliOpts.clientId)}`
  mqttSessionsUrl = mqttSessionsUrl + "&select=queueName"
  console.info(mqttSessionsUrl)

  fetch(mqttSessionsUrl, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(cliOpts.adminUser + ":" + cliOpts.adminPassword).toString('base64')
    },
  })
    .then(async response => {
      if (response.status !== 200) {
        throw (`${response.status}: ${response.statusText} -> ${await response.text()}`)
      }
      return response.json()
    })
    .then(json => {
      if (!json["data"] || json["data"].length === 0) {
        throw (new Error(`There is NO mqtt sessions of clientID: ${cliOpts.clientId}`))
      }
      return json["data"][0]["queueName"]
    })
    .then(queueName => console.info(queueName))
    .catch(error => console.error(error))
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

