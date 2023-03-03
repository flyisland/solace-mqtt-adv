#!/bin/bash

USER="admin:admin"
log() {
   echo "$(date +'%Y-%m-%d %H:%M:%S'): $1"
}

create_queue_template() {
  local queueTemplatesUrl="${solace_admin_url}/SEMP/v2/config/msgVpns/default/queueTemplates"
  local response=$(curl -X POST --write-out '%{http_code}' --silent --output /dev/null -u ${USER} ${queueTemplatesUrl} -H 'content-type: application/json' -d '{"queueTemplateName":"mqtt_template","maxTtl":600,"respectTtlEnabled":true}')
  if [ "$response" == "200" ] ; then
    log "Create Queue Template mqtt_template successfully"
  else
    log "${queueTemplatesUrl} -> ${response}"
  fi
}

update_client_profile() {
  local queueTemplatesUrl="${solace_admin_url}/SEMP/v2/config/msgVpns/default/clientProfiles/default"
  local response=$(curl -X PATCH --write-out '%{http_code}' --silent --output /dev/null -u ${USER} ${queueTemplatesUrl} -H 'content-type: application/json' -d '{"apiQueueManagementCopyFromOnCreateTemplateName": "mqtt_template"}')
  if [ "$response" == "200" ] ; then
    log "Update Client Profile default successfully"
  else
    log "${queueTemplatesUrl} -> ${response}"
  fi
}


if [ -z ${solace_admin_url+x} ]; then 
  solace_admin_url="http://localhost:8080"
fi

create_queue_template
update_client_profile
