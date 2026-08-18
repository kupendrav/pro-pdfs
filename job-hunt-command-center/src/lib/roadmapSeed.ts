import type { Milestone, RoadmapTopic } from '../types';
import { uid } from './id';

interface SeedMilestone {
  title: string;
  topics: string[];
}

// A pragmatic AI/ML roadmap (2026 flavor) — manually maintained, fully editable
// from the Roadmap section. Inspired by roadmap.sh's AI roadmap but curated for
// a job-focused learning loop: Learn → Build → Practice → Revise → Teach.
const SEED: SeedMilestone[] = [
  {
    title: 'Foundations',
    topics: ['Python proficiency', 'NumPy & Pandas', 'Data visualization', 'Git, CLI & environments', 'SQL basics'],
  },
  {
    title: 'Math for ML',
    topics: ['Linear algebra essentials', 'Calculus for ML', 'Probability & statistics', 'Optimization basics'],
  },
  {
    title: 'Classical Machine Learning',
    topics: [
      'Regression & classification',
      'Model evaluation & metrics',
      'Feature engineering',
      'Unsupervised learning (clustering, PCA)',
      'Ensembles — Random Forest, XGBoost',
      'scikit-learn end-to-end project',
    ],
  },
  {
    title: 'Deep Learning',
    topics: [
      'Neural network fundamentals',
      'PyTorch tensors & autograd',
      'Training deep nets (optimizers, regularization)',
      'CNNs',
      'RNNs & sequence models',
    ],
  },
  {
    title: 'Transformers & NLP',
    topics: [
      'Attention & the Transformer',
      'BERT / GPT families',
      'Hugging Face ecosystem',
      'Fine-tuning & transfer learning',
      'Embeddings & vector search',
    ],
  },
  {
    title: 'LLMs & Generative AI',
    topics: [
      'Prompt engineering',
      'LLM APIs & integration',
      'Retrieval-Augmented Generation (RAG)',
      'Agents & tool use',
      'Evaluating LLM systems',
      'Fine-tuning LLMs (LoRA / QLoRA)',
    ],
  },
  {
    title: 'MLOps & Deployment',
    topics: ['Docker for ML', 'FastAPI model serving', 'Experiment tracking (MLflow)', 'CI/CD basics', 'Monitoring & drift'],
  },
  {
    title: 'Interview Preparation',
    topics: ['ML fundamentals interview Q&A', 'ML system design', 'DSA — NeetCode 150', 'Behavioral & project storytelling'],
  },
  {
    title: 'Portfolio & Capstones',
    topics: ['End-to-end ML project', 'RAG application', 'Portfolio & GitHub polish', 'Resume, LinkedIn & outreach'],
  },
];

export function seedRoadmap(): { milestones: Milestone[]; topics: RoadmapTopic[] } {
  const milestones: Milestone[] = [];
  const topics: RoadmapTopic[] = [];
  let first = true;
  for (const m of SEED) {
    const mid = uid('m');
    milestones.push({ id: mid, title: m.title });
    m.topics.forEach((title) => {
      topics.push({
        id: uid('t'),
        milestoneId: mid,
        title,
        stages: { learn: false, build: false, practice: false, revise: false, teach: false },
        stageDates: {},
        isCurrent: first,
        notes: '',
        project: '',
      });
      first = false;
    });
  }
  return { milestones, topics };
}
