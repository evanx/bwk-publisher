
(
  set -u -e -x
  if docker network ls | grep test-bwk-network
  then
    docker rm -f test-bwk-redis test-bwk-app test-bwk-decipher test-bwk-encipher
    for name in redis decipher encipher app 
    do
      for container in `docker ps -q -f name=test-bwk-$name`
      do
        docker rm -f $container
      done
    done
    docker network rm test-bwk-network
  fi
)
