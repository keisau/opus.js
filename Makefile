OPUS_SOURCE=./opus

EMCC_OPTS=-Wall -O3 --llvm-lto 3 -flto -I opus/include --closure 1 -s ALLOW_MEMORY_GROWTH=1 --memory-init-file 0 -s NO_FILESYSTEM=1 -s EXPORTED_FUNCTIONS="['_malloc', '_opus_strerror']" -s MODULARIZE=1 -s NODEJS_CATCH_EXIT=0 -s NODEJS_CATCH_REJECTION=0 -s TOTAL_MEMORY=262144 -s TOTAL_STACK=65536

EMCC_NASM_OPTS=-s WASM=0 -s WASM_ASYNC_COMPILATION=0
EMCC_WASM_OPTS=-s WASM=1 -s WASM_ASYNC_COMPILATION=0 -s WASM_BIGINT

all: init compile

autogen:
	cd $(OPUS_SOURCE); \
	./autogen.sh

configure:
	cd $(OPUS_SOURCE); \
	emconfigure ./configure \
		--disable-extra-programs \
		--disable-doc \
		--disable-intrinsics \
		--disable-stack-protector

bind:
	cd $(OPUS_SOURCE); \
	emmake make; \
	rm -f a.wasm

init: autogen configure bind

compile:
	rm -rf ./build; \
	mkdir -p ./build; \
	em++ ${EMCC_OPTS} ${EMCC_NASM_OPTS} --bind -o build/opus-encoder.asm.js src/opus_encoder.cpp ${OPUS_SOURCE}/.libs/libopus.a; \
	em++ ${EMCC_OPTS} ${EMCC_WASM_OPTS} --bind -o build/opus-encoder.js src/opus_encoder.cpp ${OPUS_SOURCE}/.libs/libopus.a; \
	em++ ${EMCC_OPTS} ${EMCC_NASM_OPTS} --bind -o build/opus-decoder.asm.js src/opus_decoder.cpp ${OPUS_SOURCE}/.libs/libopus.a; \
	em++ ${EMCC_OPTS} ${EMCC_WASM_OPTS} --bind -o build/opus-decoder.js src/opus_decoder.cpp ${OPUS_SOURCE}/.libs/libopus.a; \
	em++ ${EMCC_OPTS} ${EMCC_NASM_OPTS} --bind -o build/opus-codec.asm.js src/opus_codec.cpp ${OPUS_SOURCE}/.libs/libopus.a; \
	em++ ${EMCC_OPTS} ${EMCC_WASM_OPTS} --bind -o build/opus-codec.js src/opus_codec.cpp ${OPUS_SOURCE}/.libs/libopus.a; \
	cp -f opus/COPYING build/COPYING.libopus;
