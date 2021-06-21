#include "common.h"

class OpusDecoderWrapper {
    private:
        OpusDecoder* decoder;

        int max_frame_size;

    public:
        OpusDecoderWrapper(opus_int32 sampling_rate, int channels, int max_frame_size) : max_frame_size(max_frame_size)
        {
            int decoder_error;
            decoder = opus_decoder_create(sampling_rate, channels, &decoder_error);

            if(decoder_error < 0) {
                throw decoder_error;
            }
        }

        ~OpusDecoderWrapper() {
            opus_decoder_destroy(decoder);
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

        static void destroy_handler(OpusDecoderWrapper *handler) {
            delete handler;
        }
};

EMSCRIPTEN_BINDINGS(opus) {
    class_<OpusDecoderWrapper>("Decoder")
        .constructor<opus_int32, int, int>()
        .function("decodeFloat", &OpusDecoderWrapper::decode_float)
        .function("decode", &OpusDecoderWrapper::decode)
        .class_function("destroy_handler", &OpusDecoderWrapper::destroy_handler, allow_raw_pointers());
}
