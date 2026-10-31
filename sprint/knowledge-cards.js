(() => {
  if (document.documentElement.dataset.knowledgeCardsMounted === 'true') return;
  document.documentElement.dataset.knowledgeCardsMounted = 'true';
  const day = Number(document.body.dataset.day || 0);
  const catalog = {
    1: [
      ['ipas-day1-ai-ml-dl-card.png','AI、機器學習、深度學習','先辨認上下位關係，再談模型。','s0','quick'],
      ['ipas-day1-discriminative-vs-generative.png','鑑別式 AI vs 生成式 AI','看輸出是既有標籤／數值，還是產生全新內容。','s1','quick'],
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
      ,['ipas-day2-random-vs-time-split.png','隨機切分 vs 時間切分','預測未來時要保留時間順序，避免偷看到未來。','s5','quick']
      ,['ipas-day2-chart-selection.png','問題決定圖表','比較、趨勢、分布與關係，各有適合的圖表。','s6','quick']
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
      ['ipas-day3-autoencoder-cases.png','自編碼器與異常偵測','先壓縮再還原，以重建誤差輔助判斷正常與異常。','s4','elective'],
      ['ipas-day3-q-learning-cases.png','Q-learning 學習循環','從狀態、動作、獎勵到 Q 值，分清探索與利用。','s4','elective'],
      ['ipas-day3-q-learning-vs-dqn-cases.png','Q-learning vs DQN','狀態少用 Q 表；狀態多又複雜時用神經網路估計 Q 值。','s4','elective'],
      ['ipas-rnn-lstm-gru-resnet-memory-card.png','序列記憶與深層捷徑','RNN、LSTM、GRU、ResNet 選讀。','s7','elective'],
      ['ipas-vanishing-exploding-gradient-card.png','梯度消失 vs 梯度爆炸','深度模型訓練問題選讀。','s7','elective']
    ],
    4: [
      ['01-token-generation.png','Token、向量與自迴歸生成','Token 是處理單位；模型依脈絡逐步預測下一個 Token。','s1','quick'],
      ['02-position-attention.png','位置順序與注意力參照','位置資訊保留順序，注意力依情境分配參照權重。','s1','quick'],
      ['06-text-tasks.png','四種文字任務','續寫、MLM、Seq2Seq 與分類要看輸出目標。','s2','quick'],
      ['07-gan.png','GAN 對抗訓練','生成器與鑑別器互相對抗，也要防模式崩潰。','s3','quick'],
      ['03-temperature-context.png','溫度、上下文與正確性','低溫較穩定、長上下文放得多，都不等於答案正確。','s4','quick'],
      ['04-prompt-examples.png','Zero-shot、Few-shot 與逐步分析','有沒有示例，和要不要列步驟，是兩條不同判斷軸。','s4','quick'],
      ['05-ape-evaluation.png','APE 候選與評估','同一資料、同一指標比較提示，定案後再獨立驗收。','s4','core']
    ],
    5: [
      ['ipas-day5-rag-structured-output-finetuning-cases.png','RAG、結構化輸出與微調','從最新知識、固定格式與長期行為，選對最適合的做法。','s1','quick'],
      ['ipas-day5-api-planner-cases.png','API 與 Planner','Planner 先拆解和排序，API 再依規格執行動作。','s2','quick'],
      ['ipas-day5-mcp-a2a-cases.png','MCP 與 A2A','MCP 讓代理接工具，A2A 讓代理和代理協作。','s2','quick']
    ],
    6: [
      ['security-card-01-zero-trust.png','零信任 ZTA','每次存取都重新驗證；零信任是整體安全架構。','s2','quick'],
      ['security-card-02-access-control.png','RBAC、MFA 與最小權限','以角色、第二道驗證與必要權限形成三道存取防線。','s2','quick'],
      ['security-card-03-compliance-defense.png','合規與持續防護','用法規、監控、稽核與異常偵測建立持續治理。','s6','core']
      ,['ipas-day6-governance-lifecycle.png','治理嵌入生命週期','資料、開發、部署與營運，每一關都要有控制點。','s0','quick']
      ,['ipas-day6-fairness-explainability.png','公平性與可解釋性','公平看群體差異；解釋看單次判斷依據。','s4','quick']
    ],
    7: [
      ['ipas-day7-poc-mvp-pilot-deployment.png','POC、MVP、試點與部署','從證明可行、驗證價值，到真實場域與穩定營運。','s1','quick'],
      ['ipas-day7-drift-monitoring.png','資料漂移、概念漂移與系統效能','輸入變、關係變或系統變慢，要分層判斷。','s3','quick'],
      ['ipas-day7-incident-response.png','AI 事件處置','先止血，再查因、修復與復盤；責任仍由組織承擔。','s4','quick'],
      ['ipas-day7-roi-tco-feasibility.png','ROI、TCO 與可行性','值得做、做得到與全生命週期成本要一起評估。','s7','quick']
    ]
  };

  if (!catalog[day]) return;

  const article = document.querySelector('article.content');
  if (!article) return;

  // A lesson may already embed its final cards. Keep those teaching locations
  // and only mount missing assets; ignore query/hash cache variants when matching.
  const assetKey = value => {
    const url = new URL(value, document.baseURI);
    return url.origin + url.pathname;
  };
  const existingAssets = new Set(
    [...article.querySelectorAll('img[src]')].map(image => assetKey(image.getAttribute('src')))
  );
  const missingCards = catalog[day].filter(([file]) => {
    const key = assetKey(`assets/cards/day-${day}/${file}`);
    if (existingAssets.has(key)) return false;
    existingAssets.add(key);
    return true;
  });
  if (!missingCards.length) return;

  const groups = new Map();
  missingCards.forEach(item => {
    const anchor = item[3];
    if (!groups.has(anchor)) groups.set(anchor, []);
    groups.get(anchor).push(item);
  });

  groups.forEach((items, anchor) => {
    const source = article.querySelector(`#${anchor}`);
    if (!source) return;
    const library = document.createElement('section');
    library.className = 'paper card-library inline-card-library';
    library.dataset.forSection = anchor;
    library.innerHTML = `<div class="card-library-head"><div><h2>這一段的知識圖卡</h2><p>讀完重點立刻看圖複習；點圖片可放大。</p></div><div class="card-count" aria-live="polite">${items.length} 張</div></div><div class="knowledge-card-grid"></div>`;
    const grid = library.querySelector('.knowledge-card-grid');
    items.forEach(([file,title,desc,anchor,tier]) => {
    const card = document.createElement('article');
    card.className = 'knowledge-card';
    card.dataset.tier = tier;
    const label = tier === 'quick' ? '3 分鐘核心' : tier === 'elective' ? '選讀補強' : '案例補強';
    card.innerHTML = `
      <button type="button" aria-label="放大查看：${title}" data-card-open="assets/cards/day-${day}/${file}"><img src="assets/cards/day-${day}/${file}" alt="${title}知識圖卡" loading="lazy"></button>
      <div class="knowledge-card-body"><div><span class="card-badge">${label}</span><h3>${title}</h3><p>${desc}</p></div><div class="knowledge-card-links"><a href="#${anchor}">回到對應課文</a><a href="#quiz">前往小測驗</a></div></div>`;
    grid.append(card);
    });
    source.after(library);
  });

  const dialog = document.createElement('dialog');
  dialog.className = 'card-dialog';
  dialog.innerHTML = '<button type="button" aria-label="關閉">×</button><img alt="放大的知識圖卡">';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  article.addEventListener('click', event => {
    const button = event.target.closest('[data-card-open]');
    if (!button) return;
    dialog.querySelector('img').src = button.dataset.cardOpen;
    dialog.querySelector('img').alt = button.getAttribute('aria-label').replace('放大查看：','');
    dialog.showModal();
  });

})();
