import mqtt from "async-mqtt"

function cliOpts2clientOpts(cliOpts) {
  return {
    protocolVersion: 5,
    clientId: cliOpts.clientId ? cliOpts.clientId : (Math.random() + 1).toString(36).substring(7),
    clean: cliOpts.cleanStart,
    properties: {
      sessionExpiryInterval: cliOpts.sessionExpiryInterval,
    },
  }
}

export async function sub(cliOpts) {
  const clientOptions = cliOpts2clientOpts(cliOpts)
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
  packet.payload = packet.payload.toString()
  console.info(`Received message: ${JSON.stringify(packet, null, 2)}`)
}

export async function pub(cliOpts) {
  const clientOptions = cliOpts2clientOpts(cliOpts)
  const publishOptions = {
    qos: cliOpts.qos,
    properties: {
      messageExpiryInterval: cliOpts.messageExpiryInterval,
    },
  }
  mqtt.connectAsync(cliOpts.brokerUrl, clientOptions)
    .then(asyncClient => {
      console.info(`Connected to ${cliOpts.brokerUrl} as ${clientOptions.clientId} successfully`)

      asyncClient.publish(cliOpts.topic, cliOpts.message.toString(), publishOptions)
        .then(() => {
          console.info(`Published on topic ${cliOpts.topic} with qos ${cliOpts.qos} successfully`)
          asyncClient.end()
        })
    })
    .catch(reason => console.error(reason))
}