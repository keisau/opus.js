#include "common.h"

class OpusCodecWrapper {
    private:
        OpusEncoder* encoder;
        OpusDecoder* decoder;

        int max_frame_size;

    public:
        OpusCodecWrapper(opus_int32 sampling_rate, int channels, int application, int max_frame_size) : max_frame_size(max_frame_size)
        {
            int encoder_error;
            encoder = opus_encoder_create(sampling_rate, channels, application, &encoder_error);
            if(encoder_error < 0) {
                throw encoder_error;
            }

            int decoder_error;
            decoder = opus_decoder_create(sampling_rate, channels, &decoder_error);

            if(decoder_error < 0) {
                throw decoder_error;
            }
        }

        ~OpusCodecWrapper() {
            opus_encoder_destroy(encoder);
        }

        int encode_float(intptr_t in_ptr, intptr_t out_ptr, int frame_size) {
            float* input = reinterpret_cast<float*>(in_ptr);
            unsigned char* output = reinterpret_cast<unsigned char*>(out_ptr);

            int result = opus_encode_float(encoder, input, frame_size, output, MAX_PACKET_SIZE);

            return result;
        }

        int encode(intptr_t in_ptr, intptr_t out_ptr, int frame_size) {
            opus_int16* input = reinterpret_cast<opus_int16*>(in_ptr);
            unsigned char* output = reinterpret_cast<unsigned char*>(out_ptr);

            int result = opus_encode(encoder, input, frame_size, output, MAX_PACKET_SIZE);

            if (result < 0) {
                return result;
            }

            return result;
        }

        int decode_float(intptr_t in_ptr, int bytes, intptr_t out_ptr) {
            unsigned char* input = reinterpret_cast<unsigned char*>(in_ptr);
            float* pcm = reinterpret_cast<float*>(out_ptr);

            int len = opus_decode_float(decoder, input, bytes, pcm, max_frame_size, 0);

            return len;
        }

        int decode(intptr_t in_ptr, int bytes, intptr_t out_ptr) {
            unsigned char* input = reinterpret_cast<unsigned char*>(in_ptr);
            opus_int16* pcm = reinterpret_cast<opus_int16*>(out_ptr);

            int len = opus_decode(decoder, input, bytes, pcm, max_frame_size, 0);

            return len;
        }

        static void destroy_handler(OpusCodecWrapper *handler) {
            delete handler;
        }
};

EMSCRIPTEN_BINDINGS(opus) {
    class_<OpusCodecWrapper>("Codec")
        .constructor<opus_int32, int, int, int>()
        .function("encodeFloat", &OpusCodecWrapper::encode_float)
        .function("encode", &OpusCodecWrapper::encode)
        .function("decodeFloat", &OpusCodecWrapper::decode_float)
        .function("decode", &OpusCodecWrapper::decode)
        .class_function("destroy_handler", &OpusCodecWrapper::destroy_handler, allow_raw_pointers());
}
