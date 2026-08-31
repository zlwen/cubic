import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outputPath = resolve(process.argv[2] ?? '/private/tmp/rolling-block-design-document.html');
const productName = '滚一滚V1.0.0';

const pages = [
  {
    title: '软件设计说明书',
    lead: '本文档描述滚一滚V1.0.0的总体架构、核心算法、数据结构、功能模块、接口设计及运行流程，并建立设计内容与TypeScript源程序之间的对应关系。',
    body: `
      <div class="cover-figure figure">
        <div class="cover-board">
          ${Array.from({ length: 20 }, (_, index) => `<i class="tile t${index}"></i>`).join('')}
          <b class="goal-hole"></b><b class="rolling-block"></b>
        </div>
        <div class="cover-caption">三维空间 · 姿态推演 · 机关联动 · 关卡解谜</div>
      </div>
      <div class="summary-grid">
        <div><strong>文档性质</strong><span>软件设计说明书</span></div>
        <div><strong>实现语言</strong><span>TypeScript</span></div>
        <div><strong>程序形态</strong><span>移动端三维益智游戏</span></div>
        <div><strong>设计范围</strong><span>客户端完整运行系统</span></div>
      </div>
      <p>系统以离散网格状态机为逻辑核心，以三维场景表现为交互载体。逻辑层不依赖具体渲染平台，表现层通过组件化方式组织棋盘、方块、相机、界面、音频和设备能力，从而兼顾规则正确性、运行稳定性和多端适配能力。</p>
    `,
  },
  {
    title: '1. 系统概述与设计目标',
    lead: '软件面向手机和平板等横屏设备，玩家控制长方体在悬空棋盘上翻滚，通过机关改变棋盘结构，并以直立姿态落入目标洞口完成关卡。',
    body: `
      <div class="figure context-diagram">
        <div class="actor">玩家</div><div class="arrow">→</div>
        <div class="system-box"><strong>滚一滚V1.0.0</strong><span>输入解析</span><span>谜题运算</span><span>三维表现</span><span>进度管理</span></div>
        <div class="arrow">→</div><div class="outputs"><span>画面</span><span>音效</span><span>振动</span><span>存档</span></div>
      </div>
      <h2>1.1 设计目标</h2>
      <ul><li>保证每次移动的姿态、占格、支撑和机关结果可确定、可复现。</li><li>将规则计算与三维动画分离，动画只表现已经确认的逻辑结果。</li><li>支持33个关卡、关卡选择、密码直达、进度恢复和一至三星评价。</li><li>支持简体中文、繁体中文和英文，并适配安全区和横屏比例。</li></ul>
      <h2>1.2 运行与开发环境</h2>
      <p>开发环境采用Cocos Creator 3.8.8、TypeScript及Node.js 18以上版本。运行端面向具备三维图形能力的移动设备、平板设备、小游戏容器和现代浏览器；输入方式包括触屏滑动与网页键盘，画面采用正交三维相机。</p>
    `,
  },
  {
    title: '2. 软件基本处理流程',
    lead: '系统从首场景装载开始，依次完成基础资源准备、运行对象创建、存档恢复和主菜单展示；进入关卡后，每次输入均经过规则计算、表现播放、状态持久化和界面更新。',
    body: `
      <div class="figure vertical-flow">
        <div>启动画面与首场景依赖加载</div><i>↓</i><div>GameplayBootstrap创建相机、棋盘、方块与UI</div><i>↓</i>
        <div>GameplayController读取存档并显示主菜单</div><i>↓</i><div>选择新游戏、继续游戏、关卡或密码</div><i>↓</i>
        <div>创建PuzzleEngine并渲染LevelDefinition</div><i>↓</i><div>接收输入 → 计算MoveResult → 播放动画</div><i>↓</i>
        <div>更新HUD、教程、评分与ReleaseSaveData</div>
      </div>
      <h2>2.1 启动处理</h2>
      <p><code>GameplayBootstrap.onLoad()</code>先设置深色清屏背景，避免启动画面结束后出现默认灰屏。字体和首页图像作为首场景依赖提前装载；若编辑器绑定缺失，则使用资源路径异步加载作为兜底。</p>
      <h2>2.2 单步处理</h2>
      <p><code>requestMove()</code>负责输入节流和缓冲，<code>PuzzleEngine.move()</code>产生不可变的前后状态，<code>BlockPresenter</code>根据结果播放翻滚或掉落，完成后再由控制器处理机关表现、失败界面或通关结算。</p>
    `,
  },
  {
    title: '3. 程序系统组织结构',
    lead: '程序采用“界面与流程协调层、三维表现层、领域逻辑层、数据与平台层”四层组织方式，依赖方向自上而下，核心谜题逻辑不反向依赖场景节点。',
    body: `
      <div class="figure layer-stack">
        <div><b>界面与流程协调层</b><span>GameplayBootstrap · GameplayController · OnboardingVisual</span></div>
        <div><b>三维表现层</b><span>BoardRenderer · BlockPresenter · CameraController · UiButtonVisual</span></div>
        <div><b>领域逻辑层</b><span>PuzzleEngine · movement · level · coords · solver</span></div>
        <div><b>数据与平台层</b><span>ReleaseSaveRepository · releaseSave · AudioController · PlatformAdapter</span></div>
      </div>
      <h2>3.1 目录组织</h2>
      <p><code>assets/scripts</code>保存场景组件和运行控制器；<code>assets/scripts/shared/game</code>保存可独立测试的规则与数据类型；<code>shared/levels</code>负责关卡定义；<code>shared/platform</code>定义设备能力抽象。</p>
      <h2>3.2 依赖原则</h2>
      <ul><li>逻辑层输入为普通对象，输出为<code>MoveResult</code>，不直接操作Node或MeshRenderer。</li><li>表现层读取状态，不修改谜题规则数据。</li><li>控制器负责组合组件、控制模式切换和持久化时机。</li><li>平台差异经接口隔离，避免设备判断散落在业务代码中。</li></ul>
    `,
  },
  {
    title: '4. 功能模块划分',
    lead: '系统按照单一职责拆分为九组主要模块。模块之间通过显式属性、方法和数据对象连接，便于独立测试及后续平台移植。',
    body: `
      <table class="figure module-table">
        <thead><tr><th>模块</th><th>核心类或文件</th><th>主要职责</th><th>主要输出</th></tr></thead>
        <tbody>
          <tr><td>启动装配</td><td>GameplayBootstrap</td><td>创建场景对象并绑定引用</td><td>完整运行图</td></tr>
          <tr><td>流程控制</td><td>GameplayController</td><td>菜单、关卡、结果及模式管理</td><td>界面状态</td></tr>
          <tr><td>谜题规则</td><td>PuzzleEngine</td><td>移动、机关、失败、完成与撤销</td><td>MoveResult</td></tr>
          <tr><td>棋盘表现</td><td>BoardRenderer</td><td>地砖、桥梁、洞口及碎裂效果</td><td>三维棋盘</td></tr>
          <tr><td>方块表现</td><td>BlockPresenter</td><td>翻滚、掉落、分裂及合并动画</td><td>方块姿态</td></tr>
          <tr><td>输入系统</td><td>TouchInputController</td><td>手势解析和按钮输入隔离</td><td>Direction</td></tr>
          <tr><td>存档评分</td><td>releaseSave</td><td>进度恢复、解锁和星级计算</td><td>ReleaseSaveData</td></tr>
          <tr><td>适配服务</td><td>PlatformAdapter</td><td>安全区、振动和生命周期接口</td><td>设备能力</td></tr>
          <tr><td>音频引导</td><td>AudioController等</td><td>音效、环境声和规则教学</td><td>反馈信息</td></tr>
        </tbody>
      </table>
      <p>模块划分直接对应源文件，每个组件均由启动装配模块创建，再由流程控制模块协调。规则层可在没有渲染环境的情况下运行单元测试，从而降低三维动画对规则验证的干扰。</p>
    `,
  },
  {
    title: '5. 核心数据结构设计',
    lead: '领域模型使用只读TypeScript接口表达，状态更新时创建新对象，避免动画回调或界面逻辑意外修改历史状态。',
    body: `
      <div class="figure data-model">
        <div><b>LevelDefinition</b><span>id / title / passcode</span><span>tiles / bridges / switches / splits</span><span>start / goal / solution / par</span></div>
        <div><b>PuzzleState</b><span>levelId / block / split</span><span>bridgeStates / steps</span><span>failed / completed</span></div>
        <div><b>BlockState</b><span>anchor: GridCoord</span><span>orientation</span></div>
        <div><b>MoveResult</b><span>status / direction</span><span>previous / current</span><span>occupiedCells / supportedCells</span></div>
      </div>
      <h2>5.1 坐标和姿态</h2>
      <p><code>GridCoord</code>采用整数<code>x、z</code>表示棋盘格。<code>Orientation</code>包含直立、沿X轴平躺和沿Z轴平躺三种值；锚点与姿态共同确定方块占据的一格或两格。</p>
      <h2>5.2 状态与结果</h2>
      <p><code>PuzzleState</code>是当前关卡的完整快照。<code>MoveResult</code>同时携带移动前后状态、占格、有效支撑格和结果类型，供动画系统精确选择翻滚、悬边旋转、垂直下落或通关入洞表现。</p>
    `,
  },
  {
    title: '6. 关卡数据与校验设计',
    lead: '关卡以LevelDefinition描述静态地砖、动态桥梁、机关动作、分裂目的地、起点和目标洞口。加载时先执行结构校验，错误关卡不会进入运行流程。',
    body: `
      <div class="figure validation-flow">
        <div>关卡定义</div><i>→</i><div>坐标去重</div><i>→</i><div>地砖类型检查</div><i>→</i><div>机关引用检查</div><i>→</i><div>目标洞口邻域检查</div><i>→</i><div class="ok">可运行LevelMap</div>
      </div>
      <h2>6.1 LevelMap索引</h2>
      <p><code>LevelMap</code>在构造时建立<code>tilesByCoord、bridgeIdByCoord、switchesByCoord、splitsByCoord</code>四类索引，将频繁的支撑和机关查询由遍历转换为键值查找。</p>
      <h2>6.2 校验规则</h2>
      <ul><li>静态地砖与桥梁支撑格不得重复。</li><li>起始方块占格必须落在静态地砖上。</li><li>目标坐标自身不提供支撑，周边必须形成可到达结构。</li><li>机关动作引用的桥梁标识必须存在。</li><li>分裂目的地必须不同且均有有效支撑。</li><li>关卡密码使用六位数字，最优解与评分基准保持一致。</li></ul>
    `,
  },
  {
    title: '7. 方块翻滚算法设计',
    lead: '翻滚算法是纯函数rollBlock。输入当前BlockState和Direction，输出新锚点与新姿态，不读取场景，也不产生动画副作用。',
    body: `
      <table class="figure transition-table">
        <thead><tr><th>当前姿态</th><th>左右移动</th><th>上下移动</th></tr></thead>
        <tbody>
          <tr><td>standing</td><td>变为lying-x，锚点移动1或2格</td><td>变为lying-z，锚点移动1或2格</td></tr>
          <tr><td>lying-x</td><td>变为standing，锚点跨过长边</td><td>保持lying-x，整体平移1格</td></tr>
          <tr><td>lying-z</td><td>保持lying-z，整体平移1格</td><td>变为standing，锚点跨过长边</td></tr>
        </tbody>
      </table>
      <div class="orientation-demo"><span class="stand">直立</span><i>⇄</i><span class="lie-x">沿X平躺</span><i>⇄</i><span class="lie-z">沿Z平躺</span></div>
      <h2>7.1 占格推导</h2>
      <p><code>occupiedCells()</code>根据姿态返回一个或两个坐标。所有支撑、机关和目标判断均基于该结果，而不依赖三维模型的浮点位置，因此不会受补间误差影响。</p>
      <h2>7.2 可验证性</h2>
      <p>纯函数设计便于穷举方向组合、验证姿态循环和求解器搜索。动画结束后方块节点会吸附到状态坐标，避免连续翻滚积累浮点偏差。</p>
    `,
  },
  {
    title: '8. 移动判定与结果处理',
    lead: 'PuzzleEngine.move()按固定优先级判断目标、支撑、易碎地砖、机关和分裂事件。相同输入状态与方向必然得到相同结果。',
    body: `
      <div class="figure decision-tree">
        <div>计算下一姿态与占格</div><i>↓</i><div class="decision">直立且位于目标洞口？</div><b>是 → completed</b><i>↓ 否</i>
        <div class="decision">全部占格都有支撑？</div><b>否 → fallen</b><i>↓ 是</i><div class="decision">直立压在易碎地砖？</div><b>是 → fallen</b><i>↓ 否</i>
        <div>应用机关与分裂规则</div><i>↓</i><div class="ok">提交moved状态并记录历史</div>
      </div>
      <h2>8.1 状态提交</h2>
      <p><code>commit()</code>统一写入历史栈、克隆候选状态并生成MoveResult。失败状态由<code>commitFailure()</code>构造，非法输入则返回<code>invalidResult()</code>且不改变当前状态。</p>
      <h2>8.2 撤销和重开</h2>
      <p>每次有效操作前保存完整状态快照，<code>undo()</code>直接恢复上一快照；<code>restart()</code>清空历史并按照关卡起点及桥梁初始状态重新创建PuzzleState。</p>
    `,
  },
  {
    title: '9. 机关与桥梁系统设计',
    lead: '机关采用“触发格坐标 + 动作列表”的数据驱动方式。一个机关可控制多个桥梁，一个桥梁也可受多个机关影响。',
    body: `
      <div class="figure switch-map">
        <div class="switch soft"><b>轻触机关</b><span>任意占格触发</span></div>
        <div class="switch hard"><b>重压机关</b><span>仅直立触发</span></div>
        <div class="action-list"><span>enable</span><span>disable</span><span>toggle</span></div>
        <div class="bridge-bank"><b>bridgeStates</b><span>bridge-a: true</span><span>bridge-b: false</span></div>
      </div>
      <h2>9.1 触发规则</h2>
      <p>完整方块移动后遍历占格：轻触机关在平躺或直立时均可触发；重压机关只有方块直立时触发。分裂状态下单个小方块只能触发轻触机关。</p>
      <h2>9.2 动作语义</h2>
      <p><code>enable</code>使桥梁显示并提供支撑，<code>disable</code>使其隐藏，<code>toggle</code>对当前布尔值取反，因此圆形轻触机关可以重复开关桥梁。BoardRenderer比较前后状态并播放桥梁升降动画。</p>
    `,
  },
  {
    title: '10. 目标洞口与易碎地砖',
    lead: '目标洞口和易碎地砖都改变普通支撑规则，但用途不同：洞口用于成功判定，易碎地砖用于限制方块直立姿态。',
    body: `
      <div class="figure compare-panels">
        <div><b>目标洞口</b><div class="mini-board"><i></i><i></i><i></i><i></i><em></em><i></i><i></i><i></i><i></i></div><p>方块必须直立到达洞口坐标，随后播放入洞下落并进入通关结算。</p></div>
        <div><b>易碎地砖</b><div class="glass-tile"><span></span><span></span><span></span></div><p>平躺经过时可支撑；直立压下时立即失败，并播放玻璃碎片散落动画。</p></div>
      </div>
      <h2>10.1 洞口表现</h2>
      <p><code>BoardRenderer.createGoalHole()</code>使用井壁、底面和边框表达真实孔洞。逻辑层不把目标坐标视作普通支撑，而是在支撑判定前优先识别直立完成条件。</p>
      <h2>10.2 碎裂表现</h2>
      <p><code>playFragileBreak()</code>隐藏原地砖并生成九块玻璃碎片。碎片采用抛物线位移、独立旋转和末段缩放，动画结束后销毁节点，避免长期占用资源。</p>
    `,
  },
  {
    title: '11. 分裂与重新组合机制',
    lead: '方块直立压上分裂地砖后，完整BlockState切换为SplitBlockState；玩家分别控制两个小方块，直到它们在相邻格重新组合。',
    body: `
      <div class="figure state-machine split-machine">
        <div>完整方块</div><i>压上分裂地砖</i><div>生成两个小方块</div><i>切换活动方块</i><div>单格移动</div><i>相邻检测</i><div>重新组合</div>
        <span class="loop">未相邻：继续移动或切换</span>
      </div>
      <h2>11.1 分裂状态</h2>
      <p><code>SplitBlockState</code>保存两个GridCoord及<code>activeCube</code>索引。<code>switchActiveCube()</code>切换活动对象并记录历史，使切换操作也能被撤销和保存。</p>
      <h2>11.2 重新组合</h2>
      <p>当两个小方块同Z且X相差1时组合为<code>lying-x</code>；同X且Z相差1时组合为<code>lying-z</code>。除此之外保持分裂状态。BlockPresenter同步控制两个节点的显隐和选择标记。</p>
    `,
  },
  {
    title: '12. 游戏流程状态机',
    lead: 'GameplayController通过mode字段管理页面和交互权限，确保菜单输入不会误触棋盘，暂停或结果界面出现时不会继续累计时间。',
    body: `
      <div class="figure mode-map">
        <div class="mode title">title</div><div class="mode">stage-select</div><div class="mode">passcode</div><div class="mode">how-to-play</div>
        <div class="mode playing">playing</div><div class="mode">paused</div><div class="mode">tutorial</div><div class="mode">credits</div>
        <div class="mode result">failure-result</div><div class="mode result">completion-result</div><div class="mode result">campaign-complete</div>
        <svg viewBox="0 0 700 170" aria-hidden="true"><path d="M80 40H260M350 40V100M260 100H80M440 100H620"/><path d="M260 40L350 100L440 40"/></svg>
      </div>
      <h2>12.1 模式切换</h2>
      <p><code>showOnly()</code>保证同一时刻仅有目标界面处于激活状态。进入playing时显示HUD并启动计时；进入paused、tutorial或结果模式时，requestMove拒绝新的棋盘操作。</p>
      <h2>12.2 主菜单演示</h2>
      <p>主菜单后台使用第三关的已验证路线驱动自动翻滚。演示引擎与正式游戏引擎相互独立，离开主菜单时取消补间和定时任务，避免状态泄漏。</p>
    `,
  },
  {
    title: '13. 输入接口与操作缓冲',
    lead: '输入层将触屏滑动和键盘按键统一转换为Direction，再由GameplayController执行模式校验、动画忙碌检测和单步缓冲。',
    body: `
      <div class="figure input-pipeline">
        <div><b>触屏</b><span>TOUCH_START</span><span>TOUCH_END</span><span>位移阈值32</span></div>
        <div><b>键盘</b><span>方向键</span><span>W/A/S/D</span><span>空格切换方块</span></div>
        <i>→</i><div><b>方向归一化</b><span>屏幕方向映射</span><span>按钮目标过滤</span></div><i>→</i>
        <div><b>requestMove</b><span>mode检查</span><span>busy检查</span><span>bufferedMove</span></div>
      </div>
      <h2>13.1 手势识别</h2>
      <p><code>TouchInputController</code>记录起点与终点，距离不足阈值时忽略；横向绝对位移较大时生成左右方向，否则生成上下方向。触点位于Button节点或其子节点时不启动手势。</p>
      <h2>13.2 操作缓冲</h2>
      <p>方块动画进行中只保留最后一次方向输入，当前动画结束后立即消费该输入，既避免并发状态更新，也使连续滑动保持流畅。网页键盘经过相机方向映射后与屏幕视觉方向一致。</p>
    `,
  },
  {
    title: '14. 三维渲染与相机设计',
    lead: '表现系统按节点职责拆分。棋盘使用动态网格节点，方块使用独立旋转支点，相机采用固定斜俯视正交投影，UI由专用二维相机叠加。',
    body: `
      <div class="figure scene-tree">
        <div><b>Gameplay Scene</b>
          <ul><li>Main Camera <small>Orthographic / 深色清屏</small></li><li>Main Light <small>平行光 / 阴影</small></li><li>GameRoot<ul><li>BoardRoot → BoardRenderer</li><li>BlockRoot → BlockPresenter</li><li>VoidBackdrop</li><li>Canvas → UI Camera</li></ul></li></ul>
        </div>
        <div class="camera-spec"><span>位置偏移<br><b>-6, 13, -18</b></span><span>俯角<br><b>约34°</b></span><span>偏航<br><b>约18°</b></span><span>投影<br><b>ORTHO</b></span></div>
      </div>
      <h2>14.1 棋盘渲染</h2>
      <p>BoardRenderer按照TileDefinition创建普通、玻璃、机关和分裂地砖，并按BridgeDefinition管理动态桥梁。材质缓存以颜色和粗糙度为键，减少重复Material实例。</p>
      <h2>14.2 自适应取景</h2>
      <p>CameraController计算所有地砖、桥梁、分裂目的地和洞口的边界，再将三维角点投影到相机右向量和上向量，综合屏幕宽高比及菜单偏移求出orthoHeight，确保关卡完整入镜。</p>
    `,
  },
  {
    title: '15. 方块动画与掉落设计',
    lead: '动画严格消费MoveResult，不参与规则判断。正常移动围绕接触边旋转；失败时根据supportedCells区分单边支撑和完全无支撑两类掉落。',
    body: `
      <div class="figure timeline">
        <div><b>0%</b><span>逻辑状态已提交</span></div><i></i><div><b>35%</b><span>围绕边缘翻滚</span></div><i></i><div><b>70%</b><span>越过重心或离开边缘</span></div><i></i><div><b>100%</b><span>吸附、下落或入洞</span></div>
      </div>
      <div class="fall-compare"><div><b>存在一个支撑格</b><span>先绕棋盘边缘倾覆</span><span>再进入垂直下落</span></div><div><b>完全没有支撑格</b><span>完成越界翻滚</span><span>整个方块离开后垂直下落</span></div></div>
      <h2>15.1 翻滚支点</h2>
      <p>BlockPresenter根据方向和姿态计算旋转轴、支点及目标四元数。动画完成后调用snapTo()依据PuzzleState重建精确位置和姿态。</p>
      <h2>15.2 阴影稳定</h2>
      <p>方块主体保持统一受光材质，棱线采用浅灰独立几何；平行光使用单级阴影区域，避免翻滚过程中级联阴影切换导致闪烁。</p>
    `,
  },
  {
    title: '16. 用户界面与安全区设计',
    lead: '界面采用横屏布局，主菜单位于左侧信息带，游戏HUD位于顶部安全区，弹窗和引导层居中或贴近底部，并由UI Camera独立渲染。',
    body: `
      <div class="figure ui-wireframe">
        <div class="safe-label">安全区</div><div class="title-band"><b>游戏标识</b><span>开始新游戏</span><span>继续游戏</span><span>选择关卡</span><span>输入密码</span><span>声音 / 语言</span></div>
        <div class="game-view"><div class="hud">菜单　　关卡 / 步数 / 时间 / 密码</div><div class="board-placeholder">三维棋盘显示区</div><div class="tutorial-bar">新手引导与操作按钮区域</div></div>
      </div>
      <h2>16.1 安全区</h2>
      <p><code>MobileSafeArea</code>读取可见区域并调整UITransform尺寸与位置，避免圆角屏、状态栏和手势区域遮挡。主菜单面板高度小于完整可见高度，并在窄屏下动态限制Logo尺寸。</p>
      <h2>16.2 控件生成</h2>
      <p>GameplayBootstrap集中创建按钮、标签、面板和输入框。UiButtonVisual统一管理普通、悬停、按下、禁用配色；EditBox的提示、输入和失焦文本均保持水平及垂直居中。</p>
    `,
  },
  {
    title: '17. 多语言与新手引导设计',
    lead: '文本通过UiTextKey和GameLanguage索引管理，支持简体中文、繁体中文和英文。引导系统按玩家首次遇到的机制选择主题，并在存档中记录已确认主题。',
    body: `
      <div class="figure localization-map">
        <div><b>UiTextKey</b><span>菜单</span><span>HUD</span><span>结果</span><span>规则说明</span></div><i>→</i>
        <div><b>localization</b><span>zh-CN</span><span>zh-TW</span><span>en</span></div><i>→</i>
        <div><b>Label绑定集合</b><span>applyLocalization()</span><span>即时刷新</span></div>
      </div>
      <div class="tutorial-strip"><span>移动</span><span>目标洞口</span><span>易碎地砖</span><span>轻触机关</span><span>重压机关</span><span>桥梁</span><span>分裂</span><span>切换</span><span>重组</span></div>
      <h2>17.1 引导触发</h2>
      <p>关卡加载后扫描当前LevelDefinition所包含的功能地砖，生成尚未确认的教程队列。玩家确认或跳过后调用<code>withAcknowledgedTutorials()</code>持久化，后续关卡不重复展示。</p>
      <h2>17.2 图形化规则</h2>
      <p>OnboardingVisual使用Graphics绘制与游戏相同的地砖、洞口、方块和机关符号。重压与分裂图标使用当前正交相机的投影基向量，确保引导角度与三维棋盘一致。</p>
    `,
  },
  {
    title: '18. 存档、密码与评分设计',
    lead: 'ReleaseSaveData保存继续游戏所需的最小信息。系统不直接序列化内部对象，而是保存操作序列并在恢复时重放，以验证存档仍符合当前规则。',
    body: `
      <div class="figure save-schema">
        <div><b>ReleaseSaveData</b><span>version</span><span>currentRun</span><span>highestUnlockedLevelId</span><span>soundEnabled / language</span><span>acknowledgedTutorials</span><span>bestStarsByLevel</span></div>
        <div class="save-arrows"><span>serializeReleaseSave ↓</span><b>本地键值存储</b><span>↑ decodeReleaseSave</span></div>
        <div><b>SavedRun</b><span>levelId</span><span>actions</span><span>elapsedSeconds</span></div>
      </div>
      <div class="rating-formula"><span><b>★★★</b> 玩家步数 ≤ 最优步数</span><span><b>★★</b> 玩家步数 ≤ 最优步数 × 1.25</span><span><b>★</b> 其他有效通关</span></div>
      <h2>18.1 密码访问</h2>
      <p>每关配置六位密码。输入时执行格式校验并映射关卡索引；密码列表展示全部关卡，未通关条目以星号隐藏，已通关条目可直接点击进入。</p>
      <h2>18.2 兼容与容错</h2>
      <p>存档包含版本号。解析失败、字段类型错误或关卡标识失效时回退到默认值；星级只保留合法的1至3，历史最佳成绩不会被更低评价覆盖。</p>
    `,
  },
  {
    title: '19. 平台、音频与反馈接口',
    lead: '平台能力通过PlatformAdapter抽象，音频通过AudioController集中管理。业务控制器只调用统一接口，不依赖某个设备的原生实现。',
    body: `
      <div class="figure adapter-diagram">
        <div class="interface"><b>PlatformAdapter</b><span>getSafeAreaInsets()</span><span>vibrateLight()</span><span>onLevelStarted()</span><span>onLevelCompleted()</span></div>
        <i>△</i><div><b>DefaultPlatformAdapter</b><span>网页振动能力</span><span>默认安全区</span></div><div><b>HarmonyOSAdapter</b><span>设备适配入口</span><span>生命周期扩展点</span></div>
      </div>
      <div class="audio-bus"><span>移动石材音效</span><span>坠落音效</span><span>玻璃碎裂</span><span>通关音效</span><span>按钮反馈</span><span>环境循环声</span></div>
      <h2>19.1 音频加载</h2>
      <p>AudioController启动后异步加载环境声和常用效果，缺少单个音频时仅输出警告，不阻断游戏。玩家首次交互后启动循环声，以符合浏览器及小游戏的自动播放限制。</p>
      <h2>19.2 反馈控制</h2>
      <p>声音开关保存在ReleaseSaveData并即时更新所有标签。失败和完成时调用轻振动接口；不支持振动的平台自动忽略，不影响主流程。</p>
    `,
  },
  {
    title: '20. 异常处理、测试与部署设计',
    lead: '系统通过输入校验、不可变状态、资源兜底和自动化测试控制风险。构建时仅包含项目使用的引擎模块和资源，以满足移动端及小游戏的体积要求。',
    body: `
      <table class="figure verification-table">
        <thead><tr><th>验证层级</th><th>验证对象</th><th>通过标准</th></tr></thead>
        <tbody>
          <tr><td>类型检查</td><td>TypeScript模块接口</td><td>主工程与Cocos声明均无类型错误</td></tr>
          <tr><td>规则测试</td><td>移动、机关、分裂、失败、完成</td><td>状态结果与预期一致</td></tr>
          <tr><td>关卡验证</td><td>33关结构和已验证解</td><td>关卡可加载且解法可完成</td></tr>
          <tr><td>存档测试</td><td>恢复、重置、星级与教程记录</td><td>非法数据可降级，合法数据可重放</td></tr>
          <tr><td>界面验证</td><td>横屏、安全区、三语言、输入</td><td>无越界、遮挡和方向错误</td></tr>
          <tr><td>设备验证</td><td>目标移动设备与小游戏容器</td><td>启动、关卡、音频和存档稳定</td></tr>
        </tbody>
      </table>
      <div class="deployment-flow"><span>源码</span><i>→</i><span>类型检查与测试</span><i>→</i><span>Cocos构建</span><i>→</i><span>资源裁剪</span><i>→</i><span>目标平台包</span><i>→</i><span>真机验收</span></div>
      <h2>20.1 异常处理</h2>
      <p>资源加载失败采用警告与降级策略；关卡结构错误在引擎创建前抛出；无效移动返回invalid而不修改状态；损坏存档回退默认结构；平台能力缺失时使用空实现。</p>
      <h2>20.2 源码关联总结</h2>
      <p>本文档中的处理流程、模块接口、数据结构和状态转换均对应现有TypeScript源程序：核心规则对应PuzzleEngine，表现对应BoardRenderer与BlockPresenter，流程对应GameplayController，装配对应GameplayBootstrap，持久化对应releaseSave与ReleaseSaveRepository。</p>
    `,
  },
];

