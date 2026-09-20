'use strict';
// UI prototype only: all admin content and learner progress is local demo data.
// Web preview runs inside a sandboxed iframe for visual prototyping; production additionally needs a separate origin and validated CSP.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const toast = (message) => { const el = $('#toast'); el.textContent=message; el.hidden=false; clearTimeout(toast.timer); toast.timer=setTimeout(()=>{el.hidden=true;},4200); };
const adminTabButtons = $$('[data-admin-tab]');
function showView(view) {
  for (const section of $$('.view')) {const active=section.id===`view-${view}`;section.classList.toggle('is-visible',active);section.hidden=!active;}
  for (const button of $$('[data-view]')) {const active=button.dataset.view===view;button.classList.toggle('is-active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
  $('#topbar-title').textContent=view==='admin'?'Admin Studio':'Learning Workspace';
  window.scrollTo({top:0,behavior:'instant'});
}
$$('[data-view]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
function showAdminTab(name, focus=false){
  adminTabButtons.forEach(button=>{const active=button.dataset.adminTab===name;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();});
  $$('.tab-panel').forEach(panel=>{const active=panel.id===`admin-panel-${name}`;panel.classList.toggle('active',active);panel.hidden=!active;});
}
adminTabButtons.forEach((button,i)=>{button.addEventListener('click',()=>showAdminTab(button.dataset.adminTab));button.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?adminTabButtons.length-1:(i+(event.key==='ArrowRight'?1:-1)+adminTabButtons.length)%adminTabButtons.length;showAdminTab(adminTabButtons[next].dataset.adminTab,true);});});
$$('[data-open-author]').forEach(button=>button.addEventListener('click',()=>showAdminTab('author',true)));
const contentTools={lesson:['Content Editor','Video Player','Quiz','Quick Practice','Checklist'],interactive:['Script Editor','Scene Templates','Timeline','Quiz','Coding checkpoint'],video:['Script Editor','VieNeu-TTS','Motion Canvas','Subtitle'],document:['Document Editor','Table','Image','Worksheet template'],slides:['Slide Editor','Theme','Speaker Notes'],assessment:['Question Builder','Checklist','Rubric'],project:['Template Files','Local Setup','Submission Guide']};
function renderAuthorTools(){const tools=contentTools[$('#content-type').value]||[];$('#author-tools').replaceChildren(...tools.map(name=>{const span=document.createElement('span');span.className='chip chip-green';span.textContent=name;return span;}));}
$('#content-type').addEventListener('change',renderAuthorTools);renderAuthorTools();
$('#author-preview').addEventListener('click',()=>{const config={prototype:true,contentType:$('#content-type').value,title:$('#lesson-name').value.trim(),objective:$('#lesson-goal').value.trim(),tools:contentTools[$('#content-type').value]};$('#author-config').textContent=JSON.stringify(config,null,2);toast('Đã tạo cấu hình demo. Chưa lưu lên server.');});
$('#author-reset').addEventListener('click',()=>{$('#content-type').value='lesson';$('#lesson-name').value='Lệnh print() trong Python';$('#lesson-goal').value='Học sinh viết và chạy được chương trình in ra màn hình.';$('#author-config').textContent='Chọn “Xem cấu hình” để hiển thị JSON.';renderAuthorTools();});
$('#download-manifest').addEventListener('click',()=>{const outputs=[];if($('#format-web').checked)outputs.push('interactive-web');if($('#format-mp4').checked)outputs.push('mp4');if(!outputs.length){toast('Hãy chọn ít nhất một định dạng.');return;}const manifest={prototype:true,status:'planned-not-published',contentRevision:'demo-rev',outputs,mp4Adaptation:$('#mp4-mode').value,preflight:'not-run'};const blob=new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='demo-publishing-manifest.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Đã tải manifest mẫu, không phải bản xuất video.');});
// Learner progress is in memory to prove UI states; no server persistence.
const state={read:false,quiz:false,webRun:false,runtime:'python',activeFile:'main.py',files:{python:{'main.py':'print("Xin chào Python!")'},web:{'index.html':'<h1 id="title">Xin chào!</h1>\n<button id="change">Đổi tiêu đề</button>','style.css':'body { font-family: Arial, sans-serif; padding: 24px; }\nh1 { color: #047857; }','script.js':'document.querySelector("#change").addEventListener("click", () => { document.querySelector("#title").textContent = "Đã thay đổi!"; });'}}};
const initial=JSON.parse(JSON.stringify(state.files));
function refreshProgress(){const done=Number(state.read)+Number(state.quiz)+Number(state.webRun);$('#progress-count').textContent=`${done}/3`;$('#progress-fill').style.width=`${Math.round(done/3*100)}%`;$('#check-quiz-status').checked=state.quiz;$('#check-run').checked=state.webRun;}
$('#check-read').addEventListener('change',(event)=>{state.read=event.target.checked;refreshProgress();});
$('#check-quiz-status').checked=false;$('#check-run').checked=false;
$('#check-quiz-status').disabled=true;$('#check-run').disabled=true;

