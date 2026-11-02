(() => {
  if (document.documentElement.dataset.knowledgeCardsMounted === 'true') return;
  document.documentElement.dataset.knowledgeCardsMounted = 'true';
  const day = Number(document.body.dataset.day || 0);
  const catalog = {
    1: [
      ['ipas-day1-ai-ml-dl-card.png','AI、機器學習、深度學習','先辨認上下位關係，再談模型。','s0','quick'],
      ['ipas-day1-discriminative-vs-generative.png','鑑別式 AI vs 生成式 AI','看輸出是既有標籤／數值，還是產生全新內容。','s1','quick'],
      ['ipas-four-learning-types-card.png','四種學習方式','看訓練答案來自標籤、未標記資料或環境獎勵。','s2','quick'],
      ['ipas-day1-four-ai-tasks-card.png','分類、迴歸、分群與生成','這張舊卡補充生成任務；異常偵測另以案例卡依資料條件判斷。','s3','quick'],
      ['day1-card-11-anomaly-paths.png','異常偵測不只一條路','異常是任務；監督或非監督是方法。','s3','quick'],
      ['ipas-ml-three-learning-types-memory-card.png','三種學習方式速記','較短的考前回想版本。','s2','core'],
      ['day1-card-08-self-vs-semi-supervised.png','自監督式 vs 半監督式','自己出題是自監督；少量標籤帶大量未標記是半監督。','s2','core'],
      ['ipas-ml-task-identification-memory-card.png','任務辨認速記','用題幹關鍵字快速辨認任務。','s3','core'],
      ['ipas-day1-train-inference-analysis-card.png','訓練、推論與分析','分清模型正在學、正在用，或人正在解讀。','s6','core'],
      ['day1-card-09-ai-modalities.png','NLP、ASR、OCR 與電腦視覺','先看輸入，再看要輸出什麼。','s7','elective'],
      ['day1-card-10-vision-tasks.png','分類、偵測、分割怎麼分','整張貼標籤、物件畫框、像素逐一上色。','s7','elective'],
      ['day1-card-12-specialized-transfer-agi.png','專用 AI、通用 AI 與遷移學習','單項很強，不等於什麼都會。','s7','elective']
    ],
    2: [
      ['ipas-day2-etl-elt-card.png','ETL vs ELT','差別在轉換發生於載入之前或之後。','s1','quick'],
      ['ipas-day2-data-quality-card.png','五種資料品質問題','缺失、重複、異常、不一致與不正確。','s2','quick'],
      ['ipas-day2-four-analytics-card.png','四層資料分析','從發生什麼一路走到應該怎麼做。','s3','quick'],
      ['ipas-day2-mean-median-charts-card.png','平均數、中位數與圖表','偏態與離群值會改變代表性。','s4','core']
      ,['ipas-day2-random-vs-time-split.png','隨機切分 vs 時間切分','預測未來時要保留時間順序，避免偷看到未來。','s5','quick']
      ,['ipas-day2-chart-selection.png','問題決定圖表','比較、趨勢、分布與關係，各有適合的圖表。','s6','quick']
      ,['day2-card-07-data-types.png','三種資料型態','固定表格、標記層次與自由內容要分清。','s7','elective']
      ,['day2-card-08-big-data-granularity.png','大數據 3V 與資料粒度','3V 描述規模；粒度決定看得多細。','s7','elective']
      ,['day2-card-09-sampling-variation-bias.png','抽樣變異 vs 抽樣偏誤','換一批會變是變異；總漏一群是偏誤。','s5','core']
      ,['day2-card-10-data-quality-actions.png','缺失、重複、離群怎麼處理','先查原因，再決定修正、填補、標記或刪除。','s2','core']
      ,['day2-card-11-type-errors-pvalue.png','第一類、第二類錯誤與 p 值','第一類是誤報；第二類是漏報；p 值不是假設為真的機率。','s7','elective']
      ,['day2-card-12-eda-correlation-causation.png','EDA、相關與因果','探索找到線索，不等於證明原因。','s3','core']
      ,['day2-card-13-time-series-leakage.png','時間序列與未來資訊洩漏','時序資料有方向；未來不能偷渡回過去。','s5','core']
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
      ['ipas-day4-transformer-self-attention-complete.png','Transformer 與 Self-Attention 完整流程','從 Token、位置編碼、Q／K／V、多頭注意力到因果遮罩，走完一個完整句子案例。','s1','quick'],
      ['06-text-tasks.png','四種文字任務','續寫、MLM、Seq2Seq 與分類要看輸出目標。','s2','quick'],
      ['07-gan.png','GAN 對抗訓練','生成器與鑑別器互相對抗，也要防模式崩潰。','s3','quick'],
      ['ipas-day4-generative-models-gan-vae-diffusion.png','GAN、VAE 與擴散模型','先看對抗、潛在分布與逐步去噪，分清三條生成路徑。','s3','quick'],
      ['ipas-day4-seed-prompt-cfg.png','Seed、Prompt 與 CFG','Seed 決定起點，Prompt 指定方向，CFG 控制提示詞引導強度。','s3','quick'],
      ['ipas-day4-image-control-tools.png','Inpainting、Outpainting、ControlNet 與圖生圖','從局部修改、向外延伸、結構控制到改動幅度，依任務選工具。','s3','quick'],
      ['ipas-day4-model-stack.png','Checkpoint、LoRA 與 Negative Prompt','Checkpoint 決定底子，LoRA 增加專長，負面提示降低不想要的內容。','s3','quick'],
      ['ipas-day4-practical-cases.png','四個影像生成實戰情境','從保留構圖、換服裝、延伸橫幅與放大細節，反推最適合的工具。','s3','quick'],
      ['03-temperature-context.png','溫度、上下文與正確性','低溫較穩定、長上下文放得多，都不等於答案正確。','s4','quick'],
      ['04-prompt-examples.png','Zero-shot、Few-shot 與逐步分析','有沒有示例，和要不要列步驟，是兩條不同判斷軸。','s4','quick'],
      ['05-ape-evaluation.png','APE 候選與評估','同一資料、同一指標比較提示，定案後再獨立驗收。','s4','core']
      ,['ipas-day4-generation-prompt-evaluation.png','文字生成、取樣、提示與評測','把自迴歸生成、Temperature、Top-k／Top-p、Few-shot、APE、基準與記憶範圍串成客服案例。','s4','quick']
      ,['ipas-day4-card-08-text-tasks-version-history.png','四種文字任務與版本史判讀','用接龍、填空、轉換、分抽屜判斷任務；舊資料只能證明舊狀態。','s2','quick']
      ,['ipas-day4-card-09-clip-dino-training-feedback.png','CLIP、DINO 與三種訓練回饋','先分清圖文配對、無標籤視覺表示、標準示範、人類偏好與可驗證結果。','s7','elective']
      ,['ipas-day4-card-10-model-compression.png','PEFT、LoRA 與模型壓縮','少量參數學習、專長外掛、大教小、降低精度與移除連結，五種方法一次分清。','s7','elective']
      ,['ipas-day4-card-11-flash-attention.png','注意力平方成本與 FlashAttention','長度兩倍、比較量約四倍；FlashAttention 以分塊與少搬資料改善效率。','s7','elective']
      ,['ipas-day4-card-12-titans-autoskill.png','Titans 與 AutoSkill','Titans 是模型記憶架構；AutoSkill 是 Agent 將互動經驗整理成可重用技能。','s7','elective']
    ],
    5: [
      ['ipas-day5-rag-structured-output-finetuning-cases.png','RAG、結構化輸出與微調','從最新知識、固定格式與長期行為，選對最適合的做法。','s1','quick'],
      ['ipas-day5-api-planner-cases.png','API 與 Planner','Planner 先拆解和排序，API 再依規格執行動作。','s2','quick'],
      ['ipas-day5-mcp-a2a-cases.png','MCP 與 A2A','MCP 讓代理接工具，A2A 讓代理和代理協作。','s2','quick'],
      ['ipas-day5-voice-workflow-cases.png','語音工作流四件事','ASR 聽內容、辨識看誰、切分看題、TTS 說出去。','s4','quick'],
      ['ipas-day5-batch-realtime-throughput-latency-cases.png','批次、即時、吞吐量與延遲','大量可等待用批次；單筆要快速回應用即時。','s5','quick'],
      ['day5-card-01-performance.png','AI 系統效能完整流程','分清吞吐量、延遲、TTFT、生成速度，以及批次與即時處理的取捨。','s5','quick'],
      ['day5-card-02-peak-cache.png','尖峰佇列、快取與依賴關係','從並行請求、佇列與逾時，延伸到快取、TTL、平行與循序處理。','s5','quick'],
      ['day5-card-03-operations.png','模型路由、備援與可觀測性','用模型路由控制成本，以安全降級處理故障，並用 Metrics、Logs、Traces 找瓶頸。','s5','quick'],
      ['day5-card-04-integration.png','AI 系統五層判斷地圖','先判斷缺的是知識、行為、工具、流程或效能，再選 RAG、微調、工具、Planner 或效能優化。','s0','quick'],
      ['day5-card-05-security.png','工具權限、提示注入與安全治理','工具接得越多，越要落實身分、授權、政策、資料保護、核准與稽核。','s2','quick']
    ],
    6: [
      ['security-card-01-zero-trust.png','零信任 ZTA','每次存取都重新驗證；零信任是整體安全架構。','s2','quick'],
      ['security-card-02-access-control.png','RBAC、MFA 與最小權限','以角色、第二道驗證與必要權限形成三道存取防線。','s2','quick'],
      ['security-card-03-compliance-defense.png','合規與持續防護','用法規、監控、稽核與異常偵測建立持續治理。','s6','core']
      ,['ipas-day6-governance-lifecycle.png','治理嵌入生命週期','資料、開發、部署與營運，每一關都要有控制點。','s0','quick']
      ,['ipas-day6-fairness-explainability.png','公平性與可解釋性','公平看群體差異；解釋看單次判斷依據。','s4','quick']
      ,['day6-card-06-privacy-principles.png','隱私不是刪掉姓名就結束','從目的限制、資料最小化、保存期限，到加密、假名化、匿名化與再識別風險。','s1','quick']
      ,['day6-card-08-ai-attacks.png','AI 攻擊發生在哪一段','用訓練、推論、查詢輸出與工具四個位置，分清資料中毒、對抗樣本、模型竊取、成員推論與提示注入。','s2','quick']
      ,['day6-card-09-private-defense.png','私有部署不等於零外洩','內網仍有越權、金鑰、日誌、備份、供應鏈與模型記憶風險；安全要靠六層縱深防禦。','s3','quick']
      ,['day6-card-10-shap-lime.png','SHAP 拆帳；LIME 畫附近地圖','用同一筆貸款案例，分清特徵貢獻拆解與局部近似；解釋不等於因果、公平或正確。','s5','quick']
      ,['day6-card-07-human-oversight.png','高風險決策，人要真的能踩煞車','比較 Human-in／on／out-of-the-loop，並檢查人是否看得懂、能推翻、有權限、可申訴與回滾。','s6','quick']
      ,['day6-card-11-privacy-tech.png','K 匿名、差分隱私與聯邦學習','K 匿名在資料表藏身分；差分隱私在輸出降洩漏；聯邦學習讓原始資料留在本地。','s7','elective']
    ],
    7: [
      ['day7-card-01-poc-mvp-pilot-production.png','POC、MVP、Pilot 與 Production','從技術可行、最小可用、真實試點到長期營運，四關不能跳級。','s1','quick'],
      ['day7-card-02-testing-layers.png','Unit、Integration 與 E2E','從一個零件、介接點到完整旅程，逐層測試才能又快又準地抓錯。','s2','quick'],
      ['day7-card-03-batch-throughput-latency.png','Batch、Throughput 與 Latency','處理得多不代表單筆回得快；總完成量與等待時間要分開看。','s3','quick'],
      ['day7-card-04-drift-monitoring.png','Data、Concept、Schema Drift','先判斷改變發生在輸入分布、答案關係或欄位結構，再決定處置。','s3','quick'],
      ['day7-card-05-incident-response.png','AI 事件應變順序','先止血、保留證據、找根因，再修正測試與受控恢復。','s4','quick'],
      ['day7-card-06-tco-roi-feasibility.png','TCO、ROI 與導入可行性','不能只看模型費用；要把生命週期成本、效益與風險放在一起算。','s7','quick'],
      ['day7-card-07-tools-governance.png','開發工具與組織風險','No Code、Low Code、AutoML、Vibe Coding 能加速開發，但不能取代治理。','s7','quick'],
      ['day7-card-08-scenario-expansion.png','跨場景擴散與重新驗證','成功經驗可以複製，但新場景的資料、權限、錯誤代價與人工介入必須重驗。','s5','quick']
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
