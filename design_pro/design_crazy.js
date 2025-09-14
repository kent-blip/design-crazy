let problems = [];
let responses = {};
let timerId;
let remainingTime = 0;

// 候補リスト
const whoBase = ["学生","会社員","親","老婆","子供","研究者","エンジニア","観光客","アスリート","教師"];
const whoAdj  = ["忙しい","緊張しがちな","話好きな","初心者の","外国の","若い","高齢の","ベテランの","クリエイティブな","シャイな"];

const whereBase = ["駅","学校","公園","キャンプ場","カフェ","病院","空港","図書館","オフィス","映画館"];
const whereAdj  = ["混雑した","静かな","遠い","近所の","未来的な","古びた","暗い","明るい","自然豊かな","高層の"];

const whenBase = ["音楽を聴いているとき","走っているとき","くつろいでいるとき","考え事をしているとき","通勤中","旅行中","買い物中","勉強中","食事中","休憩中"];
const whenAdj  = ["急いで","ゆったりと","真剣に","ふざけて","眠そうに","元気いっぱい","緊張して","リラックスして","集中して","楽しそうに"];

// what の部品
const objects = ["サービス内容を","バージョンを","プロジェクトを","メモを","位置情報を","健康データを","環境情報を","ユーザープロフィールを","スケジュールを","購買履歴を"];
const actions = [
  "温かくする技術またはデータ",
  "拡大する技術またはデータ",
  "記録する技術またはデータ",
  "議論する技術またはデータ",
  "強化する技術またはデータ",
  "共有する技術またはデータ",
  "最適化する技術またはデータ",
  "保護する技術またはデータ",
  "可視化する技術またはデータ",
  "分析する技術またはデータ"
];

function startTest(){
  const n = parseInt(document.getElementById('numProblems').value,10);
  const minutes = parseInt(document.getElementById('timeLimit').value,10);

  problems = [];
  for(let i=0;i<n;i++){
    // adjはランダム1つ
    const whoAdjPicked = whoAdj[Math.floor(Math.random()*whoAdj.length)];
    const whereAdjPicked = whereAdj[Math.floor(Math.random()*whereAdj.length)];
    const whenAdjPicked = whenAdj[Math.floor(Math.random()*whenAdj.length)];

    // 名詞候補は5つランダム
    const whoOptions = pickRandomOptions(whoBase, 5);
    const whereOptions = pickRandomOptions(whereBase, 5);
    const whenOptions = pickRandomOptions(whenBase, 5);

    // what候補（オブジェクト＋アクションで5つ）
    const whatOptions = generateWhatOptions(5);

    problems.push({
      id:i+1,
      whoAdj: whoAdjPicked,
      whereAdj: whereAdjPicked,
      whenAdj: whenAdjPicked,
      whoOptions,
      whereOptions,
      whenOptions,
      whatOptions,
      who:'', where:'', when:'', why:'', what:'', how:'',
      whatObject:'', whatAction:'' 
    });
  }

  responses = {problems: problems.map(p=>({...p}))};

  renderProblems();

  remainingTime = minutes*60;
  startTimer();

  document.getElementById('setupPanel').classList.add('hidden');
  document.getElementById('testPanel').classList.remove('hidden');
}

function generateWhatOptions(count) {
  const options = [];
  for (let i = 0; i < count; i++) {
    const obj = objects[Math.floor(Math.random() * objects.length)];
    const act = actions[Math.floor(Math.random() * actions.length)];
    options.push(obj + act);
  }
  return options;
}

function pickRandomOptions(baseList, count){
  const shuffled = [...baseList].sort(()=>Math.random()-0.5);
  return shuffled.slice(0,count);
}

function renderSelect(id, key, options, adj){
  return `
    <select onchange="updateResponse(${id}, '${key}', this.value, '${adj}')">
      <option value="">--選択してください--</option>
      ${options.map(o=>`<option value="${o}">${o}</option>`).join('')}
    </select>
  `;
}

function renderProblems(){
  const container = document.getElementById('problemsContainer');
  container.innerHTML = '';
  problems.forEach(p=>{
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>問題${p.id}</h3>
      <p><b>Who修飾:</b> ${p.whoAdj}</p>
      <p><b>Who候補:</b> ${renderSelect(p.id, 'who', p.whoOptions, p.whoAdj)}</p>
      <p><b>Where修飾:</b> ${p.whereAdj}</p>
      <p><b>Where候補:</b> ${renderSelect(p.id, 'where', p.whereOptions, p.whereAdj)}</p>
      <p><b>When修飾:</b> ${p.whenAdj}</p>
      <p><b>When候補:</b> ${renderSelect(p.id, 'when', p.whenOptions, p.whenAdj)}</p>

      <p><b>What:</b><br>
        ${renderObjectSelect(p.id)}
        ${renderActionSelect(p.id)}
      </p>

      <label>Why: <input type="text" oninput="updateResponse(${p.id}, 'why', this.value)"></label><br>
      <label>How: <input type="text" oninput="updateResponse(${p.id}, 'how', this.value)"></label><br>
    `;
    container.appendChild(div);
  });
}

function renderObjectSelect(id){
  return `
    <select onchange="updateResponse(${id}, 'whatObject', this.value)">
      <option value="">--対象を選択--</option>
      ${objects.map(o=>`<option value="${o}">${o}</option>`).join('')}
    </select>
  `;
}

function renderActionSelect(id){
  return `
    <select onchange="updateResponse(${id}, 'whatAction', this.value)">
      <option value="">--技術/データを選択--</option>
      ${actions.map(a=>`<option value="${a}">${a}</option>`).join('')}
    </select>
  `;
}

function updateResponse(id, key, value, adj){
  const p = responses.problems.find(pr=>pr.id===id);
  if(p) {
    if(key === "who" || key === "where" || key === "when"){
      p[key] = value ? `${adj} ${value}` : "";
    } else if(key === "whatObject" || key === "whatAction"){
      p[key] = value;
      p.what = (p.whatObject || "") + (p.whatAction || "");
    } else {
      p[key] = value;
    }
  }
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

  const shouldDownload = confirm("回答をJSONファイルとしてダウンロードしますか？");
  if(shouldDownload) downloadJSON();

  problems = [];
  responses = {};
  remainingTime = 0;

  document.getElementById('problemsContainer').innerHTML = '';
  document.getElementById('timer').textContent = '';

  document.getElementById('testPanel').classList.add('hidden');
  document.getElementById('setupPanel').classList.remove('hidden');
}

function gradeResponses() {
  let score = 0, total = 0;
  responses.problems.forEach(p=>{
    ["who","where","when","why","what","how"].forEach(key=>{
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
