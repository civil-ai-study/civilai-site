/* ===== JS有効フラグ（CSSの出現アニメ用フォールバック制御） ===== */
document.documentElement.classList.add("js");

/* ===== スクロール出現アニメ ===== */
/* rootMargin で画面下端の少し手前から先行発火（速いスクロール・キャプチャツールでの未表示を低減） */
const io = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0, rootMargin: "0px 0px 20% 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 6 * 0.04) + "s"; io.observe(el); });
/* フェイルセーフ：読み込み完了2.5秒後に未出現の要素をすべて表示（フルページキャプチャ・
   特殊ビューポート・IO不発でも本文が非表示のまま残らない保証。通常閲覧の初画面アニメは維持） */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => { el.style.transitionDelay = "0s"; el.classList.add("in"); });
  }, 2500);
});

/* ===== 30秒で選ぶツール制御 ===== */
function runQuiz(choice) {
  const resultDiv = document.getElementById("quizResult");
  const resultName = document.getElementById("quizResultName");
  const resultDesc = document.getElementById("quizResultDesc");
  const resultMore = document.getElementById("quizResultMore");
  const resultLink = document.getElementById("quizResultLink");

  if (!resultDiv || !resultName || !resultDesc || !resultLink) return;

  let name = "";
  let desc = "";
  let linkHref = "";
  let moreHtml = "";

  // 3つの結果に共通で追加する1行（道筋Step2の2記事・NAOKI確定対応表）
  const commonMore = '頼み方のコツ → <a href="#art-tanomikata">note07</a>／答えの確かめ方 → <a href="#art-tashikamekata">note08</a>';
  // 記事公開前でも「今日この場で動ける」最小手順（自己完結・空振り防止）
  let steps = "";

  switch(choice) {
    case 'notebooklm':
      name = "NotebookLM（即日導入）";
      desc = "アップロードした手元の設計図書（特記仕様書・図面・技術基準PDF等）のみを根拠に、出典付きで質問・要約ができます。AIの再学習に使用しない方針が明示されているため、社外秘の資料も扱えます。プログラミング不要で、今日から使い始められます（※本格利用には有料プランを推奨）。";
      linkHref = "#art-notebooklm";
      steps = '<strong>今すぐの3手：</strong>① NotebookLM を開く（無料）→ ② 手元の資料（報告書・基準のPDF）を1つ読み込む → ③「この資料の要点を3つ、出典つきで教えて」と聞く。';
      moreHtml = steps + '<br>→ 手順の詳しい記事はこちら（<a href="#art-notebooklm">note06：NotebookLMで社内資料を"専属アシスタント"に</a>）<br>' + commonMore;
      break;
    case 'claude':
      name = "Claude プロジェクト / ChatGPT（業務の分身）";
      desc = "報告書の構成テンプレートや、過去の類似設計報告書・技術提案書を覚えさせた「分身」を構築できます。高度な専門文書の執筆や、ドラフトの作成・文章推敲において強い右腕になります。";
      linkHref = "#art-claude";
      steps = '<strong>今すぐの3手：</strong>① ChatGPT か Claude を開く → ② 過去の報告書を1本貼る（機密は伏せる）→ ③「これを参考に、○○の構成案をつくって」と頼む。';
      moreHtml = steps + '<br>→ 手順の詳しい記事はこちら（<a href="#art-claude">note10：Claudeで"業務の分身"を育てる</a>）<br>' + commonMore;
      break;
    case 'filesearch':
      name = "Gemini File Search（ほぼ無料・自前で構築）";
      desc = "業者が売る\"専用システム\"の中身を、ほぼ無料で自前に。資料の取り込み・検索を自動で行います。コードが書ける方向けです。";
      linkHref = "#art-filesearch";
      steps = '<strong>まず確かめる3点：</strong>① 少しのプログラム（API）が使える環境か → ② 検索させたい資料が手元にあるか → ③ まずは NotebookLM で足りないかを先に試す。';
      moreHtml = steps + '<br>→ 手順の詳しい記事はこちら（<a href="#art-filesearch">note13：Gemini File Searchで自社資料AIをほぼ無料に</a>）<br>' + commonMore;
      break;
    default:
      return;
  }

  resultName.textContent = name;
  resultDesc.textContent = desc;
  if (resultMore) resultMore.innerHTML = moreHtml;
  resultLink.setAttribute("href", linkHref);

  // 診断結果を表示
  resultDiv.style.display = "block";

  // 診断結果へスムーズスクロール
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
window.runQuiz = runQuiz;

/* ===== コピペ例文カードのコピーボタン（hajimete） ===== */
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".copy-card");
    const textEl = card ? card.querySelector(".copy-text") : null;
    if (!textEl) return;
    const text = textEl.textContent.trim();

    const showDone = () => {
      const original = btn.textContent;
      btn.textContent = "コピーしました";
      btn.disabled = true;
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1600);
    };

    const fallbackCopy = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* 非対応環境では手動コピー */ }
      document.body.removeChild(ta);
      showDone();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showDone).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
});

/* ===== ページ内アンカーが開閉カード（details）を指す場合は自動で開く ===== */
function openDetailsForHash(hash) {
  if (!hash || hash.length < 2) return;
  let target;
  try { target = document.querySelector(hash); } catch (e) { return; }
  if (!target) return;
  const details = target.closest ? (target.tagName === "DETAILS" ? target : target.closest("details")) : null;
  if (details) details.open = true;
}
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (a) openDetailsForHash(a.getAttribute("href"));
});
if (location.hash) openDetailsForHash(location.hash);

/* ===== モバイル用ハンバーガーメニューの開閉 ===== */
(function () {
  const btn = document.querySelector(".nav-toggle");
  const menu = document.getElementById("navMenu");
  if (!btn || !menu) return;
  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  };
  btn.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
  // メニュー内リンクをタップしたら閉じる
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  // Escキーで閉じる
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
})();

/* ===== 追従目次（keiei/genba）：現在地表示（IntersectionObserver） ===== */
(function () {
  const tocLinks = document.querySelectorAll(".toc-link");
  if (!tocLinks.length) return;
  const map = new Map();
  tocLinks.forEach((a) => map.set(a.getAttribute("href").slice(1), a));
  const tocIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        tocLinks.forEach((a) => a.removeAttribute("aria-current"));
        const cur = map.get(e.target.id);
        if (cur) cur.setAttribute("aria-current", "true");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
  document.querySelectorAll(".doc-main section[id]").forEach((s) => tocIo.observe(s));
})();
