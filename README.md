# niji.go

> **English description follows Japanese.**

2次関数、2次方程式、2次不等式の「放物線（ビジュアル）と数式」の繋がりを極めるための、ゲーム感覚で学べるWebトレーニングアプリケーションです。平方完成から始まり、共通テストや高校数学で必須となる最大・最小、x軸との位置関係までをシームレスに学習できます。

## 🎯 アプリの目的
2次関数は高校数学（数学I）の大きな山場であり、平方完成の計算力だけでなく、「数式とグラフの形が頭の中でどう結びついているか」が鍵になります。本アプリは、すき間時間で感覚的かつ効率的にグラフのイメージと計算力を鍛え、2次式の直感を圧倒的に向上させるために開発しました。

## ✨ 主な機能と学習カテゴリ

### 📚 5つの学習カテゴリ
1. **🔰 ① 平方完成 (一般形から基本形へ)**
   $y = ax^2 + bx + c$ を $y = a(x-p)^2 + q$ へ変形する特訓。整数から簡単な分数まで網羅。
2. **📈 ② 頂点と軸・最大最小**
   頂点座標や軸の方程式の特定に加え、指定された定義域（範囲）における最大値・最小値とその時の $x$ の値を求める練習。
3. **⚔️ ③ 2次方程式と共有点**
   グラフと $x$ 軸が何個で交わるか（共有点の個数）を答え、実際の交点の $x$ 座標（2次方程式の実数解）を求める連動トレーニング。
4. **🎯 ④ 2次不等式**
   $ax^2 + bx + c > 0$ などの不等式を、グラフの上下関係をイメージして直感的に解く訓練。
5. **🎨 ⑤ グラフマッチング**
   提示された式と「凸の向き」「頂点」「軸の位置」が一致する正しいグラフを、HTML Canvasで描画された4つの選択肢から選ぶビジュアルクイズ。

### 🎮 4つのゲームモード
*   **♾️ 練習モード:** 制限時間なし。自分のペースで解き、連続正解ストリークを伸ばします。
*   **⏱️ タイムアタック:** 10問正解するまでの最速タイムを競います（不正解は+5秒のペナルティ）。
*   **❤️ サバイバル:** 3つのライフを守りながら、何問解けるか限界に挑戦するモード。
*   **🔥 スコアアタック:** 60秒間でどれだけスコアを稼げるか挑戦！コンボを繋げると加算スコアがアップし、正解時に制限時間が少し増えます。

---

## 🛠 Tech Stack
*   HTML5 / CSS3 (Vanilla / Glassmorphism Dark Theme)
*   JavaScript (ES6+)
*   KaTeX (Math equation rendering)
*   canvas-confetti (Visual effects)

---

# niji.go (English)

A gamified web training application designed to help you master the connection between quadratic equations, inequalities, and their graphical representations (parabolas). From completing the square to finding maximum/minimum values and x-axis intersections, you can train your quadratic intuition seamlessly.

## 🎯 App Objective
Quadratic functions are one of the core subjects in high school math. The key to mastery is not just algebraic computation, but bridging equations with visual graphs in your mind. This app helps you train both calculation speed and graphical intuition anywhere during your spare time.

## ✨ Core Features & Learning Categories

### 📚 5 Learning Categories
1. **🔰 1. Completing the Square**
   Transform $y = ax^2 + bx + c$ into the vertex form $y = a(x-p)^2 + q$. Covers integers and fractional coefficients.
2. **📈 2. Vertex, Axis & Min/Max**
   Identify the vertex, axis, and find the maximum/minimum values within a restricted domain.
3. **⚔️ 3. Quadratic Equations & Intersections**
   Determine the number of intersection points with the x-axis, and find the actual values of $x$ (real solutions).
4. **🎯 4. Quadratic Inequalities**
   Solve inequalities like $ax^2 + bx + c > 0$ by referencing the position of the parabola relative to the x-axis.
5. **🎨 5. Graph Matching**
   Match the given equation with the correct parabola graph drawn dynamically on 4 interactive HTML Canvas cards.

### 🎮 4 Diverse Game Modes
*   **♾️ Practice Mode:** No time limits. Practice at your own pace and extend your streak.
*   **⏱️ Time Attack:** Compete for the fastest time to correctly answer 10 questions (+5s penalty for incorrect answers).
*   **❤️ Survival:** Keep answering questions while guarding your 3 lives.
*   **🔥 Score Attack:** Rack up points in 60 seconds! Keep combos going for multiplier points, with correct answers adding bonus seconds.
