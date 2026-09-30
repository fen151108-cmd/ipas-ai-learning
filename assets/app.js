const STORE='ipas-concept-study-v1';
const LESSONS=[
  ['day01','AI 的定義、範圍與邊界'],['day02','分析型、預測型、生成型 AI'],['day03','AI 治理為什麼從設計開始'],['day04','風險分級、透明與人工問責'],
  ['day05','資料、紀錄、樣本與來源'],['day06','結構化、半結構化、非結構化'],['day07','資料品質：缺失、錯誤、重複、離群'],['day08','ETL：擷取、轉換、載入'],
  ['day09','平均數、中位數、標準差與分布'],['day10','資料視覺化如何選圖'],['day11','隱私、安全、權限與去識別'],['day12','特徵、標籤、參數與輸出'],
  ['day13','監督式學習'],['day14','分類與迴歸'],['day15','非監督式學習'],['day16','K-means 與 PCA'],['day17','強化學習與半監督式學習'],
  ['day18','訓練、驗證、測試流程'],['day19','過擬合、正則化與交叉驗證'],['day20','Accuracy、Precision、Recall、F1'],['day21','線性迴歸與邏輯迴歸'],
  ['day22','決策樹、隨機森林與 SVM'],['day23','神經網路與深度學習'],['day24','鑑別式與生成式 AI'],['day25','LLM、Token 與逐步機率生成'],
  ['day26','Transformer 與自注意力'],['day27','GAN、VAE 與擴散模型'],['day28','No Code 與 Low Code'],['day29','平台限制、鎖定與 Shadow IT'],
  ['day30','生成式 AI 工具與任務配對'],['day31','提示、幻覺、查證與溫度'],['day32','多模態輸入與輸出'],['day33','需求、目標、KPI 與可行性'],
  ['day34','POC、資源、資料與資安'],['day35','部署、監控、治理與價值擴散'],['day36','特徵工程與模型控制'],['day37','RAG 與知識更新'],
  ['day38','AI 代理與工具協作'],['day39','提示與推理方法'],['day40','安全、隱私、解釋與監控']
];

