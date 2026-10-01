# Original ONEFLOW soundscapes

All seven WAV loops are synthesized locally by `scripts/stage2-assets.js`. No recordings, copyrighted voices, sampled music, or third-party sound files are used. These original generated assets are dedicated to the public domain under CC0-1.0. Source code is included for reproducibility.

| File | Character | Format |
| --- | --- | --- |
| rain.wav | Soft broadband rain and scattered drops | 12 seconds, mono PCM, 16 kHz / 16 bit |
| cafe.wav | Nonverbal low café-like murmur | Same |
| fireplace.wav | Warm filtered noise and crackles | Same |
| forest.wav | Wind-like noise and synthesized bird tones | Same |
| ocean.wav | Slowly swelling filtered surf | Same |
| white.wav | White noise | Same |
| brown.wav | Low-pass brown-like noise | Same |

An overlap at the loop boundary avoids a silent seam. Web Audio `AudioBufferSourceNode.loop` performs continuous sample playback. The café and nature sounds are stylized synthesis, not field recordings. The optional phase chime is synthesized at runtime from three sine tones. No attribution is required for these sounds. CC0 text: https://creativecommons.org/publicdomain/zero/1.0/legalcode
