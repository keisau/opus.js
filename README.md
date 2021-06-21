opus.js
---

Inspired by [OpusScript](https://github.com/abalabahaha/opusscript) and [opus-recorder](https://github.com/chris-rudmin/opus-recorder),a JavaScript library compiled from `libopus` using Emscripten.

# Usage

Here is an example using Node.js to encode PCM in 32-bits floating point to opus and write it to a file using Ogg container format.
```javascript
const fs = require('fs')
const {
  Encoder,
  Ogg,
} = require('@vocaltale/opus.js')

const encoder = new Encoder(48000, 1, { maxFrameSize: 960 })
// const decoder = new Decoder(48000, 1, { maxFrameSize: 960 })

const raw = new Float32Array(960)
let encoded = null
const ogg = new Ogg(48000, 1, 960, 16)
const stream = fs.createWriteStream('test.opus')

stream.write(ogg.generateIdPage())
stream.write(ogg.generateCommentPage())

raw.fill(0.1)
encoded = encoder.encodeFloat(raw)

// console.log(encoded.length)
const packet = ogg.segmentPacket(encoded)
const all = ogg.finalize()
stream.write(all)
stream.end()

encoder.delete()
```

# Enhancements

1. Webpack 5 Lazy-loading support (using `await import()` syntax) (only available for esModule, `@vocaltale/opus.js/esm`)
2. Automatically fallback to `opus.asm.js` if `WASM` is not supported
3. Support 32-bits Float formatted PCM data
4. Lower memory usage by limiting the stack size and the heap size further 
5. Separated encoder and decoder. (original codec is also there)