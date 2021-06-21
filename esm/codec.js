import {
  VALID_SAMPLE_RATES,
  MAX_FRAME_SIZE,
  MAX_PACKET_SIZE,
  OpusApplication,
  OpusError,
} from './constants'

export class Codec {
  constructor(
    sampleRate,
    channels,
    {
      application = OpusApplication.AUDIO,
      maxFrameSize = MAX_FRAME_SIZE,
    } = {},
  ) {
    if (!VALID_SAMPLE_RATES.includes(sampleRate)) {
      throw new RangeError(`${sampleRate} is an invalid sampling rate.`)
    }

    this.sampleRate = sampleRate
    this.channels = channels || 1
    this.application = application || OpusApplication.AUDIO

    this.maxFrameSize = Math.min(maxFrameSize, MAX_FRAME_SIZE)

    this.ready = false

    this.promise = this.init()
  }

  async init() {
    let opus = null

    // optimized for webpack 5 lazy loading modules
    try {
      const { default: create } = await import('../build/opus-codec')

      opus = this.opus = create()
    } catch (err) {
      const { default: create } = await import('../build/opus-codec.asm')

      opus = this.opus = create()
    }

    this.component = new opus.Codec(this.sampleRate, this.channels, this.application, this.maxFrameSize)

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

  encodeFloat(buffer) {
    let array = buffer

    if (buffer.constructor.name !== 'Float32Array') {
      array = new Float32Array(buffer)
    }

    const frameSize = array.length
    const {
      bytes,
      float,
    } = this

    float.set(array)

    const len = this.component.encodeFloat(
      float.byteOffset,
      bytes.byteOffset,
      frameSize,
    )

    if (len < 0) {
      throw new Error(`Encode error: ${OpusError[`${len}`]}`)
    }

    const retval = bytes.subarray(0, len)

    return retval
  }

  encode(buffer) {
    let array = buffer

    if (buffer.constructor.name !== 'Int16Array') {
      array = new Int16Array(buffer)
    }

    const frameSize = array.length
    const {
      bytes,
      float,
    } = this

    float.set(array)

    const len = this.component.encode(
      float.byteOffset,
      bytes.byteOffset,
      frameSize,
    )

    if (len < 0) {
      throw new Error(`Encode error: ${OpusError[`${len}`]}`)
    }

    const retval = bytes.subarray(0, len)

    return retval
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
    opus.Codec.destroy_handler(this.component)
    opus._free(this.floatPointer)
    opus._free(this.bytesPointer)
    opus._free(this.int16Pointer)
  }
}
