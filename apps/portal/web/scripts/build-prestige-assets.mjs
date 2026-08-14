import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "../public/media/game-ui/classes");
const classes = ["warrior", "guardian", "thief", "priest", "wizard", "archer", "idoll", "magician"];
const variants = ["", "-selected"];

const materials = {
  platinum: { shadow: [35, 49, 57], body: [146, 177, 188], highlight: [232, 250, 255] },
  topaz: { shadow: [63, 31, 8], body: [190, 91, 22], highlight: [255, 211, 92] },
  amethyst: { shadow: [43, 20, 65], body: [112, 55, 158], highlight: [225, 188, 255] },
  obsidian: { shadow: [5, 7, 10], body: [27, 33, 43], highlight: [119, 139, 166] },
  jade: { shadow: [17, 42, 35], body: [67, 119, 96], highlight: [185, 221, 202] },
  ruby: { shadow: [53, 5, 15], body: [157, 23, 48], highlight: [255, 154, 137] },
  fernandium: { shadow: [13, 27, 42], body: [44, 89, 125], highlight: [218, 179, 91] },
  miriamite: { shadow: [51, 42, 55], body: [188, 167, 181], highlight: [255, 244, 218] },
};

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(minimum, maximum, value) {
  const amount = clamp((value - minimum) / (maximum - minimum));
  return amount * amount * (3 - 2 * amount);
}

function hueOf(red, green, blue, maximum, chroma) {
  if (chroma === 0) return 0;
  if (maximum === red) return 60 * (((green - blue) / chroma) % 6);
  if (maximum === green) return 60 * ((blue - red) / chroma + 2);
  return 60 * ((red - green) / chroma + 4);
}

function greenDetailMask(red, green, blue) {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const chroma = maximum - minimum;
  const saturation = maximum === 0 ? 0 : chroma / maximum;
  const hue = (hueOf(red, green, blue, maximum, chroma) + 360) % 360;
  const hueMask = smoothstep(65, 105, hue) * (1 - smoothstep(175, 205, hue));
  const saturationMask = smoothstep(0.055, 0.24, saturation);
  return hueMask * saturationMask;
}

function materialColor(material, luminance) {
  const shadowToBody = smoothstep(0.04, 0.56, luminance);
  const bodyToHighlight = smoothstep(0.48, 0.92, luminance);
  return material.shadow.map((shadow, channel) => {
    const body = shadow + (material.body[channel] - shadow) * shadowToBody;
    return body + (material.highlight[channel] - body) * bodyToHighlight;
  });
}

async function detailedMaterial(source, target, material) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) continue;

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
    const mask = greenDetailMask(red, green, blue);
    const replacement = materialColor(material, luminance);

    // The neutral silver frame, weapons and reliefs remain exactly as authored.
    // Only the original green enamel/stone is replaced by the prestige material.
    for (let channel = 0; channel < 3; channel += 1) {
      const original = data[index + channel];
      data[index + channel] = Math.round(original + (replacement[channel] - original) * mask);
    }
  }

  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(target);
}

for (const directory of Object.keys(materials)) {
  await mkdir(path.join(root, directory), { recursive: true });
}

for (const classId of classes) {
  for (const suffix of variants) {
    const neutral = path.join(root, "silver", `${classId}${suffix}.png`);
    for (const [directory, material] of Object.entries(materials)) {
      await detailedMaterial(neutral, path.join(root, directory, `${classId}${suffix}.png`), material);
    }
  }
}

console.log("Prestige assets generated for 8 classes and 11 level milestones.");
