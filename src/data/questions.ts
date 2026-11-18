import type { Bi, MisconceptionId, SymmetryType } from '../types'
import { STONE_SRC } from './sampleImages'

export interface Option {
  id: string
  label: Bi
}

export interface Evaluation {
  correct: boolean
  feedback: Bi
  /** Stable id of the feedback message, stored in the log. */
  feedbackKey: string
  misconception?: MisconceptionId
  /** Show the leaf reflection/difference overlay with the feedback. */
  showOverlay?: 'leaf'
  /** Show the short M2 retry task (fold the rectangle horizontally). */
  m2Task?: boolean
}

interface Base {
  id: string
  outcomes: number[]
  prompt: Bi
  hint: Bi
  modelAnswer: Bi
  image?: string
  /** Axis lines drawn on the image (for Q3/Q4). */
  imageAxes?: { id: string; angle: number; label: Bi }[]
}

export interface McqQuestion extends Base {
  kind: 'mcq'
  format: Bi
  options: Option[]
  evaluate: (answer: string) => Evaluation
}
export interface MultiQuestion extends Base {
  kind: 'multi'
  format: Bi
  options: Option[]
  evaluate: (answer: string[]) => Evaluation
}
export interface ClassifyItem {
  id: string
  label: Bi
  image: string
}
export interface ClassifyQuestion extends Base {
  kind: 'classify'
  format: Bi
  items: ClassifyItem[]
  evaluate: (answer: Record<string, SymmetryType>) => Evaluation
}
export interface InvestigateQuestion extends Base {
  kind: 'investigate'
  format: Bi
  evaluate: (answer: { classification: SymmetryType; reason: string }) => Evaluation
}
export type Question = McqQuestion | MultiQuestion | ClassifyQuestion | InvestigateQuestion

const fb = (key: string, hi: string, en: string, extra: Partial<Evaluation> = {}, correct = false): Evaluation => ({
  correct,
  feedbackKey: key,
  feedback: { hi, en },
  ...extra,
})

export const SYM_OPTIONS: { id: SymmetryType; label: Bi }[] = [
  { id: 'perfect', label: { hi: 'पूर्ण सममिति', en: 'Perfect symmetry' } },
  { id: 'approximate', label: { hi: 'लगभग सममिति', en: 'Approximate symmetry' } },
  { id: 'none', label: { hi: 'कोई सममिति नहीं', en: 'No symmetry' } },
]

