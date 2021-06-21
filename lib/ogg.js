exports.Ogg = class Ogg {
  checksumTable = new Array(256)
  serial = parseInt(Math.random() * 0xffffffff)
  pageIndex = 0
  granulePosition = 0
  segmentData = new Uint8Array(65025) // Maximum length of oggOpus data
  segmentDataIndex = 0
  segmentTable = new Uint8Array(255) // Maximum data segments
  segmentTableIndex = 0
  framesInPage = 0

  vender = Uint8Array.from(Buffer.from('vocaltale'))

  constructor(sampleRate, channels, frameSize = 1920, maxFramesPerPage = 8) {
    this.sampleRate = sampleRate
    this.channels = channels
    this.frameSize = frameSize
    this.maxFramesPerPage = maxFramesPerPage
    this.initChecksumTable()
  }

  initChecksumTable() {
    const { checksumTable } = this

    for (let i = 0; i < 256; i++) {
      let r = i << 24
      for (let j = 0; j < 8; j++) {
        r = ((r & 0x80000000) !== 0) ? ((r << 1) ^ 0x04c11db7) : (r << 1)
      }
      checksumTable[i] = (r & 0xffffffff)
    }
  }

  getChecksum(data) {
    let checksum = 0

    for (let i = 0; i < data.length; i++) {
      checksum = (checksum << 8) ^ this.checksumTable[((checksum >>> 24) & 0xff) ^ data[i]]
    }
    return checksum >>> 0
  }

  generatePage() {
    const granulePosition = (this.lastPositiveGranulePosition === this.granulePosition) ? -1 : this.granulePosition
    const pageBuffer = new ArrayBuffer(27 + this.segmentTableIndex + this.segmentDataIndex)
    const pageBufferView = new DataView(pageBuffer)
    const page = new Uint8Array(pageBuffer)

    pageBufferView.setUint32(0, 1399285583, true) // Capture Pattern starts all page headers 'OggS'
    pageBufferView.setUint8(4, 0, true) // Version
    pageBufferView.setUint8(5, this.headerType, true) // 1 = continuation, 2 = beginning of stream, 4 = end of stream

    // Number of samples upto and including this page at 48000Hz, into signed 64 bit Little Endian integer
    // Javascript Number maximum value is 53 bits or 2^53 - 1
    pageBufferView.setUint32(6, granulePosition, true)
    if (granulePosition < 0) {
      pageBufferView.setInt32(10, Math.ceil(granulePosition / 4294967297) - 1, true)
    } else {
      pageBufferView.setInt32(10, Math.floor(granulePosition / 4294967296), true)
    }

    pageBufferView.setUint32(14, this.serial, true) // Bitstream serial number
    pageBufferView.setUint32(18, this.pageIndex++, true) // Page sequence number
    pageBufferView.setUint8(26, this.segmentTableIndex, true) // Number of segments in page.
    page.set(this.segmentTable.subarray(0, this.segmentTableIndex), 27) // Segment Table
    page.set(this.segmentData.subarray(0, this.segmentDataIndex), 27 + this.segmentTableIndex) // Segment Data
    pageBufferView.setUint32(22, this.getChecksum(page), true) // Checksum

    this.segmentTableIndex = 0
    this.segmentDataIndex = 0
    this.framesInPage = 0
    if (granulePosition > 0) {
      this.lastPositiveGranulePosition = granulePosition
    }

    return page
  }

  generateIdPage() {
    const segmentDataView = new DataView(this.segmentData.buffer)
    segmentDataView.setUint32(0, 1937076303, true) // Magic Signature 'Opus'
    segmentDataView.setUint32(4, 1684104520, true) // Magic Signature 'Head'
    segmentDataView.setUint8(8, 1, true) // Version
    segmentDataView.setUint8(9, this.channels, true) // Channel count
    segmentDataView.setUint16(10, 3840, true) // pre-skip (80ms)
    segmentDataView.setUint32(12, this.sampleRate, true) // original sample rate
    segmentDataView.setUint16(16, 0, true) // output gain
    segmentDataView.setUint8(18, 0, true) // channel map 0 = mono or stereo
    this.segmentTableIndex = 1
    this.segmentDataIndex = this.segmentTable[0] = 19
    this.headerType = 2
    return this.generatePage()
  }

  generateCommentPage() {
    const segmentDataView = new DataView(this.segmentData.buffer)

    segmentDataView.setUint32(0, 1937076303, true) // Magic Signature 'Opus'
    segmentDataView.setUint32(4, 1936154964, true) // Magic Signature 'Tags'

    segmentDataView.setUint32(8, this.vender.byteLength, true) // Vendor Length
    this.segmentData.set(this.vender, 12)
    segmentDataView.setUint32(12 + this.vender.byteLength, 0, true) // User Comment List Length
    this.segmentTableIndex = 1
    this.segmentDataIndex = this.segmentTable[0] = 26
    this.headerType = 0
    return this.generatePage()
  }

  segmentPacket(packet) {
    let packetIndex = 0
    const exportPages = []
    let { length } = packet

    while (length >= 0) {
      if (this.segmentTableIndex === 255) {
        exportPages.push(this.generatePage())
        this.headerType = 1
      }

      const segmentLength = Math.min(length, 255)
      this.segmentTable[this.segmentTableIndex++] = segmentLength
      this.segmentData.set(packet.subarray(packetIndex, packetIndex + segmentLength), this.segmentDataIndex)
      this.segmentDataIndex += segmentLength
      packetIndex += segmentLength
      length -= 255
    }

    this.granulePosition += (48 * this.frameSize)
    if (this.segmentTableIndex === 255) {
      exportPages.push(this.generatePage())
      this.headerType = 0
    }

    return exportPages
  }

  finalize() {
    this.headerType += 4
    return this.generatePage()
  }
}
