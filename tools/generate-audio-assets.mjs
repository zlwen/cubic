import fs from 'node:fs';
import path from 'node:path';

const sampleRate = 22050;
const outputDir = path.resolve('assets/resources/audio');

function writeWav(name, duration, sampleAt) {
  const sampleCount = Math.floor(duration * sampleRate);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const sample = Math.max(-1, Math.min(1, sampleAt(time, index)));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }
  fs.writeFileSync(path.join(outputDir, name), buffer);
}

function seededNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff * 2 - 1;
  };
}

function makeMove(name, baseFrequency, seed) {
  const noise = seededNoise(seed);
  writeWav(name, 0.28, (time) => {
    const body = Math.sin(Math.PI * 2 * baseFrequency * time) * Math.exp(-time * 18);
    const ring = Math.sin(Math.PI * 2 * (baseFrequency * 3.7) * time) * Math.exp(-time * 28);
    const grit = noise() * Math.exp(-time * 45);
    const attack = Math.min(1, time * 900);
    return (body * 0.5 + ring * 0.2 + grit * 0.16) * attack;
  });
}

fs.mkdirSync(outputDir, { recursive: true });

makeMove('move-stone-1.wav', 92, 101);
makeMove('move-stone-2.wav', 104, 202);
makeMove('move-stone-3.wav', 116, 303);

writeWav('ui-click.wav', 0.1, (time) => {
  const envelope = Math.exp(-time * 46);
  return (
    Math.sin(Math.PI * 2 * 520 * time) * 0.25
    + Math.sin(Math.PI * 2 * 820 * time) * 0.12
  ) * envelope;
});

{
  const noise = seededNoise(404);
  writeWav('fall.wav', 0.9, (time) => {
    const frequency = 230 - time * 175;
    const whoosh = noise() * Math.sin(Math.min(1, time / 0.35) * Math.PI) * 0.12;
    const descent = Math.sin(Math.PI * 2 * frequency * time) * Math.exp(-time * 2.6) * 0.22;
    const impactTime = Math.max(0, time - 0.56);
    const impact = time >= 0.56
      ? Math.sin(Math.PI * 2 * 58 * impactTime) * Math.exp(-impactTime * 15) * 0.55
      : 0;
    return whoosh + descent + impact;
  });
}

writeWav('complete.wav', 1.05, (time) => {
  const tones = [
    { start: 0, frequency: 196 },
    { start: 0.12, frequency: 294 },
    { start: 0.24, frequency: 392 },
  ];
  return tones.reduce((sample, tone) => {
    const local = time - tone.start;
    if (local < 0) {
      return sample;
    }
    return sample + Math.sin(Math.PI * 2 * tone.frequency * local) * Math.exp(-local * 4.5) * 0.22;
  }, 0);
});

writeWav('ambient-loop.wav', 8, (time) => {
  const modulation = 0.72 + Math.sin(Math.PI * 2 * 0.125 * time) * 0.14;
  const low = Math.sin(Math.PI * 2 * 55 * time) * 0.075;
  const fifth = Math.sin(Math.PI * 2 * 82.5 * time) * 0.04;
  const air = Math.sin(Math.PI * 2 * 165 * time + Math.sin(Math.PI * 2 * 0.25 * time)) * 0.012;
  return (low + fifth + air) * modulation;
});

console.log(`Generated original audio assets in ${outputDir}`);
