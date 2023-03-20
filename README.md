# Solace Advanced Features for MQTT

## Message expiry

Message expiry is added to MQTT v5.0 to allow an expiry interval to be set when a message is published.

`node mqtt5.mjs sub -c client007 --no-clean-start --session-expiry-interval 600 -t abc -q 1`
`node mqtt5.mjs pub -t abc -q 1 -e 60 -m "test 001"`
`node replay.mjs -c client007`

## Replay


## Retain
