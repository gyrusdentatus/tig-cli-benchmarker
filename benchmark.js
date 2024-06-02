const fs = require('fs').promises;

(async () => {
  const apiUrl = process.env.API_URL;
  const apiKey = await fs.readFile('/run/secrets/api_key', 'utf8');
  const address = await fs.readFile('/run/secrets/address', 'utf8');

  const benchmarker = await import('./pkg/tig_benchmarker.js'); // Adjust the import path if necessary
  await benchmarker.setup(apiUrl, apiKey.trim(), address.trim());
  await benchmarker.select_algorithm("c001", "c001_a001");
  await benchmarker.start(10, 10);

  // Add a mechanism to stop the benchmark after a certain time or condition
  setTimeout(async () => {
    await benchmarker.stop();
    process.exit(0);
  }, 10000); // Adjust the timeout as needed
})();
