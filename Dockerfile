FROM rust:latest

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nodejs \
    && curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Set up the working directory
WORKDIR /app

# Clone the repository
RUN git clone https://github.com/tig-foundation/tig-monorepo

# Set the working directory to the benchmarker
WORKDIR /app/tig-monorepo/tig-benchmarker

# Install wasm-opt using Cargo
RUN cargo install wasm-opt --locked

# Update PATH to include the directory where wasm-bindgen is installed
ENV PATH="/root/.cargo/bin:/root/.cache/.wasm-pack/.wasm-bindgen-cargo-install-0.2.92/bin:${PATH}"

# Build the wasm package
RUN wasm-pack build --release --target nodejs

# Copy the benchmark script
COPY benchmark.mjs .

# Run the benchmark script
CMD ["node", "benchmark.mjs"]
