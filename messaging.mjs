import mqtt from "async-mqtt"

export async function sub(cliOpts) {
  const clientOptions = {
    protocolVersion: 5,
    clientId: cliOpts.clientId ? cliOpts.clientId : (Math.random() + 1).toString(36).substring(7),
    clean: cliOpts.cleanStart,
    properties: {
      sessionExpiryInterval: cliOpts.sessionExpiryInterval,
    },
  }
  mqtt.connectAsync(cliOpts.brokerUrl, clientOptions)
    .then(asyncClient => {
      console.info(`Connected to ${cliOpts.brokerUrl} as ${clientOptions.clientId} successfully`)
      asyncClient.on("message", onMessage)
      asyncClient.subscribe(cliOpts.topic, { qos: cliOpts.qos })
        .then(console.info(`Subscribed on topic ${cliOpts.topic} with qos ${cliOpts.qos} successfully`))
    })
    .catch(reason => console.error(reason))
}

function onMessage(topic, payload, packet) {
  console.info(`Received message: ${JSON.stringify(packet, null, 2)}`)
}