if (pages.length < 10 || pages.length > 60) {
  throw new Error(`Design document must contain 10 to 60 pages; found ${pages.length}.`);
}

const pageHtml = pages.map((page, index) => `
  <section class="page">
    <header>${productName}</header>
    <main>
      <div class="chapter"><span>${String(index + 1).padStart(2, '0')}</span><h1>${page.title}</h1></div>
      <p class="lead">${page.lead}</p>
      ${page.body}
    </main>
    <footer>第 ${index + 1} 页 / 共 ${pages.length} 页</footer>
  </section>`).join('');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${productName}软件设计说明书</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #1b2530; }
    body { font-family: Arial, "PingFang SC", "Microsoft YaHei", sans-serif; }
    .page { width: 210mm; height: 297mm; padding: 9mm 13mm 10mm; position: relative; overflow: hidden; break-after: page; page-break-after: always; background: #fff; }
    .page:last-child { break-after: auto; page-break-after: auto; }
    header { height: 8mm; border-bottom: .25mm solid #566575; display: flex; align-items: center; justify-content: flex-start; font-size: 8pt; color: #334252; }
    main { padding-top: 5mm; }
    .chapter { display: flex; align-items: center; gap: 4mm; margin-bottom: 2.5mm; }
    .chapter > span { width: 9mm; height: 9mm; display: grid; place-items: center; background: #b42834; color: #fff; font-size: 9pt; font-weight: 700; }
    h1 { margin: 0; font-size: 19pt; color: #162638; letter-spacing: 0; }
    h2 { margin: 4mm 0 1.5mm; font-size: 11pt; color: #314b62; border-left: 1.2mm solid #d6a83e; padding-left: 2.4mm; }
    p { margin: 1.8mm 0; font-size: 9.2pt; line-height: 1.65; text-align: justify; }
    .lead { margin: 0 0 4mm; color: #46596b; font-size: 10pt; line-height: 1.65; }
    ul { margin: 1mm 0 0 5mm; padding-left: 4mm; columns: 2; column-gap: 8mm; }
    li { margin: 0 0 1.6mm; font-size: 8.8pt; line-height: 1.5; break-inside: avoid; }
    code { font-family: Menlo, Monaco, monospace; font-size: 8pt; background: #edf1f4; padding: .2mm 1mm; color: #27465d; }
    footer { position: absolute; left: 13mm; right: 13mm; bottom: 4mm; border-top: .2mm solid #aab3bc; padding-top: 1.8mm; text-align: center; font-size: 8pt; color: #344454; }
    .figure { border: .25mm solid #aeb9c3; background: #f5f7f9; min-height: 67mm; margin: 3mm 0 4mm; padding: 5mm; }
    .figure b, .figure strong { color: #17354c; }
    .arrow { color: #b42834; font-size: 18pt; font-weight: 700; }
    .cover-figure { min-height: 106mm; display: grid; place-items: center; background: #101820; border: 0; }
    .cover-board { width: 115mm; height: 64mm; display: grid; grid-template-columns: repeat(5, 20mm); grid-template-rows: repeat(4, 14mm); gap: 1.5mm; transform: skewY(-7deg); position: relative; }
    .cover-board .tile { background: #d8dde2; border: .6mm solid #929ca6; box-shadow: 1.5mm 2mm 0 #606c77; }
    .cover-board .t1,.cover-board .t5,.cover-board .t14,.cover-board .t18 { visibility: hidden; }
    .goal-hole { position: absolute; width: 13mm; height: 8mm; border-radius: 50%; background: #050709; right: 24mm; bottom: 11mm; box-shadow: 0 0 0 1.5mm #68737e; }
    .rolling-block { position: absolute; width: 17mm; height: 34mm; background: #b72d37; border: .7mm solid #d85b63; left: 40mm; top: -13mm; box-shadow: 4mm 4mm 0 #73151d; transform: skewY(7deg) rotate(-8deg); }
    .cover-caption { color: #eef3f6; font-size: 12pt; letter-spacing: 1.5mm; margin-top: 3mm; }
    .summary-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 2mm; }
    .summary-grid div { border-left: 1mm solid #b42834; background: #f1f4f6; padding: 2.2mm 3mm; display: flex; justify-content: space-between; font-size: 9pt; }
    .summary-grid span { color: #536578; }
    .context-diagram { display: flex; align-items: center; justify-content: space-around; }
    .actor { width: 22mm; height: 22mm; border-radius: 50%; background: #d6a83e; display: grid; place-items: center; font-weight: 700; }
    .system-box { width: 77mm; padding: 5mm; background: #233a4d; color: #fff; display: grid; grid-template-columns: repeat(2,1fr); gap: 2mm; text-align: center; }
    .system-box strong { grid-column: 1/-1; color: #fff; margin-bottom: 2mm; }
    .system-box span { background: #385870; padding: 2mm; }
    .outputs { display: grid; grid-template-columns: repeat(2,15mm); gap: 2mm; }
    .outputs span { background: #e2e7eb; padding: 2mm 0; text-align: center; font-size: 8pt; }
    .vertical-flow { min-height: 107mm; display: grid; place-items: center; }
    .vertical-flow div { width: 122mm; text-align: center; padding: 2.4mm; background: #e6ebef; border-left: 1.2mm solid #334e64; font-size: 9pt; }
    .vertical-flow div:nth-of-type(3),.vertical-flow div:nth-of-type(5) { background: #f5e8c8; border-color: #c38a18; }
    .vertical-flow i { color: #b42834; font-style: normal; }
    .layer-stack { display: grid; gap: 2mm; }
    .layer-stack div { padding: 4mm; color: #fff; display: flex; justify-content: space-between; }
    .layer-stack div:nth-child(1) { background: #8c2c38; }.layer-stack div:nth-child(2) { background: #32566e; }.layer-stack div:nth-child(3) { background: #387066; }.layer-stack div:nth-child(4) { background: #646b75; }
    .layer-stack span { font-size: 8pt; }
    table { width: 100%; border-collapse: collapse; font-size: 7.6pt; }
    th { background: #263f54; color: #fff; padding: 2.3mm; text-align: left; }
    td { border: .2mm solid #b7c0c8; padding: 1.8mm 2.2mm; vertical-align: top; }
    tr:nth-child(even) td { background: #edf1f4; }
    .module-table { min-height: auto; padding: 0; }
    .data-model { display: grid; grid-template-columns: repeat(2,1fr); gap: 3mm; }
    .data-model div { border-top: 1.2mm solid #b42834; background: #fff; padding: 3mm; display: grid; gap: 1mm; }
    .data-model b { font-size: 10pt; }.data-model span { font: 8pt Menlo, monospace; color: #516273; }
    .validation-flow { display: flex; align-items: center; justify-content: space-between; min-height: 55mm; }
    .validation-flow div { width: 24mm; min-height: 25mm; padding: 3mm 2mm; display: grid; place-items: center; text-align: center; background: #e1e7eb; font-size: 8pt; }
    .validation-flow i { font-style: normal; color: #b42834; }.validation-flow .ok { background: #b8d8cb; }
    .transition-table { min-height: auto; padding: 0; font-size: 8.5pt; }
    .orientation-demo { display: flex; align-items: center; justify-content: center; gap: 5mm; margin: 4mm 0; }
    .orientation-demo span { padding: 3mm 6mm; color: #fff; background: #385970; }.orientation-demo .stand { background: #a92d38; }.orientation-demo i { font-size: 16pt; }
    .decision-tree { display: grid; grid-template-columns: 1fr 23mm; gap: 1.3mm 3mm; align-items: center; }
    .decision-tree div { background: #e2e8ec; padding: 2mm; text-align: center; }.decision-tree .decision { border: .6mm solid #c39325; background: #fff6df; }.decision-tree .ok { background: #b8d8cb; }
    .decision-tree i { text-align: center; font-style: normal; color: #8b3340; }.decision-tree b { font-size: 8pt; }
    .switch-map { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; align-items: center; }
    .switch { background: #fff; padding: 4mm; display: grid; place-items: center; gap: 2mm; border-top: 1.5mm solid #2d7f72; }.switch.hard { border-color: #ad5e23; }
    .action-list,.bridge-bank { display: grid; gap: 2mm; }.action-list span { background: #d6a83e; padding: 2mm; text-align: center; }.bridge-bank { grid-column: 1/-1; grid-template-columns: repeat(3,1fr); background: #304c63; color: #fff; padding: 3mm; }
    .compare-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }.compare-panels > div { background: #fff; padding: 4mm; text-align: center; }.compare-panels p { font-size: 8pt; }
    .mini-board { display: grid; grid-template-columns: repeat(3,13mm); justify-content: center; gap: 1mm; margin: 4mm; }.mini-board i,.mini-board em { height: 10mm; background: #dce1e5; border: .4mm solid #8d98a2; }.mini-board em { border-radius: 50%; background: #080a0c; }
    .glass-tile { width: 45mm; height: 34mm; margin: 8mm auto; background: #acdce5aa; border: 1mm solid #d5f2f6; display: flex; justify-content: space-around; transform: skewY(-8deg); }.glass-tile span { border-left: .5mm solid #fff; transform: rotate(25deg); }
    .state-machine { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; }.state-machine div { width: 32mm; padding: 4mm 2mm; text-align: center; background: #2f5269; color: #fff; }.state-machine i { width: 20mm; text-align: center; font-size: 7pt; color: #8c2c38; }.split-machine .loop { width: 100%; margin-top: 7mm; padding: 2mm; text-align: center; background: #f3dfaa; }
    .mode-map { position: relative; display: grid; grid-template-columns: repeat(4,1fr); gap: 4mm; align-content: center; }.mode { padding: 3mm 1mm; background: #dfe5e9; text-align: center; font: 8pt Menlo, monospace; z-index: 2; }.mode.title { background: #d4a640; }.mode.playing { background: #4c806f; color: #fff; }.mode.result { background: #8f3541; color: #fff; }.mode-map svg { position: absolute; inset: 5mm; width: calc(100% - 10mm); height: calc(100% - 10mm); z-index: 1; }.mode-map path { stroke: #7f8d99; stroke-width: 2; fill: none; }
    .input-pipeline { display: flex; align-items: center; justify-content: space-between; }.input-pipeline div { width: 34mm; min-height: 45mm; background: #fff; border-top: 1mm solid #395c74; padding: 3mm; display: grid; gap: 2mm; text-align: center; }.input-pipeline span { font-size: 7.5pt; }.input-pipeline i { color: #b42834; font-style: normal; font-size: 16pt; }
    .scene-tree { display: grid; grid-template-columns: 1.4fr 1fr; gap: 5mm; }.scene-tree > div { background: #fff; padding: 4mm; }.scene-tree ul { columns: 1; margin: 2mm 0; }.scene-tree li { font: 8pt Menlo, monospace; }.scene-tree small { color: #687785; }.camera-spec { display: grid; grid-template-columns: repeat(2,1fr); gap: 2mm; }.camera-spec span { background: #2e4e65; color: #fff; padding: 3mm; text-align: center; font-size: 8pt; }.camera-spec b { color: #f1c75a; }
    .timeline { display: flex; align-items: center; }.timeline div { width: 35mm; height: 35mm; border-radius: 50%; display: grid; place-items: center; text-align: center; background: #2f536b; color: #fff; padding: 3mm; }.timeline i { flex: 1; height: 1mm; background: #c89b32; }.timeline b { color: #fff; }.timeline span { font-size: 7pt; }
    .fall-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }.fall-compare div { border-left: 1mm solid #b42834; background: #eef2f4; padding: 3mm; display: grid; gap: 1mm; }.fall-compare span { font-size: 8pt; }
    .ui-wireframe { display: grid; grid-template-columns: 43mm 1fr; position: relative; padding: 4mm; background: #151a20; color: #fff; }.safe-label { position: absolute; right: 3mm; top: 2mm; color: #d5ac4e; font-size: 7pt; }.title-band { background: #252d35; padding: 4mm; display: grid; gap: 2mm; }.title-band span { padding: 1.5mm; background: #3b4650; font-size: 7pt; }.game-view { position: relative; border: .5mm dashed #d5ac4e; }.hud { height: 9mm; padding: 2mm; background: #202a33; text-align: center; font-size: 7pt; }.board-placeholder { height: 43mm; display: grid; place-items: center; color: #8998a5; }.tutorial-bar { height: 10mm; padding: 2mm; background: #2c353d; text-align: center; font-size: 7pt; }
    .localization-map { display: flex; align-items: center; justify-content: space-around; }.localization-map div { width: 42mm; min-height: 45mm; background: #fff; padding: 3mm; display: grid; gap: 2mm; text-align: center; }.localization-map i { color: #b42834; font-style: normal; font-size: 16pt; }.tutorial-strip { display: grid; grid-template-columns: repeat(9,1fr); gap: 1mm; }.tutorial-strip span { background: #38586f; color: #fff; font-size: 6.5pt; text-align: center; padding: 2mm 1mm; }
    .save-schema { display: grid; grid-template-columns: 1fr .8fr 1fr; gap: 4mm; align-items: center; }.save-schema > div { background: #fff; padding: 3mm; display: grid; gap: 1mm; }.save-schema span { font: 7pt Menlo, monospace; }.save-arrows { text-align: center; background: transparent!important; }.rating-formula { display: grid; grid-template-columns: repeat(3,1fr); gap: 2mm; }.rating-formula span { background: #f3e3b9; padding: 2mm; text-align: center; font-size: 7.5pt; }.rating-formula b { color: #bc8614; }
    .adapter-diagram { display: grid; grid-template-columns: 1.2fr 15mm 1fr 1fr; gap: 3mm; align-items: center; }.adapter-diagram div { min-height: 48mm; background: #fff; padding: 3mm; display: grid; gap: 2mm; text-align: center; }.adapter-diagram i { font-style: normal; font-size: 18pt; text-align: center; }.adapter-diagram span { font-size: 7pt; }.interface { border-top: 1.2mm solid #b42834; }.audio-bus { display: grid; grid-template-columns: repeat(6,1fr); gap: 1mm; }.audio-bus span { padding: 2mm 1mm; background: #304e64; color: #fff; text-align: center; font-size: 6.5pt; }
    .verification-table { min-height: auto; padding: 0; font-size: 8.2pt; }.deployment-flow { display: flex; align-items: center; justify-content: space-between; margin: 4mm 0; }.deployment-flow span { background: #304f65; color: #fff; padding: 2.5mm; font-size: 7.5pt; }.deployment-flow i { color: #b42834; font-style: normal; }
  </style>
</head>
<body>${pageHtml}</body>
</html>`;

writeFileSync(outputPath, html);
console.log(JSON.stringify({ outputPath, productName, totalPages: pages.length }, null, 2));
