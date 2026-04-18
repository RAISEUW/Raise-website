const ACRONYMS = new Set(['LLM', 'AI', 'NLP', 'HCI', 'HPC', 'COVID-19', 'DOI', 'API', 'URL', 'PDF', 'LM', 'ML', 'RAG', 'GPT']);

function titleCaseToken(word) {
  const upper = word.toUpperCase();
  if (ACRONYMS.has(upper)) return upper;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function normalizeTopic(raw) {
  return raw.trim().split(/\s+/).map(titleCaseToken).join(' ');
}

export function splitTopics(pipeString) {
  return pipeString.split('|').map(s => normalizeTopic(s.trim())).filter(Boolean);
}
