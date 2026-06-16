document.addEventListener('DOMContentLoaded', () => {
  // --- State Management ---
  let currentCategory = 'kansei';
  let currentGameMode = 'practice';
  let currentProblem = null;
  let selectedFormat = 'none'; // Dynamically used per category
  let selectedChoice = null;   // For graph matching (0, 1, 2, 3)
  let isGameOver = false;

  // Game Mode Stats
  let practiceStreak = 0;
  let taStartTime = 0;
  let taQuestionsDone = 0;
  let taTimerInterval = null;
  let svHp = 3;
  let saScore = 0;
  let saTimeLeft = 60;
  let saCombo = 0;
  let saTimerInterval = null;

  // --- DOM Elements ---
  const appHeader = document.getElementById('app-header');
  const backBtn = document.getElementById('back-btn');
  const headerTitle = document.getElementById('header-title');

  const titleScreen = document.getElementById('title-screen');
  const tutorialSelectScreen = document.getElementById('tutorial-select-screen');
  const tutorialScreen = document.getElementById('tutorial-screen');
  const categorySelectScreen = document.getElementById('category-select-screen');
  const modeSelectScreen = document.getElementById('mode-select-screen');
  const introScreen = document.getElementById('intro-screen');
  const problemArea = document.getElementById('problem-area');

  // Screen Nav Buttons
  const goToTutorialBtn = document.getElementById('go-to-tutorial-btn');
  const goToTrainingBtn = document.getElementById('go-to-training-btn');
  const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
  const tutorialNextBtn = document.getElementById('tutorial-next-btn');
  const startGameBtn = document.getElementById('start-game-btn');
  const judgeBtn = document.getElementById('judge-btn');

  // Tutorial
  const tutorialTitle = document.getElementById('tutorial-title');
  const tutorialContent = document.getElementById('tutorial-content');
  const slideIndicator = document.getElementById('slide-indicator');

  // Intro Screen Dynamic content
  const introCatName = document.getElementById('intro-cat-name');
  const introCatDesc = document.getElementById('intro-cat-desc');
  const introModeName = document.getElementById('intro-mode-name');
  const introModeDesc = document.getElementById('intro-mode-desc');

  // Game Area
  const statsLeft = document.getElementById('stats-left');
  const statsRight = document.getElementById('stats-right');
  const problemPrompt = document.getElementById('problem-prompt');
  const equationDisplay = document.getElementById('equation-display');
  const feedbackToast = document.getElementById('feedback-toast');

  // Input Rows (Category specific)
  const inputRowKansei = document.getElementById('input-row-kansei');
  const inputRowMinmax = document.getElementById('input-row-minmax');
  const inputRowEquation = document.getElementById('input-row-equation');
  const inputRowInequality = document.getElementById('input-row-inequality');
  const inputRowMatching = document.getElementById('input-row-matching');

  // --- Fraction Toggle Implementation ---
  document.querySelectorAll('.toggle-frac-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const integerInput = document.getElementById(`input-${target}`);
      const fractionWrapper = document.getElementById(`frac-${target}`);
      
      if (fractionWrapper.classList.contains('hidden')) {
        fractionWrapper.classList.remove('hidden');
        integerInput.classList.add('hidden');
        btn.classList.add('active');
        btn.textContent = '整数';
      } else {
        fractionWrapper.classList.add('hidden');
        integerInput.classList.remove('hidden');
        btn.classList.remove('active');
        btn.textContent = '分数';
      }
    });
  });

  // Helper function to reset a hybrid input to integer view
  function resetHybridInput(target) {
    const integerInput = document.getElementById(`input-${target}`);
    const fractionWrapper = document.getElementById(`frac-${target}`);
    const btn = document.querySelector(`.toggle-frac-btn[data-target="${target}"]`);
    
    if (integerInput && fractionWrapper && btn) {
      integerInput.classList.remove('hidden');
      integerInput.value = '';
      fractionWrapper.classList.add('hidden');
      const numInput = fractionWrapper.querySelector('.num-input');
      const denInput = fractionWrapper.querySelector('.den-input');
      if (numInput) numInput.value = '';
      if (denInput) denInput.value = '';
      btn.classList.remove('active');
      btn.textContent = '分数';
    }
  }

  // --- Tutorial Database ---
  const tutorials = {
    kansei: {
      title: "平方完成のコツ",
      slides: [
        `
        <div class="tutorial-slide">
          <p>平方完成とは、一般の2次関数 <span class="math">y = ax^2 + bx + c</span> を、頂点がひと目でわかる形 <span class="math">y = a(x - p)^2 + q</span> に変形する操作です。</p>
          <div class="visual-box">
            <div class="math">y = x^2 - 6x + 10</div>
            <p style="font-size:12px; color:var(--apple-text-secondary);">↓ <span class="math">x</span> の係数の「半分」の2乗を作る</p>
            <div class="math">y = (x - 3)^2 - 9 + 10</div>
            <div class="math">y = (x - 3)^2 + 1</div>
          </div>
          <p>この変形により、グラフの頂点が <span class="math">(3, 1)</span>、軸が <span class="math">x = 3</span> であることが分かります。</p>
        </div>
        `,
        `
        <div class="tutorial-slide">
          <p class="warning">⚠️ 注意点：<span class="math">x^2</span> の係数が <span class="math">1</span> 以外のとき</p>
          <p><span class="math">x^2</span> の係数 <span class="math">a</span> で、まず <span class="math">x</span> の項までを括り出してから平方完成を行います。</p>
          <div class="visual-box">
            <div class="math">y = 2x^2 + 8x + 5</div>
            <p style="font-size:12px; color:var(--apple-text-secondary);">↓ <span class="math">x^2</span> の係数 <span class="math">2</span> で括る</p>
            <div class="math">y = 2(x^2 + 4x) + 5</div>
            <p style="font-size:12px; color:var(--apple-text-secondary);">↓ カッコの中を平方完成（外に出すときに <span class="math">2</span> 倍する！）</p>
            <div class="math">y = 2\{(x+2)^2 - 4\} + 5</div>
            <div class="math">y = 2(x+2)^2 - 8 + 5</div>
            <div class="math">y = 2(x+2)^2 - 3</div>
          </div>
        </div>
        `
      ]
    },
    minmax: {
      title: "頂点と最大・最小",
      slides: [
        `
        <div class="tutorial-slide">
          <p>2次関数の最大値・最小値は、<span class="highlight">グラフの凸の向き</span>と<span class="highlight">頂点の位置</span>で決まります。</p>
          <div class="visual-box" style="gap:12px;">
            <p><strong>下に凸 (<span class="math">a &gt; 0</span>) のとき</strong></p>
            <p>頂点部分で <span class="highlight">最小値</span> をとる。（最大値は無限に大きくなるため、範囲がない場合は「なし」）</p>
            <p><strong>上に凸 (<span class="math">a &lt; 0</span>) のとき</strong></p>
            <p>頂点部分で <span class="highlight">最大値</span> をとる。（最小値は「なし」）</p>
          </div>
        </div>
        `,
        `
        <div class="tutorial-slide">
          <p>定義域（<span class="math">x</span> の範囲）が制限されている場合は、以下の3点のうちどこで最大・最小になるかを調べます。</p>
          <p class="highlight">① 定義域の左端の値、② 頂点での値、③ 定義域の右端の値</p>
          <div class="visual-box">
            <p>例: <span class="math">y = (x-2)^2 + 1 \\quad (0 \\leqq x \\leqq 5)</span></p>
            <p style="font-size:13px; text-align:left;">
              ・頂点 <span class="math">x=2</span> は範囲内 → 最小値は <span class="math">y=1</span> (<span class="math">x=2</span> のとき)<br>
              ・軸 <span class="math">x=2</span> から遠い方の端 <span class="math">x=5</span> で最も高くなる → 最大値は <span class="math">y=(5-2)^2+1 = 10</span> (<span class="math">x=5</span> のとき)
            </p>
          </div>
        </div>
        `
      ]
    },
    ineq: {
      title: "2次方程式と2次不等式",
      slides: [
        `
        <div class="tutorial-slide">
          <p>2次方程式 <span class="math">ax^2 + bx + c = 0</span> の実数解は、2次関数 <span class="math">y = ax^2 + bx + c</span> のグラフと <span class="highlight"><span class="math">x</span> 軸との共有点の <span class="math">x</span> 座標</span> に一致します。</p>
          <div class="visual-box">
            <p>判別式 <span class="math">D = b^2 - 4ac</span></p>
            <p style="font-size:13px; text-align:left;">
              ・<span class="math">D &gt; 0</span> : 共有点は <span class="math">2</span> 個（異なる2つの実数解）<br>
              ・<span class="math">D = 0</span> : 共点は <span class="math">1</span> 個（重解、グラフは <span class="math">x</span> 軸と接する）<br>
              ・<span class="math">D &lt; 0</span> : 共点は <span class="math">0</span> 個（実数解なし、グラフは <span class="math">x</span> 軸と交わらない）
            </p>
          </div>
        </div>
        `,
        `
        <div class="tutorial-slide">
          <p>2次不等式を解くときは、放物線を描いて <span class="highlight"><span class="math">x</span> 軸より上にあるか下にあるか</span> を視覚的に判断します。</p>
          <div class="visual-box">
            <p>例: <span class="math">x^2 - 4x + 3 &gt; 0</span></p>
            <p style="font-size:12px; color:var(--apple-text-secondary);">左辺を因数分解して交点を求める: <span class="math">(x-1)(x-3) &gt; 0</span></p>
            <p style="font-size:13px;">交点は <span class="math">x = 1, 3</span>。<span class="math">y &gt; 0</span> (<span class="math">x</span> 軸の上側) の範囲なので：</p>
            <p class="highlight" style="font-size:18px;"><span class="math">x &lt; 1, \\; 3 &lt; x</span></p>
          </div>
        </div>
        `
      ]
    }
  };

  let activeTutorial = null;
  let currentSlideIndex = 0;

  // --- Helper Functions ---
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    return b === 0 ? a : gcd(b, a % b);
  }

  function simplifyFraction(n, d) {
    if (d === 0) return { n, d };
    const common = gcd(n, d);
    let finalN = n / common;
    let finalD = d / common;
    if (finalD < 0) {
      finalN = -finalN;
      finalD = -finalD;
    }
    return { n: finalN, d: finalD };
  }

  function parseFractionInput(id) {
    const integerInput = document.getElementById(`input-${id}`);
    const fractionWrapper = document.getElementById(`frac-${id}`);
    
    if (fractionWrapper && !fractionWrapper.classList.contains('hidden')) {
      const num = parseInt(fractionWrapper.querySelector('.num-input').value);
      const den = parseInt(fractionWrapper.querySelector('.den-input').value);
      if (isNaN(num) || isNaN(den) || den === 0) return null;
      return simplifyFraction(num, den);
    } else if (integerInput) {
      const val = parseInt(integerInput.value);
      if (isNaN(val)) return null;
      return { n: val, d: 1 };
    }
    return null;
  }

  function renderMath() {
    document.querySelectorAll('.math:not(.rendered)').forEach(el => {
      katex.render(el.textContent, el, { throwOnError: false });
      el.classList.add('rendered');
    });
  }

  function hideAllScreens() {
    titleScreen.classList.add('hidden');
    tutorialSelectScreen.classList.add('hidden');
    tutorialScreen.classList.add('hidden');
    categorySelectScreen.classList.add('hidden');
    modeSelectScreen.classList.add('hidden');
    introScreen.classList.add('hidden');
    problemArea.classList.add('hidden');
    appHeader.classList.add('hidden');
  }

  // --- Screen Navigation ---
  goToTutorialBtn.addEventListener('click', () => {
    hideAllScreens();
    tutorialSelectScreen.classList.remove('hidden');
    appHeader.classList.remove('hidden');
    headerTitle.textContent = 'やり方を学ぶ';
    backBtn.textContent = '◀ 戻る';
  });

  goToTrainingBtn.addEventListener('click', () => {
    hideAllScreens();
    categorySelectScreen.classList.remove('hidden');
    appHeader.classList.remove('hidden');
    headerTitle.textContent = 'カテゴリ選択';
    backBtn.textContent = '◀ 戻る';
  });

  backBtn.addEventListener('click', () => {
    resetGameTimers();
    if (!tutorialSelectScreen.classList.contains('hidden') || !categorySelectScreen.classList.contains('hidden')) {
      hideAllScreens();
      titleScreen.classList.remove('hidden');
    } else if (!tutorialScreen.classList.contains('hidden')) {
      hideAllScreens();
      tutorialSelectScreen.classList.remove('hidden');
      appHeader.classList.remove('hidden');
      headerTitle.textContent = 'やり方を学ぶ';
      backBtn.textContent = '◀ 戻る'; // Reset label
    } else if (!modeSelectScreen.classList.contains('hidden')) {
      hideAllScreens();
      categorySelectScreen.classList.remove('hidden');
      appHeader.classList.remove('hidden');
      headerTitle.textContent = 'カテゴリ選択';
      backBtn.textContent = '◀ 戻る';
    } else if (!introScreen.classList.contains('hidden')) {
      hideAllScreens();
      modeSelectScreen.classList.remove('hidden');
      appHeader.classList.remove('hidden');
      headerTitle.textContent = 'ゲームモード選択';
      backBtn.textContent = '◀ 戻る';
    } else if (!problemArea.classList.contains('hidden')) {
      // In-game quit
      hideAllScreens();
      titleScreen.classList.remove('hidden');
    } else {
      hideAllScreens();
      titleScreen.classList.remove('hidden');
    }
  });

  // Tutorial Select & Slideshow
  document.querySelectorAll('.tutorial-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTutorial = tutorials[btn.dataset.tutorial];
      currentSlideIndex = 0;
      hideAllScreens();
      tutorialScreen.classList.remove('hidden');
      appHeader.classList.remove('hidden');
      headerTitle.textContent = '解説';
      backBtn.textContent = '◀ 閉じる'; // Specific label for exiting slideshow
      updateTutorialSlide();
    });
  });

  function updateTutorialSlide() {
    tutorialTitle.textContent = activeTutorial.title;
    tutorialContent.innerHTML = activeTutorial.slides[currentSlideIndex];
    slideIndicator.textContent = `${currentSlideIndex + 1} / ${activeTutorial.slides.length}`;
    
    tutorialPrevBtn.disabled = (currentSlideIndex === 0);
    if (currentSlideIndex === activeTutorial.slides.length - 1) {
      tutorialNextBtn.textContent = '完了';
    } else {
      tutorialNextBtn.textContent = '次へ ▶';
    }
    renderMath();
  }

  tutorialPrevBtn.addEventListener('click', () => {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateTutorialSlide();
    }
  });

  tutorialNextBtn.addEventListener('click', () => {
    if (currentSlideIndex < activeTutorial.slides.length - 1) {
      currentSlideIndex++;
      updateTutorialSlide();
    } else {
      // Finished tutorial
      hideAllScreens();
      tutorialSelectScreen.classList.remove('hidden');
      appHeader.classList.remove('hidden');
      headerTitle.textContent = 'やり方を学ぶ';
      backBtn.textContent = '◀ 戻る'; // Reset label
    }
  });

  // Category Selection
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      hideAllScreens();
      modeSelectScreen.classList.remove('hidden');
      appHeader.classList.remove('hidden');
      headerTitle.textContent = 'ゲームモード選択';
    });
  });

  // Game Mode Selection
  document.querySelectorAll('.game-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentGameMode = btn.dataset.mode;
      hideAllScreens();
      introScreen.classList.remove('hidden');
      appHeader.classList.remove('hidden');
      headerTitle.textContent = '準備';
      updateIntroDetails();
    });
  });

  function updateIntroDetails() {
    const categoriesJp = {
      kansei: '① 平方完成',
      minmax: '② 頂点と最大・最小',
      equation: '③ 2次方程式と共有点',
      inequality: '④ 2次不等式',
      matching: '⑤ グラフマッチング'
    };
    const categoriesDesc = {
      kansei: '一般形 y = ax² + bx + c の式を、平方完成した形 a(x - p)² + q に変形して係数を答えます。分数になる場合もあるので注意！',
      minmax: '2次関数の軸・頂点、または指定された定義域（範囲）における最大値・最小値とその時の x の値を解答します。',
      equation: '2次関数と x 軸の共有点の個数を答え、共有点がある場合はその x 座標（2次方程式の実数解）を求めます。',
      inequality: '2次不等式をグラフの上下関係から解きます。まず解答の形式を選んでから数値を入力します。',
      matching: '提示された2次関数の式に完全に一致する正しい放物線グラフを、4つの Canvas 描画カードから選びます。'
    };
    const modesJp = {
      practice: '練習モード',
      timeAttack: 'タイムアタック',
      survival: 'サバイバル',
      scoreAttack: 'スコアアタック'
    };
    const modesDesc = {
      practice: '制限時間なし。連続正解のストリークをできるだけ伸ばす練習用モードです。',
      timeAttack: '10問正解するまでのタイムを測定します。間違えるとペナルティタイム（+5秒）が加算されます。',
      survival: 'ライフは3つ。間違えるごとにライフが減り、0になるとゲームオーバーです。何問正解できるか挑戦！',
      scoreAttack: '制限時間は60秒。正解すると残り時間が少し増え、連続で正解するとコンボボーナスで高得点が入ります。'
    };

    introCatName.textContent = categoriesJp[currentCategory];
    introCatDesc.textContent = categoriesDesc[currentCategory];
    introModeName.textContent = modesJp[currentGameMode];
    introModeDesc.textContent = modesDesc[currentGameMode];
  }

  // Start game click
  startGameBtn.addEventListener('click', () => {
    hideAllScreens();
    problemArea.classList.remove('hidden');
    appHeader.classList.remove('hidden');
    headerTitle.textContent = 'トレーニング中';
    initGameSession();
  });

  // --- Game Session Initialization ---
  function initGameSession() {
    resetGameTimers();
    
    if (currentGameMode === 'practice') {
      practiceStreak = 0;
    } else if (currentGameMode === 'timeAttack') {
      taQuestionsDone = 0;
      taStartTime = Date.now();
      taTimerInterval = setInterval(updateStatsUI, 100);
    } else if (currentGameMode === 'survival') {
      svHp = 3;
      practiceStreak = 0;
    } else if (currentGameMode === 'scoreAttack') {
      saScore = 0;
      saTimeLeft = 60;
      saCombo = 0;
      saTimerInterval = setInterval(() => {
        if (isGameOver) return;
        saTimeLeft--;
        updateStatsUI();
        if (saTimeLeft <= 0) endGame('scoreAttack');
      }, 1000);
    }

    updateStatsUI();
    generateProblem();
  }

  function resetGameTimers() {
    if (taTimerInterval) clearInterval(taTimerInterval);
    if (saTimerInterval) clearInterval(saTimerInterval);
    isGameOver = false;
    judgeBtn.disabled = false;
  }

  function updateStatsUI() {
    const catLabels = {
      kansei: '🔰 平方完成',
      minmax: '📈 頂点・最大最小',
      equation: '⚔️ 方程式・共点',
      inequality: '🎯 2次不等式',
      matching: '🎨 マッチング'
    };
    statsLeft.textContent = catLabels[currentCategory];

    if (currentGameMode === 'practice') {
      statsRight.innerHTML = `連続正解: <span style="color:var(--theme-primary); font-weight:bold;">${practiceStreak}</span>`;
    } else if (currentGameMode === 'timeAttack') {
      const elapsed = ((Date.now() - taStartTime) / 1000).toFixed(1);
      statsRight.innerHTML = `${taQuestionsDone}/10問 | <span style="color:var(--apple-red); font-weight:bold;">${elapsed}s</span>`;
    } else if (currentGameMode === 'survival') {
      let hearts = '❤️'.repeat(svHp) + '🤍'.repeat(3 - svHp);
      statsRight.innerHTML = `${hearts} | 正解: <span style="color:var(--theme-primary); font-weight:bold;">${practiceStreak}</span>`;
    } else if (currentGameMode === 'scoreAttack') {
      statsRight.innerHTML = `残り <span style="color:var(--apple-red); font-weight:bold;">${saTimeLeft}s</span> | Score: <span style="color:var(--theme-primary); font-weight:bold;">${saScore}</span>`;
    }
  }

  // --- End Game Screen ---
  function endGame(mode) {
    isGameOver = true;
    judgeBtn.disabled = true;
    resetGameTimers();

    let titleText = 'ゲーム終了！';
    let detailText = '';

    if (mode === 'timeAttack') {
      const elapsed = ((Date.now() - taStartTime) / 1000).toFixed(1);
      titleText = '🏆 タイムアタック クリア！';
      detailText = `10問クリアタイム: ${elapsed} 秒`;
    } else if (mode === 'survival') {
      titleText = '💀 ゲームオーバー';
      detailText = `記録: 連続 ${practiceStreak} 問正解`;
    } else if (mode === 'scoreAttack') {
      titleText = '⏰ タイムアップ！';
      detailText = `最終スコア: ${saScore} 点 (最大コンボ: ${saCombo})`;
    }

    equationDisplay.classList.remove('rendered');
    equationDisplay.textContent = '';
    
    // Injects dynamic final result markup into equation area
    equationDisplay.innerHTML = `
      <div class="result-title">${titleText}</div>
      <div class="result-subtitle">${detailText}</div>
      <button class="primary-btn" id="retry-btn" style="margin-top:20px; max-width:200px;">もう一度挑戦</button>
    `;
    
    // Hide inputs
    document.querySelectorAll('.input-row').forEach(r => r.classList.add('hidden'));
    document.getElementById('action-area').classList.add('hidden');

    document.getElementById('retry-btn').addEventListener('click', () => {
      document.getElementById('action-area').classList.remove('hidden');
      initGameSession();
    });
  }

  // --- Problem Generator Router ---
  function generateProblem() {
    // Hide all input rows first
    document.querySelectorAll('.input-row').forEach(r => r.classList.add('hidden'));
    
    // Reset all standard input fields
    document.querySelectorAll('.val-input').forEach(i => i.value = '');
    
    // Reset all active choice buttons
    document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('active'));

    // Reset fraction toggles to integer view for key inputs
    const keysToReset = ['a', 'p', 'q', 'vp', 'vq', 'axis', 'max-val', 'min-val', 'sol1', 'sol2', 'ie-left', 'ie-right', 'ie-split-left', 'ie-split-right'];
    keysToReset.forEach(k => resetHybridInput(k));

    if (currentCategory === 'kansei') {
      inputRowKansei.classList.remove('hidden');
      generateKanseiProblem();
    } else if (currentCategory === 'minmax') {
      inputRowMinmax.classList.remove('hidden');
      generateMinmaxProblem();
    } else if (currentCategory === 'equation') {
      inputRowEquation.classList.remove('hidden');
      generateEquationProblem();
    } else if (currentCategory === 'inequality') {
      inputRowInequality.classList.remove('hidden');
      generateInequalityProblem();
    } else if (currentCategory === 'matching') {
      inputRowMatching.classList.remove('hidden');
      generateMatchingProblem();
    }
  }

  // ==========================================
  // ① 平方完成 問題生成
  // ==========================================
  function generateKanseiProblem() {
    // Generate basic parameters
    // y = a(x - p)^2 + q  =>  ax^2 - 2ap x + (ap^2 + q)
    let a = 1;
    let p = 0;
    let q = 0;

    const r = Math.random();
    if (r < 0.4) {
      // Standard easy integer
      a = Math.random() > 0.5 ? 1 : -1;
      p = Math.floor(Math.random() * 7) - 3; // -3 to 3
      q = Math.floor(Math.random() * 11) - 5; // -5 to 5
    } else if (r < 0.7) {
      // Non-1 integer coefficients
      a = Math.random() > 0.5 ? 2 : -2;
      p = Math.floor(Math.random() * 5) - 2; // -2 to 2
      q = Math.floor(Math.random() * 9) - 4; // -4 to 4
    } else {
      // Fractional p, q cases (e.g. y = x^2 - 3x + 2 => (x - 3/2)^2 - 1/4)
      a = 1;
      const pNum = (Math.floor(Math.random() * 7) - 3) * 2 + 1; // Odd numbers
      p = pNum / 2; // p is half integer (e.g., 1.5, -0.5)
      
      const qNum = Math.floor(Math.random() * 15) - 7;
      q = qNum / 4; // q is quarter fraction
    }

    // Convert decimal parameters to simplified fraction form for comparison
    const targetA = simplifyFraction(a * 100, 100);
    const targetP = simplifyFraction(p * 100, 100);
    const targetQ = simplifyFraction(q * 100, 100);

    // Expand to general form: ax^2 + bx + c
    // b = -2ap
    // c = ap^2 + q
    const coeffB = -2 * a * p;
    const coeffC = a * p * p + q;

    currentProblem = {
      type: 'kansei',
      a: targetA,
      p: targetP,
      q: targetQ,
      rawA: a,
      rawP: p,
      rawQ: q
    };

    // Render Latex Equation
    const formatCoeffX2 = (val) => {
      if (val === 1) return 'x^2';
      if (val === -1) return '-x^2';
      return `${val}x^2`;
    };

    const formatCoeffX = (val) => {
      if (val === 0) return '';
      if (val === 1) return ' + x';
      if (val === -1) return ' - x';
      return val > 0 ? ` + ${val}x` : ` - ${Math.abs(val)}x`;
    };

    const formatConst = (val) => {
      if (val === 0) return '';
      // Formats fractions if it's not an integer
      if (val % 1 !== 0) {
        const simplified = simplifyFraction(Math.round(val * 100), 100);
        const sign = simplified.n > 0 ? '+' : '-';
        return ` ${sign} \\frac{${Math.abs(simplified.n)}}{${simplified.d}}`;
      }
      return val > 0 ? ` + ${val}` : ` - ${Math.abs(val)}`;
    };

    const eqLatex = `y = ${formatCoeffX2(a)}${formatCoeffX(coeffB)}${formatConst(coeffC)}`;
    problemPrompt.textContent = '次の２次関数を平方完成しなさい。';
    
    equationDisplay.classList.remove('rendered');
    equationDisplay.textContent = eqLatex;
    renderMath();
  }

  // ==========================================
  // ② 頂点と最大最小 問題生成
  // ==========================================
  function generateMinmaxProblem() {
    // Generate y = a(x - p)^2 + q
    let a = Math.random() > 0.5 ? 1 : -1;
    if (Math.random() > 0.7) a = a * 2; // ±2 sometimes
    
    const p = Math.floor(Math.random() * 7) - 3; // -3 to 3
    const q = Math.floor(Math.random() * 11) - 5; // -5 to 5

    // Choose Sub-Type
    // 'vertex' | 'axis' | 'minmax' (with restricted domain)
    const types = ['vertex', 'axis', 'minmax'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    // Hide/Show rows in DOM
    const rowVertex = document.getElementById('row-vertex');
    const rowAxis = document.getElementById('row-axis');
    const rowMax = document.getElementById('row-max');
    const rowMin = document.getElementById('row-min');

    rowVertex.classList.add('hidden');
    rowAxis.classList.add('hidden');
    rowMax.classList.add('hidden');
    rowMin.classList.add('hidden');

    if (selectedType === 'vertex') {
      rowVertex.classList.remove('hidden');
      problemPrompt.textContent = '次の2次関数の 頂点座標 を求めなさい。';
      
      currentProblem = {
        type: 'minmax',
        subType: 'vertex',
        targetP: simplifyFraction(p, 1),
        targetQ: simplifyFraction(q, 1)
      };
    } else if (selectedType === 'axis') {
      rowAxis.classList.remove('hidden');
      problemPrompt.textContent = '次の2次関数の 軸の方程式 を求めなさい。';
      
      currentProblem = {
        type: 'minmax',
        subType: 'axis',
        targetP: simplifyFraction(p, 1)
      };
    } else {
      // minmax with restricted domain: [xMin, xMax]
      // Pick dynamic domain bounds around p
      let xMin = p - 2;
      let xMax = p + 3;
      if (Math.random() > 0.5) {
        xMin = p - 3;
        xMax = p + 1;
      }
      
      rowMax.classList.remove('hidden');
      rowMin.classList.remove('hidden');
      problemPrompt.textContent = `次の2次関数の定義域（範囲）における 最大値・最小値 を求めなさい。`;

      // Calculate values at left, right, and vertex
      const f = (x) => a * Math.pow(x - p, 2) + q;
      const yLeft = f(xMin);
      const yRight = f(xMax);
      const yVertex = q; // f(p)

      let maxVal = -999;
      let maxX = 0;
      let minVal = 999;
      let minX = 0;

      // Candidates
      const candidates = [{ x: xMin, y: yLeft }, { x: xMax, y: yRight }];
      if (p >= xMin && p <= xMax) {
        candidates.push({ x: p, y: yVertex });
      }

      candidates.forEach(c => {
        if (c.y > maxVal) { maxVal = c.y; maxX = c.x; }
        if (c.y < minVal) { minVal = c.y; minX = c.x; }
      });

      currentProblem = {
        type: 'minmax',
        subType: 'minmax',
        targetMaxVal: simplifyFraction(maxVal, 1),
        targetMaxX: simplifyFraction(maxX, 1),
        targetMinVal: simplifyFraction(minVal, 1),
        targetMinX: simplifyFraction(minX, 1)
      };
      
      // Inject domain into the prompt description
      problemPrompt.textContent = `次の定義域における２次関数の最大値・最小値とその時の <span class="math">x</span> の値を求めなさい： 範囲: <span class="math">${xMin} \\leqq x \\leqq ${xMax}</span>`;
    }

    // Render Equation
    const aStr = a === 1 ? '' : (a === -1 ? '-' : a);
    const pStr = p === 0 ? 'x' : (p > 0 ? `x - ${p}` : `x + ${Math.abs(p)}`);
    const qStr = q === 0 ? '' : (q > 0 ? ` + ${q}` : ` - ${Math.abs(q)}`);
    const eqLatex = p === 0 ? `y = ${aStr}x^2${qStr}` : `y = ${aStr}(${pStr})^2${qStr}`;

    equationDisplay.classList.remove('rendered');
    equationDisplay.textContent = eqLatex;
    renderMath();
  }

  // ==========================================
  // ③ 2次方程式と共有点 問題生成
  // ==========================================
  function generateEquationProblem() {
    const choiceButtons = document.querySelectorAll('.point-count-btn');
    const solutionInputsBox = document.getElementById('solution-inputs-box');
    const blockSol2Wrapper = document.getElementById('block-sol2-wrapper');
    const solPrompt = document.getElementById('sol-prompt');

    solutionInputsBox.classList.add('hidden');
    blockSol2Wrapper.classList.add('hidden');
    selectedFormat = 'none';

    choiceButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        choiceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = parseInt(btn.dataset.count); // 0, 1, 2
        
        // Dynamic visibility of inputs depending on the selected number of intersection points
        if (selectedFormat === 0) {
          solutionInputsBox.classList.add('hidden');
        } else {
          solutionInputsBox.classList.remove('hidden');
          if (selectedFormat === 2) {
            blockSol2Wrapper.classList.remove('hidden');
            solPrompt.textContent = '実数解の値を入力してください（順不同）：';
          } else {
            blockSol2Wrapper.classList.add('hidden');
            solPrompt.textContent = '重解の値を入力してください：';
          }
        }
      });
    });

    // Generate Problem parameters
    // a(x - alpha)(x - beta) = 0
    let a = Math.random() > 0.5 ? 1 : -1;
    const isIntersection = Math.random();

    let eqLatex = '';
    let targetCount = 0;
    let targetSol1 = null;
    let targetSol2 = null;

    if (isIntersection < 0.4) {
      // 2 intersection points
      targetCount = 2;
      const alpha = Math.floor(Math.random() * 7) - 3; // -3 to 3
      let beta = Math.floor(Math.random() * 7) - 3;
      while (beta === alpha) {
        beta = Math.floor(Math.random() * 7) - 3;
      }
      
      targetSol1 = simplifyFraction(alpha, 1);
      targetSol2 = simplifyFraction(beta, 1);

      // Expand: a(x^2 - (a+b)x + ab)
      const b = -a * (alpha + beta);
      const c = a * alpha * beta;
      
      eqLatex = formatGeneralQuadratic(a, b, c);
    } else if (isIntersection < 0.7) {
      // 1 intersection point (Tangent / Double Root)
      targetCount = 1;
      const alpha = Math.floor(Math.random() * 7) - 3; // -3 to 3
      targetSol1 = simplifyFraction(alpha, 1);

      const b = -2 * a * alpha;
      const c = a * alpha * alpha;

      eqLatex = formatGeneralQuadratic(a, b, c);
    } else {
      // 0 intersection points (No real solution)
      targetCount = 0;
      // Generate using vertex form where a and q are same sign (never crosses x-axis)
      const p = Math.floor(Math.random() * 5) - 2;
      const q = (Math.floor(Math.random() * 4) + 1) * (a > 0 ? 1 : -1); // Same sign as a

      const b = -2 * a * p;
      const c = a * p * p + q;

      eqLatex = formatGeneralQuadratic(a, b, c);
    }

    currentProblem = {
      type: 'equation',
      targetCount,
      targetSol1,
      targetSol2
    };

    problemPrompt.textContent = '次の2次関数について、<span class="math">x</span> 軸との共有点の個数と、共有点がある場合はその <span class="math">x</span> 座標を求めなさい（<span class="math">y=0</span> とおいた2次方程式の解）。';
    
    equationDisplay.classList.remove('rendered');
    equationDisplay.textContent = eqLatex;
    renderMath();
  }

  function formatGeneralQuadratic(a, b, c) {
    const formatCoeffX2 = (val) => {
      if (val === 1) return 'x^2';
      if (val === -1) return '-x^2';
      return `${val}x^2`;
    };

    const formatCoeffX = (val) => {
      if (val === 0) return '';
      if (val === 1) return ' + x';
      if (val === -1) return ' - x';
      return val > 0 ? ` + ${val}x` : ` - ${Math.abs(val)}x`;
    };

    const formatConst = (val) => {
      if (val === 0) return '';
      return val > 0 ? ` + ${val}` : ` - ${Math.abs(val)}`;
    };

    return `y = ${formatCoeffX2(a)}${formatCoeffX(b)}${formatConst(c)}`;
  }

  // ==========================================
  // ④ 2次不等式 問題生成
  // ==========================================
  function generateInequalityProblem() {
    const ineqFormatSelector = document.getElementById('ineq-format-selector');
    const ineqInputsWrapper = document.getElementById('ineq-inputs-wrapper');
    const selectedIneqFmtText = document.getElementById('selected-ineq-fmt-text');
    const changeIneqFmtBtn = document.getElementById('change-ineq-fmt-btn');

    const ineqCompoundRow = document.getElementById('ineq-compound-row');
    const ineqSplitRow = document.getElementById('ineq-split-row');

    ineqFormatSelector.classList.remove('hidden');
    ineqInputsWrapper.classList.add('hidden');
    ineqCompoundRow.classList.add('hidden');
    ineqSplitRow.classList.add('hidden');
    selectedFormat = 'none';

    document.querySelectorAll('.ineq-fmt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fmt = btn.dataset.format || btn.dataset.fmt;
        selectIneqFormat(fmt);
      });
    });

    function selectIneqFormat(fmt) {
      selectedFormat = fmt;
      ineqFormatSelector.classList.add('hidden');
      ineqInputsWrapper.classList.remove('hidden');

      if (fmt === 'compound') {
        selectedIneqFmtText.innerHTML = '解答形式: <span class="math">a \\lesseqgtr x \\lesseqgtr b</span>';
        ineqCompoundRow.classList.remove('hidden');
        ineqSplitRow.classList.add('hidden');
      } else if (fmt === 'split') {
        selectedIneqFmtText.innerHTML = '解答形式: <span class="math">x \\lesseqgtr a, \\; b \\lesseqgtr x</span>';
        ineqCompoundRow.classList.add('hidden');
        ineqSplitRow.classList.remove('hidden');
      } else if (fmt === 'all') {
        selectedIneqFmtText.innerHTML = '解答形式: <strong>すべての実数</strong> (数値入力不要)';
        ineqCompoundRow.classList.add('hidden');
        ineqSplitRow.classList.add('hidden');
      } else if (fmt === 'none') {
        selectedIneqFmtText.innerHTML = '解答形式: <strong>解なし</strong> (数値入力不要)';
        ineqCompoundRow.classList.add('hidden');
        ineqSplitRow.classList.add('hidden');
      }
      renderMath();
    }

    changeIneqFmtBtn.addEventListener('click', () => {
      selectedFormat = 'none';
      ineqFormatSelector.classList.remove('hidden');
      ineqInputsWrapper.classList.add('hidden');
      ineqCompoundRow.classList.add('hidden');
      ineqSplitRow.classList.add('hidden');
    });

    // Generate Problem
    let a = Math.random() > 0.5 ? 1 : -1;
    // Keep a=1 mostly for simplicity unless advanced, negative quadratic inequalities are standard but tricky
    if (Math.random() > 0.7) a = a * 2;

    const signs = ['>', '<', '>=', '<='];
    const sign = signs[Math.floor(Math.random() * signs.length)];

    let eqLatex = '';
    let correctFormat = 'none'; // 'compound', 'split', 'all', 'none'
    let correctVal1 = null;      // left value (a)
    let correctVal2 = null;      // right value (b)
    let correctSign1 = '';       // sign 1
    let correctSign2 = '';       // sign 2

    const isAllOrNone = Math.random() > 0.75;

    if (!isAllOrNone) {
      // Intersection exists: factors (x - alpha)(x - beta)
      const alpha = Math.floor(Math.random() * 7) - 3; // -3 to 3
      let beta = Math.floor(Math.random() * 7) - 3;
      while (beta === alpha) {
        beta = Math.floor(Math.random() * 7) - 3;
      }
      
      const small = Math.min(alpha, beta);
      const large = Math.max(alpha, beta);

      const b = -a * (alpha + beta);
      const c = a * alpha * beta;
      
      // ax^2 + bx + c [sign] 0
      const signLatex = sign.replace('<=', '\\leqq').replace('>=', '\\geqq');
      eqLatex = `${formatGeneralQuadraticNoY(a, b, c)} ${signLatex} 0`;

      // Determine correct solution set
      // Downwards or Upwards parabola
      const leadingPositive = a > 0;
      
      if (leadingPositive) {
        // y = +(x-small)(x-large)
        if (sign === '>') {
          correctFormat = 'split';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<';
          correctSign2 = '<';
        } else if (sign === '>=') {
          correctFormat = 'split';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<=';
          correctSign2 = '<=';
        } else if (sign === '<') {
          correctFormat = 'compound';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<';
          correctSign2 = '<';
        } else if (sign === '<=') {
          correctFormat = 'compound';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<=';
          correctSign2 = '<=';
        }
      } else {
        // y = -(x-small)(x-large)
        if (sign === '>') {
          correctFormat = 'compound';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<';
          correctSign2 = '<';
        } else if (sign === '>=') {
          correctFormat = 'compound';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<=';
          correctSign2 = '<=';
        } else if (sign === '<') {
          correctFormat = 'split';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<';
          correctSign2 = '<';
        } else if (sign === '<=') {
          correctFormat = 'split';
          correctVal1 = simplifyFraction(small, 1);
          correctVal2 = simplifyFraction(large, 1);
          correctSign1 = '<=';
          correctSign2 = '<=';
        }
      }
    } else {
      // D < 0 case (All real numbers or No solution)
      const p = Math.floor(Math.random() * 5) - 2;
      const q = (Math.floor(Math.random() * 3) + 2) * (a > 0 ? 1 : -1); // Vertex is shifted off x-axis

      const b = -2 * a * p;
      const c = a * p * p + q;
      
      const signLatex = sign.replace('<=', '\\leqq').replace('>=', '\\geqq');
      eqLatex = `${formatGeneralQuadraticNoY(a, b, c)} ${signLatex} 0`;

      // a(x-p)^2 + q [sign] 0
      // Check if parabola lies entirely above or below x-axis
      const positiveParabola = a > 0;
      
      if (positiveParabola) {
        // Graph is entirely above x-axis (y >= q > 0)
        if (sign === '>' || sign === '>=') {
          correctFormat = 'all';
        } else {
          correctFormat = 'none';
        }
      } else {
        // Graph is entirely below x-axis (y <= q < 0)
        if (sign === '<' || sign === '<=') {
          correctFormat = 'all';
        } else {
          correctFormat = 'none';
        }
      }
    }

    currentProblem = {
      type: 'inequality',
      correctFormat,
      correctVal1,
      correctVal2,
      correctSign1,
      correctSign2
    };

    problemPrompt.textContent = '次の2次不等式を解きなさい。';
    
    equationDisplay.classList.remove('rendered');
    equationDisplay.textContent = eqLatex;
    renderMath();
  }

  function formatGeneralQuadraticNoY(a, b, c) {
    const formatCoeffX2 = (val) => {
      if (val === 1) return 'x^2';
      if (val === -1) return '-x^2';
      return `${val}x^2`;
    };

    const formatCoeffX = (val) => {
      if (val === 0) return '';
      if (val === 1) return ' + x';
      if (val === -1) return ' - x';
      return val > 0 ? ` + ${val}x` : ` - ${Math.abs(val)}x`;
    };

    const formatConst = (val) => {
      if (val === 0) return '';
      return val > 0 ? ` + ${val}` : ` - ${Math.abs(val)}`;
    };

    return `${formatCoeffX2(a)}${formatCoeffX(b)}${formatConst(c)}`;
  }

  // ==========================================
  // ⑤ グラフマッチング 問題生成 & Canvas 描画
  // ==========================================
  function generateMatchingProblem() {
    selectedChoice = null;
    document.querySelectorAll('.graph-card').forEach(card => card.classList.remove('active'));

    // Base target: y = a(x - p)^2 + q
    // Ensure variety in combinations
    let a = Math.random() > 0.5 ? 1 : -1;
    const p = (Math.floor(Math.random() * 5) - 2) * 1.5; // -3, -1.5, 0, 1.5, 3
    const q = (Math.floor(Math.random() * 5) - 2) * 1.5;

    // Helper to format values as fractions for LaTeX
    const formatMathVal = (val) => {
      if (val === 0) return '0';
      if (val % 1 === 0) return `${Math.abs(val)}`;
      const frac = simplifyFraction(Math.round(val * 100), 100);
      return `\\frac{${Math.abs(frac.n)}}{${frac.d}}`;
    };

    // Correct formula representation (using LaTeX fractions instead of decimals)
    const aStr = a === 1 ? '' : (a === -1 ? '-' : a);
    
    let pStr = 'x';
    if (p !== 0) {
      const pFormatted = formatMathVal(p);
      const sign = p > 0 ? '-' : '+';
      pStr = `x ${sign} ${pFormatted}`;
    }
    
    let qStr = '';
    if (q !== 0) {
      const qFormatted = formatMathVal(q);
      const sign = q > 0 ? '+' : '-';
      qStr = ` ${sign} ${qFormatted}`;
    }

    const eqLatex = p === 0 ? `y = ${aStr}x^2${qStr}` : `y = ${aStr}(${pStr})^2${qStr}`;

    problemPrompt.textContent = '次の数式に最もよく一致するグラフのカードを選びなさい。';
    equationDisplay.classList.remove('rendered');
    equationDisplay.textContent = eqLatex;
    renderMath();

    // Create 4 choices: 1 correct, 3 distinct dummies
    // Dummies: invert sign of a, invert sign of p, invert sign of q
    const choices = [
      { a, p, q, correct: true },
      { a: -a, p, q, correct: false },
      { a, p: -p === 0 ? (p + 3) : -p, q, correct: false },
      { a, p, q: -q === 0 ? (q + 3) : -q, correct: false }
    ];

    // Ensure choices are distinct
    // If q or p was 0, some choices might duplicate. We alter them randomly if duplicated.
    const seen = new Set();
    for (let i = 0; i < choices.length; i++) {
      const key = `${choices[i].a}_${choices[i].p}_${choices[i].q}`;
      if (seen.has(key)) {
        // Modify parameters slightly to maintain unique shapes
        choices[i].p = choices[i].p + (i * 1.5);
        choices[i].q = choices[i].q - (i * 1.5);
      }
      seen.add(`${choices[i].a}_${choices[i].p}_${choices[i].q}`);
    }

    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    // Identify correct choice index
    const correctIndex = choices.findIndex(c => c.correct);

    currentProblem = {
      type: 'matching',
      correctIndex
    };

    // Draw on Canvases
    choices.forEach((choice, index) => {
      const canvas = document.getElementById(`canvas-${index}`);
      drawQuadraticGraph(canvas, choice.a, choice.p, choice.q);
    });

    // Handle clicks
    document.querySelectorAll('.graph-card').forEach((card, index) => {
      // Re-bind click event
      card.onclick = () => {
        document.querySelectorAll('.graph-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedChoice = index;
      };
    });
  }

  // Draw 2D Quadratic Function in HTML Canvas
  function drawQuadraticGraph(canvas, a, p, q) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#1e293b'; // Card dark Slate background
    ctx.fillRect(0, 0, width, height);

    // Scale mapper settings
    // Map mathematics range [-6, 6] to canvas pixels [0, width/height]
    const xMin = -6;
    const xMax = 6;
    const yMin = -6;
    const yMax = 6;

    const toPixelX = (x) => {
      return ((x - xMin) / (xMax - xMin)) * width;
    };
    const toPixelY = (y) => {
      // Math y-axis is inverted in pixel coordinates
      return height - (((y - yMin) / (yMax - yMin)) * height);
    };

    // Draw grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let g = -5; g <= 5; g++) {
      if (g === 0) continue;
      // Verticals
      ctx.beginPath();
      ctx.moveTo(toPixelX(g), 0);
      ctx.lineTo(toPixelX(g), height);
      ctx.stroke();

      // Horizontals
      ctx.beginPath();
      ctx.moveTo(0, toPixelY(g));
      ctx.lineTo(width, toPixelY(g));
      ctx.stroke();
    }

    // Draw primary axes (X and Y)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, toPixelY(0));
    ctx.lineTo(width, toPixelY(0));
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(toPixelX(0), 0);
    ctx.lineTo(toPixelX(0), height);
    ctx.stroke();

    // Axis label placeholder: Origin O
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.fillText('O', toPixelX(0.2), toPixelY(-0.4));

    // Draw Parabola Curve
    ctx.strokeStyle = a > 0 ? '#38bdf8' : '#818cf8'; // Neon Blue for downwards-facing, Indigo for upwards-facing
    ctx.lineWidth = 3;
    ctx.beginPath();

    const f = (x) => a * Math.pow(x - p, 2) + q;

    let first = true;
    // Step-by-step point mapping along horizontal bounds
    for (let px = 0; px <= width; px++) {
      // Map pixel x back to math value x
      const x = xMin + (px / width) * (xMax - xMin);
      const y = f(x);
      
      const py = toPixelY(y);

      // Clamp curves to prevent drawing extreme artifacts outside boundaries
      if (py >= -10 && py <= height + 10) {
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Draw Vertex Dot
    ctx.fillStyle = '#f87171'; // Coral/Red dot at vertex
    ctx.beginPath();
    ctx.arc(toPixelX(p), toPixelY(q), 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  // ==========================================
  // ANSWER EVALUATION & SUBMIT
  // ==========================================
  judgeBtn.addEventListener('click', checkAnswer);

  function checkAnswer() {
    if (isGameOver) return;

    let isCorrect = false;
    let hintMessage = '';

    if (currentCategory === 'kansei') {
      const userA = parseFractionInput('a');
      const userP = parseFractionInput('p');
      const userQ = parseFractionInput('q');

      if (!userA || !userP || !userQ) {
        showFeedback('すべての枠に値を入力してください。', 'error');
        return;
      }

      isCorrect = (userA.n === currentProblem.a.n && userA.d === currentProblem.a.d &&
                   userP.n === currentProblem.p.n && userP.d === currentProblem.p.d &&
                   userQ.n === currentProblem.q.n && userQ.d === currentProblem.q.d);
      
      if (!isCorrect) {
        hintMessage = `正解: a = ${formatFractionLabel(currentProblem.a)}, p = ${formatFractionLabel(currentProblem.p)}, q = ${formatFractionLabel(currentProblem.q)}`;
      }
    } 
    else if (currentCategory === 'minmax') {
      if (currentProblem.subType === 'vertex') {
        const userP = parseFractionInput('vp');
        const userQ = parseFractionInput('vq');

        if (!userP || !userQ) {
          showFeedback('頂点座標 (p, q) を両方入力してください。', 'error');
          return;
        }
        isCorrect = (userP.n === currentProblem.targetP.n && userP.d === currentProblem.targetP.d &&
                     userQ.n === currentProblem.targetQ.n && userQ.d === currentProblem.targetQ.d);

        if (!isCorrect) {
          hintMessage = `正解: (${formatFractionLabel(currentProblem.targetP)}, ${formatFractionLabel(currentProblem.targetQ)})`;
        }
      } 
      else if (currentProblem.subType === 'axis') {
        const userP = parseFractionInput('axis');

        if (!userP) {
          showFeedback('軸の値を入力してください。', 'error');
          return;
        }
        isCorrect = (userP.n === currentProblem.targetP.n && userP.d === currentProblem.targetP.d);

        if (!isCorrect) {
          hintMessage = `正解: x = ${formatFractionLabel(currentProblem.targetP)}`;
        }
      } 
      else {
        // minmax
        const userMaxX = parseInt(document.getElementById('input-max-x').value);
        const userMaxVal = parseFractionInput('max-val');
        const userMinX = parseInt(document.getElementById('input-min-x').value);
        const userMinVal = parseFractionInput('min-val');

        if (isNaN(userMaxX) || !userMaxVal || isNaN(userMinX) || !userMinVal) {
          showFeedback('最大値・最小値のすべての枠に入力してください。', 'error');
          return;
        }

        isCorrect = (userMaxX === currentProblem.targetMaxX.n && 
                     userMaxVal.n === currentProblem.targetMaxVal.n && userMaxVal.d === currentProblem.targetMaxVal.d &&
                     userMinX === currentProblem.targetMinX.n && 
                     userMinVal.n === currentProblem.targetMinVal.n && userMinVal.d === currentProblem.targetMinVal.d);

        if (!isCorrect) {
          hintMessage = `正解: 最大値は x=${currentProblem.targetMaxX.n} のとき ${formatFractionLabel(currentProblem.targetMaxVal)}、最小値は x=${currentProblem.targetMinX.n} のとき ${formatFractionLabel(currentProblem.targetMinVal)}`;
        }
      }
    } 
    else if (currentCategory === 'equation') {
      if (selectedFormat === 'none') {
        showFeedback('共有点の個数を選択してください。', 'error');
        return;
      }

      if (selectedFormat !== currentProblem.targetCount) {
        isCorrect = false;
      } else {
        if (selectedFormat === 0) {
          isCorrect = true; // No intersection matches correctly
        } else if (selectedFormat === 1) {
          const userSol1 = parseFractionInput('sol1');
          if (!userSol1) {
            showFeedback('値を入力してください。', 'error');
            return;
          }
          isCorrect = (userSol1.n === currentProblem.targetSol1.n && userSol1.d === currentProblem.targetSol1.d);
        } else {
          // 2 roots - allow any input order
          const userSol1 = parseFractionInput('sol1');
          const userSol2 = parseFractionInput('sol2');
          if (!userSol1 || !userSol2) {
            showFeedback('すべての解の値を入力してください。', 'error');
            return;
          }

          const matchOrder1 = (userSol1.n === currentProblem.targetSol1.n && userSol1.d === currentProblem.targetSol1.d &&
                               userSol2.n === currentProblem.targetSol2.n && userSol2.d === currentProblem.targetSol2.d);
          const matchOrder2 = (userSol1.n === currentProblem.targetSol2.n && userSol1.d === currentProblem.targetSol2.d &&
                               userSol2.n === currentProblem.targetSol1.n && userSol2.d === currentProblem.targetSol1.d);
          isCorrect = (matchOrder1 || matchOrder2);
        }
      }

      if (!isCorrect) {
        if (currentProblem.targetCount === 0) {
          hintMessage = `正解: 個数は 0個（実数解なし）`;
        } else if (currentProblem.targetCount === 1) {
          hintMessage = `正解: 1個、x = ${formatFractionLabel(currentProblem.targetSol1)}`;
        } else {
          hintMessage = `正解: 2個、x = ${formatFractionLabel(currentProblem.targetSol1)}, ${formatFractionLabel(currentProblem.targetSol2)}`;
        }
      }
    } 
    else if (currentCategory === 'inequality') {
      if (selectedFormat === 'none') {
        showFeedback('解答形式を選択してください。', 'error');
        return;
      }

      if (selectedFormat !== currentProblem.correctFormat) {
        isCorrect = false;
      } else {
        if (selectedFormat === 'all' || selectedFormat === 'none') {
          isCorrect = true; // Matched correct general format
        } 
        else if (selectedFormat === 'compound') {
          const userValLeft = parseFractionInput('ie-left');
          const userValRight = parseFractionInput('ie-right');
          const userSignLeft = document.getElementById('input-ie-sign-left').value;
          const userSignRight = document.getElementById('input-ie-sign-right').value;

          if (!userValLeft || !userValRight) {
            showFeedback('値を入力してください。', 'error');
            return;
          }

          isCorrect = (userValLeft.n === currentProblem.correctVal1.n && userValLeft.d === currentProblem.correctVal1.d &&
                       userValRight.n === currentProblem.correctVal2.n && userValRight.d === currentProblem.correctVal2.d &&
                       userSignLeft === currentProblem.correctSign1 && userSignRight === currentProblem.correctSign2);
        } 
        else if (selectedFormat === 'split') {
          const userValLeft = parseFractionInput('ie-split-left');
          const userValRight = parseFractionInput('ie-split-right');
          const userSignLeft = document.getElementById('input-ie-split-sign-left').value;
          const userSignRight = document.getElementById('input-ie-split-sign-right').value;

          if (!userValLeft || !userValRight) {
            showFeedback('値を入力してください。', 'error');
            return;
          }

          isCorrect = (userValLeft.n === currentProblem.correctVal1.n && userValLeft.d === currentProblem.correctVal1.d &&
                       userValRight.n === currentProblem.correctVal2.n && userValRight.d === currentProblem.correctVal2.d &&
                       userSignLeft === currentProblem.correctSign1 && userSignRight === currentProblem.correctSign2);
        }
      }

      if (!isCorrect) {
        if (currentProblem.correctFormat === 'all') {
          hintMessage = `正解: すべての実数`;
        } else if (currentProblem.correctFormat === 'none') {
          hintMessage = `正解: 解なし`;
        } else if (currentProblem.correctFormat === 'compound') {
          const s1 = currentProblem.correctSign1;
          const s2 = currentProblem.correctSign2;
          hintMessage = `正解: ${formatFractionLabel(currentProblem.correctVal1)} ${s1} x ${s2} ${formatFractionLabel(currentProblem.correctVal2)}`;
        } else if (currentProblem.correctFormat === 'split') {
          const s1 = currentProblem.correctSign1;
          const s2 = currentProblem.correctSign2;
          hintMessage = `正解: x ${s1} ${formatFractionLabel(currentProblem.correctVal1)}, ${formatFractionLabel(currentProblem.correctVal2)} ${s2} x`;
        }
      }
    } 
    else if (currentCategory === 'matching') {
      if (selectedChoice === null) {
        showFeedback('グラフカードを選択してください。', 'error');
        return;
      }
      isCorrect = (selectedChoice === currentProblem.correctIndex);
      if (!isCorrect) {
        const alphabet = ['A', 'B', 'C', 'D'];
        hintMessage = `正解: カード ${alphabet[currentProblem.correctIndex]}`;
      }
    }

    // Apply feedback effects
    if (isCorrect) {
      handleSuccess();
    } else {
      handleFailure(hintMessage);
    }
  }

  function formatFractionLabel(frac) {
    if (frac.d === 1) return `${frac.n}`;
    return `${frac.n}/${frac.d}`;
  }

  // Success Feedback
  function handleSuccess() {
    if (isGameOver) return;
    let msg = '正解！素晴らしい！';

    if (currentGameMode === 'practice') {
      practiceStreak++;
    } else if (currentGameMode === 'timeAttack') {
      taQuestionsDone++;
      if (taQuestionsDone >= 10) {
        endGame('timeAttack');
        return;
      }
    } else if (currentGameMode === 'survival') {
      practiceStreak++;
    } else if (currentGameMode === 'scoreAttack') {
      saCombo++;
      const points = 100 + (saCombo * 50);
      saScore += points;
      saTimeLeft = Math.min(99, saTimeLeft + 3); // Add bonus time
      msg = `正解！ ${saCombo}コンボ (+${points}点, 残り時間+3s)`;
    }

    updateStatsUI();
    showFeedback(msg, 'success');
    
    // Trigger canvas confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#34d399']
    });

    setTimeout(() => {
      if (!isGameOver) generateProblem();
    }, 1500);
  }

  // Failure Feedback
  function handleFailure(hint) {
    if (isGameOver) return;
    let msg = hint ? `惜しい！ ${hint}` : '違います。もう一度計算してみましょう。';

    if (currentGameMode === 'practice') {
      practiceStreak = 0;
      showFeedback(msg, 'error');
    } else if (currentGameMode === 'timeAttack') {
      showFeedback(msg + ' (ペナルティ +5秒)', 'error');
      // Shift start time backwards by 5 seconds as penalty
      taStartTime -= 5000;
    } else if (currentGameMode === 'survival') {
      svHp--;
      practiceStreak = 0;
      if (svHp <= 0) {
        endGame('survival');
        return;
      } else {
        showFeedback(msg + ` (残りHP: ${svHp})`, 'error');
      }
    } else if (currentGameMode === 'scoreAttack') {
      saCombo = 0;
      saScore = Math.max(0, saScore - 50);
      showFeedback(msg + ' (-50点, コンボリセット)', 'error');
    }

    updateStatsUI();
  }

  function showFeedback(text, type) {
    feedbackToast.textContent = text;
    feedbackToast.className = `feedback show ${type}`;
    setTimeout(() => {
      feedbackToast.classList.remove('show');
    }, 3000);
  }

});
