const fs = require('fs').promises;

async function loadWasm() {
  try {
    console.log("Loading Benchmarker WASM");
    const wasmModule = await import('./pkg/tig_benchmarker.js');
    console.log("WASM Module:", wasmModule);

    // Use the correct initialization function
    const init = wasmModule.__wbg_init;

    if (init) await init("./pkg/tig_benchmarker_bg.wasm");
    
    // Directly reference the functions from wasmModule
    global.state = wasmModule.__wasm.state;
    global.start = wasmModule.__wasm.start;
    global.stop = wasmModule.__wasm.stop;
    global.select_algorithm = wasmModule.__wasm.select_algorithm;
    global.setup = wasmModule.__wasm.setup;

    console.log("Benchmarker WASM initialized and functions are available globally");
  } catch (error) {
    console.error("Failed to load WASM module:", error);
  }
}

async function runBenchmark() {
  try {
    await loadWasm();

    const apiUrl = process.env.API_URL || 'https://api.tig.foundation/play';
    const apiKey = (await fs.readFile('/run/secrets/api_key', 'utf8')).trim();
    const address = (await fs.readFile('/run/secrets/address', 'utf8')).trim();

    console.log('API URL:', apiUrl);
    console.log('API Key:', apiKey);
    console.log('Address:', address);

    console.log('Calling setup...');
    if (global.setup) {
      await global.setup(apiUrl, apiKey, address);
      console.log('Setup completed successfully.');
    } else {
      console.log('Setup function not found.');
    }

    console.log('Selecting algorithm...');
    if (global.select_algorithm) {
      await global.select_algorithm("c001", "c001_a005");
      console.log('Algorithm selected successfully.');
    } else {
      console.log('Select algorithm function not found.');
    }

    console.log('Starting benchmark...');
    if (global.start) {
      await global.start(10, 10000);
      console.log('Benchmark started successfully.');
    } else {
      console.log('Start function not found.');
    }

    setTimeout(async () => {
      console.log('Stopping benchmark...');
      if (global.stop) {
        await global.stop();
        console.log('Benchmark stopped successfully.');
      } else {
        console.log('Stop function not found.');
      }
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('Error during benchmarking:', error);
  }
}

runBenchmark();
