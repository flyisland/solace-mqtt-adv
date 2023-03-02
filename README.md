# Solace Advanced Features for MQTT

```bash
./sdkperf_mqtt5.sh -cip=localhost -cn="hkjc-mqtt-008" -stl="a/b/c" -msq=1 -mcs=0 -msei=600 -q -md -nsr
./sdkperf_mqtt5.sh -cip=localhost -ptl="a/b/c" -mpq=1 -mn=1 -mwmei=20 -msa=100
```

1. MQTT with TTL configuration to control the duration for messages in Solace queue
2. Request for Replay message and display them
