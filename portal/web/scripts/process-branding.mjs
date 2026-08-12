import sharp from "sharp";

const [source, output] = process.argv.slice(2);

if (!source || !output) {
  throw new Error("Usage: node process-branding.mjs <source> <output>");
}

const image = sharp(source).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

for (let index = 0; index < data.length; index += info.channels) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const magenta = Math.min(red, blue) - green;
  const brightness = Math.min(red, blue);

  if (magenta > 75 && brightness > 145) {
    const alpha = Math.max(0, 255 - Math.round((magenta - 75) * 2.4));
    data[index + 3] = Math.min(data[index + 3], alpha);
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: info.channels },
})
  .trim({ background: { r: 255, g: 0, b: 255, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(output);
