import { mkdirSync, writeFileSync } from 'node:fs';

const out = new URL('../public/diagrams/', import.meta.url);
mkdirSync(out, { recursive: true });

const esc = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const text = (x, y, value, cls = 'label', anchor = 'middle') =>
  `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(value)}</text>`;
const box = (x, y, w, h, title, note = '', tone = '') =>
  `<g class="node ${tone}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>${text(x + w / 2, y + h / 2 - (note ? 5 : -4), title, 'node-title')}${note ? text(x + w / 2, y + h / 2 + 13, note, 'node-note') : ''}</g>`;
const arrow = (x1, y1, x2, y2, cls = '') => `<path class="arrow ${cls}" d="M ${x1} ${y1} L ${x2} ${y2}" marker-end="url(#arrow)"/>`;
const dot = (x, y, label, tone = '') => `<circle class="dot ${tone}" cx="${x}" cy="${y}" r="5"/>${text(x, y - 12, label, `value ${tone}`)}`;

const shell = (title, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 420" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title><desc id="desc">${esc(title)}</desc>
  <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6"/></marker></defs>
  <style>
    svg { background: #fffdf8; } .node rect { fill:#fffdf8; stroke:#2f302d; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
    .node.accent rect,.accent { stroke:#b85c38; fill:#fff1e8; } .node.good rect,.good { stroke:#557a61; fill:#edf5ed; } .node.warn rect,.warn { stroke:#a45a35; fill:#fff0e8; }
    .arrow { fill:none; stroke:#2f302d; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; } .arrow.dashed { stroke-dasharray:7 6; } .arrow.accent { stroke:#b85c38; }
    .label,.node-title,.node-note,.caption,.value { fill:#2f302d; font-family: ui-rounded, 'Comic Sans MS', sans-serif; } .label { font-size:16px; font-weight:650; } .node-title { font-size:16px; font-weight:700; } .node-note { font-size:12px; fill:#62645e; } .caption { font-size:14px; fill:#62645e; } .value { font-size:14px; font-weight:700; } .value.accent { fill:#b85c38; } .value.good { fill:#557a61; }
    .dot { fill:#2f302d; } .dot.accent { fill:#b85c38; } .dot.good { fill:#557a61; } .line { stroke:#c9c5bb; stroke-width:1.5; stroke-dasharray:4 6; }
  </style>${body}</svg>`;

const diagrams = {
  'attention-memory': {
    title: 'Attention has two separate problems: storing scores and computing them quickly',
    labels: ['Q, K, V', 'naive attention', 'N by N scores in HBM', 'softmax then output', 'FlashAttention', 'one score tile in SRAM', 'running m, l, and output', 'same result, no N squared allocation'],
    svg: shell('Attention memory: materialize versus stream', `
      ${box(42, 95, 116, 62, 'Q, K, V', 'input tensors')}
      ${arrow(158,126,220,126)}${box(220, 78, 170, 98, 'naive attention', 'form every score', 'warn')}${arrow(390,126,462,126)}${box(462,78,210,98, 'N × N scores in HBM', 'then softmax', 'warn')}
      ${text(446, 205, 'memory grows with every query-key pair', 'caption')}
      <path class="line" d="M40 232 L720 232"/>
      ${box(42,279,116,62, 'Q, K, V', 'input blocks')}${arrow(158,310,220,310)}${box(220,263,170,96, 'FlashAttention', 'hold one Q block')}${arrow(390,310,462,310,'accent')}${box(462,263,210,96, 'one score tile in SRAM', 'stream K/V blocks', 'accent')}
      ${text(567, 388, 'carry (max, denominator, output) forward, then discard the tile', 'caption')}`),
  },
  'flash-two-wins': {
    title: 'Tiling fixed memory while tensor cores restored throughput',
    labels: ['does it fit?', 'does it run fast?', 'naive', 'tiled scalar', 'WMMA tiled', 'PyTorch SDPA', '137 GB at N 16384', '2.15 GB at N 16384', '54 TF', '5 TF', '21 TF', '200 TF'],
    svg: shell('FlashAttention: memory and speed are separate wins', `${text(198,75,'memory at N = 16384', 'caption')}${text(570,75,'throughput', 'caption')}
      <path class="line" d="M380 90 L380 376"/>
      ${box(66,112,250,62,'naive','~137 GB → OOM','warn')}${box(66,206,250,62,'tiled scalar','2.15 GB → fits','good')}${box(66,300,250,62,'WMMA tiled','2.15 GB → fits','good')}
      ${box(442,112,250,62,'naive','54 TFLOP/s')}${box(442,206,250,62,'tiled scalar','5 TFLOP/s','warn')}${box(442,300,250,62,'WMMA tiled','21 TFLOP/s','accent')}
      ${arrow(191,174,191,204,'accent')}${arrow(191,268,191,298,'accent')}${arrow(567,174,567,204,'warn')}${arrow(567,268,567,298,'accent')}
      ${text(380,399,'Tiling removes the allocation. Tensor cores recover some speed. SDPA is still ~200 TF.', 'caption')}`),
  },
  'flash-ablations': {
    title: 'Three ablations ruled out the first explanations for the remaining FlashAttention gap',
    labels: ['hypothesis', 'test', 'what it ruled out', 'wider K/V tile', '14.7 to 21 TF', 'softmax not dominant', 'occupancy padding', 'plateau after 5 blocks per SM', 'not starved for warps', 'remove online softmax', '52 to 51 ms', 'softmax about 2 percent', 'remaining uncertainty: tile size and memory traffic'],
    svg: shell('FlashAttention ablations and remaining uncertainty', `${text(132,78,'question', 'caption')}${text(380,78,'measurement', 'caption')}${text(628,78,'result', 'caption')}
      ${box(42,103,180,58,'softmax is costly')}${box(290,103,180,58,'remove it','52 → 51 ms')}${box(538,103,180,58,'~2%','not the main cost','good')}
      ${box(42,193,180,58,'need more warps')}${box(290,193,180,58,'pad shared memory','2–10 blocks / SM')}${box(538,193,180,58,'plateau after 5','not occupancy','good')}
      ${box(42,283,180,58,'bookkeeping dominates')}${box(290,283,180,58,'K/V tile: 16 → 64','14.7 → 21 TF')}${box(538,283,180,58,'smaller gain','not enough alone','good')}
      ${arrow(222,132,290,132)}${arrow(470,132,538,132)}${arrow(222,222,290,222)}${arrow(470,222,538,222)}${arrow(222,312,290,312)}${arrow(470,312,538,312)}
      ${text(380,390,'Larger register tiles may reduce repeated K/V traffic and staging overhead.', 'caption')}`),
  },
  'engine-boundary': {
    title: 'One writer owns the market state while I O and durability stay outside the matching path',
    labels: ['clients', 'ingress', 'global sequence', 'single writer engine', 'books risk wallets settlement', 'event ring', 'reliable delivery', '20 Hz snapshots', 'journal', 'off path'],
    svg: shell('Exchange ownership boundary', `${box(35,158,105,60,'clients','WebSocket')}${box(190,148,128,80,'ingress','sequence commands')}${box(374,130,160,116,'engine','books · risk · wallets','accent')}${box(592,110,122,58,'reliable','acks · fills')}${box(592,230,122,58,'market data','20 Hz snapshots')}${box(190,294,128,58,'journal','replay input','good')}
      ${arrow(140,188,190,188)}${arrow(318,188,374,188,'accent')}${arrow(534,170,592,139)}${arrow(534,205,592,259)}<path class="arrow dashed" d="M254 228 L254 292" marker-end="url(#arrow)"/>
      ${text(454,273,'only this thread mutates the round', 'caption')}${text(254,380,'Journal records the input stream; a slow disk must not delay admission.', 'caption')}`),
  },
  'book-confidence': {
    title: 'A simple reference book and replay tests check the optimized exchange engine',
    labels: ['same command stream', 'fast book', 'array plus arena', 'reference book', 'flat vector scan', 'after every command compare events and resting orders'],
    svg: shell('Testing an optimized order book against a simple oracle', `${box(46,162,140,64,'commands','randomized stream')}${box(282,94,162,64,'fast book','array + arena','accent')}${box(282,244,162,64,'reference book','flat vector scan')}${box(554,162,150,64,'compare','events + state','good')}${arrow(186,194,282,126)}${arrow(186,194,282,276)}${arrow(444,126,554,186)}${arrow(444,276,554,202)}
      ${text(494,332,'compare events and resting orders after each command', 'caption')}`),
  },
  'delivery-ceilings': {
    title: 'Two structural changes moved the end to end delivery ceiling',
    labels: ['27k', '31k', '54k', '97k', 'baseline', 'batch market data', 'decouple journal', 'four delivery shards', 'correct cleanups did not move the knee'],
    svg: shell('Delivery ceiling investigation', `<path class="line" d="M72 326 L704 326"/><path class="line" d="M72 84 L72 326"/>
      <path class="arrow" d="M112 288 L272 274 L432 182 L592 98" marker-end="url(#arrow)"/>
      ${dot(112,288,'27k')}${dot(272,274,'31k')}${dot(432,182,'54k','accent')}${dot(592,98,'97k','accent')}
      ${text(112,350,'baseline', 'caption')}${text(272,350,'batch market data', 'caption')}${text(432,350,'journal off admission', 'caption')}${text(592,350,'four delivery shards', 'caption')}
      ${text(380,390,'Routing off Tokio and replacing copies with Arc did not change the measured ceiling.', 'caption')}`),
  },
  'backpressure-evidence': {
    title: 'A slow journal blocked order admission and left the engine idle',
    labels: ['before', 'orders', 'journal fsync', 'queue fills', 'engine idle', 'server unread receive queue 126 MB', 'after', 'orders reach engine', 'journal receives copy', 'durability lags by bounded window'],
    svg: shell('Journal backpressure and evidence', `${text(190,78,'before: disk gates admission', 'value accent')}${box(40,110,100,56,'orders')}${box(190,110,128,56,'journal','fsync','warn')}${box(372,110,114,56,'engine','idle','warn')}${arrow(140,138,190,138,'accent')}${arrow(318,138,372,138,'accent')}${text(254,190,'journal queue fills, so ingress stops', 'caption')}${box(500,110,180,56,'server observation','126 MB unread orders','accent')}
      <path class="line" d="M40 226 L720 226"/>${text(190,258,'after: tee, then let the journal lag', 'value good')}${box(40,290,100,56,'orders')}${box(218,290,128,56,'engine','admit now','good')}${box(500,290,128,56,'journal','copy, off path')}${arrow(140,318,218,318)}<path class="arrow dashed" d="M140 310 Q300 246 500 310" marker-end="url(#arrow)"/>${text(380,390,'The trade-off is explicit: acknowledged orders can be unflushed for a bounded interval.', 'caption')}`),
  },
  'delivery-shards': {
    title: 'Delivery shards parallelize work while keeping each client owned by one shard',
    labels: ['before one consumer', 'after four consumers', 'event ring', 'all 250 clients', 'shard 0', 'shard 1', 'shard 2', 'shard 3', 'one cursor per shard', 'each client stays on one shard'],
    svg: shell('Sharding the delivery stage', `${text(185,78,'before', 'value accent')}${box(55,112,105,52,'event ring')}${box(230,112,146,52,'one consumer','all 250 clients','warn')}${box(470,112,190,52,'client lanes','one after another')}${arrow(160,138,230,138)}${arrow(376,138,470,138)}
      <path class="line" d="M40 204 L720 204"/>${text(380,236,'after', 'value good')}${box(320,250,120,52,'event ring','one cursor per shard','good')}
      ${box(55,342,100,50,'shard 0','0 mod 4','good')}${box(230,342,100,50,'shard 1','1 mod 4','good')}${box(405,342,100,50,'shard 2','2 mod 4','good')}${box(580,342,100,50,'shard 3','3 mod 4','good')}
      ${arrow(337,302,105,342)}${arrow(369,302,280,342)}${arrow(401,302,455,342)}${arrow(433,302,630,342)}
      ${text(380,414,'Each client remains assigned to one shard.', 'caption')}`),
  },
};

function element(type, id, x, y, width, height, extra = {}) {
  return { id, type, x, y, width, height, angle: 0, strokeColor: '#2f302d', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, groupIds: [], frameId: null, index: null, roundness: type === 'rectangle' ? { type: 3 } : null, seed: id.length * 7919, version: 1, versionNonce: id.length * 104729, isDeleted: false, boundElements: [], updated: 1, link: null, locked: false, ...extra };
}

for (const [name, diagram] of Object.entries(diagrams)) {
  writeFileSync(new URL(`${name}.svg`, out), diagram.svg);
  const elements = diagram.labels.flatMap((label, i) => {
    const x = 40 + (i % 4) * 175;
    const y = 40 + Math.floor(i / 4) * 80;
    const width = 145;
    const height = 52;
    const boxId = `box-${i}`;
    return [
      element('rectangle', boxId, x, y, width, height, { backgroundColor: i % 3 === 0 ? '#fff1e8' : '#fffdf8' }),
      element('text', `text-${i}`, x + 10, y + 14, width - 20, 24, {
        fontSize: 16, fontFamily: 2, text: label, textAlign: 'center', verticalAlign: 'middle', containerId: boxId, originalText: label, autoResize: true, lineHeight: 1.25,
      }),
    ];
  });
  for (let i = 0; i < diagram.labels.length - 1; i += 1) {
    const x = 40 + (i % 4) * 175 + 145;
    const y = 40 + Math.floor(i / 4) * 80 + 26;
    const nextX = 40 + ((i + 1) % 4) * 175;
    const nextY = 40 + Math.floor((i + 1) / 4) * 80 + 26;
    const wraps = (i + 1) % 4 === 0;
    elements.push(element('arrow', `arrow-${i}`, x, y, wraps ? -510 : nextX - x, wraps ? 54 : nextY - y, {
      points: [[0, 0], [wraps ? -510 : nextX - x, wraps ? 54 : nextY - y]],
      lastCommittedPoint: [wraps ? -510 : nextX - x, wraps ? 54 : nextY - y],
      startBinding: null,
      endBinding: null,
      startArrowhead: null,
      endArrowhead: 'arrow',
    }));
  }
  writeFileSync(new URL(`${name}.excalidraw`, out), JSON.stringify({ type: 'excalidraw', version: 2, source: 'https://excalidraw.com', elements, appState: { viewBackgroundColor: '#fffdf8', gridSize: null }, files: {} }, null, 2));
}
