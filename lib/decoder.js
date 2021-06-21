const {
  VALID_SAMPLE_RATES,
  MAX_FRAME_SIZE,
  MAX_PACKET_SIZE,
  OpusApplication,
  OpusError,
} = require('./constants')

exports.Decoder = class Decoder {
  constructor(
    sampleRate,
    channels,
    { maxFrameSize = MAX_FRAME_SIZE } = {},
  ) {
    if (!VALID_SAMPLE_RATES.includes(sampleRate)) {
      throw new RangeError(`${sampleRate} is an invalid sampling rate.`)
    }

    this.sampleRate = sampleRate
    this.channels = channels || 1

    this.maxFrameSize = Math.min(maxFrameSize, MAX_FRAME_SIZE)

    this.ready = false

    this.init()
    this.promise = Promise.resolve()
  }

  init() {
    let opus = null

    // optimized for webpack 5 lazy loading modules
    try {
      const create = require('../build/opus-decoder')

      opus = this.opus = create()
    } catch (err) {
      const create = require('../build/opus-decoder.asm')

      opus = this.opus = create()
    }

    this.component = new opus.Decoder(this.sampleRate, this.channels, this.maxFrameSize)

    const frameLength = this.maxFrameSize * this.channels

    this.floatPointer = opus._malloc(frameLength * Float32Array.BYTES_PER_ELEMENT)
    this.int16Pointer = opus._malloc(frameLength * Int16Array.BYTES_PER_ELEMENT)
    this.bytesPointer = opus._malloc(MAX_PACKET_SIZE)

    this.float = new Float32Array(opus.HEAPU8.buffer, this.floatPointer, frameLength)
    this.int16 = new Int16Array(opus.HEAPU8.buffer, this.int16Pointer, frameLength)
    this.bytes = opus.HEAPU8.subarray(this.bytesPointer, this.bytesPointer + MAX_PACKET_SIZE)

    this.ready = true

    return this
  }

  decodeFloat(buffer) {
    let array = buffer

    if (buffer.constructor.name !== 'Uint8Array') {
      array = new Uint8Array(buffer)
    }

    const {
      bytes,
      float,
    } = this

    bytes.set(array)

    const len = this.component.decodeFloat(bytes.byteOffset, array.length, float.byteOffset)

    if (len < 0) {
      throw new Error(`Decode error: ${OpusError[`${len}`]}`)
    }

    const retval = float.subarray(0, len * this.channels)

    return retval
  }

  decode(buffer) {
    let array = buffer

    if (buffer.constructor.name !== 'Uint8Array') {
      array = new Uint8Array(buffer)
    }

    const {
      bytes,
      int16,
    } = this

    bytes.set(array)

    const len = this.component.decode(bytes.byteOffset, array.length, int16.byteOffset)

    if (len < 0) {
      throw new Error(`Decode error: ${OpusError[`${len}`]}`)
    }

    const retval = int16.subarray(0, len * this.channels)

    return retval
  }

  delete() {
    const { opus } = this
    opus.Decoder.destroy_handler(this.component)
    opus._free(this.floatPointer)
    opus._free(this.bytesPointer)
    opus._free(this.int16Pointer)
  }
}
