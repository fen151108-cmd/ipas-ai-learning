(() => {
  'use strict';
  // Separate public worksheet state; never load the former private worksheet key.
  const KEY = 'ipas-day1-transfer-public-v1';
  const ids = ['t1', 't2', 't3', 't4', 't5', 't6'];
  const confidenceLabels = {unsure: '不確定', sure: '有把握', guess: '猜測'};
  const status = document.getElementById('status');
  let state = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) state = parsed;
  } catch (_) {
    status.textContent = '無法讀取本機紀錄；仍可填寫並匯出。';
  }
  function save() {
    state = Object.fromEntries(ids.map(id => [id, {
      reason: document.getElementById(id).value,
      confidence: document.getElementById(id + '-confidence').value
    }]));
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      status.textContent = '已儲存在此瀏覽器；不會上傳或自動同步。';
    } catch (_) {
      status.textContent = '此瀏覽器無法儲存；目前內容仍可匯出備份。';
    }
  }
  ids.forEach(id => {
    const item = state[id];
    document.getElementById(id).value = typeof item?.reason === 'string' ? item.reason.slice(0, 5000) : '';
    document.getElementById(id + '-confidence').value = Object.hasOwn(confidenceLabels, item?.confidence) ? item.confidence : 'unsure';
    document.getElementById(id).addEventListener('input', save);
    document.getElementById(id + '-confidence').addEventListener('change', save);
  });
  document.getElementById('save').addEventListener('click', save);
  document.getElementById('export').addEventListener('click', () => {
    save();
    const text = 'Day 1｜六個新情境｜本機填寫紀錄（不自動計分）\n\n' + ids.map((id, i) =>
      '情境 ' + (i + 1) + '｜' + confidenceLabels[state[id].confidence] + '\n' + state[id].reason
    ).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Day1_六個新情境_我的理由.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