const quizAction=document.querySelector('button#check-quiz');
if(quizAction){quizAction.addEventListener('click',()=>{const selected=document.querySelector('input[name="quiz"]:checked');const feedback=$('#quiz-feedback');if(!selected){feedback.textContent='Hãy chọn một đáp án trước.';feedback.className='feedback bad';return;}state.quiz=selected.value==='print';feedback.textContent=state.quiz?'Chính xác! print() hiển thị kết quả.':'Chưa đúng. Hãy quan sát ví dụ print() phía trên.';feedback.className=`feedback ${state.quiz?'ok':'bad'}`;refreshProgress();});}
$('#local-practice').addEventListener('click',()=>toast('Local Practice sẽ cung cấp ZIP và hướng dẫn ở Slice 5. Demo chưa có ZIP để tải.'));
const editor=$('#code-input');
function storeActive(){state.files[state.runtime][state.activeFile]=editor.value;}
function renderFiles(){const container=$('#file-tabs');container.replaceChildren(...Object.keys(state.files[state.runtime]).map(name=>{const btn=document.createElement('button');btn.type='button';btn.role='tab';btn.textContent=name;btn.className=name===state.activeFile?'active':'';btn.setAttribute('aria-selected',String(name===state.activeFile));btn.addEventListener('click',()=>{storeActive();state.activeFile=name;renderFiles();});return btn;}));editor.value=state.files[state.runtime][state.activeFile];const isPython=state.runtime==='python';$('#preview-heading').textContent=isPython?'Console Output':'Live Preview';$('#preview-badge').textContent=isPython?'Python':'Web';$('#python-preview').hidden=!isPython;$('#web-preview').hidden=isPython;$('#run-status').textContent='Chưa chạy';}
$('#runtime').addEventListener('change',(event)=>{storeActive();state.runtime=event.target.value;state.activeFile=state.runtime==='python'?'main.py':'index.html';renderFiles();});
editor.addEventListener('input',()=>{state.files[state.runtime][state.activeFile]=editor.value;$('#run-status').textContent='Đã sửa (demo, chưa lưu)';});
$('#reset-code').addEventListener('click',()=>{if(!window.confirm('Khôi phục mã mẫu của môi trường hiện tại? Nội dung đã sửa trong prototype sẽ mất.'))return;state.files[state.runtime]=JSON.parse(JSON.stringify(initial[state.runtime]));state.activeFile=state.runtime==='python'?'main.py':'index.html';renderFiles();toast('Đã khôi phục mã mẫu trong bộ nhớ demo.');});
$('#run-code').addEventListener('click',()=>{storeActive();if(state.runtime==='python'){$('#python-preview').textContent='Chưa có Pyodide trong UI prototype. Slice 3 sẽ triển khai Worker Python thật, không hiển thị kết quả giả.';$('#run-status').textContent='Python runtime chưa tích hợp';return;}const f=state.files.web;const safeScript=f['script.js'].replace(/<\/script/gi,'<\\/script');const html=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'"><style>${f['style.css']}</style></head><body>${f['index.html']}<script>${safeScript}<\/script></body></html>`;$('#web-preview').srcdoc=html;$('#run-status').textContent='Web preview đã chạy (demo)';state.webRun=true;refreshProgress();});
renderFiles();refreshProgress();