function emptyState(){return{done:[],attempts:{},logs:[]}}
function normalizeState(raw){
  const s=raw&&typeof raw==='object'?raw:{};
  return{
    done:Array.isArray(s.done)?[...new Set(s.done.filter(Boolean))]:[],
    attempts:s.attempts&&typeof s.attempts==='object'?s.attempts:{},
    logs:Array.isArray(s.logs)?s.logs:[]
  };
}
function getState(){try{return normalizeState(JSON.parse(localStorage.getItem(STORE)))}catch(e){return emptyState()}}
function saveState(s){localStorage.setItem(STORE,JSON.stringify(normalizeState(s)))}
function isDone(id){return getState().done.includes(id)}
function lessonNumber(id){return Number(String(id||'').replace(/\D/g,''))||0}
function lessonTitle(id){return LESSONS.find(x=>x[0]===id)?.[1]||id}
function currentLessonId(){
  const m=location.pathname.match(/day-(\d{2})\.html$/);
  if(m)return`day${m[1]}`;
  return null;
}
function lessonHref(id){
  const n=String(lessonNumber(id)).padStart(2,'0');
  return location.pathname.includes('/lessons/')?`day-${n}.html`:`lessons/day-${n}.html`;
}
function progressHref(){return location.pathname.includes('/lessons/')?'../progress.html':'progress.html'}
function indexHref(){return location.pathname.includes('/lessons/')?'../index.html':'index.html'}
function todayLocal(){
  const d=new Date();
  const z=n=>String(n).padStart(2,'0');
  return`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;
}
function showToast(message,linkText,linkHref){
  document.querySelector('.study-toast')?.remove();
  const box=document.createElement('div');box.className='study-toast';box.setAttribute('role','status');box.textContent=message;
  if(linkText&&linkHref){const a=document.createElement('a');a.href=linkHref;a.textContent=linkText;box.appendChild(a)}
  document.body.appendChild(box);setTimeout(()=>box.classList.add('show'),10);setTimeout(()=>box.remove(),6500);
}
function toggleDone(id,btn){
  const s=getState();const i=s.done.indexOf(id);let added=false;
  if(i>=0)s.done.splice(i,1);else{s.done.push(id);added=true}
  saveState(s);paintDone(id,btn);updateProgress();
  if(added)showToast(`Day ${lessonNumber(id)} 已標記完成。`,'補上學習紀錄',progressHref()+`?lesson=${id}`);
}
function paintDone(id,btn){if(!btn)return;const d=isDone(id);btn.textContent=d?'已完成｜點擊取消':'標記這課已完成';btn.classList.toggle('done',d)}
function updateProgress(){
  const s=getState();const valid=new Set(LESSONS.map(x=>x[0]));const n=s.done.filter(x=>valid.has(x)).length;
  document.querySelectorAll('[data-progress-text]').forEach(e=>e.textContent=`${n}／40 課`);
  document.querySelectorAll('[data-progress-bar]').forEach(e=>e.style.width=`${Math.min(100,n/40*100)}%`);
  document.querySelectorAll('[data-lesson-id]').forEach(e=>{
    const state=e.querySelector('.state');if(!state)return;
    state.textContent=s.done.includes(e.dataset.lessonId)?'已完成':'可學習';
    e.classList.toggle('is-done',s.done.includes(e.dataset.lessonId));
  });
}
function answerText(name,value){const input=document.querySelector(`input[name="${name}"][value="${value}"]`);if(!input)return value;const label=input.closest('label');return label?label.textContent.replace(/\s+/g,' ').trim():value}
function saveQuizAttempt(score,total,answered){
  const id=currentLessonId();if(!id)return;
  const s=getState();s.attempts[id]={score,total,answered,date:todayLocal(),updatedAt:new Date().toISOString()};saveState(s);
}
function gradeQuiz(answers){
  let score=0;let answered=0;
  Object.entries(answers).forEach(([name,info])=>{
    const picked=document.querySelector(`input[name="${name}"]:checked`);const box=document.getElementById(`f-${name}`);const inputs=document.querySelectorAll(`input[name="${name}"]`);
    inputs.forEach(input=>{const label=input.closest('label');if(label)label.classList.remove('answer-correct','answer-wrong')});
    const correct=document.querySelector(`input[name="${name}"][value="${info.answer}"]`);const correctLabel=correct?.closest('label');if(correctLabel)correctLabel.classList.add('answer-correct');const correctText=answerText(name,info.answer);
    if(!picked){box.className='feedback show bad';box.textContent=`尚未作答。正確答案：${correctText}。解析：${info.explain}`;return}
    answered++;const ok=picked.value===info.answer;if(ok)score++;else{const pickedLabel=picked.closest('label');if(pickedLabel)pickedLabel.classList.add('answer-wrong')}
    box.className=`feedback show ${ok?'good':'bad'}`;box.textContent=`${ok?'答對了':'答錯了'}。正確答案：${correctText}。解析：${info.explain}`;
  });
  const total=Object.keys(answers).length;saveQuizAttempt(score,total,answered);
  const out=document.getElementById('score');if(!out)return;
  out.className=`score show ${score===total?'perfect':'needs-review'}`;out.textContent=`評分：${score}／${total} 題正確（已作答 ${answered} 題）`;
  const record=document.createElement('a');record.href=progressHref()+`?lesson=${currentLessonId()||''}`;record.className='score-record-link';record.textContent='補上弱點與一句記憶';out.appendChild(record);
  const close=document.createElement('button');close.type='button';close.textContent='收合';close.setAttribute('aria-label','收合評分提示');close.addEventListener('click',()=>out.classList.add('dismissed'),{once:true});out.appendChild(close);
  out.setAttribute('role','status');out.setAttribute('aria-live','polite');out.tabIndex=-1;
  const reveal=()=>{try{out.scrollIntoView({block:'center',inline:'nearest'})}catch(e){out.scrollIntoView()}try{out.focus({preventScroll:true})}catch(e){out.focus()}};
  if(window.requestAnimationFrame)requestAnimationFrame(()=>requestAnimationFrame(reveal));else setTimeout(reveal,0);
}
function addProgressNav(){
  document.querySelectorAll('.nav').forEach(nav=>{if(nav.querySelector('[data-progress-nav]'))return;const a=document.createElement('a');a.href=progressHref();a.textContent='學習紀錄';a.dataset.progressNav='';nav.appendChild(a)});
}
function latestAttempt(s){return Object.entries(s.attempts).sort((a,b)=>String(b[1].updatedAt||'').localeCompare(String(a[1].updatedAt||'')))[0]}
function renderProgressPage(){
  const root=document.querySelector('[data-progress-page]');if(!root)return;
  const s=getState();const valid=new Set(LESSONS.map(x=>x[0]));const doneCount=s.done.filter(x=>valid.has(x)).length;const latest=latestAttempt(s);
  const reviewCount=s.logs.filter(x=>['🔴 完全不懂','🟠 聽過但分不清'].includes(x.confidence)).length;
  document.querySelector('[data-stat-done]').textContent=`${doneCount}／40`;
  document.querySelector('[data-stat-score]').textContent=latest?`${latest[1].score}／${latest[1].total}`:'尚無';
  document.querySelector('[data-stat-review]').textContent=String(reviewCount);
  const select=document.getElementById('lessonSelect');
  if(select&&!select.options.length){LESSONS.forEach(([id,title])=>{const o=document.createElement('option');o.value=id;o.textContent=`Day ${lessonNumber(id)}｜${title}`;select.appendChild(o)})}
  const requested=new URLSearchParams(location.search).get('lesson');if(requested&&valid.has(requested))select.value=requested;
  const date=document.getElementById('logDate');if(date&&!date.value)date.value=todayLocal();
  fillAttemptFields(select?.value);
  select?.addEventListener('change',()=>fillAttemptFields(select.value));
  renderCourseRows(s);renderLogs(s);
}
function fillAttemptFields(id){
  const a=getState().attempts[id];const score=document.getElementById('logScore');const total=document.getElementById('logTotal');
  if(score)score.value=a?.score??'';if(total)total.value=a?.total??'';
}
function renderCourseRows(s){
  const box=document.getElementById('progressLessonList');if(!box)return;box.replaceChildren();
  LESSONS.forEach(([id,title])=>{
    const row=document.createElement('a');row.className='progress-course-row';row.href=lessonHref(id);
    const day=document.createElement('span');day.className='progress-day';day.textContent=`D${String(lessonNumber(id)).padStart(2,'0')}`;
    const text=document.createElement('div');const b=document.createElement('b');b.textContent=title;const small=document.createElement('small');
    const attempt=s.attempts[id];small.textContent=attempt?`最近測驗 ${attempt.score}／${attempt.total}・${attempt.date}`:'尚無測驗紀錄';text.append(b,small);
    const state=document.createElement('em');state.textContent=s.done.includes(id)?'已完成':'未完成';state.className=s.done.includes(id)?'done':'';
    row.append(day,text,state);box.appendChild(row);
  });
}
function renderLogs(s){
  const box=document.getElementById('localLogList');if(!box)return;box.replaceChildren();
  if(!s.logs.length){const p=document.createElement('p');p.className='empty-note';p.textContent='尚無學習反思。完成一課後，填寫弱點名詞與一句記憶即可。';box.appendChild(p);return}
  [...s.logs].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).forEach(log=>{
    const card=document.createElement('article');card.className='log-card';
    const top=document.createElement('div');const h=document.createElement('h3');h.textContent=`${log.date}｜Day ${lessonNumber(log.lesson)}｜${lessonTitle(log.lesson)}`;const tag=document.createElement('span');tag.textContent=log.confidence;top.append(h,tag);
    const score=log.score!==''&&log.total!==''?`測驗：${log.score}／${log.total}`:'測驗：未填';
    const body=document.createElement('p');body.textContent=`${score}｜弱點：${log.weakness||'未填'}｜記憶句：${log.memory||'未填'}｜下一步：${log.next||'未填'}`;
    card.append(top,body);box.appendChild(card);
  });
}
function bindStudyLogForm(){
  const form=document.getElementById('studyLogForm');if(!form)return;
  form.addEventListener('submit',e=>{
    e.preventDefault();const fd=new FormData(form);const s=getState();const lesson=String(fd.get('lesson'));
    const log={
      id:`${fd.get('date')}-${lesson}`,
      date:String(fd.get('date')),lesson,status:String(fd.get('status')),confidence:String(fd.get('confidence')),
      score:String(fd.get('score')??''),total:String(fd.get('total')??''),weakness:String(fd.get('weakness')??'').trim(),
      memory:String(fd.get('memory')??'').trim(),next:String(fd.get('next')??'').trim(),updatedAt:new Date().toISOString()
    };
    const i=s.logs.findIndex(x=>x.id===log.id);if(i>=0)s.logs[i]=log;else s.logs.push(log);
    if(log.status==='已完成'&&!s.done.includes(lesson))s.done.push(lesson);
    if(log.score!==''&&log.total!=='')s.attempts[lesson]={score:Number(log.score),total:Number(log.total),answered:Number(log.total),date:log.date,updatedAt:log.updatedAt};
    saveState(s);updateProgress();renderProgressPage();showToast('學習紀錄已保存在這個瀏覽器。','產生摘要','#summary');
  });
}
function latestLogForLesson(id){return getState().logs.filter(x=>x.lesson===id).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]}
function buildSummary(){
  const id=document.getElementById('lessonSelect')?.value||'day36';const s=getState();const log=latestLogForLesson(id);const a=s.attempts[id];
  const lines=[`iPAS 學習紀錄｜${todayLocal()}`,`Day ${lessonNumber(id)}｜${lessonTitle(id)}`,`狀態：${s.done.includes(id)?'已完成':'學習中'}`];
  if(a)lines.push(`測驗：${a.score}／${a.total}`);
  if(log){lines.push(`信心：${log.confidence}`,`弱點名詞：${log.weakness||'未填'}`,`一句記憶：${log.memory||'未填'}`,`下一步：${log.next||'未填'}`)}
  lines.push('請更新私人 Notion 學習進度與弱點紀錄。');return lines.join('\n');
}
async function copySummary(){
  const text=buildSummary();const out=document.getElementById('summaryOutput');if(out){out.value=text;out.hidden=false}
  try{await navigator.clipboard.writeText(text);showToast('學習摘要已複製。')}catch(e){out?.select();showToast('摘要已產生，請手動複製。')}
}
function exportProgress(){
  const data=JSON.stringify(getState(),null,2);const blob=new Blob([data],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ipas-study-progress-${todayLocal()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importProgress(file){
  if(!file)return;const r=new FileReader();r.onload=()=>{try{const parsed=normalizeState(JSON.parse(String(r.result)));saveState(parsed);updateProgress();renderProgressPage();showToast('備份已匯入。')}catch(e){showToast('無法匯入：檔案格式不正確。')}};r.readAsText(file);
}

document.addEventListener('DOMContentLoaded',()=>{
  addProgressNav();updateProgress();document.querySelectorAll('[data-complete]').forEach(b=>paintDone(b.dataset.complete,b));
  const q=document.getElementById('lessonSearch');if(q)q.addEventListener('input',()=>{const v=q.value.trim().toLowerCase();document.querySelectorAll('.lesson-card').forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(v))});
  renderProgressPage();bindStudyLogForm();
  document.getElementById('copySummary')?.addEventListener('click',copySummary);
  document.getElementById('exportProgress')?.addEventListener('click',exportProgress);
  document.getElementById('importProgress')?.addEventListener('change',e=>importProgress(e.target.files?.[0]));
});
