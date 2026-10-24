'use strict';

(function (ROOT) {
  const DAY = Number(ROOT.LESSON_DIAGNOSTIC?.day);
  const FORMAT = `ipas-day${DAY}-diagnostic-backup`;
  const SCHEMA = 1;
  const CONFIDENCES = ['sure', 'unsure', 'guess'];
  const LETTERS = ['A', 'B', 'C', 'D'];
  const SKILL_LABELS = {
    recognition: '辨認',
    comparison: '比較',
    transfer: '轉用',
    integration: '整合'
  };

  function isPlainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function cleanText(value, max) {
    return typeof value === 'string' ? value.slice(0, max) : '';
  }

  function validateData(data) {
    const errors = [];
    const counts = { total: 0, core: 0, extension: 0, original: 0, adapted: 0 };
    if (!isPlainObject(data)) return { ok: false, errors: ['資料不是物件。'], counts };
    if (!Number.isInteger(data.day) || data.day < 2 || data.day > 7 || data.day !== DAY) errors.push('day 必須對應第 2–7 課。');
    if (typeof data.version !== 'string' || !data.version.trim() || data.version.length > 80) errors.push('version 必須是非空字串。');
    if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 200) errors.push('title 必須是非空字串。');
    if (!Array.isArray(data.questions)) return { ok: false, errors: [...errors, 'questions 必須是陣列。'], counts };

    counts.total = data.questions.length;
    const seen = new Set();
    data.questions.forEach((q, index) => {
      const at = `第 ${index + 1} 題`;
      if (!isPlainObject(q)) { errors.push(`${at}不是物件。`); return; }
      if (typeof q.id !== 'string' || !new RegExp(`^d${DAY}x-\\d{2}$`).test(q.id)) errors.push(`${at} id 格式錯誤。`);
      else if (seen.has(q.id)) errors.push(`${at} id 重複。`);
      else seen.add(q.id);
      if (q.scope === 'core') counts.core += 1;
      else if (q.scope === 'extension') counts.extension += 1;
      else errors.push(`${at} scope 必須是 core 或 extension。`);
      if (q.kind === 'original') counts.original += 1;
      else if (q.kind === 'adapted') counts.adapted += 1;
      else errors.push(`${at} kind 必須是 original 或 adapted。`);
      if (typeof q.concept !== 'string' || !q.concept.trim() || q.concept.length > 100) errors.push(`${at} concept 無效。`);
      if (!Object.prototype.hasOwnProperty.call(SKILL_LABELS, q.skill)) errors.push(`${at} skill 無效。`);
      if (typeof q.stem !== 'string' || !q.stem.trim() || q.stem.length > 3000) errors.push(`${at} stem 無效。`);
      if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(o => typeof o !== 'string' || !o.trim() || o.length > 2000)) errors.push(`${at} options 必須是四個非空字串。`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(`${at} answer 必須是 0–3。`);
      if (!Array.isArray(q.why) || q.why.length !== 4 || q.why.some(o => typeof o !== 'string' || !o.trim() || o.length > 3000)) errors.push(`${at} why 必須是四個非空字串。`);
      if (typeof q.insight !== 'string' || !q.insight.trim() || q.insight.length > 3000) errors.push(`${at} insight 無效。`);
      if (q.source !== undefined) {
        if (!isPlainObject(q.source)) errors.push(`${at} source 無效。`);
        else {
          if (typeof q.source.label !== 'string' || !q.source.label.trim() || q.source.label.length > 300) errors.push(`${at} source.label 無效。`);
          if (typeof q.source.url !== 'string' || !q.source.url.trim() || q.source.url.length > 2000) errors.push(`${at} source.url 無效。`);
          if (typeof q.source.question !== 'string' || q.source.question.length > 500) errors.push(`${at} source.question 無效。`);
          if (typeof q.source.note !== 'string' || q.source.note.length > 2000) errors.push(`${at} source.note 無效。`);
        }
      }
      if (!isPlainObject(q.review) || typeof q.review.label !== 'string' || !q.review.label.trim() || q.review.label.length > 300 || typeof q.review.url !== 'string' || !q.review.url.trim() || q.review.url.length > 2000) errors.push(`${at} review 必須含有效的 label 與 url。`);
    });

    if (counts.total !== 50) errors.push(`題數應為 50，目前為 ${counts.total}。`);
    if (counts.core !== 40 || counts.extension !== 10) errors.push(`範圍應為 40 核心＋10 延伸，目前為 ${counts.core}＋${counts.extension}。`);
    if (counts.original !== 44 || counts.adapted !== 6) errors.push(`題型應為 44 原創＋6 改編，目前為 ${counts.original}＋${counts.adapted}。`);
    return { ok: errors.length === 0, errors, counts };
  }

  function normalizeResponse(value, allowEmpty) {
    if (!isPlainObject(value)) {
      if (allowEmpty) return { picked: null, confidence: 'unsure' };
      throw new Error('答案紀錄格式錯誤。');
    }
    const picked = value.picked === null && allowEmpty ? null : value.picked;
    if (picked !== null && (!Number.isInteger(picked) || picked < 0 || picked > 3)) throw new Error('答案選項超出範圍。');
    if (!CONFIDENCES.includes(value.confidence)) throw new Error('信心標記無效。');
    return { picked, confidence: value.confidence };
  }

  function score(questions, responses) {
    if (!Array.isArray(questions) || !isPlainObject(responses)) throw new Error('計分資料格式錯誤。');
    const result = {
      total: questions.length,
      correct: 0,
      core: { correct: 0, total: 0 },
      extension: { correct: 0, total: 0 },
      confidentCorrect: 0,
      correctUncertain: 0,
      highConfidenceWrong: 0,
      weakCount: 0,
      details: [],
      concepts: {}
    };
    questions.forEach(q => {
      const r = normalizeResponse(responses[q.id], false);
      if (r.picked === null) throw new Error(`題目 ${q.id} 尚未作答。`);
      const correct = r.picked === q.answer;
      const weak = !correct || r.confidence !== 'sure';
      result[q.scope].total += 1;
      if (correct) {
        result.correct += 1;
        result[q.scope].correct += 1;
        if (r.confidence === 'sure') result.confidentCorrect += 1;
        else result.correctUncertain += 1;
      } else if (r.confidence === 'sure') result.highConfidenceWrong += 1;
      if (weak) result.weakCount += 1;
      if (!result.concepts[q.concept]) result.concepts[q.concept] = { total: 0, correct: 0, wrong: 0, uncertainCorrect: 0, highConfidenceWrong: 0, weak: 0 };
      const concept = result.concepts[q.concept];
      concept.total += 1;
      if (correct) concept.correct += 1;
      else concept.wrong += 1;
      if (correct && r.confidence !== 'sure') concept.uncertainCorrect += 1;
      if (!correct && r.confidence === 'sure') concept.highConfidenceWrong += 1;
      if (weak) concept.weak += 1;
      result.details.push({ id: q.id, picked: r.picked, confidence: r.confidence, correct, weak });
    });
    return result;
  }

  function createState(dataVersion) {
    return { format: FORMAT, schema: SCHEMA, dataVersion, draft: null, history: [] };
  }

  function normalizeDraft(value, idSet) {
    if (value === null || value === undefined) return null;
    if (!isPlainObject(value)) throw new Error('草稿格式錯誤。');
    const responses = {};
    const raw = isPlainObject(value.responses) ? value.responses : {};
    idSet.forEach(id => {
      if (Object.prototype.hasOwnProperty.call(raw, id)) responses[id] = normalizeResponse(raw[id], true);
    });
    const block = Number.isInteger(value.block) && value.block >= 0 && value.block < 5 ? value.block : 0;
    const startedAt = cleanText(value.startedAt, 40);
    if (!startedAt || Number.isNaN(Date.parse(startedAt))) throw new Error('草稿開始時間無效。');
    return { responses, block, startedAt, timerEnabled: Boolean(value.timerEnabled) };
  }

  function normalizeAttempt(value, questions, idSet) {
    if (!isPlainObject(value)) throw new Error('作答歷史格式錯誤。');
    const raw = isPlainObject(value.responses) ? value.responses : {};
    const responses = {};
    idSet.forEach(id => {
      if (!Object.prototype.hasOwnProperty.call(raw, id)) throw new Error('歷史紀錄缺少答案。');
      responses[id] = normalizeResponse(raw[id], false);
      if (responses[id].picked === null) throw new Error('歷史紀錄含未作答題目。');
    });
    const submittedAt = cleanText(value.submittedAt, 40);
    if (!submittedAt || Number.isNaN(Date.parse(submittedAt))) throw new Error('歷史提交時間無效。');
    const id = cleanText(value.id, 100) || `attempt-${submittedAt}`;
    const computed = score(questions, responses);
    return { id, submittedAt, timerEnabled: Boolean(value.timerEnabled), startedAt: cleanText(value.startedAt, 40), responses, result: compactResult(computed) };
  }

  function compactResult(result) {
    return {
      total: result.total,
      correct: result.correct,
      core: { correct: result.core.correct, total: result.core.total },
      extension: { correct: result.extension.correct, total: result.extension.total },
      confidentCorrect: result.confidentCorrect,
      correctUncertain: result.correctUncertain,
      highConfidenceWrong: result.highConfidenceWrong,
      weakCount: result.weakCount
    };
  }

  function validateBackup(value, data) {
    const validation = validateData(data);
    if (!validation.ok) throw new Error('目前題庫無法驗證備份。');
    if (!isPlainObject(value) || value.format !== FORMAT || value.schema !== SCHEMA) throw new Error('不是本診斷的有效備份檔。');
    if (value.dataVersion !== data.version) throw new Error(`備份版本 ${cleanText(value.dataVersion, 80) || '未知'} 與目前題庫 ${data.version} 不同，未匯入。`);
    const ids = new Set(data.questions.map(q => q.id));
    const normalized = createState(data.version);
    normalized.draft = normalizeDraft(value.draft, ids);
    if (!Array.isArray(value.history)) throw new Error('備份缺少作答歷史陣列。');
    const byId = new Map();
    value.history.forEach(item => {
      const attempt = normalizeAttempt(item, data.questions, ids);
      byId.set(attempt.id, attempt);
    });
    normalized.history = [...byId.values()].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
    return normalized;
  }

  const API = { validateData, validateBackup, score, createState, format: FORMAT, schema: SCHEMA };
  ROOT.LessonDiagnostic = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document === 'undefined') return;

  const data = ROOT.LESSON_DIAGNOSTIC;
  const dataCheck = validateData(data);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const storageWarning = $('#storage-warning');
  const appError = $('#app-error');
  const liveStatus = $('#live-status');
  let memoryState = dataCheck.ok ? createState(data.version) : null;
  let storageAvailable = false;
  let currentBlock = 0;
  let reviewBlock = 0;
  let reviewFilter = 'all';
  let timerHandle = null;
  let activeAttempt = null;
  let state = null;
  let STORAGE_KEY = '';

  function announce(message) {
    liveStatus.textContent = '';
    ROOT.setTimeout(() => { liveStatus.textContent = message; }, 20);
  }

  function showStorageWarning() {
    storageWarning.hidden = false;
  }

  function testStorage() {
    try {
      const probe = `${STORAGE_KEY}:probe`;
      ROOT.localStorage.setItem(probe, '1');
      ROOT.localStorage.removeItem(probe);
      return true;
    } catch (_) {
      showStorageWarning();
      return false;
    }
  }

  function loadState() {
    if (!storageAvailable) return memoryState;
    try {
      const raw = ROOT.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createState(data.version);
      return validateBackup(JSON.parse(raw), data);
    } catch (_) {
      showStorageWarning();
      storageAvailable = false;
      return memoryState;
    }
  }

  function saveState(next) {
    const normalized = validateBackup(next, data);
    state = normalized;
    memoryState = normalized;
    if (!storageAvailable) { showStorageWarning(); return false; }
    try {
      ROOT.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return true;
    } catch (_) {
      storageAvailable = false;
      showStorageWarning();
      return false;
    }
  }

  function safeUrl(value, fallback = `day-${DAY}.html`) {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^(?:\.\.?\/)?[a-zA-Z0-9][a-zA-Z0-9._~!$&'()*+,;=:@%\/-]*(?:#[a-zA-Z0-9._~!$&'()*+,;=:@%\/-]+)?$/.test(trimmed)) return trimmed;
    return fallback;
  }

  function externalAttrs(url) {
    return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
  }

  function download(filename, text, type) {
    const link = document.createElement('a');
    const href = URL.createObjectURL(new Blob([text], { type }));
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    ROOT.setTimeout(() => URL.revokeObjectURL(href), 3000);
  }

  function answeredCount(draft = state.draft) {
    if (!draft) return 0;
    return data.questions.reduce((count, q) => count + (Number.isInteger(draft.responses[q.id]?.picked) ? 1 : 0), 0);
  }

  function blockAnswered(block, draft = state.draft) {
    if (!draft) return 0;
    return data.questions.slice(block * 10, block * 10 + 10).reduce((count, q) => count + (Number.isInteger(draft.responses[q.id]?.picked) ? 1 : 0), 0);
  }

  function startDraft(timerEnabled) {
    const now = new Date().toISOString();
    const responses = {};
    data.questions.forEach(q => { responses[q.id] = { picked: null, confidence: 'unsure' }; });
    state.draft = { responses, block: 0, startedAt: now, timerEnabled: Boolean(timerEnabled) };
    saveState(state);
    currentBlock = 0;
    showQuiz();
  }

  function showOnly(panel) {
    $('#intro-panel').hidden = panel !== 'intro';
    $('#quiz-panel').hidden = panel !== 'quiz';
    $('#results-panel').hidden = panel !== 'results';
  }

  function updateIntro() {
    const count = state.history.length;
    $('#history-intro').textContent = count ? `此裝置已有 ${count} 次完成紀錄。再次作答會標示為「重做（熟悉題）」，不覆蓋首次結果。` : '尚無完成紀錄。首次交卷後會保留首次結果。';
    const hasDraft = Boolean(state.draft);
    $('#resume-button').hidden = !hasDraft;
    if (hasDraft) $('#resume-button').textContent = `繼續上次進度（已答 ${answeredCount()}／50）`;
  }

  function showIntro() {
    stopTimer();
    activeAttempt = null;
    showOnly('intro');
    updateIntro();
  }

  function renderBlockNav() {
    $('#block-nav').innerHTML = Array.from({ length: 5 }, (_, block) => {
      const done = blockAnswered(block);
      return `<button type="button" data-block="${block}"${block === currentBlock ? ' aria-current="step"' : ''} class="${done === 10 ? 'complete' : ''}">第 ${block + 1} 組<span>${done}／10 已答</span></button>`;
    }).join('');
    $$('[data-block]', $('#block-nav')).forEach(button => button.addEventListener('click', () => switchBlock(Number(button.dataset.block))));
  }

  function questionMarkup(q, index) {
    const response = state.draft.responses[q.id] || { picked: null, confidence: 'unsure' };
    const options = q.options.map((option, optionIndex) => `
      <label class="choice">
        <input type="radio" name="answer-${q.id}" value="${optionIndex}"${response.picked === optionIndex ? ' checked' : ''}>
        <span><span class="choice-letter">${LETTERS[optionIndex]}.</span> ${esc(option)}</span>
      </label>`).join('');
    const confidence = [
      ['sure', '有把握'],
      ['unsure', '不確定'],
      ['guess', '猜測']
    ].map(([value, label]) => `<label><input type="radio" name="confidence-${q.id}" value="${value}"${response.confidence === value ? ' checked' : ''}>${label}</label>`).join('');
    return `<fieldset class="question-card paper" data-question-id="${q.id}">
      <legend><span class="question-number">${index + 1}</span>${esc(q.stem)}</legend>
      <span class="question-scope">${q.scope === 'core' ? '核心題' : '延伸題'}</span>
      <div class="option-list" role="group" aria-label="第 ${index + 1} 題選項">${options}</div>
      <div class="confidence-group" role="group" aria-label="第 ${index + 1} 題作答信心">
        <span>這一題的作答信心（預設：不確定）</span>
        <div class="confidence-options">${confidence}</div>
      </div>
    </fieldset>`;
  }

  function renderQuestions(focusId) {
    const start = currentBlock * 10;
    const questions = data.questions.slice(start, start + 10);
    $('#question-list').innerHTML = questions.map((q, offset) => questionMarkup(q, start + offset)).join('');
    questions.forEach(q => {
      $$(`input[name="answer-${q.id}"]`).forEach(input => input.addEventListener('change', () => {
        const confidence = $(`input[name="confidence-${q.id}"]:checked`)?.value || 'unsure';
        state.draft.responses[q.id] = { picked: Number(input.value), confidence };
        saveState(state);
        updateProgress();
      }));
      $$(`input[name="confidence-${q.id}"]`).forEach(input => input.addEventListener('change', () => {
        const existing = state.draft.responses[q.id] || { picked: null, confidence: 'unsure' };
        state.draft.responses[q.id] = { picked: existing.picked, confidence: input.value };
        saveState(state);
      }));
    });
    if (focusId) ROOT.requestAnimationFrame(() => $(`[data-question-id="${focusId}"] input[type="radio"]`)?.focus());
  }

  function updateProgress() {
    const answered = answeredCount();
    const missing = 50 - answered;
    $('#progress-copy').textContent = `已回答 ${answered}／50`;
    $('#missing-copy').textContent = missing ? `尚有 ${missing} 題未回答` : '50 題皆已回答，可以交卷';
    $('#progress-bar').style.width = `${answered * 2}%`;
    $('#submit-button').disabled = missing !== 0;
    renderBlockNav();
  }

  function updateBlockControls() {
    $('#current-block-label').textContent = String(currentBlock + 1);
    $('#previous-block').disabled = currentBlock === 0;
    $('#next-block').hidden = currentBlock === 4;
    $('#submit-button').hidden = currentBlock !== 4;
  }

  function switchBlock(block, focusId) {
    if (!state.draft || block < 0 || block > 4) return;
    currentBlock = block;
    state.draft.block = block;
    saveState(state);
    renderQuestions(focusId);
    updateBlockControls();
    updateProgress();
    if (!focusId) $('#quiz-heading').focus?.({ preventScroll: true });
    ROOT.scrollTo({ top: Math.max(0, $('#quiz-panel').offsetTop - 12), behavior: 'smooth' });
    announce(`已開啟第 ${block + 1} 組。`);
  }

  function formatElapsed(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return hours ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function tickTimer() {
    if (!state?.draft?.timerEnabled) return;
    const elapsed = (Date.now() - Date.parse(state.draft.startedAt)) / 1000;
    $('#elapsed-time').textContent = formatElapsed(elapsed);
  }

  function startTimer() {
    stopTimer();
    const enabled = Boolean(state.draft?.timerEnabled);
    $('#elapsed-wrap').hidden = !enabled;
    if (enabled) {
      tickTimer();
      timerHandle = ROOT.setInterval(tickTimer, 1000);
    }
  }

  function stopTimer() {
    if (timerHandle) ROOT.clearInterval(timerHandle);
    timerHandle = null;
  }

  function showQuiz() {
    if (!state.draft) return showIntro();
    activeAttempt = null;
    showOnly('quiz');
    currentBlock = state.draft.block;
    renderQuestions();
    updateBlockControls();
    updateProgress();
    startTimer();
    announce(`已載入第 ${currentBlock + 1} 組，目前已回答 ${answeredCount()} 題。`);
  }

  function firstMissing() {
    return data.questions.find(q => !Number.isInteger(state.draft?.responses[q.id]?.picked));
  }

  function jumpToMissing() {
    const q = firstMissing();
    if (!q) { announce('所有題目都已回答。'); return; }
    const index = data.questions.findIndex(item => item.id === q.id);
    switchBlock(Math.floor(index / 10), q.id);
    announce(`已跳到第 ${index + 1} 題，這題尚未作答。`);
  }

  function submitAttempt() {
    const missing = firstMissing();
    if (missing) { jumpToMissing(); return; }
    const result = score(data.questions, state.draft.responses);
    const submittedAt = new Date().toISOString();
    const attempt = {
      id: `attempt-${submittedAt}-${Math.random().toString(36).slice(2, 8)}`,
      submittedAt,
      startedAt: state.draft.startedAt,
      timerEnabled: state.draft.timerEnabled,
      responses: state.draft.responses,
      result: compactResult(result)
    };
    state.history.push(attempt);
    state.draft = null;
    saveState(state);
    activeAttempt = state.history[state.history.length - 1];
    showResults(activeAttempt, true);
  }

  function confidenceLabel(value) {
    return ({ sure: '有把握', unsure: '不確定', guess: '猜測' })[value] || '不確定';
  }

  function dateLabel(value) {
    try { return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
    catch (_) { return value.slice(0, 16); }
  }

  function sortedHistory() {
    return state.history.slice().sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  }

  function renderComparison() {
    const history = sortedHistory();
    const first = history[0];
    const latest = history[history.length - 1];
    const attemptCard = (label, attempt, note) => `<div class="attempt-chip"><span>${label}</span><b>核心 ${attempt.result.core.correct}／40 · 延伸 ${attempt.result.extension.correct}／10</b><small>${esc(dateLabel(attempt.submittedAt))}${note ? ` · ${esc(note)}` : ''}</small></div>`;
    $('#attempt-comparison').innerHTML = attemptCard('首次作答', first, '保留作為起點') + (history.length > 1 ? attemptCard('最近一次重做', latest, '熟悉題表現，不外推到未見題') : '<div class="attempt-chip"><span>重做紀錄</span><b>目前沒有</b><small>若再次作答，會另存而不覆蓋首次結果。</small></div>');
  }

  function priorityGroups(result) {
    const groups = {};
    const detailMap = new Map(result.details.map(item => [item.id, item]));
    data.questions.forEach(q => {
      const detail = detailMap.get(q.id);
      const name = `${q.scope === 'core' ? '核心' : '延伸'}｜${q.concept}`;
      const stats = groups[name] || (groups[name] = {scope: q.scope, total: 0, wrong: 0, weak: 0, uncertainCorrect: 0, highConfidenceWrong: 0, questionId: q.id});
      stats.total += 1;
      if (!detail.correct) stats.wrong += 1;
      if (detail.correct && detail.confidence !== 'sure') stats.uncertainCorrect += 1;
      if (!detail.correct && detail.confidence === 'sure') stats.highConfidenceWrong += 1;
      if (detail.weak) {stats.weak += 1; stats.questionId = q.id;}
    });
    return Object.entries(groups).filter(([, stats]) => stats.weak > 0)
      .sort((a,b) => (a[1].scope === 'core' ? 0 : 1) - (b[1].scope === 'core' ? 0 : 1) || b[1].highConfidenceWrong - a[1].highConfidenceWrong || b[1].wrong - a[1].wrong || b[1].weak - a[1].weak || a[0].localeCompare(b[0], 'zh-Hant'));
  }

  function renderPriorities(result) {
    const entries = priorityGroups(result);
    if (!entries.length) {
      $('#priority-list').innerHTML = `<div class="priority-item"><div><h3>本次沒有答錯或低信心作答</h3><p>這只代表本題組的表現；可回課程整理記憶句，再用未見題確認能否轉用。</p></div><a class="button secondary" href="day-${DAY}.html">回課程複習</a></div>`;
      return;
    }
    $('#priority-list').innerHTML = entries.map(([concept, stats], index) => {
      const representative = data.questions.find(q => q.id === stats.questionId && q.review);
      const url = safeUrl(representative?.review?.url);
      const label = representative?.review?.label || `回 Day ${DAY} 對照複習`;
      const evidence = `${stats.total} 題中：答錯 ${stats.wrong}、答對但不確定／猜測 ${stats.uncertainCorrect}${stats.highConfidenceWrong ? `，其中有把握答錯 ${stats.highConfidenceWrong}` : ''}`;
      return `<article class="priority-item"><div><h3><span class="priority-rank">${index + 1}</span>${esc(concept)}</h3><p>${esc(evidence)}。這是補強排序線索，不是掌握度百分比。</p></div><a class="button secondary" href="${esc(url)}"${externalAttrs(url)}>${esc(label)}</a></article>`;
    }).join('');
  }

  function answerState(detail) {
    if (!detail.correct) return ['答錯', 'wrong'];
    if (detail.confidence !== 'sure') return ['答對但待複習', 'weak'];
    return ['答對', 'correct'];
  }

  function renderReview() {
    const computed = score(data.questions, activeAttempt.responses);
    const details = new Map(computed.details.map(detail => [detail.id, detail]));
    const start = reviewBlock * 10;
    const blockQuestions = data.questions.slice(start, start + 10);
    const visible = blockQuestions.filter(q => reviewFilter === 'all' || details.get(q.id).weak);
    $('#review-list').innerHTML = visible.map(q => {
      const detail = details.get(q.id);
      const [stateLabel, stateClass] = answerState(detail);
      const options = q.options.map((option, optionIndex) => {
        const correctClass = optionIndex === q.answer ? ' correct-option' : '';
        const wrongClass = optionIndex === detail.picked && !detail.correct ? ' chosen-wrong' : '';
        const markers = [optionIndex === q.answer ? '正確答案' : '', optionIndex === detail.picked ? '你的選擇' : ''].filter(Boolean).join('、');
        return `<div class="review-option${correctClass}${wrongClass}"><span class="marker">${LETTERS[optionIndex]}.</span><span>${esc(option)}${markers ? ` <b>（${esc(markers)}）</b>` : ''}</span><span class="option-explanation">${esc(q.why[optionIndex])}</span></div>`;
      }).join('');
      let source = '<p>原創題；沒有外部題目改編來源。</p>';
      if (q.source) {
        const sourceUrl = safeUrl(q.source.url, 'https://www.ipas.org.tw/certification/AIAP/learning-resources');
        source = `<p><b>改編來源：</b><a href="${esc(sourceUrl)}"${externalAttrs(sourceUrl)}>${esc(q.source.label)}</a>${q.source.question ? ` · ${esc(q.source.question)}` : ''}</p>${q.source.note ? `<p><b>改編說明：</b>${esc(q.source.note)}</p>` : ''}`;
      }
      const questionIndex = data.questions.findIndex(item => item.id === q.id) + 1;
      return `<article class="review-card paper">
        <div class="review-card-header"><h3>${questionIndex}. ${esc(q.stem)}</h3><span class="answer-state ${stateClass}">${stateLabel}</span></div>
        <div class="review-tags"><span class="tag">${q.scope === 'core' ? '核心' : '延伸'}</span><span class="tag ${q.kind === 'adapted' ? 'adapted' : ''}">${q.kind === 'adapted' ? '改編題' : '原創題'}</span><span class="tag">概念：${esc(q.concept)}</span><span class="tag">能力：${esc(SKILL_LABELS[q.skill])}</span><span class="tag">信心：${esc(confidenceLabel(detail.confidence))}</span></div>
        <div class="correct-answer-line">正確答案：${LETTERS[q.answer]}．${esc(q.options[q.answer])}</div>
        <div class="review-options">${options}</div>
        <p class="insight"><b>帶走這句：</b>${esc(q.insight)}</p>
        <div class="source-details">${source}<p><a href="${esc(safeUrl(q.review.url))}"${externalAttrs(safeUrl(q.review.url))}>複習：${esc(q.review.label)}</a></p></div>
      </article>`;
    }).join('');
    $('#empty-review').hidden = visible.length !== 0;
    renderResultBlockNav(computed);
  }

  function renderResultBlockNav(computed) {
    const detailMap = new Map(computed.details.map(detail => [detail.id, detail]));
    $('#result-block-nav').innerHTML = Array.from({ length: 5 }, (_, block) => {
      const questions = data.questions.slice(block * 10, block * 10 + 10);
      const weak = questions.reduce((count, q) => count + (detailMap.get(q.id).weak ? 1 : 0), 0);
      return `<button type="button" data-result-block="${block}"${block === reviewBlock ? ' aria-current="page"' : ''}>第 ${block + 1} 組<span>${weak} 題待複習</span></button>`;
    }).join('');
    $$('[data-result-block]').forEach(button => button.addEventListener('click', () => {
      reviewBlock = Number(button.dataset.resultBlock);
      renderReview();
      $('#review-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce(`已顯示第 ${reviewBlock + 1} 組解析。`);
    }));
  }

  function showResults(attempt, openDialog) {
    stopTimer();
    activeAttempt = attempt;
    reviewBlock = 0;
    const result = score(data.questions, attempt.responses);
    const history = sortedHistory();
    const index = history.findIndex(item => item.id === attempt.id);
    $('#attempt-kind').textContent = index <= 0 ? '首次作答' : `第 ${index + 1} 次 · 重做（熟悉題）`;
    $('#submitted-at').textContent = `交卷：${dateLabel(attempt.submittedAt)} · 結果已鎖定`;
    $('#core-score').textContent = `${result.core.correct}／${result.core.total}`;
    $('#extension-score').textContent = `${result.extension.correct}／${result.extension.total}`;
    $('#confident-correct').textContent = String(result.confidentCorrect);
    $('#uncertain-correct').textContent = String(result.correctUncertain);
    $('#confident-wrong').textContent = String(result.highConfidenceWrong);
    renderComparison();
    renderPriorities(result);
    renderReview();
    showOnly('results');
    ROOT.requestAnimationFrame(() => $('#score-announcement').focus());
    announce(`診斷完成。核心題答對 ${result.core.correct} 題，延伸題答對 ${result.extension.correct} 題。`);
    if (openDialog) {
      $('#dialog-score').textContent = `核心 ${result.core.correct}／40；延伸 ${result.extension.correct}／10。`;
      const dialog = $('#result-dialog');
      if (typeof dialog.showModal === 'function' && !dialog.open) ROOT.setTimeout(() => dialog.showModal(), 60);
    }
  }

  function learningSummary() {
    const history = sortedHistory();
    const lines = [
      `Day ${DAY} 理解診斷｜本機學習摘要`,
      `題庫版本：${data.version}`,
      `完成次數：${history.length}`,
      '說明：核心與延伸分開記錄；此摘要不預測官方考試通過與否。'
    ];
    if (!history.length) {
      lines.push(`目前草稿：已回答 ${answeredCount()}／50`, '尚未交卷，沒有診斷結果。');
      return lines.join('\n');
    }
    const first = history[0];
    const latest = history[history.length - 1];
    const latestResult = score(data.questions, latest.responses);
    lines.push(
      `首次作答（${dateLabel(first.submittedAt)}）：核心 ${first.result.core.correct}/40；延伸 ${first.result.extension.correct}/10`,
      `最近作答（${dateLabel(latest.submittedAt)}）：核心 ${latestResult.core.correct}/40；延伸 ${latestResult.extension.correct}/10${history.length > 1 ? '（熟悉題重做）' : ''}`,
      `有把握且答對：${latestResult.confidentCorrect}`,
      `答對但不確定／猜測：${latestResult.correctUncertain}`,
      `有把握但答錯：${latestResult.highConfidenceWrong}`,
      '優先補強線索：'
    );
    const concepts = priorityGroups(latestResult);
    if (!concepts.length) lines.push('- 本次沒有答錯或低信心作答；仍建議以未見題確認轉用。');
    else concepts.forEach(([name, value]) => lines.push(`- ${name}：${value.total} 題中答錯 ${value.wrong}；答對但不確定／猜測 ${value.uncertainCorrect}`));
    lines.push('待複習題號與作答（供自己回看或自願與老師討論）：');
    latestResult.details.filter(detail => detail.weak).forEach(detail => {
      const q = data.questions.find(item => item.id === detail.id);
      lines.push(`- ${q.id}｜${q.scope === 'core' ? '核心' : '延伸'}｜${q.concept}｜選 ${LETTERS[detail.picked]}，正解 ${LETTERS[q.answer]}｜${confidenceLabel(detail.confidence)}｜${q.insight}`);
    });
    lines.push('提醒：題數有限，弱點排序不是心理計量上的掌握度；本檔案可自行留存，正常計分不需要分享。');
    return lines.join('\n');
  }

  function exportJson() {
    const payload = { ...state, exportedAt: new Date().toISOString() };
    download(`day-${DAY}-diagnostic-${data.version}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    announce('已匯出 JSON 完整備份。');
  }

  function exportSummary() {
    download(`day-${DAY}-diagnostic-summary-${data.version}.txt`, learningSummary(), 'text/plain;charset=utf-8');
    announce('已匯出純文字學習摘要。');
  }

  function mergeImported(imported) {
    const merged = createState(data.version);
    const byId = new Map();
    [...state.history, ...imported.history].forEach(attempt => byId.set(attempt.id, attempt));
    merged.history = [...byId.values()].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
    merged.draft = imported.draft || state.draft;
    saveState(merged);
  }

  async function importFile(file) {
    if (!file) return;
    if (file.size > 2_000_000) throw new Error('備份檔超過 2 MB，未匯入。');
    const imported = validateBackup(JSON.parse(await file.text()), data);
    const ok = ROOT.confirm('匯入會合併完成歷史；若備份內有草稿，會取代目前草稿。要繼續嗎？');
    if (!ok) return;
    mergeImported(imported);
    if (state.draft) showQuiz();
    else if (state.history.length) showResults(sortedHistory().at(-1), false);
    else showIntro();
    announce('備份已安全匯入。這是手動搬移，不是自動同步。');
  }

  function freshAttemptConfirm() {
    const message = state.draft && answeredCount() ? `目前草稿已有 ${answeredCount()} 題答案，重新作答會清除這份草稿；已交卷歷史不會刪除。確定繼續嗎？` : '要開始一份新的空白作答嗎？已交卷歷史不會刪除。';
    if (!ROOT.confirm(message)) return;
    startDraft(Boolean(state.draft?.timerEnabled ?? activeAttempt?.timerEnabled ?? $('#timer-enabled').checked));
  }

  function bindEvents() {
    $('#start-button').addEventListener('click', () => startDraft($('#timer-enabled').checked));
    $('#resume-button').addEventListener('click', showQuiz);
    $('#previous-block').addEventListener('click', () => switchBlock(currentBlock - 1));
    $('#next-block').addEventListener('click', () => switchBlock(currentBlock + 1));
    $('#jump-missing').addEventListener('click', jumpToMissing);
    $('#quiz-form').addEventListener('submit', event => { event.preventDefault(); submitAttempt(); });
    $('#restart-button').addEventListener('click', freshAttemptConfirm);
    $('#new-attempt-button').addEventListener('click', freshAttemptConfirm);
    $('[data-review-filter="all"]').addEventListener('click', () => setReviewFilter('all'));
    $('[data-review-filter="weak"]').addEventListener('click', () => setReviewFilter('weak'));
    $$('[data-export-json]').forEach(button => button.addEventListener('click', exportJson));
    $$('[data-export-summary]').forEach(button => button.addEventListener('click', exportSummary));
    $$('[data-import-file]').forEach(input => input.addEventListener('change', async event => {
      try { await importFile(event.target.files?.[0]); }
      catch (error) { announce(error.message); appError.textContent = error.message; appError.hidden = false; }
      finally { event.target.value = ''; }
    }));
    $('#close-dialog').addEventListener('click', () => $('#result-dialog').close());
  }

  function setReviewFilter(filter) {
    reviewFilter = filter;
    $$('[data-review-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.reviewFilter === filter)));
    renderReview();
    announce(filter === 'weak' ? '只顯示答錯或低信心題目。' : '顯示全部題目解析。');
  }

  function init() {
    if (!dataCheck.ok) {
      appError.hidden = false;
      appError.innerHTML = `<strong>診斷題庫尚未就緒。</strong><p>${esc(dataCheck.errors.slice(0, 5).join(' '))}</p>`;
      $('#intro-panel').hidden = true;
      return;
    }
    $('#diagnostic-title').textContent = data.title;
    STORAGE_KEY = `ipas-day${DAY}-diagnostic:${data.version}`;
    storageAvailable = testStorage();
    state = loadState();
    memoryState = state;
    bindEvents();
    if (state.draft) showQuiz();
    else if (state.history.length) showResults(sortedHistory().at(-1), false);
    else showIntro();
  }

  document.addEventListener('DOMContentLoaded', init);
})(typeof window !== 'undefined' ? window : globalThis);
