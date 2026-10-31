(() => {
  const day = Number(document.body.dataset.day || 0);
  const catalog = {
    1: [
      ['ipas-day1-ai-ml-dl-card.png','AI、機器學習、深度學習','先辨認上下位關係，再談模型。','s0','quick'],
      ['ipas-four-learning-types-card.png','四種學習方式','看訓練答案來自標籤、未標記資料或環境獎勵。','s2','quick'],
      ['ipas-day1-four-ai-tasks-card.png','四種常見 AI 任務','用輸出型態判斷分類、迴歸、分群與生成。','s3','quick'],
      ['ipas-ml-three-learning-types-memory-card.png','三種學習方式速記','較短的考前回想版本。','s2','core'],
      ['ipas-ml-task-identification-memory-card.png','任務辨認速記','用題幹關鍵字快速辨認任務。','s3','core'],
      ['ipas-day1-train-inference-analysis-card.png','訓練、推論與分析','分清模型正在學、正在用，或人正在解讀。','s6','core']
    ],
    2: [
      ['ipas-day2-etl-elt-card.png','ETL vs ELT','差別在轉換發生於載入之前或之後。','s1','quick'],
      ['ipas-day2-data-quality-card.png','五種資料品質問題','缺失、重複、異常、不一致與不正確。','s2','quick'],
      ['ipas-day2-four-analytics-card.png','四層資料分析','從發生什麼一路走到應該怎麼做。','s3','quick'],
      ['ipas-day2-mean-median-charts-card.png','平均數、中位數與圖表','偏態與離群值會改變代表性。','s4','core']
    ],
    3: [
      ['ipas-day3-four-roles-equipment-case-card.png','機器學習四個角色','特徵、標籤、參數、超參數放進同一設備案例。','s0','quick'],
      ['ipas-training-validation-test-overfit-card.png','訓練、驗證、測試與過擬合','訓練拿來學，驗證拿來選，測試最後驗收。','s0','quick'],
      ['ipas-day3-data-leakage-cases.png','資料洩漏案例歸檔','用時間與流程兩條判斷軸，分清未來資訊、測試集參與學習與正常處理。','s0','quick'],
      ['ipas-day3-overfit-underfit-generalization-cases.png','過度擬合、欠擬合與泛化良好','從訓練與測試的高低及落差，判斷模型學習狀態。','s0','quick'],
      ['ipas-day3-preprocessing-four-methods-cases-card.png','四種前處理案例','One-hot、標準化、特徵選擇與 PCA 一次分清。','s1','quick'],
      ['ipas-day3-parameters-vs-hyperparameters-card.png','參數 vs 超參數','模型自己學，或由人先設定。','s0','core'],
      ['ipas-day3-preprocessing-four-methods-card.png','四種前處理速記','先看改的是類別、尺度、欄位還是座標。','s1','core'],
      ['ipas-day3-loss-vs-regularization-card.png','損失函數 vs 正則化','MSE、MAE、交叉熵負責衡量錯誤；L1、L2 負責限制模型複雜度。','s2','core'],
      ['ipas-day3-loss-regularization-cases-card.png','損失函數與正則化案例','用房價預測與設備故障，走完整選擇流程。','s2','core'],
      ['ipas-day3-precision-recall-f1-card-v2.png','Precision、Recall 與 F1','從 True／False、Positive／Negative 推回 TP、FP、FN、TN，再依錯誤代價選指標。','s5','quick'],
      ['ipas-dataset-keywords-wrong-questions-card.png','資料切分錯題關鍵字','用題幹辨認訓練、驗證、測試與過擬合。','traps','core'],
      ['ipas-common-models-cases-1.png','常見模型與用途（一）','從任務與核心機制辨認模型。','s3','core'],
      ['ipas-common-models-cases-2.png','常見模型與用途（二）','KNN、K-means、SVM 等案例。','s3','core'],
      ['ipas-model-cases-expanded-1.png','模型案例：迴歸','線性迴歸與邏輯斯迴歸。','cases','core'],
      ['ipas-model-cases-expanded-2.png','模型案例：樹模型','決策樹與隨機森林。','cases','core'],
      ['ipas-model-cases-expanded-3.png','模型案例：KNN','用最近、相似、鄰居辨認。','cases','core'],
      ['ipas-model-cases-expanded-4.png','模型案例：SVM','用最佳邊界與最大間隔辨認。','cases','core'],
      ['ipas-random-forest-clear-example.png','隨機森林清楚案例','多棵樹看不同線索，再一起投票。','s3','core'],
      ['ipas-rnn-lstm-gru-resnet-memory-card.png','序列記憶與深層捷徑','RNN、LSTM、GRU、ResNet 選讀。','s7','elective'],
      ['ipas-vanishing-exploding-gradient-card.png','梯度消失 vs 梯度爆炸','深度模型訓練問題選讀。','s7','elective']
    ],
    6: [
      ['security-card-01-zero-trust.png','零信任 ZTA','每次存取都重新驗證；零信任是整體安全架構。','s2','quick'],
      ['security-card-02-access-control.png','RBAC、MFA 與最小權限','以角色、第二道驗證與必要權限形成三道存取防線。','s2','quick'],
      ['security-card-03-compliance-defense.png','合規與持續防護','用法規、監控、稽核與異常偵測建立持續治理。','s6','core']
    ]
  };

  if (!catalog[day]) return;

  const layout = document.querySelector('.layout');
  const article = document.querySelector('article.content');
  const quiz = document.querySelector('#quiz');
  if (!layout || !article) return;

  const library = document.createElement('section');
  library.className = 'paper card-library';
  library.id = 'knowledge-cards';
  library.innerHTML = `<div class="card-library-head"><div><h2>本日知識圖卡</h2><p>已全部展開；點圖片可放大，每張都能回到對應課文。</p></div><div class="card-count" aria-live="polite">共 ${catalog[day].length} 張</div></div><div class="knowledge-card-grid"></div>`;
  (quiz || article.lastElementChild).before(library);

  const grid = library.querySelector('.knowledge-card-grid');
  catalog[day].forEach(([file,title,desc,anchor,tier]) => {
    const card = document.createElement('article');
    card.className = 'knowledge-card';
    card.dataset.tier = tier;
    const label = tier === 'quick' ? '3 分鐘核心' : tier === 'elective' ? '選讀補強' : '案例補強';
    card.innerHTML = `
      <button type="button" aria-label="放大查看：${title}" data-card-open="assets/cards/day-${day}/${file}"><img src="assets/cards/day-${day}/${file}" alt="${title}知識圖卡" loading="lazy"></button>
      <div class="knowledge-card-body"><div><span class="card-badge">${label}</span><h3>${title}</h3><p>${desc}</p></div><div class="knowledge-card-links"><a href="#${anchor}">回到對應課文</a><a href="#quiz">前往小測驗</a></div></div>`;
    grid.append(card);
  });

  const dialog = document.createElement('dialog');
  dialog.className = 'card-dialog';
  dialog.innerHTML = '<button type="button" aria-label="關閉">×</button><img alt="放大的知識圖卡">';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-card-open]');
    if (!button) return;
    dialog.querySelector('img').src = button.dataset.cardOpen;
    dialog.querySelector('img').alt = button.getAttribute('aria-label').replace('放大查看：','');
    dialog.showModal();
  });

})();
