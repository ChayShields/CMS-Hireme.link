import sharp from "sharp";

const targetBytes = 400 * 1024;

export async function compressImage(buffer) {
  let width = 2000;
  let quality = 82;
  let output = await render(buffer, width, quality);

  while (output.length > targetBytes && quality > 34) {
    quality -= 8;
    output = await render(buffer, width, quality);
  }

  while (output.length > targetBytes && width > 720) {
    width = Math.floor(width * 0.84);
    quality = 58;
    output = await render(buffer, width, quality);
  }

  if (output.length > targetBytes) {
    output = await render(buffer, 640, 42);
  }

  return output;
}

async function render(buffer, width, quality) {
  return sharp(buffer)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 6,
    })
    .toBuffer();
}
