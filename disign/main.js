let problems = [];
let responses = {};
let timerId;
let remainingTime = 0;

function startTest(){
  const n = parseInt(document.getElementById('numProblems').value,10);
  const minutes = parseInt(document.getElementById('timeLimit').value,10);

  const whoBase = document.getElementById('whoInput').value.split(',').map(s=>s.trim()).filter(Boolean);
  const whoAdj = document.getElementById('whoAdj').value.split(',').map(s=>s.trim()).filter(Boolean);
  const whereBase = document.getElementById('whereInput').value.split(',').map(s=>s.trim()).filter(Boolean);
  const whereAdj = document.getElementById('whereAdj').value.split(',').map(s=>s.trim()).filter(Boolean);
  const whenBase = document.getElementById('whenInput').value.split(',').map(s=>s.trim()).filter(Boolean);
  const whenAdj = document.getElementById('whenAdj').value.split(',').map(s=>s.trim()).filter(Boolean);

  problems = [];
  for(let i=0;i<n;i++){
    const who = (whoAdj.length>0 ? whoAdj[Math.floor(Math.random()*whoAdj.length)]+' ' : '') + (whoBase[Math.floor(Math.random()*whoBase.length)] || '');
    const where = (whereAdj.length>0 ? whereAdj[Math.floor(Math.random()*whereAdj.length)]+' ' : '') + (whereBase[Math.floor(Math.random()*whereBase.length)] || '');
    const when = (whenAdj.length>0 ? whenAdj[Math.floor(Math.random()*whenAdj.length)]+' ' : '') + (whenBase[Math.floor(Math.random()*whenBase.length)] || '');

    problems.push({id:i+1, who, where, when, why:'', what:'', how:''});
  }
  responses = {problems: problems.map(p=>({...p}))};

  renderProblems();

  remainingTime = minutes*60;
  startTimer();

  document.getElementById('setupPanel').classList.add('hidden');
  document.getElementById('testPanel').classList.remove('hidden');
}

function renderProblems(){
  const container = document.getElementById('problemsContainer');
  container.innerHTML = '';
  problems.forEach(p=>{
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>問題${p.id}</h3>
      <p>Who: ${p.who} / Where: ${p.where} / When: ${p.when}</p>
      <label>Why: <input type="text" oninput="updateResponse(${p.id}, 'why', this.value)"></label><br>
      <label>What: <input type="text" oninput="updateResponse(${p.id}, 'what', this.value)"></label><br>
      <label>How: <input type="text" oninput="updateResponse(${p.id}, 'how', this.value)"></label><br>
    `;
    container.appendChild(div);
  });
}

function updateResponse(id, key, value){
  const p = responses.problems.find(pr=>pr.id===id);
  if(p) p[key] = value;
}

function startTimer(){
  const timerEl = document.getElementById('timer');
  timerId = setInterval(()=>{
    remainingTime--;
    const m = Math.floor(remainingTime/60);
    const s = remainingTime%60;
    timerEl.textContent = `残り時間: ${m}:${s.toString().padStart(2,'0')}`;

    if(remainingTime<=0){
      finishTest();
    }
  },1000);
}

function finishTest(){
  clearInterval(timerId);
  console.log("回答結果:", responses);

  const {score, total} = gradeResponses();
  alert(`テスト終了！スコア: ${score}/${total}`);

  // JSONを自動ダウンロード
  downloadJSON();
}

function gradeResponses() {
  let score = 0;
  let total = 0;
  responses.problems.forEach(p=>{
    ["why","what","how"].forEach(key=>{
      total++;
      if(p[key] && p[key].trim() !== "") score++;
    });
  });
  return {score, total};
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(responses, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "responses.json";
  a.click();
  URL.revokeObjectURL(url);
}
