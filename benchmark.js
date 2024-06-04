const fs = require('fs').promises;

async function loadWasm() {
  try {
    console.log("Loading Benchmarker WASM");
    const wasmModule = await import('./pkg/tig_benchmarker.js');
    console.log("WASM Module:", wasmModule);

    const init = wasmModule.__wbg_init;

    if (init) await init("./pkg/tig_benchmarker_bg.wasm");
    
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, retries = 5, delayMs = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed: ${error}`);
      if (attempt === retries - 1) throw error;
      await delay(delayMs * Math.pow(2, attempt)); // Exponential backoff
      attempt++;
    }
  }
}

async function checkApiReady(apiUrl, apiKey) {
  try {
    const fetch = await import('node-fetch');
    const url = `${apiUrl}/get-challenges?block_id=f8becb0d836b3a1844d533afef349307`;  // Add a valid block_id here
    const headers = {
      'x-api-key': apiKey,
      'user-agent': 'TIG API',
    };

    console.log("Checking API readiness with URL:", url);
    console.log("Headers:", headers);

    const response = await fetch.default(url, {
      method: 'GET',
      headers: headers,
    });

    const responseBody = await response.text();
    console.log("API Response:", responseBody);

    if (response.ok) {
      console.log("API is ready");
      return true;
    } else {
      console.log("API is not ready, status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Failed to check API readiness:", error);
    return false;
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

    console.log('Waiting for API readiness...');
    await retry(async () => {
      if (await checkApiReady(apiUrl, apiKey)) {
        return true;
      } else {
        throw new Error('API not ready');
      }
    });

    console.log('Calling setup...');
    await retry(async () => {
      if (global.setup) {
        await global.setup(apiUrl, apiKey, address);
        console.log('Setup completed successfully.');
      } else {
        throw new Error('Setup function not found.');
      }
    });

    console.log('Selecting algorithm...');
    await retry(async () => {
      if (global.select_algorithm) {
        await global.select_algorithm("c001", "c001_a005");
        console.log('Algorithm selected successfully.');
      } else {
        throw new Error('Select algorithm function not found.');
      }
    });

    console.log('Starting benchmark...');
    await retry(async () => {
      if (global.start) {
        await global.start(10, 10000);
        console.log('Benchmark started successfully.');
      } else {
        throw new Error('Start function not found.');
      }
    });

    setTimeout(async () => {
      console.log('Stopping benchmark...');
      await retry(async () => {
        if (global.stop) {
          await global.stop();
          console.log('Benchmark stopped successfully.');
        } else {
          throw new Error('Stop function not found.');
        }
      });
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('Error during benchmarking:', error);
  }
}

runBenchmark();
