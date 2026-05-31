// Learning calendar data.
//
// Each entry is one day of study. Edit freely — the calendar on /blog
// renders straight from this list (both the list and month views).
//
//   status: 'done'    → already covered
//           'next'    → what I'm on / up next
//           'planned' → scheduled, not started
//
//   blog:   optional slug of a /blog/<slug> post written up from that day.

export type Status = 'done' | 'next' | 'planned';

export interface LearningEntry {
  date: string;        // YYYY-MM-DD
  title: string;       // short heading for the day
  items: string[];     // topics / papers tackled
  status: Status;
  blog?: string;       // optional blog post slug
}

export const learning: LearningEntry[] = [
  {
    date: '2026-05-26',
    title: 'CS336 — intro + tokenization',
    items: ['Lectures 1–2: course overview', 'BPE tokenization'],
    status: 'done',
  },
  {
    date: '2026-05-27',
    title: 'Transformer refresher',
    items: ['nanoGPT read-through', 'Attention / KV mechanics'],
    status: 'done',
  },
  {
    date: '2026-05-28',
    title: 'GPU MODE — CUDA basics',
    items: ['Lectures 1–3', 'PMPP ch. 1–3', 'Thread/block/warp model'],
    status: 'done',
  },
  {
    date: '2026-05-29',
    title: 'Megatron-LM',
    items: [
      'Shoeybi et al. 2019 (arXiv:1909.08053)',
      'Column/row-parallel linears',
      'f/g conjugate operators',
    ],
    status: 'done',
  },
  {
    date: '2026-05-30',
    title: 'ZeRO',
    items: [
      'Rajbhandari et al. SC’20 (arXiv:1910.02054)',
      'Optimizer / gradient / param partitioning',
      'ZeRO-3 ≈ FSDP',
    ],
    status: 'done',
  },
  {
    date: '2026-05-31',
    title: 'Tier-0 #1: minimal GPT',
    items: ['Pure-PyTorch GPT from scratch', 'Train on TinyStories', 'Write the README'],
    status: 'next',
  },
  {
    date: '2026-06-01',
    title: 'PTD-P / 3D parallelism',
    items: [
      'Narayanan et al. SC’21 (arXiv:2104.04473)',
      'Interleaved 1F1B schedule',
      'Pipeline-bubble analysis',
    ],
    status: 'planned',
  },
  {
    date: '2026-06-02',
    title: 'Collective communication',
    items: ['Ring vs. tree all-reduce', 'reduce-scatter + all-gather', 'NCCL docs'],
    status: 'planned',
  },
  {
    date: '2026-06-03',
    title: 'Tier-0 #2: all-reduce from scratch',
    items: ['Ring all-reduce via torch.distributed', 'Bandwidth vs. message-size plot'],
    status: 'planned',
  },
  {
    date: '2026-06-04',
    title: 'GPU MODE — memory hierarchy',
    items: ['Lectures 4–6', 'Coalescing, bank conflicts', 'Occupancy & tiling'],
    status: 'planned',
  },
  {
    date: '2026-06-05',
    title: 'Triton fundamentals',
    items: ['Fused softmax tutorial', 'Matmul tutorial'],
    status: 'planned',
  },
  {
    date: '2026-06-06',
    title: 'FlashAttention',
    items: [
      'Dao et al. 2022 (arXiv:2205.14135)',
      'Tiling + online softmax rescaling',
      'IO-aware, quadratic → linear memory',
    ],
    status: 'planned',
  },
  {
    date: '2026-06-08',
    title: 'Tier-0 #3: Triton FA2 forward',
    items: ['CS336 A2', 'Correctness vs. PyTorch SDPA', 'Nsight occupancy + roofline'],
    status: 'planned',
  },
  {
    date: '2026-06-09',
    title: 'PagedAttention / vLLM',
    items: [
      'Kwon et al. SOSP’23 (arXiv:2309.06180)',
      'Block tables, copy-on-write KV',
      'Near-zero fragmentation',
    ],
    status: 'planned',
  },
  {
    date: '2026-06-10',
    title: 'Orca — continuous batching',
    items: ['Yu et al. OSDI’22', 'Iteration-level scheduling'],
    status: 'planned',
  },
  {
    date: '2026-06-11',
    title: 'Tier-0 #4: KV-cache decode loop',
    items: ['Hand-rolled KV cache', 'Greedy / sampling decode', 'tokens/sec + memory accounting'],
    status: 'planned',
  },
  {
    date: '2026-06-13',
    title: 'Roofline & profiling',
    items: ['Arithmetic intensity: GEMM vs. decode', 'Nsight Compute, ncu', 'Compute- vs. memory-bound'],
    status: 'planned',
  },
];
