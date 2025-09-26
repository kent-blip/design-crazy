// URLパラメータから評価データを取得
const params = new URLSearchParams(window.location.search);
const dataParam = params.get("data");

if (!dataParam) {
  document.body.innerHTML = "<p>データが見つかりません。最初からやり直してください。</p>";
  throw new Error("no data");
}

const responsesObj = JSON.parse(decodeURIComponent(dataParam));

// Object から配列に変換しつつ totalScore を追加
const responses = Object.keys(responsesObj).map(key => {
  const idea = responsesObj[key];
  const totalScore = idea.scores.q1 + idea.scores.q2 + idea.scores.q3 + idea.scores.q4;
  return { ...idea, totalScore };
});

// 高得点順にソート
const rankedIdeas = [...responses].sort((a, b) => b.totalScore - a.totalScore);

// ---------------------------
// ランク付け（上位パーセンテージでSSS〜E）
function assignRank(score, scores) {
  const sorted = [...scores].sort((a, b) => b - a);
  const percentile = (sorted.indexOf(score) + 1) / sorted.length;
  if (percentile <= 0.05) return "SSS";
  if (percentile <= 0.15) return "SS";
  if (percentile <= 0.30) return "S";
  if (percentile <= 0.50) return "A";
  if (percentile <= 0.70) return "B";
  if (percentile <= 0.90) return "C";
  return "E";
}

const scoresArray = rankedIdeas.map(item => item.totalScore);
rankedIdeas.forEach(item => {
  item.rank = assignRank(item.totalScore, scoresArray);
});

const rankTitles = {
  "SSS": ": design crazy God 🐦‍🔥",
  "SS": ": design crazy King 👑",
  "S": ": design crazy 🏅",
  "A": ": design star 🌟",
  "B": ": design man 💡",
  "C": ": design challenger ⚔️",
  "D": ": design student 🧑‍🎓",
  "E": ": design beginner 🔰"
};

// ---------------------------
// 結果表示
const container = document.getElementById("result");
rankedIdeas.forEach((item, idx) => {
  const div = document.createElement("div");
  div.className = "idea-card rank-" + item.rank;
  div.innerHTML = `
    <h3>アイデアランキングNo. ${idx + 1} - ${item.rank} ${rankTitles[item.rank]} (スコア: ${item.totalScore})</h3>
    <p><strong>Who:</strong> ${item.text.who}</p>
    <p><strong>Where:</strong> ${item.text.where}</p>
    <p><strong>When:</strong> ${item.text.when}</p>
    <p><strong>What:</strong> ${item.text.what}</p>
    <p><strong>Why:</strong> ${item.text.why}</p>
    <p><strong>How:</strong> ${item.text.how}</p>
  `;
  container.appendChild(div);
});

// 上部にサマリー
document.querySelector(".result-summary").innerHTML =
  `<h2>評価完了！アイデアのランキング結果</h2>`;
