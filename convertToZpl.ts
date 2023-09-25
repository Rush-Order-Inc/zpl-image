import { Buffer } from "buffer";
import { Gif } from "gifwrap";
import { GifCodec } from "gifwrap";
const rgbaToZ64 = require("zpl-image").rgbaToZ64;

export const gifToZpl = async (buffer: Buffer): Promise<string> => {
  const codec = new GifCodec();
  return (codec.decodeGif(buffer) as Promise<Gif>)
    .then((sourceGif: Gif) => {
      const firstFrame = sourceGif.frames[0];

      // you might want to rotate L to be in line with PDF prints,
      // but UPC purchase number 2d scan makes label slightly too long
      // causing label to shift upward cut off top
      let result = rgbaToZ64(firstFrame.bitmap.data, firstFrame.bitmap.width, {
        black: 47,
        rotate: "R",
      });

      const zpl = `
          ^XA^LH0,0^FWN^PON^PMN^LRN
          ^FO15,10^GFA,${result.length},${result.length},${result.rowlen},${result.z64}
          ^XZ`;

      return zpl;
    })
    .catch((err) => {
      console.error("error: ", err);
      return "error";
    });
};
