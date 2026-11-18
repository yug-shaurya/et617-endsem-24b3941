import type { SampleImage } from '../types'

/**
 * All sample images are original SVG illustrations drawn for this project
 * (public/images/samples). Metadata was written by inspecting each drawing:
 * the natural objects were deliberately drawn with small left/right differences.
 */
const p = (f: string) => `/images/samples/${f}`

export const SAMPLES: SampleImage[] = [
  {
    id: 'butterfly',
    category: 'nature',
    src: p('butterfly.svg'),
    name: { hi: 'तितली', en: 'Butterfly' },
    description: {
      hi: 'सामने से देखी तितली। दोनों पंख लगभग एक जैसे हैं, पर धब्बों का आकार अलग है।',
      en: 'A front-facing butterfly. The wings are nearly alike, but the spots differ in size.',
    },
    symmetry: 'approximate',
    axes: { hi: '1 खड़ी रेखा (लगभग)', en: '1 vertical line (approximate)' },
    suggestedAxis: 'vertical',
    axisAngle: 0,
  },
  {
    id: 'leaf',
    category: 'nature',
    src: p('leaf.svg'),
    name: { hi: 'पत्ता', en: 'Leaf' },
    description: {
      hi: 'बीच में एक मुख्य नस वाला पत्ता। दायाँ किनारा बाएँ से थोड़ा ज़्यादा फैला है।',
      en: 'A leaf with a central vein. The right edge bulges out a little more than the left.',
    },
    symmetry: 'approximate',
    axes: { hi: 'मुख्य नस पर खड़ी रेखा (लगभग)', en: 'Vertical line along the vein (approximate)' },
    suggestedAxis: 'vertical',
    axisAngle: 0,
  },
  {
    id: 'flower',
    category: 'nature',
    src: p('flower.svg'),
    name: { hi: 'फूल', en: 'Flower' },
    description: {
      hi: 'पाँच पंखुड़ियों वाला फूल। पंखुड़ियाँ गोल घेरे में हैं पर उनके आकार थोड़े अलग हैं।',
      en: 'A five-petal flower. The petals go around in a circle but their sizes differ slightly.',
    },
    symmetry: 'approximate',
    axes: { hi: 'हर पंखुड़ी से होकर 5 रेखाएँ (लगभग)', en: '5 lines, one through each petal (approximate)' },
    suggestedAxis: 'vertical',
    axisAngle: 0,
  },
  {
    id: 'starfish',
    category: 'nature',
    src: p('starfish.svg'),
    name: { hi: 'तारा मछली', en: 'Starfish' },
    description: {
      hi: 'पाँच भुजाओं वाली तारा मछली। इसकी भुजाएँ बीच से चारों ओर फैली हैं (त्रिज्य सममिति), पर हर भुजा थोड़ी अलग है।',
      en: 'A five-armed starfish. Its arms spread out from the centre (radial symmetry), but each arm is a little different.',
    },
    symmetry: 'approximate',
    axes: { hi: 'हर भुजा से होकर 5 रेखाएँ (लगभग)', en: '5 lines, one through each arm (approximate)' },
    suggestedAxis: 'vertical',
    axisAngle: 0,
  },
  {
    id: 'water-pot',
    category: 'everyday',
    src: p('water-pot.svg'),
    name: { hi: 'मटका', en: 'Water pot' },
    description: {
      hi: 'सामने से देखा मिट्टी का मटका। आकार सममित है, पर बाईं ओर चमक का निशान है।',
      en: 'A clay water pot seen from the front. The shape is symmetric, but there is a shine mark on the left.',
    },
    symmetry: 'approximate',
    axes: { hi: '1 खड़ी रेखा (सामने से देखने पर)', en: '1 vertical line (when seen from the front)' },
    suggestedAxis: 'vertical',
    axisAngle: 0,
  },
  {
    id: 'chair',
    category: 'everyday',
    src: p('chair.svg'),
    name: { hi: 'कुर्सी', en: 'Chair' },
    description: {
      hi: 'सामने से देखी लकड़ी की कुर्सी। ढाँचा सममित है, पर लकड़ी की धारियाँ अलग-अलग हैं।',
      en: 'A wooden chair seen from the front. The frame is symmetric, but the wood grain lines differ.',
    },
    symmetry: 'approximate',
    axes: { hi: '1 खड़ी रेखा', en: '1 vertical line' },
    suggestedAxis: 'vertical',
    axisAngle: 0,
  },
  {
    id: 'square',
    category: 'geometric',
    src: p('square.svg'),
    name: { hi: 'वर्ग', en: 'Square' },
    description: {
      hi: 'चारों भुजाएँ बराबर। इसमें 4 सममिति रेखाएँ हैं — खड़ी, आड़ी और दोनों विकर्ण।',
      en: 'All four sides equal. It has 4 lines of symmetry — vertical, horizontal and both diagonals.',
    },
    symmetry: 'perfect',
    axes: { hi: '4 रेखाएँ (पूर्ण)', en: '4 lines (perfect)' },
    suggestedAxis: 'diagonal',
    axisAngle: 45,
  },
  {
    id: 'rectangle',
    category: 'geometric',
    src: p('rectangle.svg'),
    name: { hi: 'आयत', en: 'Rectangle' },
    description: {
      hi: 'लंबाई चौड़ाई से ज़्यादा। इसमें 2 सममिति रेखाएँ हैं — खड़ी और आड़ी। विकर्ण नहीं।',
      en: 'Longer than it is wide. It has 2 lines of symmetry — vertical and horizontal. Not the diagonals.',
    },
    symmetry: 'perfect',
    axes: { hi: '2 रेखाएँ: खड़ी और आड़ी (पूर्ण)', en: '2 lines: vertical and horizontal (perfect)' },
    suggestedAxis: 'horizontal',
    axisAngle: 90,
  },
]

/** Extra images used only inside questions. */
export const STONE_SRC = p('stone.svg')

export const OBJECT_CHOICES = [
  { hi: 'पत्ता', en: 'Leaf' },
  { hi: 'फूल', en: 'Flower' },
  { hi: 'तितली', en: 'Butterfly' },
  { hi: 'मटका', en: 'Water pot' },
  { hi: 'कुर्सी', en: 'Chair' },
  { hi: 'बर्तन', en: 'Utensil' },
  { hi: 'पत्थर', en: 'Stone' },
  { hi: 'चेहरा/मुखौटा', en: 'Face / mask' },
]
