export const MAX_SERVER_SESSION_SIZE = 50;

export function validateSessionResult(correct, total) {
  if (!Number.isInteger(correct) || !Number.isInteger(total)) {
    return { valid: false, error: 'Session result must use whole numbers.' };
  }
  if (total < 1 || total > MAX_SERVER_SESSION_SIZE) {
    return {
      valid: false,
      error: `Session must contain between 1 and ${MAX_SERVER_SESSION_SIZE} answers.`,
    };
  }
  if (correct < 0 || correct > total) {
    return { valid: false, error: 'Correct answers must be between 0 and the session total.' };
  }
  return { valid: true, correct, total };
}

export function validateSessionResults(results) {
  if (!Array.isArray(results)) {
    return { valid: false, error: 'Session answers must be an array.' };
  }
  if (results.length < 1 || results.length > MAX_SERVER_SESSION_SIZE) {
    return {
      valid: false,
      error: `Session must contain between 1 and ${MAX_SERVER_SESSION_SIZE} answers.`,
    };
  }

  const answers = [];
  for (const result of results) {
    const code = typeof result?.code === 'string' ? result.code.toLowerCase() : '';
    const mode = typeof result?.mode === 'string' ? result.mode : 'classic';
    const selectedCode = typeof result?.selectedCode === 'string'
      ? result.selectedCode.toLowerCase()
      : null;
    const answerText = typeof result?.answerText === 'string'
      ? result.answerText.trim()
      : null;

    if (!/^[a-z]{2}$/.test(code)) {
      return { valid: false, error: 'Session answers must include valid country codes.' };
    }
    if (selectedCode !== null && !/^[a-z]{2}$/.test(selectedCode)) {
      return { valid: false, error: 'Selected answers must use valid country codes.' };
    }
    if (answerText !== null && answerText.length > 120) {
      return { valid: false, error: 'Typed answers must be 120 characters or fewer.' };
    }

    answers.push({ code, mode, selectedCode, answerText });
  }

  return { valid: true, answers };
}

export function xpForSession(correct, total) {
  const result = validateSessionResult(correct, total);
  if (!result.valid) return 0;
  return correct * 10 + (correct === total ? 50 : 0);
}
