FROM rust:latest

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    curl \
    nodejs \
    && curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Set up the working directory
WORKDIR /app

# Clone the repository
RUN git clone https://github.com/tig-foundation/tig-monorepo

# Set the working directory to the benchmarker
WORKDIR /app/tig-monorepo/tig-benchmarker

# Build the wasm package
RUN wasm-pack build --release --target web

# Copy the benchmark script
COPY benchmark.js .

# Expose port 80
EXPOSE 80

# Start the web server and run the benchmark script
CMD ["sh", "-c", "python3 -m http.server 80 & node benchmark.js"]