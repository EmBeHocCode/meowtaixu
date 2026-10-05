export const chapters = [
  { id: 'hero', label: 'Khởi hành' },
  { id: 'about', label: 'Về tôi' },
  { id: 'expertise', label: 'Chuyên môn' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'focus', label: 'Định hướng' },
  { id: 'projects', label: 'Dự án' },
  { id: 'connect', label: 'Kết nối' },
] as const;

export function chapterIndex(hash: string) {
  const id = hash.replace(/^#/, '');
  const alias = id === 'services' ? 'expertise' : id === 'experience' ? 'projects' : id;
  return chapters.findIndex(chapter => chapter.id === alias);
}

export function wheelDelta(x: number, y: number, mode: number, height: number) {
  const scale = mode === 1 ? 16 : mode === 2 ? height : 1;
  return (Math.abs(x) > Math.abs(y) ? x : y) * scale;
}

export function canScrollInside(top: number, client: number, total: number, delta: number) {
  return total > client + 2 && (delta > 0 ? top + client < total - 2 : top > 2);
}

// One deliberate burst => at most one chapter, including inertial wheel tails.
export class WheelGate {
  last = -Infinity;
  sum = 0;
  consumed = false;
  feed(delta: number, now: number, locked: boolean) {
    if (now - this.last > 220) { this.sum = 0; this.consumed = false; }
    this.last = now;
    if (locked || this.consumed) { this.consumed = true; return 0; }
    if (Math.sign(delta) !== Math.sign(this.sum)) this.sum = 0;
    this.sum += delta;
    if (Math.abs(this.sum) < 65) return 0;
    this.consumed = true;
    return Math.sign(this.sum);
  }
}
