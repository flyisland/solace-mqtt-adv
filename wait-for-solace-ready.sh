#!/bin/bash

log() {
   echo "$(date +'%Y-%m-%d %H:%M:%S'): $1"
}

wait_for_service_ready() {
   local is_started=false
   while [ "$is_started" == false ] ; do
      local response=$(curl --write-out '%{http_code}' --silent ${solace_health_check_url} -H "content-type: text")
      log "${solace_health_check_url} -> ${response}"
      if [ "$response" == "200" ] ; then
         is_started=ture
         log "Solace service is ready!"
      else
         sleep 5
      fi
   done
}

if [ -z ${solace_health_check_url+x} ]; then 
  solace_health_check_url="http://localhost:5550/health-check/guaranteed-active"
fi

wait_for_service_ready