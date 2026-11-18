// Unit tests for the server-side AI output validator. Run: node --test tests/validate.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validate } from '../api/analyse-image.ts'

const good = { object_name: 'पत्ता', description: 'हरा पत्ता, बीच में एक नस है।', possible_axis: 'vertical', symmetry_observation: 'approximate', confidence: 0.91, observation_task: 'बाएँ और दाएँ किनारों की तुलना करो।' }
const goodEn = { ...good, object_name: 'Leaf', description: 'A green leaf with a central vein.', observation_task: 'Compare the left and right edges of the leaf.' }

test('accepts valid Hindi output', () => assert.equal(validate(JSON.stringify(good), 'hi')?.object_name, 'पत्ता'))
test('accepts valid English output', () => assert.equal(validate(JSON.stringify(goodEn), 'en')?.possible_axis, 'vertical'))
test('rejects invalid JSON', () => assert.equal(validate('not json {', 'en'), null))
test('rejects missing field', () => { const { description: _d, ...o } = goodEn; assert.equal(validate(JSON.stringify(o), 'en'), null) })
test('rejects unknown axis value', () => assert.equal(validate(JSON.stringify({ ...goodEn, possible_axis: 'circular' }), 'en'), null))
test('rejects "perfect" observation (not allowed)', () => assert.equal(validate(JSON.stringify({ ...goodEn, symmetry_observation: 'perfect' }), 'en'), null))
test('rejects confidence out of range', () => assert.equal(validate(JSON.stringify({ ...goodEn, confidence: 1.4 }), 'en'), null))
test('rejects confidence as string', () => assert.equal(validate(JSON.stringify({ ...goodEn, confidence: '0.9' }), 'en'), null))
test('rejects overly long text', () => assert.equal(validate(JSON.stringify({ ...goodEn, description: 'x'.repeat(400) }), 'en'), null))
test('rejects English text when Hindi was requested', () => assert.equal(validate(JSON.stringify(goodEn), 'hi'), null))
test('low confidence is downgraded to uncertain', () => assert.equal(validate(JSON.stringify({ ...goodEn, confidence: 0.2 }), 'en')?.symmetry_observation, 'uncertain'))
test('strips markup characters from text', () => assert.equal(validate(JSON.stringify({ ...goodEn, object_name: '<b>Leaf</b>' }), 'en')?.object_name, 'bLeaf/b'))
test('extracts JSON wrapped in prose', () => assert.ok(validate('Here you go: ' + JSON.stringify(goodEn), 'en')))
