(
  set -u -e -x
  mkdir -p tmp
  if docker network ls | grep test-bwk-network
  then
    docker network rm test-bwk-network
  fi
  for name in test-bwk-redis test-bwk-app test-bwk-decipher test-bwk-encipher
  do
    docker rm -f $name || echo 'no $name'
  done
  docker network create -d bridge test-bwk-network
  redisContainer=`docker run --network=test-bwk-network \
      --name test-bwk-redis -d tutum/redis`
  redisPassword=`docker logs $redisContainer | grep '^\s*redis-cli -a' |
      sed -e 's/^\s*redis-cli -a \(\w*\) .*$/\1/'`
  redisHost=`docker inspect $redisContainer |
      grep '"IPAddress":' | tail -1 | sed 's/.*"\([0-9\.]*\)",/\1/'`
  dd if=/dev/urandom bs=32 count=1 > $HOME/tmp/test-spiped-keyfile
  decipherContainer=`docker run --network=test-bwk-network \
    --name test-bwk-decipher -v $HOME/tmp/test-spiped-keyfile:/spiped/key:ro \
    -p 6444:6444 -d spiped \
    -d -s "[0.0.0.0]:6444" -t "[$redisHost]:6379"`
  decipherHost=`docker inspect $decipherContainer |
    grep '"IPAddress":' | tail -1 | sed 's/.*"\([0-9\.]*\)",/\1/'`
  encipherContainer=`docker run --network=test-bwk-network \
    --name test-bwk-encipher -v $HOME/tmp/test-spiped-keyfile:/spiped/key:ro \
    -p 6341:6341 -d spiped \
    -e -s "[0.0.0.0]:6341" -t "[$decipherHost]:6444"`
  encipherHost=`docker inspect $encipherContainer |
    grep '"IPAddress":' | tail -1 | sed 's/.*"\([0-9\.]*\)",/\1/'`
  cat test/Brian_Kernighan.json |
    redis-cli -a $redisPassword -h $encipherHost -p 6341 -x \
    set bwkp:people:Brian_Kernighan:json
  appContainer=`docker run --network=test-bwk-network --name test-bwk-app \
    -e redisHost=$encipherHost -e redisPort=6341 -e redisPassword=$redisPassword \
    -d evanxsummers/bwk-publisher`
  appHost=`docker inspect $appContainer |
    grep '"IPAddress":' | tail -1 | sed 's/.*"\([0-9\.]*\)",/\1/'`
  sleep 2
  curl -s $appHost:8841/bwk/json/get/people/Brian_Kernighan
  docker rm -f test-bwk-redis test-bwk-app test-bwk-decipher test-bwk-encipher
  docker network rm test-bwk-network
)