export const QUESTIONS: Question[] = [
  // ---------------- Q1 ----------------
  {
    id: 'Q1',
    kind: 'mcq',
    outcomes: [1],
    format: { hi: 'बहुविकल्पी', en: 'Multiple choice' },
    prompt: { hi: 'सममिति रेखा क्या होती है?', en: 'What is a line of symmetry?' },
    options: [
      { id: 'A', label: { hi: 'वह रेखा जो किसी वस्तु को दो बिल्कुल एक जैसे हिस्सों में बाँटती है।', en: 'A line that divides an object into two matching halves.' } },
      { id: 'B', label: { hi: 'वह रेखा जो किसी वस्तु को दो असमान हिस्सों में बाँटती है।', en: 'A line that divides an object into two unequal halves.' } },
      { id: 'C', label: { hi: 'वस्तु के अंदर खींची गई कोई भी रेखा।', en: 'Any line drawn inside an object.' } },
    ],
    hint: { hi: 'काग़ज़ को मोड़ने के बारे में सोचो।', en: 'Think about folding a sheet of paper.' },
    modelAnswer: {
      hi: 'A — सममिति रेखा पर मोड़ने से दोनों हिस्से एक-दूसरे पर मिल जाते हैं।',
      en: 'A — folding along a line of symmetry makes the two halves overlap.',
    },
    evaluate: (a) =>
      a === 'A'
        ? fb('q1.correct', 'बिल्कुल सही! सममिति रेखा पर मोड़ने से आकृति के दोनों हिस्से पूरी तरह एक-दूसरे पर आ जाते हैं।', 'Correct! A line of symmetry divides a shape into two matching halves.', {}, true)
        : fb('q1.fold', 'मोड़ने की कल्पना करो। क्या दोनों हिस्से एक-दूसरे पर मिलेंगे?', 'Think about the folding test. Would both halves overlap?'),
  },
  // ---------------- Q2 ----------------
  {
    id: 'Q2',
    kind: 'mcq',
    outcomes: [1, 3],
    format: { hi: 'चित्र वर्गीकरण', en: 'Image classification' },
    image: '/images/samples/leaf.svg',
    prompt: { hi: 'इस पत्ते को देखो। इसमें कैसी सममिति दिखाई देती है?', en: 'Look at this leaf. How would you describe its symmetry?' },
    options: [
      { id: 'A', label: { hi: 'पूर्ण सममिति', en: 'Perfect symmetry' } },
      { id: 'B', label: { hi: 'लगभग सममिति', en: 'Approximate symmetry' } },
      { id: 'C', label: { hi: 'दोनों हिस्सों में कोई समानता नहीं', en: 'No similarity between the two sides' } },
    ],
    hint: { hi: 'बाएँ और दाएँ किनारे का सबसे चौड़ा हिस्सा देखो। क्या दोनों बराबर दूर हैं?', en: 'Look at the widest part of the left and right edges. Are they equally far from the vein?' },
    modelAnswer: {
      hi: 'B — दोनों हिस्से मिलते-जुलते हैं, पर दायाँ किनारा ज़्यादा फैला है, इसलिए लगभग सममिति।',
      en: 'B — the halves are similar, but the right edge bulges more, so it is approximate symmetry.',
    },
    evaluate: (a) => {
      if (a === 'B')
        return fb('q2.correct', 'बहुत अच्छा! पत्ते के दोनों हिस्से मिलते-जुलते हैं, लेकिन बिल्कुल एक जैसे नहीं हैं। इसे लगभग सममिति कहते हैं।', 'Well done! The two sides look similar, but their edges are not exactly the same. This is approximate symmetry.', {}, true)
      if (a === 'A')
        return fb('q2.m1', 'पत्ता संतुलित दिख सकता है, लेकिन उसके किनारों को ध्यान से देखो। दोनों किनारे थोड़े अलग हैं। मिलते-जुलते होने का मतलब बिल्कुल समान होना नहीं है।', 'The leaf may look balanced, but look closely at its edges. They are slightly different. Similar does not always mean perfectly identical.', { misconception: 'M1', showOverlay: 'leaf' })
      return fb('q2.toofar', 'दोनों हिस्सों में काफी समानता है — बीच की नस के दोनों ओर आकार लगभग एक जैसा है। फिर से सोचो।', 'There is a lot of similarity — the shape on both sides of the central vein is nearly the same. Think again.', { showOverlay: 'leaf' })
    },
  },
  // ---------------- Q3 ----------------
  {
    id: 'Q3',
    kind: 'mcq',
    outcomes: [2],
    format: { hi: 'बहुविकल्पी (चित्र)', en: 'Multiple choice (picture)' },
    image: '/images/samples/butterfly.svg',
    imageAxes: [
      { id: 'A', angle: 0, label: { hi: 'A', en: 'A' } },
      { id: 'B', angle: 90, label: { hi: 'B', en: 'B' } },
      { id: 'C', angle: 45, label: { hi: 'C', en: 'C' } },
    ],
    prompt: { hi: 'कौन-सी रेखा इस तितली को दो मिलते-जुलते हिस्सों में बाँटती है?', en: 'Which line best divides this butterfly into two similar halves?' },
    options: [
      { id: 'A', label: { hi: 'बीच से खड़ी रेखा (A)', en: 'Vertical line through the middle (A)' } },
      { id: 'B', label: { hi: 'बीच से आड़ी रेखा (B)', en: 'Horizontal line through the middle (B)' } },
      { id: 'C', label: { hi: 'तिरछी रेखा (C)', en: 'Diagonal line (C)' } },
    ],
    hint: { hi: 'तितली के शरीर को देखो। पंख किस तरफ़ जुड़े हैं?', en: "Look at the butterfly's body. On which sides are the wings attached?" },
    modelAnswer: {
      hi: 'A — खड़ी रेखा शरीर के बीच से जाती है और बाएँ-दाएँ पंखों को अलग करती है।',
      en: 'A — the vertical line runs along the body and separates the left and right wings.',
    },
    evaluate: (a) => {
      if (a === 'A') return fb('q3.correct', 'सही जवाब! तितली के बाएँ और दाएँ पंख लगभग एक जैसे हैं।', "Correct! The butterfly's left and right wings are approximately alike.", {}, true)
      if (a === 'B')
        return fb('q3.horizontal', 'आड़ी रेखा पर मोड़ो तो ऊपर के बड़े पंख नीचे के छोटे पंखों और सिर पर पड़ेंगे — वे मेल नहीं खाते। इस तितली के लिए आड़ी रेखा ठीक नहीं है (पर दूसरी आकृतियों में आड़ी रेखा सममिति रेखा हो सकती है!)।', 'Folding along the horizontal line puts the big upper wings onto the small lower wings and the head — they do not match. For this butterfly the horizontal line does not work (but in other shapes a horizontal line can be a line of symmetry!).')
      return fb('q3.diagonal', 'तिरछी रेखा पर मोड़ो तो एक पंख शरीर पर और दूसरा खाली जगह पर पड़ेगा। इस तितली के हिस्से इस रेखा पर नहीं मिलते। कुछ आकृतियों (जैसे वर्ग) में तिरछी रेखा भी काम करती है।', 'Folding along the diagonal puts one wing onto the body and another onto empty space. This butterfly’s halves do not match along it. In some shapes (like a square) a diagonal does work.')
    },
  },
  // ---------------- Q4 ----------------
  {
    id: 'Q4',
    kind: 'multi',
    outcomes: [2],
    format: { hi: 'एक से ज़्यादा चुनो', en: 'Multiple select' },
    image: '/images/samples/rectangle.svg',
    imageAxes: [
      { id: 'V', angle: 0, label: { hi: '1', en: '1' } },
      { id: 'H', angle: 90, label: { hi: '2', en: '2' } },
      { id: 'D', angle: 63.43, label: { hi: '3', en: '3' } },
    ],
    prompt: { hi: 'उन सभी रेखाओं को चुनो जो इस आयत को दो समान हिस्सों में बाँटती हैं।', en: 'Select all the lines that divide this rectangle into two matching halves.' },
    options: [
      { id: 'V', label: { hi: 'बीच से खड़ी रेखा (1)', en: 'Vertical line through the centre (1)' } },
      { id: 'H', label: { hi: 'बीच से आड़ी रेखा (2)', en: 'Horizontal line through the centre (2)' } },
      { id: 'D', label: { hi: 'एक कोने से दूसरे कोने तक विकर्ण (3)', en: 'Diagonal line from one corner to another (3)' } },
    ],
    hint: { hi: 'हर रेखा पर अलग-अलग मोड़ने की कल्पना करो। एक से ज़्यादा सही हो सकती हैं।', en: 'Imagine folding along each line separately. More than one can be correct.' },
    modelAnswer: {
      hi: 'खड़ी और आड़ी रेखा। विकर्ण पर मोड़ने से कोने बाहर निकल जाते हैं।',
      en: 'The vertical and the horizontal line. Folding along the diagonal makes the corners stick out.',
    },
    evaluate: (sel) => {
      const s = new Set(sel)
      const V = s.has('V'), H = s.has('H'), D = s.has('D')
      if (V && H && !D)
        return fb('q4.correct', 'बहुत बढ़िया! एक आयत में सममिति की दो रेखाएँ होती हैं। उसके विकर्ण सममिति रेखाएँ नहीं होते, जब तक वह वर्ग न हो।', 'Excellent! A rectangle has two lines of symmetry. Its diagonals are not lines of symmetry unless it is a square.', {}, true)
      if (D)
        return fb('q4.diagonal', 'विकर्ण के सहारे मोड़ने की कल्पना करो। दोनों हिस्से एक-दूसरे पर नहीं मिलेंगे।' + (H ? '' : ' और आड़ी रेखा को भी जाँचो।'), 'Try the fold test along the diagonal. The two halves will not overlap.' + (H ? '' : ' Also check the horizontal line.'), H ? {} : { misconception: 'M2', m2Task: true })
      if (V && !H)
        return fb('q4.m2', 'आड़ी रेखा को भी जाँचो। क्या इस रेखा पर मोड़ने से दोनों हिस्से मिलते हैं? सममिति रेखा की दिशा आकृति पर निर्भर करती है — वह हमेशा खड़ी नहीं होती।', 'Try the horizontal line too. Would the two halves overlap when folded along it? The direction of a symmetry line depends on the shape — it is not always vertical.', { misconception: 'M2', m2Task: true })
      return fb('q4.vertical', 'आड़ी रेखा सही है! अब खड़ी रेखा को भी जाँचो — बाएँ और दाएँ हिस्से मिलते हैं क्या?', 'The horizontal line is right! Now check the vertical line too — do the left and right halves match?')
    },
  },
  // ---------------- Q5 ----------------
  {
    id: 'Q5',
    kind: 'classify',
    outcomes: [1, 3],
    format: { hi: 'वर्गीकरण', en: 'Classification' },
    prompt: { hi: 'हर वस्तु के लिए बताओ: उसमें कैसी सममिति है?', en: 'For each object, decide: what kind of symmetry does it have?' },
    items: [
      { id: 'butterfly', label: { hi: 'तितली (सामने से)', en: 'Butterfly (front view)' }, image: '/images/samples/butterfly.svg' },
      { id: 'stone', label: { hi: 'टेढ़ा-मेढ़ा पत्थर', en: 'Irregular stone' }, image: STONE_SRC },
      { id: 'square', label: { hi: 'वर्ग का चित्र', en: 'Square drawing' }, image: '/images/samples/square.svg' },
    ],
    hint: { hi: 'प्राकृतिक चीज़ों में छोटे अंतर होते हैं। रूलर से बनी आकृति बिल्कुल सही हो सकती है।', en: 'Natural things have small differences. A shape drawn with a ruler can be exact.' },
    modelAnswer: {
      hi: 'तितली — लगभग सममिति; पत्थर — कोई सममिति नहीं; वर्ग — पूर्ण सममिति।',
      en: 'Butterfly — approximate; stone — no symmetry; square — perfect.',
    },
    evaluate: (a) => {
      const ok = a.butterfly === 'approximate' && a.stone === 'none' && a.square === 'perfect'
      if (ok)
        return fb('q5.correct', 'बहुत अच्छा! सममिति इस बात पर निर्भर करती है कि दोनों हिस्से मिलते हैं या नहीं, केवल सुंदर या संतुलित दिखने पर नहीं।', 'Great comparison! Symmetry depends on whether the two sides match, not just whether an object looks attractive or balanced.', {}, true)
      if (a.butterfly === 'perfect' && a.stone === 'perfect' && a.square === 'perfect')
        return fb('q5.allperfect', 'थोड़ा ध्यान से देखो। प्राकृतिक वस्तुओं के दोनों हिस्सों में छोटे अंतर हो सकते हैं।', 'Look more carefully. Natural objects can have small differences between their two sides.', { misconception: 'M1' })
      const parts: Bi[] = []
      if (a.butterfly === 'perfect')
        parts.push({ hi: 'तितली सुंदर और संतुलित दिखती है, पर उसके धब्बे दोनों पंखों पर अलग आकार के हैं — इसलिए पूर्ण नहीं।', en: 'The butterfly looks pretty and balanced, but its spots are different sizes on the two wings — so it is not perfect.' })
      else if (a.butterfly === 'none') parts.push({ hi: 'तितली के पंख काफी मिलते-जुलते हैं — कुछ सममिति ज़रूर है।', en: 'The butterfly wings are very similar — there is some symmetry.' })
      if (a.stone !== 'none') parts.push({ hi: 'पत्थर को किसी भी रेखा पर मोड़कर देखो — किनारे मेल नहीं खाते।', en: 'Fold the stone along any line — the edges do not match.' })
      if (a.square !== 'perfect') parts.push({ hi: 'वर्ग रूलर से बना है; उसकी चारों रेखाओं पर हिस्से बिल्कुल मिलते हैं।', en: 'The square is drawn with a ruler; along its four lines the halves match exactly.' })
      return {
        correct: false,
        feedbackKey: a.butterfly === 'perfect' ? 'q5.m1butterfly' : 'q5.partial',
        misconception: a.butterfly === 'perfect' ? 'M1' : undefined,
        feedback: { hi: parts.map((p) => p.hi).join(' '), en: parts.map((p) => p.en).join(' ') },
      }
    },
  },
  // ---------------- Q6 ----------------
  {
    id: 'Q6',
    kind: 'investigate',
    outcomes: [2, 3],
    format: { hi: 'जाँच: रेखा लगाओ', en: 'Investigation: place the axis' },
    prompt: {
      hi: 'किसी पत्ते, तितली या दूसरी वस्तु की तस्वीर लो। उस पर सममिति की संभावित रेखा खींचो। रेखा को खिसकाकर दोनों हिस्सों की तुलना करो।',
      en: 'Take a photograph of a leaf, butterfly picture or another object. Draw a possible line of symmetry. Move the line and compare the two halves.',
    },
    hint: { hi: 'रेखा को वस्तु के बीच में लाओ और अलग-अलग कोण आज़माओ। लाल हिस्से कम हों तो रेखा अच्छी है।', en: 'Bring the line to the middle of the object and try different angles. Less red means a better line.' },
    modelAnswer: {
      hi: 'कोई एक सही उत्तर नहीं — फ़ैसला तुम्हारे अवलोकन से मेल खाना चाहिए (जैसे "छोटे अंतर हैं" → लगभग सममिति)।',
      en: 'No single right answer — your decision should match your observation (e.g. "small differences" → approximate symmetry).',
    },
    evaluate: ({ classification, reason }) => {
      if (reason === 'looks')
        return fb('q6.m1reason', 'सिर्फ़ संतुलित या सुंदर दिखना सममिति का सबूत नहीं है। मोड़कर देखो — क्या हर किनारा मिलता है? फिर कारण बदलो।', 'Looking balanced or pretty is not proof of symmetry. Do the fold test — does every edge match? Then change your reason.', { misconception: 'M1' })
      const consistent =
        (classification === 'perfect' && reason === 'match') ||
        (classification === 'approximate' && reason === 'small') ||
        (classification === 'none' && reason === 'nomatch')
      if (!consistent)
        return fb('q6.inconsistent', 'तुम्हारा फ़ैसला और कारण मेल नहीं खाते। जो तुमने तुलना में देखा, उसी के आधार पर फ़ैसला चुनो।', 'Your decision and your reason do not agree. Choose the decision that matches what you saw in the comparison.')
      return fb('q6.correct', 'तुमने खुद वस्तु की जाँच की! याद रखो, कंप्यूटर की तुलना केवल एक अनुमान है। सही निर्णय लेने के लिए अपनी आँखों और मोड़ने की विधि का भी उपयोग करो।', "You investigated the object yourself! Remember, the computer's comparison is an estimate. Use your eyes and the fold test to make the final decision.", {}, true)
    },
  },
]
