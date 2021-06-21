opus.js
---

Inspired by [OpusScript](https://github.com/abalabahaha/opusscript), or an enhanced version, of a JavaScript library compiled from `libopus` using Emscripten.

# Usage

```javascript
import Opus, { OpusApplication } from '@vocaltale/opus.js'

opus = new Opus(48000, 1, OpusApplication.RESTRICTED_LOWDELAY)

const frameFloat = new Float32Array(1920)
frameFloat.fill(0.1)

const encodedFloat = opus.encodeFloat(frameFloat)

const decodedFloat = opus.decodeFloat(encodedFloat)

opus.delete()

```

# Enhancements

1. Webpack 5 Lazy-loading support (using `await import()` syntax)
2. Automatically fallback to `opus.asm.js` if `WASM` is not supported
3. Support 32-bits Float formatted PCM data
4. Lower memory usage by limiting the stack size and the heap size further 
5. Separated encoder and decoder. (original codec is also there)