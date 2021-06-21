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
const packets = ogg.segmentPacket(encoded)

packets.forEach(packet => {
  stream.write(packet)
})

const all = ogg.finalize()

stream.write(all)
stream.end()

encoder.delete()
```

For browser applications, we might want to use `esModule` version for Webpack 5 Lazy-loading.

```javascript
import {
  Codec,
  OpusApplication
} from '@vocaltale/opus.js/esm'

const codec = new Codec(48000, 1, {
  maxFrameSize: 960,
  application: OpusApplication.RESTRICTED_LOWDELAY,
})

const raw = new Float32Array(960)
let encoded = null

raw.fill(0.1)
encoded = codec.encodeFloat(raw)

// ...

const decoded = codec.decodeFloat(encoded)

codec.delete()
```

The only tricky part is to place the `build/opus-<codec|encoder|decoder>.wasm` to the correct place so the script can run, but let's stop here for you as a challenge.

Remember `opus` is a stateful codec; don't use the same encoder/decoder with multiple sources. Or you might can weird, noisy results.

# Enhancements

1. Webpack 5 Lazy-loading support (using `await import()` syntax) (only available for esModule, `@vocaltale/opus.js/esm`)
2. Automatically fallback to `opus-<codec|encoder|decoder>.asm.js` if `WASM` is not supported
3. Support 32-bits Float formatted PCM data
4. Lower memory usage by limiting the stack size and the heap size further 
5. Separated encoder and decoder, `.wasm` files can be much smaller if don't need both of them. Original codec is also there if you need both of them; they share the same stack and heap memory.