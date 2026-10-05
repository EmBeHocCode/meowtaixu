import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterIndex, chapters, WheelGate, wheelDelta, canScrollInside } from '../src/components/navigation/journey-model.ts';

test('canonical and legacy deep links resolve in journey order', () => {
  assert.deepEqual(chapters.map(c => c.id), ['hero', 'about', 'expertise', 'skills', 'focus', 'projects', 'connect']);
  assert.equal(chapterIndex('#about'), 1);
  assert.equal(chapterIndex('#services'), 2);
  assert.equal(chapterIndex('#experience'), 5);
  assert.equal(chapterIndex('#unknown'), -1);
});
test('wheel and horizontal trackpad use the dominant axis and normalize units', () => {
  assert.equal(wheelDelta(3, 100, 0, 900), 100);
  assert.equal(wheelDelta(-80, 3, 0, 900), -80);
  assert.equal(wheelDelta(0, 3, 1, 900), 48);
  assert.equal(wheelDelta(0, 1, 2, 900), 900);
});
test('a burst and momentum tail cannot skip multiple chapters', () => {
  const gate = new WheelGate();
  assert.equal(gate.feed(20, 0, false), 0);
  assert.equal(gate.feed(50, 20, false), 1);
  for (let t = 40; t < 1600; t += 20) assert.equal(gate.feed(100, t, t < 1020), 0);
  assert.equal(gate.feed(-80, 1900, false), -1);
});
test('internal reading consumes gesture until its boundary; next burst leaves', () => {
  assert.equal(canScrollInside(100, 600, 1200, 80), true);
  assert.equal(canScrollInside(600, 600, 1200, 80), false);
  assert.equal(canScrollInside(0, 600, 1200, -80), false);
  assert.equal(canScrollInside(0, 600, 600, 80), false);
  const gate = new WheelGate();
  gate.feed(100, 0, true);
  assert.equal(gate.feed(100, 100, false), 0);
  assert.equal(gate.feed(100, 500, false), 1);
});
