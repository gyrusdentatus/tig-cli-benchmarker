import { promises as fs } from 'fs';
import { setup, select_algorithm, start, stop } from './pkg/tig_benchmarker.js';

(async () => {
  try {
    const apiUrl = process.env.API_URL || 'https://api.tig.foundation/play';
    const apiKey = (await fs.readFile('/run/secrets/api_key', 'utf8')).trim();
    const address = (await fs.readFile('/run/secrets/address', 'utf8')).trim();

    console.log('API URL:', apiUrl);
    console.log('API Key:', apiKey);
    console.log('Address:', address);

    await setup(apiUrl, apiKey, address);
    console.log('Setup completed successfully.');

    await select_algorithm("c001", "c001_a005");
    console.log('Algorithm selected successfully.');

    await start(10, 10000);
    console.log('Benchmark started successfully.');

    // Add a mechanism to stop the benchmark after a certain time or condition
    setTimeout(async () => {
      await stop();
      console.log('Benchmark stopped successfully.');
      process.exit(0);
    }, 10000); // Adjust the timeout as needed

  } catch (error) {
    console.error('Error during benchmarking:', error);
  }
})();
