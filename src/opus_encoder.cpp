#include "common.h"

class OpusEncoderWrapper {
    private:
        OpusEncoder* encoder;

    public:
        OpusEncoderWrapper(opus_int32 sampling_rate, int channels, int application)
        {
            int encoder_error;
            encoder = opus_encoder_create(sampling_rate, channels, application, &encoder_error);
            if(encoder_error < 0) {
                throw encoder_error;
            }
        }

        ~OpusEncoderWrapper() {
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

        static void destroy_handler(OpusEncoderWrapper *handler) {
            delete handler;
        }
};

EMSCRIPTEN_BINDINGS(opus) {
    class_<OpusEncoderWrapper>("Encoder")
        .constructor<opus_int32, int, int>()
        .function("encodeFloat", &OpusEncoderWrapper::encode_float)
        .function("encode", &OpusEncoderWrapper::encode)
        .class_function("destroy_handler", &OpusEncoderWrapper::destroy_handler, allow_raw_pointers());
}
