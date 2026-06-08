import fs from 'fs';
import path from 'path';

export function getEnJsonWritePaths() {
  return [
    path.join(process.cwd(), '../client/src/en.json'),
    path.join(process.cwd(), 'src/en.json'),
  ].filter((filePath) => {
    const dir = path.dirname(filePath);
    return fs.existsSync(dir);
  });
}

export function getEnJsonReadPath() {
  const candidates = getEnJsonWritePaths();
  let bestPath = candidates[0];
  let bestCount = 0;

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const truths = content?.questions?.truths ?? {};
      const dares = content?.questions?.dares ?? {};
      const count =
        Object.values(truths).reduce(
          (sum: number, list) => sum + (Array.isArray(list) ? list.length : 0),
          0,
        ) +
        Object.values(dares).reduce(
          (sum: number, list) => sum + (Array.isArray(list) ? list.length : 0),
          0,
        );
      if (count >= bestCount) {
        bestCount = count;
        bestPath = filePath;
      }
    } catch {
      continue;
    }
  }

  return bestPath;
}
