#!/bin/bash

USER="admin:admin"
log() {
   echo "$(date +'%Y-%m-%d %H:%M:%S'): $1"
}

provision(){
  local goal=$1
  local configUrl=$solace_admin_url/SEMP/v2/config$2
  local action=$3
  local jsonBody=$4
  local response=$(echo "$jsonBody" | curl -X $action --write-out '%{http_code}' --silent --output /dev/null -u $USER $configUrl -H 'content-type: application/json' -d @-)
  if [ "$response" == "200" ] ; then
    log "$goal successfully"
  else
    log "${configUrl} -> ${response}"
  fi
}


if [ -z ${solace_admin_url+x} ]; then 
  solace_admin_url="http://localhost:8080"
fi

provision "Create Queue Template mqtt_template" \
  "/msgVpns/default/queueTemplates" \
  "POST" \
  '{"queueTemplateName":"mqtt_template","maxTtl":600,"respectTtlEnabled":true}'

provision "Update Client Profile default" \
  "/msgVpns/default/clientProfiles/default" \
  "PATCH" \
  '{"apiQueueManagementCopyFromOnCreateTemplateName":"mqtt_template"}'

provision "Enable Replay" \
  "/msgVpns/default/replayLogs" \
  "POST" \
  '{"egressEnabled":true,"ingressEnabled":true,"maxSpoolUsage":1000,"replayLogName":"defaultLog"}'
