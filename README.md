# TIG-cli-benchmarker
This repo contains tools to run The Innovation Game benchmarker inside a container to be able to run the benchmark headless and with more resources then from host's web browser. 
# Installation
Install the `wasm-opt` on your host first. 
`cargo install wasm-opt`   
Copy it to this directory
`cp $HOME/.cargo/bin/wasm-opt .` 
create address.txt and api_key.txt with their values. 

then `docker compose build` and `up` ... ;P 