export const OpusApplication = {
  VOIP               : 2048,
  AUDIO              : 2049,
  RESTRICTED_LOWDELAY: 2051,
}

export const OpusError = {
  0   : 'OK',
  '-1': 'Bad argument',
  '-2': 'Buffer too small',
  '-3': 'Internal error',
  '-4': 'Invalid packet',
  '-5': 'Unimplemented',
  '-6': 'Invalid state',
  '-7': 'Memory allocation fail',
}

export const VALID_SAMPLE_RATES = [
  8000,
  12000,
  16000,
  24000,
  48000,
]

export const MAX_FRAME_SIZE = 48000 * 120 / 1000
export const MAX_PACKET_SIZE = 1276 * 3

export function clone(typedArray) {
  const Class = typedArray.constructor

  const {
    buffer, byteOffset, byteLength,
  } = typedArray

  const arrayBuffer = buffer.slice(byteOffset, byteLength + byteOffset)

  return new Class(arrayBuffer)
}
