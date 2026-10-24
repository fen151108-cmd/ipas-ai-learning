(() => {
  'use strict';
  // Isolated MCQ state: never read private, free-response, or diagnostic keys.
  const KEY = 'ipas-day1-transfer-mcq-v2';
  const labels = {sure: '有把握', unsure: '不確定', guess: '猜測'};
  const letters = ['A', 'B', 'C', 'D'];
  const questions = [
    {
      title: '資料存在，不等於參與訓練',
      stem: '文件中心用有主題標籤的歷史文件訓練分類模型。另有一批未標記文件，完全不參與訓練，下週才交給已訓練好的模型判讀。哪個判斷最適當？',
      options: ['同時擁有兩種資料，所以本次必為半監督式學習。', '本次是監督式分類；下週對新文件判讀是推論。', '下週文件沒有標籤，所以判讀必為非監督式分群。', '模型每判讀一份新文件，就必定重新訓練參數。'],
      answer: 1,
      explanations: ['半監督式的關鍵是有標籤與未標記資料共同參與學習；僅存在同一機構不算。', '歷史文件的主題標籤提供監督訊號；已訓練模型用於新輸入屬推論。', '推論輸入通常沒有待預測的標籤；無標籤輸入不會把分類模型變成分群模型。', '推論使用既有參數；除非另有更新流程，不能認定每次輸入都重新訓練。'],
      concept: '監督式學習／訓練與推論', takeaway: '先問哪些資料真的參與訓練，再分清學習與使用。'
    },
    {
      title: '分群後才命名',
      stem: '門市未預設購物型態標籤，先依購買特徵找出相似群組，之後店長才替各群命名。若未拿這些名稱重新訓練，原來的學習方式如何判斷？',
      options: ['店長命名後，先前的訓練就改成監督式分類。', '店長參與一部分，所以是半監督式學習。', '群組名稱是回饋，因此是強化學習。', '仍是非監督式分群，命名只是事後解讀。'],
      answer: 3,
      explanations: ['事後名稱不會回溯成為先前訓練使用的目標標籤；若日後另拿標籤訓練，才是另一流程。', '半監督式不是人與機器各做一半，而是有標籤與未標記資料共同學習。', '本題沒有行動、獎勵與策略更新；命名不是強化學習的充分條件。', '分群時沒有事先指定目標類別；人事後解讀群組，不改變原學習方式。'],
      concept: '非監督式分群／事後解讀', takeaway: '看訓練當時有沒有目標標籤，不看事後有沒有名字。'
    },
    {
      title: '條件反轉：兩批資料分開做',
      stem: '農業團隊用少量已標記葉片訓練病害分類器；大量未標記影像只拿去獨立分群，分群結果不回到分類器的訓練流程。哪個判斷最適當？',
      options: ['這是監督式分類與非監督式分群兩項工作，不能僅據此稱為半監督式分類。', '只要標記影像比較少，就一定是半監督式分類。', '使用同一種葉片影像，就代表共同參與同一學習目標。', '兩個模型都屬非監督式，因為整體未標記資料較多。'],
      answer: 0,
      explanations: ['題目明說分群不回到分類訓練；兩個獨立工作不等於共同利用兩種資料改善同一分類目標。', '數量少不是充分條件；還要看未標記資料有沒有參與同一學習流程。', '資料類型相同不代表訓練目標與訊號有整合；要查實際資料流。', '分類器確實使用病害標籤，仍屬監督式；不能按整體資料比例改判。'],
      concept: '半監督式的共同學習條件', takeaway: '有標籤加無標籤，不等於半監督；要看是否共同學習。'
    },
    {
      title: '數字是類別還是數量',
      stem: '客服系統第一個模型將案件判為既定優先級 1、2、3；數字只表示三種類別。第二個模型預測案件需要處理幾分鐘。兩項主要任務依序是？',
      options: ['迴歸、迴歸，因為兩個輸出都是數字。', '分群、分類，因為前者有三群、後者是案件判斷。', '分類、迴歸，因為前者選既定類別，後者估計時間量。', '分類、分群，因為時間可以切成不同群組。'],
      answer: 2,
      explanations: ['數字可以只是類別代碼；要看意義，不是只看表示格式。', '預先定義優先級是分類，並非從資料自行發現群組；預測分鐘數也不是分類。', '選擇既定離散類別屬分類；預測有數量意義的處理時間屬迴歸。', '本題預測的是分鐘數，未說先把時間分群；不能自行加入題目沒有的處理。'],
      concept: '分類／迴歸／分群', takeaway: '看到數字先問：它是代號，還是真的數量？'
    },
    {
      title: '回饋有沒有改變策略',
      stem: '運輸中心把客戶星等做成月報，排程規則不變。另一個模擬代理則根據選路後的耗時獎勵，更新下一次選路策略。哪一段符合強化學習的描述？',
      options: ['只有星等月報，因為評分就是獎勵。', '只有模擬代理，因為行動後的獎勵用來更新策略。', '兩段都是，因為都收到某種回饋。', '兩段都不是，因為沒有事先標好的正確路線。'],
      answer: 1,
      explanations: ['蒐集評分並製作報表，不代表回饋被用來學習行動策略。', '代理採取行動、取得環境獎勵並據此改善策略，符合強化學習的核心描述。', '收到回饋本身不夠；要看是否形成策略學習迴路。', '強化學習不必逐筆提供正確答案標籤，可透過行動後的獎勵學習。'],
      concept: '強化學習／回饋與策略更新', takeaway: '有回饋不等於在學習；回饋要真的用來改善行動策略。'
    },
    {
      title: '規則很多，不代表深度學習',
      stem: '維修系統由工程師撰寫多層條件規則，依知識庫推理，但不從案例自動調整規則。主管認為「規則層數多，所以一定是深度學習」。哪個回應最適當？',
      options: ['正確，只要判斷層數多，就是深度神經網路。', '不是 AI，因為所有 AI 都必須從資料訓練。', '是監督式學習，因為規則由有經驗的人提供。', '可屬規則式專家系統；規則層數多不等於多層神經網路從資料學習。'],
      answer: 3,
      explanations: ['條件判斷層與神經網路層不是同一概念；不能只用層數判定深度學習。', 'AI 範圍包含規則式系統，不只有機器學習。', '人寫規則不是提供標記案例讓模型學習；本題沒有描述監督式訓練。', '知識庫加推理規則可構成專家系統；沒有資料學習機制，不能因規則複雜就稱深度學習。'],
      concept: 'AI／機器學習／深度學習邊界', takeaway: 'AI 不只機器學習；規則的深，不是神經網路的深。'
    }
  ];
  const status = document.getElementById('status');
  const result = document.getElementById('result');
  let state = {version: 2, answers: questions.map(() => ({choice: null, confidence: ''})), submitted: false, repeat: false};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved?.version === 2 && saved.answers?.length === 6 && saved.answers.every(a =>
      a && (a.choice === null || Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 4) &&
      (a.confidence === '' || Object.hasOwn(labels, a.confidence)))) {
      state = {version: 2, answers: saved.answers, submitted: saved.submitted === true && saved.answers.every(a => a.choice !== null && a.confidence), repeat: saved.repeat === true};
    }
  } catch (_) { status.textContent = '無法讀取本機紀錄；仍可作答並匯出。'; }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      status.textContent = `已保存 ${state.answers.filter(a => a.choice !== null && a.confidence).length}/6 題選項與信心；${state.submitted ? '已提交鎖定。' : '可重開續答。'}僅存此瀏覽器。`;
    } catch (_) { status.textContent = '本機儲存不可用；目前仍可作答與匯出，離開前請備份。'; }
  }
  function render() {
    document.getElementById('questions').innerHTML = questions.map((q, i) => `<article class="paper" id="q${i + 1}"><fieldset ${state.submitted ? 'disabled' : ''}><legend>第 ${i + 1} 題｜${q.title}</legend><p>${q.stem}</p>${q.options.map((option, j) => `<label class="option"><input type="radio" name="q${i}" value="${j}" ${state.answers[i].choice === j ? 'checked' : ''}><span>${letters[j]}．${option}</span></label>`).join('')}<label for="confidence-${i}">本題信心</label><select id="confidence-${i}" data-question="${i}"><option value="">請選信心</option>${Object.entries(labels).map(([key, text]) => `<option value="${key}" ${state.answers[i].confidence === key ? 'selected' : ''}>${text}</option>`).join('')}</select></fieldset><div id="feedback-${i}"></div></article>`).join('');
    document.getElementById('submit').hidden = state.submitted;
    result.hidden = !state.submitted;
    if (state.submitted) showResults();
  }
  function showResults() {
    const correct = state.answers.filter((a, i) => a.choice === questions[i].answer).length;
    const review = questions.map((q, i) => ({q, i, a: state.answers[i]})).filter(({q, a}) => a.choice !== q.answer || a.confidence !== 'sure');
    result.innerHTML = `<h2>本次結果：${correct} / 6 題答對</h2><p>${state.repeat ? '熟題重做' : '本次練習'}｜原創補強題，不能外推官方通過率。作答已鎖定，可逐題展開完整解析。</p><h3>弱點與複習順序</h3>${review.length ? '<ul>' + review.sort((x, y) => Number(y.a.choice !== y.q.answer && y.a.confidence === 'sure') - Number(x.a.choice !== x.q.answer && x.a.confidence === 'sure')).map(({q, i, a}) => `<li><a href="#q${i + 1}">第 ${i + 1} 題｜${q.concept}</a>：${a.choice !== q.answer ? (a.confidence === 'sure' ? '有把握但答錯，優先釐清' : '答錯，回看條件與排除理由') : '答對但未確定，也要複習'}（${labels[a.confidence]}）。</li>`).join('') + '</ul>' : '<p>本次皆答對且有把握；下次仍需用未見情境確認，不能據此宣稱完整掌握。</p>'}`;
    questions.forEach((q, i) => {
      const a = state.answers[i];
      document.getElementById(`feedback-${i}`).innerHTML = `<p class="${a.choice === q.answer ? 'correct' : 'wrong'}"><strong>${a.choice === q.answer ? '答對' : '答錯'}｜你的選項 ${letters[a.choice]}；正解 ${letters[q.answer]}｜${labels[a.confidence]}</strong></p><details><summary>查看本題完整解析、考點與帶走一句話</summary><p><strong>正解：${letters[q.answer]}．${q.options[q.answer]}</strong></p><ul>${q.explanations.map((text, j) => `<li><strong>${letters[j]}（${j === q.answer ? '正確' : '錯誤'}${j === a.choice ? '，你的選項' : ''}）：</strong>${text}</li>`).join('')}</ul><p><strong>考點：</strong>${q.concept}</p><p><strong>帶走一句話：</strong>${q.takeaway}</p></details>`;
    });
  }
  document.getElementById('quiz').addEventListener('change', event => {
    if (state.submitted) return;
    const target = event.target;
    if (target.matches('input[type="radio"]')) state.answers[Number(target.name.slice(1))].choice = Number(target.value);
    if (target.matches('select')) state.answers[Number(target.dataset.question)].confidence = target.value;
    save();
  });
  document.getElementById('quiz').addEventListener('submit', event => {
    event.preventDefault();
    if (state.submitted) return;
    const missing = state.answers.findIndex(a => a.choice === null || !a.confidence);
    if (missing !== -1) {
      status.textContent = `尚未完成：請填第 ${missing + 1} 題的選項與信心；六題完成後才揭露答案。`;
      const article = document.getElementById(`q${missing + 1}`);
      article.scrollIntoView({block: 'start'});
      article.querySelector(state.answers[missing].choice === null ? 'input' : 'select').focus({preventScroll: true});
      return;
    }
    state.submitted = true;
    save(); render();
    result.focus({preventScroll: true});
    requestAnimationFrame(() => result.scrollIntoView({block: 'start'}));
  });
  function exportRecord(format) {
    save();
    const record = {kind: 'Day 1 原創補強題・非官方題', ...state, questions: questions.map((q, i) => ({number: i + 1, stem: q.stem, options: q.options, choice: state.answers[i].choice === null ? null : letters[state.answers[i].choice], confidence: labels[state.answers[i].confidence] || '未標記', ...(state.submitted ? {correct: letters[q.answer], explanations: q.explanations, concept: q.concept, takeaway: q.takeaway} : {})}))};
    const text = format === 'json' ? JSON.stringify(record, null, 2) : `${record.kind}\n${state.submitted ? '已提交' : '未提交；不揭露答案'}${state.repeat ? '（熟題重做）' : ''}\n\n` + record.questions.map(q => `第 ${q.number} 題：${q.stem}\n${q.options.map((o, i) => `${letters[i]}．${o}`).join('\n')}\n我的選項：${q.choice || '未答'}｜信心：${q.confidence}${state.submitted ? `\n正解：${q.correct}\n${q.explanations.map((e, i) => `${letters[i]}：${e}`).join('\n')}\n考點：${q.concept}\n帶走一句話：${q.takeaway}` : ''}`).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], {type: format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = `Day1_六題選擇補強.${format}`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.getElementById('save').addEventListener('click', save);
  document.getElementById('export').addEventListener('click', () => exportRecord('txt'));
  document.getElementById('export-json').addEventListener('click', () => exportRecord('json'));
  document.getElementById('restart').addEventListener('click', () => {
    if (!confirm('重新練習會取代本頁紀錄；若要保留，請先取消並匯出。確定重做？')) return;
    state = {version: 2, answers: questions.map(() => ({choice: null, confidence: ''})), submitted: false, repeat: true};
    save(); render(); document.getElementById('q1').scrollIntoView({block: 'start'});
  });
  render();
})();