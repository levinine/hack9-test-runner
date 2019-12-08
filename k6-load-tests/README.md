# K6 load tests

See http://k6.io/ 

## Install 


## Run

``` Bash
# load test GET /switch/price
k6 run -e phase=getPrice script.js

# load test POST /switch/call
k6 run -e phase=postCall script.js
```

