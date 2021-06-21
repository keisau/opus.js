const { Decoder } = require('./decoder')
const { Encoder } = require('./encoder')
const { Codec } = require('./codec')
const { Ogg } = require('./ogg')
const {
  VALID_SAMPLE_RATES,
  MAX_FRAME_SIZE,
  MAX_PACKET_SIZE,
  OpusApplication,
  OpusError,
} = require('./constants')

module.exports = {
  Encoder,
  Decoder,
  Codec,
  Ogg,
  VALID_SAMPLE_RATES,
  MAX_FRAME_SIZE,
  MAX_PACKET_SIZE,
  OpusApplication,
  OpusError,
}
