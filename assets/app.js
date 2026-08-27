
const STORE='ipas-concept-study-v1';
function getState(){try{return JSON.parse(localStorage.getItem(STORE))||{done:[]}}catch(e){return{done:[]}}}
function saveState(s){localStorage.setItem(STORE,JSON.stringify(s))}
function isDone(id){return getState().done.includes(id)}
function toggleDone(id,btn){const s=getState(); const i=s.done.indexOf(id); if(i>=0)s.done.splice(i,1);else s.done.push(id);saveState(s);paintDone(id,btn);updateProgress()}
function paintDone(id,btn){if(!btn)return;const d=isDone(id);btn.textContent=d?'已完成｜點擊取消':'標記這課已完成';btn.classList.toggle('done',d)}
function updateProgress(){const s=getState();const n=s.done.length;document.querySelectorAll('[data-progress-text]').forEach(e=>e.textContent=`${n}／35 課`);document.querySelectorAll('[data-progress-bar]').forEach(e=>e.style.width=`${Math.min(100,n/35*100)}%`);document.querySelectorAll('[data-lesson-id]').forEach(e=>{if(s.done.includes(e.dataset.lessonId))e.querySelector('.state')?.replaceChildren(document.createTextNode('已完成'))})}
function gradeQuiz(answers){let score=0;Object.entries(answers).forEach(([name,info])=>{const picked=document.querySelector(`input[name="${name}"]:checked`);const box=document.getElementById(`f-${name}`);if(!picked){box.className='feedback show bad';box.textContent='這題尚未作答。';return}const ok=picked.value===info.answer;if(ok)score++;box.className=`feedback show ${ok?'good':'bad'}`;box.textContent=`${ok?'答對了。':'再想一次。'} ${info.explain}`});const out=document.getElementById('score');out.textContent=`本次 ${score}／${Object.keys(answers).length} 題`;out.scrollIntoView({behavior:'smooth',block:'center'})}
document.addEventListener('DOMContentLoaded',()=>{updateProgress();document.querySelectorAll('[data-complete]').forEach(b=>paintDone(b.dataset.complete,b));const q=document.getElementById('lessonSearch');if(q)q.addEventListener('input',()=>{const v=q.value.trim().toLowerCase();document.querySelectorAll('.lesson-card').forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(v))})});
