
  ls -l `find tmp/data | grep json`
  for json in `find tmp/data | grep json$`
  do
    echo $json
    cat $json
    echo
  done
  for gz in `find tmp/data | grep json.gz$`
  do
    echo $gz
    zcat $gz
    echo
  done
