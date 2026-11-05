'use strict';

(function (ROOT) {
  const EXPECTED_BANK_VERSION = '20261105-v1';
  const FORMAT = 'ipas-full-mock-backup';
  const SCHEMA = 1;
  const CONFIDENCES = [null, 'certain', 'uncertain', 'guess'];
  const SUBJECTS = ['1', '2'];
  const LETTERS = ['A', 'B', 'C', 'D'];
  const COURSE_LINKS = Object.freeze({ home: 'index.html', framework: 'framework.html', review: 'review.html', sources: 'sources.html' });

  function isPlainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function exactKeys(value, expected) {
    if (!isPlainObject(value)) return false;
    const actual = Object.keys(value).sort();
    return actual.length === expected.length && expected.slice().sort().every((key, index) => key === actual[index]);
  }

  function validText(value, max, allowEmpty = false) {
    return typeof value === 'string' && value.length <= max && (allowEmpty || value.trim().length > 0);
  }

  function validId(value) {
    return validText(value, 80) && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value);
  }

  function validUrl(value, externalOnly = false) {
    if (!validText(value, 2000)) return false;
    if (/^https:\/\/[A-Za-z0-9]/i.test(value)) return true;
    if (externalOnly) return false;
    return /^(?:\.\.?\/)?[A-Za-z0-9][A-Za-z0-9._~!$&'()*+,;=:@%\/-]*(?:#[A-Za-z0-9._~!$&'()*+,;=:@%\/-]+)?$/.test(value);
  }

  function validIso(value) {
    return validText(value, 40) && !Number.isNaN(Date.parse(value));
  }

  function validateData(data) {
    const errors = [];
    if (!isPlainObject(data)) return { ok: false, errors: ['題庫根節點必須是物件。'] };
    if (data.version !== EXPECTED_BANK_VERSION) errors.push(`題庫版本必須是 ${EXPECTED_BANK_VERSION}。`);

    const sourceIds = new Set();
    if (!Array.isArray(data.sources) || data.sources.length < 1 || data.sources.length > 100) {
      errors.push('sources 必須是 1–100 筆陣列。');
    } else {
      data.sources.forEach((source, index) => {
        const at = `來源 ${index + 1}`;
        if (!isPlainObject(source)) { errors.push(`${at} 必須是物件。`); return; }
        if (!validId(source.id)) errors.push(`${at} id 無效。`);
        else if (sourceIds.has(source.id)) errors.push(`${at} id 重複。`);
        else sourceIds.add(source.id);
        if (!validUrl(source.url, true)) errors.push(`${at} url 必須是 HTTPS 網址。`);
        if (!validText(source.label, 300)) errors.push(`${at} label 無效。`);
      });
    }

    if (!Array.isArray(data.subjects) || data.subjects.length !== 2) {
      errors.push('subjects 必須恰好包含兩科。');
      return { ok: false, errors };
    }

    const subjectNumbers = new Set();
    const questionIds = new Set();
    data.subjects.forEach((subject, subjectIndex) => {
      const at = `第 ${subjectIndex + 1} 份科目`;
      if (!isPlainObject(subject)) { errors.push(`${at} 必須是物件。`); return; }
      if (![1, 2].includes(subject.subject)) errors.push(`${at} subject 必須是 1 或 2。`);
      else if (subjectNumbers.has(subject.subject)) errors.push(`${at} subject 重複。`);
      else subjectNumbers.add(subject.subject);
      if (!validText(subject.title, 200)) errors.push(`${at} title 無效。`);
      if (subject.minutes !== 75) errors.push(`${at} minutes 必須是 75。`);
      if (!Array.isArray(subject.questions) || subject.questions.length !== 50) {
        errors.push(`${at} questions 必須恰好 50 題。`);
        return;
      }
      subject.questions.forEach((q, index) => {
        const qAt = `科目 ${subject.subject} 第 ${index + 1} 題`;
        if (!isPlainObject(q)) { errors.push(`${qAt} 必須是物件。`); return; }
        if (!validId(q.id)) errors.push(`${qAt} id 無效。`);
        else if (questionIds.has(q.id)) errors.push(`${qAt} id 重複。`);
        else questionIds.add(q.id);
        if (!validText(q.stem, 5000)) errors.push(`${qAt} stem 無效。`);
        if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(item => !validText(item, 3000))) errors.push(`${qAt} options 必須是四個非空字串。`);
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(`${qAt} answer 必須是 0–3。`);
        if (!Array.isArray(q.why) || q.why.length !== 4 || q.why.some(item => !validText(item, 5000))) errors.push(`${qAt} why 必須是四個非空字串。`);
        ['concept', 'kind', 'scope'].forEach(field => { if (!validText(q[field], 300)) errors.push(`${qAt} ${field} 無效。`); });
        if (!isPlainObject(q.review) || !validUrl(q.review.url) || !validText(q.review.label, 300)) errors.push(`${qAt} review 必須含安全網址與標籤。`);
        if (!Array.isArray(q.styleRefs)) errors.push(`${qAt} styleRefs 必須是陣列。`);
        else q.styleRefs.forEach((ref, refIndex) => {
          if (!isPlainObject(ref) || !validId(ref.sourceId) || !sourceIds.has(ref.sourceId) || !['string', 'number'].includes(typeof ref.question) || !validText(String(ref.question), 200) || !validText(ref.note, 1000, true)) errors.push(`${qAt} styleRefs[${refIndex}] 無效或引用未知來源。`);
        });
      });
    });
    if (![1, 2].every(number => subjectNumbers.has(number))) errors.push('subjects 必須各含科目 1 與科目 2。');
    return { ok: errors.length === 0, errors };
  }

  function makeResponses(questions) {
    const responses = {};
    questions.forEach(q => { responses[q.id] = { picked: null, confidence: null, flagged: false }; });
    return responses;
  }

  function normalizeResponse(value) {
    if (!exactKeys(value, ['picked', 'confidence', 'flagged'])) throw new Error('答案紀錄欄位不完整或含未知欄位。');
    if (value.picked !== null && (!Number.isInteger(value.picked) || value.picked < 0 || value.picked > 3)) throw new Error('答案選項超出 0–3。');
    if (!CONFIDENCES.includes(value.confidence)) throw new Error('信心標記超出允許範圍。');
    if (typeof value.flagged !== 'boolean') throw new Error('回看標記必須是布林值。');
    return { picked: value.picked, confidence: value.confidence, flagged: value.flagged };
  }

  function normalizeResponses(raw, questions) {
    if (!isPlainObject(raw)) throw new Error('responses 必須是物件。');
    const ids = questions.map(q => q.id);
    const keys = Object.keys(raw);
    if (keys.length !== ids.length || keys.some(id => !ids.includes(id)) || ids.some(id => !Object.prototype.hasOwnProperty.call(raw, id))) throw new Error('responses 必須完整且只能包含目前題庫的 50 題。');
    const normalized = {};
    questions.forEach(q => { normalized[q.id] = normalizeResponse(raw[q.id]); });
    return normalized;
  }

  function gradeSubject(questions, responses) {
    if (!Array.isArray(questions) || questions.length !== 50) throw new Error('計分需要完整 50 題。');
    const normalized = normalizeResponses(responses, questions);
    const result = { total: 50, answered: 0, correct: 0, points: 0, wrong: [], doubtful: [], unknownConfidence: [], flagged: [], confidence: { certain: 0, uncertain: 0, guess: 0, unknown: 0 }, items: [] };
    questions.forEach((q, index) => {
      const response = normalized[q.id];
      const answered = response.picked !== null;
      const correct = answered && response.picked === q.answer;
      if (answered) result.answered += 1;
      if (correct) result.correct += 1;
      if (!correct) result.wrong.push(q.id);
      if (correct && (response.confidence === 'uncertain' || response.confidence === 'guess')) result.doubtful.push(q.id);
      if (response.confidence === null) result.unknownConfidence.push(q.id);
      if (response.flagged) result.flagged.push(q.id);
      result.confidence[response.confidence || 'unknown'] += 1;
      result.items.push({ questionId: q.id, index: index + 1, picked: response.picked, confidence: response.confidence, flagged: response.flagged, answered, correct });
    });
    result.points = result.correct * 2;
    return result;
  }

  function createState(bankVersion) {
    if (bankVersion !== EXPECTED_BANK_VERSION) throw new Error('無法為未知題庫版本建立狀態。');
    return { subjects: { '1': { draft: null, history: [] }, '2': { draft: null, history: [] } } };
  }

  function makeId(subjectNumber, now) {
    const suffix = Math.random().toString(36).slice(2, 10);
    return `s${subjectNumber}-${new Date(now).toISOString().replace(/[^0-9]/g, '')}-${suffix}`;
  }

  function createDraft(subject, historyLength, now = Date.now()) {
    const startedAt = new Date(now).toISOString();
    const deadlineAt = new Date(now + subject.minutes * 60000).toISOString();
    return { id: makeId(subject.subject, now), kind: historyLength ? 'familiar-repeat' : 'first', startedAt, deadlineAt, current: 0, responses: makeResponses(subject.questions) };
  }

  function sameJson(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  function normalizeDraft(value, subject) {
    if (value === null) return null;
    if (!exactKeys(value, ['id', 'kind', 'startedAt', 'deadlineAt', 'current', 'responses'])) throw new Error('草稿欄位不完整或含未知欄位。');
    if (!validText(value.id, 100)) throw new Error('草稿 id 無效。');
    if (!['first', 'familiar-repeat'].includes(value.kind)) throw new Error('草稿 kind 無效。');
    if (!validIso(value.startedAt) || !validIso(value.deadlineAt)) throw new Error('草稿時間無效。');
    if (Date.parse(value.deadlineAt) - Date.parse(value.startedAt) !== subject.minutes * 60000) throw new Error('草稿截止時間不符合 75 分鐘。');
    if (!Number.isInteger(value.current) || value.current < 0 || value.current >= 50) throw new Error('草稿題號超出範圍。');
    return { id: value.id, kind: value.kind, startedAt: value.startedAt, deadlineAt: value.deadlineAt, current: value.current, responses: normalizeResponses(value.responses, subject.questions) };
  }

  function normalizeAttempt(value, subject) {
    const keys = ['id', 'kind', 'startedAt', 'deadlineAt', 'submittedAt', 'submitReason', 'responses', 'result'];
    if (!exactKeys(value, keys)) throw new Error('完成紀錄欄位不完整或含未知欄位。');
    if (!validText(value.id, 100)) throw new Error('完成紀錄 id 無效。');
    if (!['first', 'familiar-repeat'].includes(value.kind)) throw new Error('完成紀錄 kind 無效。');
    if (!validIso(value.startedAt) || !validIso(value.deadlineAt) || !validIso(value.submittedAt)) throw new Error('完成紀錄時間無效。');
    const started = Date.parse(value.startedAt);
    const deadline = Date.parse(value.deadlineAt);
    const submitted = Date.parse(value.submittedAt);
    if (deadline - started !== subject.minutes * 60000 || submitted < started) throw new Error('完成紀錄的時間範圍無效。');
    if (!['early', 'time-expired'].includes(value.submitReason)) throw new Error('交卷原因無效。');
    if (value.submitReason === 'early' && submitted > deadline) throw new Error('提前交卷時間晚於截止時間。');
    if (value.submitReason === 'time-expired' && submitted < deadline) throw new Error('時間到交卷早於截止時間。');
    const responses = normalizeResponses(value.responses, subject.questions);
    const computed = gradeSubject(subject.questions, responses);
    if (!sameJson(value.result, computed)) throw new Error('完成紀錄的逐題正確性或分數與答案不一致。');
    return { id: value.id, kind: value.kind, startedAt: value.startedAt, deadlineAt: value.deadlineAt, submittedAt: value.submittedAt, submitReason: value.submitReason, responses, result: computed };
  }

  function createBackup(state, data, exportedAt = new Date().toISOString()) {
    return { format: FORMAT, schema: SCHEMA, bankVersion: data.version, exportedAt, courseLinks: { ...COURSE_LINKS }, state };
  }

  function validateBackup(value, data) {
    const dataCheck = validateData(data);
    if (!dataCheck.ok) throw new Error('目前題庫未通過驗證，不能驗證備份。');
    if (!exactKeys(value, ['format', 'schema', 'bankVersion', 'exportedAt', 'courseLinks', 'state'])) throw new Error('備份根節點欄位不完整或含未知欄位。');
    if (value.format !== FORMAT || value.schema !== SCHEMA) throw new Error('不是本頁支援的備份格式。');
    if (value.bankVersion !== data.version || value.bankVersion !== EXPECTED_BANK_VERSION) throw new Error(`備份題庫版本必須是 ${data.version}。`);
    if (!validIso(value.exportedAt)) throw new Error('備份匯出時間無效。');
    if (!exactKeys(value.courseLinks, Object.keys(COURSE_LINKS)) || Object.keys(COURSE_LINKS).some(key => value.courseLinks[key] !== COURSE_LINKS[key])) throw new Error('備份課程連結欄位無效。');
    if (!exactKeys(value.state, ['subjects']) || !exactKeys(value.state.subjects, SUBJECTS)) throw new Error('備份必須恰好包含兩科狀態。');

    const normalized = createState(data.version);
    const allAttemptIds = new Set();
    SUBJECTS.forEach(number => {
      const raw = value.state.subjects[number];
      if (!exactKeys(raw, ['draft', 'history']) || !Array.isArray(raw.history)) throw new Error(`科目 ${number} 狀態格式錯誤。`);
      const subject = data.subjects.find(item => item.subject === Number(number));
      const history = raw.history.map(item => normalizeAttempt(item, subject));
      history.forEach(attempt => {
        if (allAttemptIds.has(attempt.id)) throw new Error(`重複的完成紀錄 id：${attempt.id}`);
        allAttemptIds.add(attempt.id);
      });
      for (let index = 1; index < history.length; index += 1) {
        if (Date.parse(history[index].submittedAt) < Date.parse(history[index - 1].submittedAt)) throw new Error(`科目 ${number} 歷史必須依時間排序。`);
      }
      if (history.length && history[0].kind !== 'first') throw new Error(`科目 ${number} 首次完成紀錄必須標示為 first。`);
      if (history.slice(1).some(item => item.kind !== 'familiar-repeat')) throw new Error(`科目 ${number} 後續紀錄必須標示為 familiar-repeat。`);
      const draft = normalizeDraft(raw.draft, subject);
      if (draft && allAttemptIds.has(draft.id)) throw new Error(`草稿 id 與完成紀錄重複：${draft.id}`);
      if (draft && draft.kind !== (history.length ? 'familiar-repeat' : 'first')) throw new Error(`科目 ${number} 草稿熟悉度標記與歷史不符。`);
      normalized.subjects[number] = { draft, history };
    });
    return normalized;
  }

  const API = { EXPECTED_BANK_VERSION, FORMAT, SCHEMA, COURSE_LINKS, validateData, validateBackup, createBackup, createState, createDraft, gradeSubject };
  ROOT.IPASFullMock = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let data = null;
  let state = null;
  let memoryState = null;
  let storageAvailable = false;
  let storageKey = '';
  let activeSubject = null;
  let activeAttemptId = null;
  let questionIndex = 0;
  let reviewIndex = 0;
  let timerHandle = null;
  let pendingConfirm = null;
  let confirmReturnFocus = null;

  function subjectData(number) { return data.subjects.find(item => item.subject === Number(number)); }
  function subjectState(number) { return state.subjects[String(number)]; }
  function announce(message) { const live = $('#live-status'); live.textContent = ''; ROOT.setTimeout(() => { live.textContent = message; }, 20); }
  function showStorageWarning() { $('#storage-warning').hidden = false; }

  function testStorage() {
    try {
      const probe = `${storageKey}:probe`;
      ROOT.localStorage.setItem(probe, '1');
      ROOT.localStorage.removeItem(probe);
      return true;
    } catch (_) { showStorageWarning(); return false; }
  }

  function saveState() {
    memoryState = state;
    if (!storageAvailable) { showStorageWarning(); return false; }
    try {
      ROOT.localStorage.setItem(storageKey, JSON.stringify(createBackup(state, data)));
      return true;
    } catch (_) {
      storageAvailable = false;
      showStorageWarning();
      return false;
    }
  }

  function loadState() {
    if (!storageAvailable) return createState(data.version);
    try {
      const raw = ROOT.localStorage.getItem(storageKey);
      return raw ? validateBackup(JSON.parse(raw), data) : createState(data.version);
    } catch (_) {
      storageAvailable = false;
      showStorageWarning();
      return createState(data.version);
    }
  }

  function showPanel(name) {
    document.body.dataset.view = name;
    $('.hero').hidden = name !== 'home';
    $('.source-footer').hidden = name === 'exam';
    $('#loading-panel').hidden = name !== 'loading';
    $('#home-panel').hidden = name !== 'home';
    $('#exam-panel').hidden = name !== 'exam';
    $('#result-panel').hidden = name !== 'result';
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  function formatRemaining(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function download(filename, text) {
    const href = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    ROOT.setTimeout(() => URL.revokeObjectURL(href), 2000);
  }

  function exportBackup() {
    const backup = createBackup(state || memoryState, data);
    download(`ipas-full-mock-${data.version}-${new Date().toISOString().slice(0, 10)}.json`, `${JSON.stringify(backup, null, 2)}\n`);
    announce('JSON 備份已下載。');
  }

  function openConfirm(title, message, acceptLabel, callback) {
    pendingConfirm = callback;
    confirmReturnFocus = document.activeElement;
    $('#confirm-title').textContent = title;
    $('#confirm-message').textContent = message;
    $('#accept-confirm').textContent = acceptLabel;
    $('#confirm-sheet').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#cancel-confirm').focus();
  }

  function closeConfirm() {
    $('#confirm-sheet').hidden = true;
    document.body.style.overflow = '';
    pendingConfirm = null;
    confirmReturnFocus?.focus?.();
  }

  function acceptConfirm() {
    const callback = pendingConfirm;
    $('#confirm-sheet').hidden = true;
    document.body.style.overflow = '';
    pendingConfirm = null;
    if (callback) callback();
  }

  function finalizeDraft(number, reason, now = Date.now()) {
    const bucket = subjectState(number);
    if (!bucket.draft) return null;
    const subject = subjectData(number);
    const draft = bucket.draft;
    const effectiveNow = reason === 'early' ? Math.min(now, Date.parse(draft.deadlineAt)) : Math.max(now, Date.parse(draft.deadlineAt));
    const attempt = {
      id: draft.id,
      kind: draft.kind,
      startedAt: draft.startedAt,
      deadlineAt: draft.deadlineAt,
      submittedAt: new Date(effectiveNow).toISOString(),
      submitReason: reason,
      responses: draft.responses,
      result: gradeSubject(subject.questions, draft.responses)
    };
    bucket.history.push(attempt);
    bucket.draft = null;
    saveState();
    return attempt;
  }

  function enforceExpiredDrafts(now = Date.now()) {
    let changed = false;
    SUBJECTS.forEach(number => {
      const draft = subjectState(number).draft;
      if (draft && Date.parse(draft.deadlineAt) <= now) {
        finalizeDraft(Number(number), 'time-expired', now);
        changed = true;
      }
    });
    return changed;
  }

  function answeredCount(draft) {
    return Object.values(draft.responses).filter(response => response.picked !== null).length;
  }

  function renderHome() {
    stopTimer();
    activeSubject = null;
    activeAttemptId = null;
    enforceExpiredDrafts();
    showPanel('home');
    $('#bank-version').textContent = `題庫版本：${data.version}。匯入只接受相同版本與完整兩科資料。`;
    $('#subject-cards').innerHTML = data.subjects.map(subject => {
      const bucket = subjectState(subject.subject);
      const latest = bucket.history.at(-1);
      let status = '<strong>尚未開始</strong><span>首次開始後會建立不可覆蓋的第一筆紀錄。</span>';
      if (bucket.draft) {
        status = `<strong>作答中：${answeredCount(bucket.draft)}／50 已答</strong><span>截止 ${esc(formatDate(bucket.draft.deadlineAt))}；倒數不因離開頁面暫停。</span>`;
      } else if (latest) {
        status = `<strong>最新：${latest.result.points} 分（${latest.result.correct}／50）</strong><span>共 ${bucket.history.length} 次完成；首次與全部歷史均保留。</span>`;
      }
      const actions = bucket.draft
        ? `<button class="button primary" type="button" data-resume-subject="${subject.subject}">繼續作答</button><button class="button secondary" type="button" data-export>備份進度</button>`
        : latest
          ? `<button class="button primary" type="button" data-view-subject="${subject.subject}">查看最新結果</button><button class="button secondary" type="button" data-repeat-subject="${subject.subject}">熟悉題重做</button>`
          : `<button class="button primary" type="button" data-start-subject="${subject.subject}">開始科目 ${subject.subject}</button>`;
      return `<article class="paper subject-card"><div class="subject-card-header"><div><p class="section-kicker">科目 ${subject.subject}</p><h3>${esc(subject.title)}</h3><div class="meta">50 題 · 100 分 · ${subject.minutes} 分鐘</div></div><div class="subject-number" aria-hidden="true">${subject.subject}</div></div><div class="subject-status">${status}</div><div class="subject-actions">${actions}</div></article>`;
    }).join('');
    bindHomeActions();
    renderCombined();
    ROOT.scrollTo({ top: 0, behavior: 'instant' });
  }

  function bindHomeActions() {
    $$('[data-start-subject]').forEach(button => button.addEventListener('click', () => startSubject(Number(button.dataset.startSubject))));
    $$('[data-resume-subject]').forEach(button => button.addEventListener('click', () => openExam(Number(button.dataset.resumeSubject))));
    $$('[data-view-subject]').forEach(button => button.addEventListener('click', () => showResult(Number(button.dataset.viewSubject))));
    $$('[data-repeat-subject]').forEach(button => button.addEventListener('click', () => startSubject(Number(button.dataset.repeatSubject))));
    $$('[data-export]', $('#subject-cards')).forEach(button => button.addEventListener('click', exportBackup));
  }

  function renderCombined() {
    const latest = SUBJECTS.map(number => subjectState(number).history.at(-1));
    if (latest.some(item => !item)) { $('#combined-panel').hidden = true; return; }
    $('#combined-panel').hidden = false;
    $('#combined-scores').innerHTML = latest.map((attempt, index) => `<span>科目 ${index + 1}：${attempt.result.points} 分</span>`).join('');
    const scores = latest.map(item => item.result.points);
    const individual = scores.every(score => score >= 70);
    const average = (scores[0] + scores[1]) / 2;
    const sitting = average >= 70 && Math.min(...scores) >= 60;
    $('#individual-benchmark').className = individual ? 'met' : 'not-met';
    $('#individual-benchmark').textContent = individual ? '兩科皆達 70 分' : '至少一科未達 70 分';
    $('#sitting-benchmark').className = sitting ? 'met' : 'not-met';
    $('#sitting-benchmark').textContent = `${sitting ? '符合' : '未符合'}：平均 ${average.toFixed(1)} 分，最低 ${Math.min(...scores)} 分`;
  }

  function startSubject(number) {
    const bucket = subjectState(number);
    if (bucket.draft) { openExam(number); return; }
    bucket.draft = createDraft(subjectData(number), bucket.history.length);
    saveState();
    openExam(number);
  }

  function openExam(number) {
    enforceExpiredDrafts();
    const bucket = subjectState(number);
    if (!bucket.draft) { showResult(number); return; }
    activeSubject = number;
    activeAttemptId = null;
    questionIndex = bucket.draft.current;
    showPanel('exam');
    const collapseGrid = ROOT.matchMedia('(max-width: 720px)').matches;
    $('#question-grid').hidden = collapseGrid;
    $('#toggle-grid').setAttribute('aria-expanded', String(!collapseGrid));
    $('#toggle-grid').textContent = collapseGrid ? '展開題號' : '收合題號';
    $('#exam-title').textContent = `科目 ${number}｜${subjectData(number).title}`;
    renderQuestion();
    startTimer();
    ROOT.scrollTo({ top: 0, behavior: 'instant' });
  }

  function currentDraft() { return subjectState(activeSubject).draft; }

  function renderQuestion() {
    const subject = subjectData(activeSubject);
    const draft = currentDraft();
    if (!draft) return;
    const question = subject.questions[questionIndex];
    const response = draft.responses[question.id];
    $('#exam-progress').textContent = `第 ${questionIndex + 1}／50 題 · 已答 ${answeredCount(draft)}／50`;
    $('#question-card').innerHTML = `<p class="question-count">第 ${questionIndex + 1} 題</p><h2 id="question-heading">${esc(question.stem)}</h2><div class="option-list" role="radiogroup" aria-label="第 ${questionIndex + 1} 題選項">${question.options.map((option, index) => `<label class="choice"><input type="radio" name="active-answer" value="${index}"${response.picked === index ? ' checked' : ''}><span><span class="choice-letter">${LETTERS[index]}.</span> ${esc(option)}</span></label>`).join('')}</div><div class="confidence-box"><span>作答信心（選填，可保留未標記）</span><div class="confidence-buttons" role="group" aria-label="作答信心">${[[null,'未標記'],['certain','確定'],['uncertain','不確定'],['guess','猜測']].map(([value,label]) => `<button type="button" data-confidence="${value ?? ''}" aria-pressed="${response.confidence === value}">${label}</button>`).join('')}</div></div>`;
    $$('input[name="active-answer"]', $('#question-card')).forEach(input => input.addEventListener('change', () => {
      response.picked = Number(input.value);
      saveState();
      renderGrid();
      $('#exam-progress').textContent = `第 ${questionIndex + 1}／50 題 · 已答 ${answeredCount(draft)}／50`;
    }));
    $$('[data-confidence]', $('#question-card')).forEach(button => button.addEventListener('click', () => {
      response.confidence = button.dataset.confidence || null;
      saveState();
      $$('[data-confidence]', $('#question-card')).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
    $('#previous-question').disabled = questionIndex === 0;
    $('#next-question').disabled = questionIndex === 49;
    $('#flag-question').setAttribute('aria-pressed', String(response.flagged));
    $('#flag-question').textContent = response.flagged ? '★ 已標記待回看' : '☆ 標記待回看';
    renderGrid();
  }

  function renderGrid() {
    const subject = subjectData(activeSubject);
    const draft = currentDraft();
    $('#question-grid').innerHTML = subject.questions.map((question, index) => {
      const response = draft.responses[question.id];
      const classes = [response.picked !== null ? 'answered' : '', response.flagged ? 'flagged' : ''].filter(Boolean).join(' ');
      const stateText = `${response.picked !== null ? '，已回答' : '，未回答'}${response.flagged ? '，已標記待回看' : ''}`;
      return `<button type="button" data-question="${index}" class="${classes}"${index === questionIndex ? ' aria-current="step"' : ''} aria-label="第 ${index + 1} 題${stateText}">${index + 1}</button>`;
    }).join('');
    $$('[data-question]', $('#question-grid')).forEach(button => button.addEventListener('click', () => goQuestion(Number(button.dataset.question))));
  }

  function goQuestion(index) {
    if (index < 0 || index >= 50 || !currentDraft()) return;
    questionIndex = index;
    currentDraft().current = index;
    saveState();
    renderQuestion();
    $('#question-heading').focus?.({ preventScroll: true });
    $('#question-card').scrollIntoView({ block: 'start', behavior: 'instant' });
    announce(`已開啟第 ${index + 1} 題。`);
  }

  function toggleFlag() {
    const draft = currentDraft();
    const question = subjectData(activeSubject).questions[questionIndex];
    draft.responses[question.id].flagged = !draft.responses[question.id].flagged;
    saveState();
    renderQuestion();
    $('#flag-question').focus();
  }

  function requestSubmit() {
    const draft = currentDraft();
    if (!draft) return;
    const missing = 50 - answeredCount(draft);
    const message = missing ? `仍有 ${missing} 題空白。提前交卷後答案會鎖定，空白題計為未答；確定交卷嗎？` : '50 題皆已處理。提前交卷後答案會鎖定，確定交卷嗎？';
    openConfirm('提前交卷', message, '確認交卷', () => {
      const attempt = finalizeDraft(activeSubject, 'early');
      activeAttemptId = attempt.id;
      showResult(activeSubject, attempt.id);
      announce(`科目 ${activeSubject} 已交卷，得分 ${attempt.result.points} 分。`);
    });
  }

  function tickTimer() {
    const draft = activeSubject ? currentDraft() : null;
    if (!draft) return;
    const remaining = Date.parse(draft.deadlineAt) - Date.now();
    if (remaining <= 0) {
      if (!$('#confirm-sheet').hidden) closeConfirm();
      const number = activeSubject;
      const attempt = finalizeDraft(number, 'time-expired');
      activeAttemptId = attempt.id;
      showResult(number, attempt.id);
      announce(`科目 ${number} 時間到，已自動交卷，包含空白題。`);
      return;
    }
    $('#timer').textContent = formatRemaining(remaining);
    $('#timer').classList.toggle('urgent', remaining <= 5 * 60000);
  }

  function startTimer() { stopTimer(); tickTimer(); timerHandle = ROOT.setInterval(tickTimer, 500); }
  function stopTimer() { if (timerHandle) ROOT.clearInterval(timerHandle); timerHandle = null; }

  function attemptFor(number, id) {
    const history = subjectState(number).history;
    return history.find(item => item.id === id) || history.at(-1);
  }

  function showResult(number, attemptId) {
    stopTimer();
    const bucket = subjectState(number);
    const attempt = attemptFor(number, attemptId);
    if (!attempt) { renderHome(); return; }
    activeSubject = number;
    activeAttemptId = attempt.id;
    reviewIndex = Math.max(0, subjectData(number).questions.findIndex(q => attempt.result.wrong.includes(q.id) || attempt.result.doubtful.includes(q.id)));
    showPanel('result');
    renderResult();
    ROOT.requestAnimationFrame(() => $('#score-banner').focus());
    ROOT.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderResult() {
    const subject = subjectData(activeSubject);
    const bucket = subjectState(activeSubject);
    const attempt = attemptFor(activeSubject, activeAttemptId);
    activeAttemptId = attempt.id;
    $('#attempt-label').textContent = attempt.kind === 'first' ? '首次作答' : '熟悉題重做';
    $('#result-meta').textContent = `科目 ${activeSubject}｜${formatDate(attempt.submittedAt)}｜${attempt.submitReason === 'time-expired' ? '時間到自動交卷' : '提前交卷'}｜已答 ${attempt.result.answered}／50`;
    $('#score-points').textContent = `${attempt.result.points} 分`;
    $('#score-count').textContent = `答對 ${attempt.result.correct}／50`;
    $('#wrong-count').textContent = String(attempt.result.wrong.length);
    $('#doubtful-count').textContent = String(attempt.result.doubtful.length);
    $('#unknown-count').textContent = String(attempt.result.unknownConfidence.length);
    $('#flagged-count').textContent = String(attempt.result.flagged.length);
    $('#attempt-select').innerHTML = bucket.history.slice().reverse().map((item, reverseIndex) => {
      const originalIndex = bucket.history.length - reverseIndex;
      const label = item.kind === 'first' ? '首次' : `重做 ${originalIndex - 1}`;
      return `<option value="${esc(item.id)}"${item.id === attempt.id ? ' selected' : ''}>${label}｜${item.result.points} 分｜${esc(formatDate(item.submittedAt))}</option>`;
    }).join('');
    const weakIds = new Set([...attempt.result.wrong, ...attempt.result.doubtful]);
    $('#weak-list').innerHTML = weakIds.size ? subject.questions.filter(q => weakIds.has(q.id)).map((q, index) => {
      const questionIndexValue = subject.questions.indexOf(q);
      const type = attempt.result.wrong.includes(q.id) ? 'wrong' : 'doubtful';
      return `<button type="button" class="${type}" data-weak-index="${questionIndexValue}">第 ${questionIndexValue + 1} 題 · ${type === 'wrong' ? '錯誤／空白' : '答對但猶豫'}</button>`;
    }).join('') : '<p>本次沒有錯題或答對但猶豫的題目。</p>';
    $$('[data-weak-index]').forEach(button => button.addEventListener('click', () => {
      reviewIndex = Number(button.dataset.weakIndex);
      $('#weak-only').checked = true;
      renderReview();
      $('#review-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    renderReview();
  }

  function reviewIndices(attempt) {
    if (!$('#weak-only').checked) return Array.from({ length: 50 }, (_, index) => index);
    const weak = new Set([...attempt.result.wrong, ...attempt.result.doubtful]);
    return subjectData(activeSubject).questions.map((q, index) => weak.has(q.id) ? index : -1).filter(index => index >= 0);
  }

  function renderReview() {
    const subject = subjectData(activeSubject);
    const attempt = attemptFor(activeSubject, activeAttemptId);
    const indices = reviewIndices(attempt);
    if (indices.length && !indices.includes(reviewIndex)) reviewIndex = indices[0];
    $('#review-grid').innerHTML = indices.map(index => {
      const item = attempt.result.items[index];
      const classes = [item.correct ? 'answered' : '', item.flagged ? 'flagged' : ''].filter(Boolean).join(' ');
      return `<button type="button" data-review-index="${index}" class="${classes}"${index === reviewIndex ? ' aria-current="page"' : ''}>${index + 1}</button>`;
    }).join('');
    $$('[data-review-index]').forEach(button => button.addEventListener('click', () => { reviewIndex = Number(button.dataset.reviewIndex); renderReview(); }));
    if (!indices.length) {
      $('#review-card').innerHTML = '<h3>本次沒有錯題或答對但猶豫的題目。</h3><p>關閉「只在弱點題中切換」即可檢視全部解析。</p>';
      $('#previous-review').disabled = true;
      $('#next-review').disabled = true;
      return;
    }
    const question = subject.questions[reviewIndex];
    const response = attempt.responses[question.id];
    const item = attempt.result.items[reviewIndex];
    const doubtful = item.correct && (item.confidence === 'uncertain' || item.confidence === 'guess');
    const stateClass = item.correct ? (doubtful ? 'doubtful' : 'correct') : 'wrong';
    const stateLabel = item.correct ? (doubtful ? '答對但猶豫' : '答對') : (item.answered ? '答錯' : '空白');
    const sourceById = new Map(data.sources.map(source => [source.id, source]));
    const refs = question.styleRefs.map(ref => {
      const source = sourceById.get(ref.sourceId);
      return `<p>題型參考：<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>，題號 ${esc(ref.question)}${ref.note ? `；${esc(ref.note)}` : ''}</p>`;
    }).join('');
    $('#review-card').innerHTML = `<div class="review-header"><div><p class="question-count">第 ${reviewIndex + 1} 題</p><h3>${esc(question.stem)}</h3></div><span class="answer-state ${stateClass}">${stateLabel}</span></div><div class="review-tags"><span class="tag">${esc(question.concept)}</span><span class="tag">${esc(question.scope)}</span><span class="tag">${esc(question.kind)}</span><span class="tag">信心：${esc({ certain:'確定', uncertain:'不確定', guess:'猜測' }[response.confidence] || '未標記')}</span>${response.flagged ? '<span class="tag">曾標記待回看</span>' : ''}</div>${question.options.map((option,index) => `<div class="review-option ${index === question.answer ? 'correct-option' : ''} ${index === response.picked && index !== question.answer ? 'chosen-wrong' : ''}"><b>${LETTERS[index]}.</b><span>${esc(option)}${index === response.picked ? '（你的選擇）' : ''}</span><span class="option-why">${esc(question.why[index])}</span></div>`).join('')}<p class="correct-line">正確答案：${LETTERS[question.answer]}。${esc(question.options[question.answer])}</p><div class="review-meta"><p>這是本站原創模擬題；題庫標記：${esc(question.kind)}。不代表官方命題或預測。</p>${refs ? '<p class="microcopy">官方 PDF 內含答案；若要保留考古題首次作答，請完成後再開啟下方來源。</p>' : ''}${refs}<p>回課程複習：<a href="${esc(question.review.url)}">${esc(question.review.label)}</a></p></div>`;
    const position = indices.indexOf(reviewIndex);
    $('#previous-review').disabled = position <= 0;
    $('#next-review').disabled = position < 0 || position >= indices.length - 1;
  }

  function moveReview(direction) {
    const attempt = attemptFor(activeSubject, activeAttemptId);
    const indices = reviewIndices(attempt);
    const position = indices.indexOf(reviewIndex);
    const next = indices[position + direction];
    if (next === undefined) return;
    reviewIndex = next;
    renderReview();
    $('#review-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function importFile(file) {
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('備份檔超過 5 MB。');
      const parsed = JSON.parse(await file.text());
      const imported = validateBackup(parsed, data);
      openConfirm('匯入完整備份', '匯入會以檔案中的兩科草稿與全部歷史取代目前本機狀態。格式、題庫版本、題號、選項與逐題計分均已驗證。要繼續嗎？', '確認匯入', () => {
        state = imported;
        memoryState = imported;
        enforceExpiredDrafts();
        saveState();
        renderHome();
        announce('完整備份已匯入。');
      });
    } catch (error) {
      $('#app-error').hidden = false;
      $('#app-error').innerHTML = `<strong>備份未匯入。</strong><p>${esc(error.message)}</p>`;
      announce(`備份未匯入：${error.message}`);
    } finally {
      $$('[data-import]').forEach(input => { input.value = ''; });
    }
  }

  function bindStaticEvents() {
    $$('[data-export]').forEach(button => button.addEventListener('click', exportBackup));
    $$('[data-import]').forEach(input => input.addEventListener('change', () => importFile(input.files?.[0])));
    $('#previous-question').addEventListener('click', () => goQuestion(questionIndex - 1));
    $('#next-question').addEventListener('click', () => goQuestion(questionIndex + 1));
    $('#flag-question').addEventListener('click', toggleFlag);
    $('#submit-exam').addEventListener('click', requestSubmit);
    $('#exam-home').addEventListener('click', renderHome);
    $('#toggle-grid').addEventListener('click', () => {
      const grid = $('#question-grid');
      const expanded = !grid.hidden;
      grid.hidden = expanded;
      $('#toggle-grid').setAttribute('aria-expanded', String(!expanded));
      $('#toggle-grid').textContent = expanded ? '展開題號' : '收合題號';
    });
    $('#attempt-select').addEventListener('change', event => { activeAttemptId = event.target.value; reviewIndex = 0; renderResult(); });
    $('#return-home').addEventListener('click', renderHome);
    $('#repeat-subject').addEventListener('click', () => startSubject(activeSubject));
    $('#weak-only').addEventListener('change', renderReview);
    $('#previous-review').addEventListener('click', () => moveReview(-1));
    $('#next-review').addEventListener('click', () => moveReview(1));
    $('#cancel-confirm').addEventListener('click', closeConfirm);
    $('#accept-confirm').addEventListener('click', acceptConfirm);
    $('[data-cancel-confirm]').addEventListener('click', closeConfirm);
    document.addEventListener('keydown', event => {
      if (!$('#confirm-sheet').hidden && event.key === 'Escape') closeConfirm();
      if (!$('#confirm-sheet').hidden && event.key === 'Tab') {
        const buttons = [$('#cancel-confirm'), $('#accept-confirm')];
        const index = buttons.indexOf(document.activeElement);
        if (event.shiftKey && index === 0) { event.preventDefault(); buttons[1].focus(); }
        if (!event.shiftKey && index === 1) { event.preventDefault(); buttons[0].focus(); }
      }
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tickTimer(); });
  }

  async function init() {
    bindStaticEvents();
    try {
      const response = await fetch('full-mock-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`題庫尚未就緒（HTTP ${response.status}）。`);
      const loaded = await response.json();
      const check = validateData(loaded);
      if (!check.ok) throw new Error(`題庫驗證失敗：${check.errors.slice(0, 8).join('；')}`);
      data = loaded;
      storageKey = `ipas-full-mock:${data.version}:state-v1`;
      storageAvailable = testStorage();
      state = loadState();
      memoryState = state;
      enforceExpiredDrafts();
      saveState();
      renderHome();
    } catch (error) {
      showPanel('loading');
      $('#loading-panel').hidden = true;
      $('#app-error').hidden = false;
      $('#app-error').innerHTML = `<strong>目前無法開始模擬考。</strong><p>${esc(error.message)} 請確認 full-mock-data.json 已放在本頁同一資料夾後再重新整理。</p>`;
    }
  }

  init();
})(typeof globalThis !== 'undefined' ? globalThis : this);
