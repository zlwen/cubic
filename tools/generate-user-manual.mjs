import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outputPath = resolve(process.argv[2] ?? '/private/tmp/rolling-block-user-manual.html');
const productName = '滚一滚V1.0.0';
const screenshotDirectory = resolve('docs/游戏截图');

function screenshot(fileName, caption) {
  const source = readFileSync(resolve(screenshotDirectory, fileName));
  const dataUrl = `data:image/png;base64,${source.toString('base64')}`;
  return `
    <figure class="screen-figure">
      <img src="${dataUrl}" alt="${caption}">
      <figcaption>${caption}</figcaption>
    </figure>`;
}

const pages = [
  {
    title: '软件使用说明书',
    lead: '本文档介绍滚一滚V1.0.0从启动、主菜单操作、关卡进入、核心玩法、特殊地砖、暂停设置到通关评价的完整使用方法。',
    body: `
      <div class="info-grid">
        <div><b>软件名称</b><span>滚一滚</span></div>
        <div><b>版本号</b><span>V1.0.0</span></div>
        <div><b>软件类型</b><span>三维空间益智游戏</span></div>
        <div><b>操作方式</b><span>触屏滑动、网页键盘</span></div>
      </div>
      <div class="introduction">
        <h2>游戏概述</h2>
        <p>滚一滚V1.0.0是一款以空间观察、路线规划和方块姿态控制为核心的三维益智游戏。玩家需要在悬空棋盘上控制一个长方体，利用向上、向下、向左和向右的移动，使方块沿自身棱边连续翻滚。每次翻滚都会改变方块占据的棋盘格和直立、横向平躺或纵向平躺的姿态，因此玩家既要规划前进路线，也要提前判断下一步的落点与支撑情况。</p>
        <h2>游戏目标</h2>
        <p>每个关卡均设有起始位置和目标洞口。玩家需要避开棋盘边缘和无支撑区域，并让长方体最终以直立姿态准确落入目标洞口，才能完成关卡。方块平躺经过洞口不会通关；方块越出棋盘、失去全部支撑，或直立压碎易碎地砖时，本次挑战将失败，用户可从失败页面重新开始。</p>
        <h2>主要玩法</h2>
        <p>随着关卡推进，棋盘会出现轻触机关、重压机关、隐藏桥梁、易碎地砖和分裂地砖。轻触机关可由完整方块的任意部分或分裂后的小方块触发；重压机关需要完整方块直立压下；易碎地砖只能允许方块平躺经过；分裂地砖会将长方体拆分为两个可分别控制的小方块，两个小方块移动到相邻位置后可重新组合。玩家需要综合运用这些规则打开通路并到达目标。</p>
        <h2>主要功能</h2>
        <p>软件包含33个关卡，并提供新游戏、继续游戏、关卡选择、密码直达、教学引导、暂停设置、声音开关和多语言切换等功能。系统会自动保存关卡解锁状态和最佳星级，并根据玩家通关步数与关卡最优步数的差距评定一至三星。用户可以重复挑战已解锁关卡以提高评价，也可以使用已获得的六位密码快速进入对应关卡。</p>
      </div>
      <h2>文档阅读说明</h2>
      <p>后续章节按照真实使用顺序编排。界面截图均来自软件完整横屏画面，未截取局部区域。红色按钮表示当前主要操作，灰色按钮表示可选操作；完成当前页所述操作后，可按“跳转结果”继续阅读下一界面的说明。</p>
    `,
  },
  {
    title: '1. 启动软件与进入主界面',
    lead: '用户在设备或小游戏容器中打开软件后，系统先加载首场景、界面资源和本地进度，随后自动进入主界面。',
    body: `
      <div class="figure startup-flow">
        <div><b>打开软件</b><span>点击应用图标或小游戏入口</span></div><i>→</i>
        <div><b>加载资源</b><span>显示启动进度，准备三维场景</span></div><i>→</i>
        <div><b>读取进度</b><span>恢复关卡、星级和设置</span></div><i>→</i>
        <div class="active"><b>显示主界面</b><span>可以开始或继续游戏</span></div>
      </div>
      <h2>1.1 启动方法</h2>
      <ol><li>将设备调整为横屏，点击“滚一滚”图标或从对应小游戏入口进入。</li><li>启动进度显示期间保持软件处于前台，不需要点击屏幕。</li><li>加载完成后，系统自动展示主界面和后台三维棋盘演示。</li></ol>
      <h2>1.2 运行要求</h2>
      <p>软件适用于支持横屏和三维图形显示的手机、平板、现代浏览器及小游戏运行环境。触屏设备使用滑动手势；网页版本还可使用方向键或W、A、S、D键。首次运行没有历史记录时，“继续游戏”可能不可用或指向第一关。</p>
      <div class="jump"><b>跳转结果</b><span>资源加载完成 → 主界面</span></div>
    `,
  },
  {
    title: '2. 主界面与菜单功能',
    lead: '主界面是所有功能的入口。左侧显示游戏标志和菜单，右侧展示自动运行的棋盘场景。',
    body: `
      ${screenshot('游戏首页.PNG', '图2-1 软件主界面完整画面')}
      <div class="two-column">
        <div><h2>2.1 开始与继续</h2><p>点击“开始新游戏”会清除当前临时关卡并从第一关开始；点击“继续游戏”会读取本地保存的关卡编号、步数记录和解锁进度，进入上次可继续的关卡。</p></div>
        <div><h2>2.2 其他入口</h2><p>“选择关卡”进入关卡列表；“输入密码”进入密码页面；“声音”切换音效；“语言”依次切换简体中文、繁体中文和英文；“制作人员”显示软件信息。</p></div>
      </div>
      <div class="operation-table"><b>操作</b><span>点击左侧对应菜单按钮</span><b>跳转结果</b><span>根据按钮进入关卡、选关、密码或信息页面</span></div>
    `,
  },
  {
    title: '3. 选择关卡',
    lead: '已解锁关卡可以从关卡列表直接进入；尚未解锁的关卡以“--”显示，不能提前选择。',
    body: `
      ${screenshot('选择关卡.PNG', '图3-1 选择关卡完整界面')}
      <h2>3.1 进入方法</h2>
      <ol><li>在主界面点击“选择关卡”。</li><li>系统打开关卡列表，已解锁的编号正常显示，已通关关卡下方显示获得的星级。</li><li>点击可用的关卡编号，系统立即加载对应棋盘并进入游戏。</li><li>不需要选择时，点击底部“返回”回到主界面。</li></ol>
      <h2>3.2 解锁规则</h2>
      <p>完成当前关卡后会解锁下一关。列表中的星星代表该关卡历史最佳评价，不会因为重复挑战获得较低评价而减少。未解锁关卡不能通过关卡列表直接进入，但可以在获得正确密码后通过密码功能访问。</p>
      <div class="jump"><b>跳转结果</b><span>主界面“选择关卡” → 关卡列表 → 点击编号 → 游戏界面</span></div>
    `,
  },
  {
    title: '4. 输入密码与快速进入关卡',
    lead: '每个关卡具有六位数字密码。玩家可输入已知密码，也可点击列表中已经显示的通关密码进入对应关卡。',
    body: `
      ${screenshot('输入密码.PNG', '图4-1 输入密码完整界面')}
      <h2>4.1 手动输入</h2>
      <ol><li>在主界面点击“输入密码”。</li><li>点击页面上方的密码输入框，使用系统键盘输入六位数字。</li><li>检查输入内容后点击红色“确认”按钮。</li><li>密码有效时进入对应关卡；密码无效时保持当前页面，用户可以重新输入。</li></ol>
      <h2>4.2 通关密码列表</h2>
      <p>列表展示全部33个关卡。已完成关卡显示真实密码并可直接点击；尚未完成关卡的密码以星号隐藏。点击底部“返回”可取消输入并回到主界面。密码功能不会修改既有星级记录。</p>
      <div class="jump"><b>跳转结果</b><span>主界面“输入密码” → 密码页面 → 确认有效密码 → 对应关卡</span></div>
    `,
  },
  {
    title: '5. 游戏界面、基本操作与机关',
    lead: '进入关卡后，用户通过滑动控制长方体翻滚。顶部信息区显示关卡、步数、时间和当前关卡密码。',
    body: `
      ${screenshot('游戏引导 2.PNG', '图5-1 游戏界面及轻触机关教学完整画面')}
      <div class="two-column compact">
        <div><h2>5.1 基本操作</h2><p>在棋盘空白区域向上、下、左或右滑动，方块会沿对应方向绕棱翻滚一格。网页端可使用方向键或W、A、S、D。应先观察落点，避免方块任何占格失去支撑。</p></div>
        <div><h2>5.2 通关目标</h2><p>将长方体调整为直立姿态，并使其准确落入棋盘目标洞口即可完成关卡。平躺经过洞口不会通关；方块越出棋盘会掉落并判定失败。</p></div>
      </div>
      <h2>5.3 轻触与重压机关</h2>
      <p>圆形标记是轻触机关，完整方块的任意部分或分裂后的小方块都能触发。螺旋标记是重压机关，只有完整方块直立压上时才能触发。机关用于显示、隐藏或切换与其连接的桥梁；部分机关可重复触发。</p>
      <div class="jump"><b>教学操作</b><span>点击“下一项”继续介绍；点击“跳过”直接开始关卡</span></div>
    `,
  },
  {
    title: '6. 易碎地砖的使用规则',
    lead: '透明玻璃质感的地砖属于易碎地砖。它能够承受平躺方块的部分重量，但不能承受直立方块的集中压力。',
    body: `
      ${screenshot('游戏引导 3.PNG', '图6-1 易碎地砖教学完整画面')}
      <h2>6.1 识别方法</h2>
      <p>易碎地砖比普通灰色地砖更透明，表面带玻璃高光和边框。进入包含该机制的关卡时，系统会显示对应教学。教学窗口左侧同步渲染游戏中的地砖外观，便于用户在棋盘上识别。</p>
      <h2>6.2 通过方法</h2>
      <ol><li>预先判断方块下一次翻滚后的姿态。</li><li>让长方体以平躺姿态经过易碎地砖，此时地砖可以提供支撑。</li><li>不要让方块直立停在易碎地砖上，否则地砖会碎裂，方块随之掉落。</li><li>阅读完成后点击“知道了”关闭教学并开始操作。</li></ol>
      <div class="notice"><b>注意</b><span>易碎地砖碎裂会直接导致本次挑战失败，需要从失败界面重新开始。</span></div>
    `,
  },
  {
    title: '7. 分裂地砖与双方块控制',
    lead: '完整方块直立压在分裂地砖上时会分成两个小正方体。玩家需要分别移动它们，并在相邻格重新组合。',
    body: `
      ${screenshot('游戏引导 4.PNG', '图7-1 分裂地砖教学完整画面')}
      <h2>7.1 触发与移动</h2>
      <ol><li>让完整长方体以直立姿态落在带有“两个三角形和中间竖线”标记的分裂地砖上。</li><li>分裂后，带有选择提示的小方块是当前活动方块，滑动屏幕只移动该方块。</li><li>点击界面中的切换控制，或在网页端按空格键，切换当前活动的小方块。</li><li>两个小方块移动到上下或左右相邻格后会自动重新组合成长方体。</li></ol>
      <h2>7.2 机关配合</h2>
      <p>分裂后的小方块可以触发轻触机关，但不能触发要求完整方块直立受力的重压机关。规划路线时应同时保证两个小方块均有地砖支撑，并确定最终合并方向。</p>
      <div class="jump"><b>教学操作</b><span>点击“下一项”查看后续说明，或点击“跳过”开始关卡</span></div>
    `,
  },
  {
    title: '8. 暂停菜单与游戏设置',
    lead: '游戏过程中点击左上角“菜单”可暂停计时和方块操作，并打开暂停菜单。',
    body: `
      ${screenshot('游戏暂停.PNG', '图8-1 游戏暂停菜单完整画面')}
      <h2>8.1 暂停与恢复</h2>
      <p>在游戏界面点击左上角“菜单”后进入暂停状态。点击“返回游戏”关闭菜单，恢复当前关卡、计时和操作；暂停期间在棋盘区域滑动不会移动方块。</p>
      <h2>8.2 设置和退出</h2>
      <ul><li><b>声音：</b>点击后在“开”和“关”之间切换，设置会保存并用于后续关卡。</li><li><b>语言：</b>点击后切换简体中文、繁体中文和英文，界面文字立即更新。</li><li><b>返回主菜单：</b>退出当前关卡并回到主界面，已保存的通关和星级记录不会丢失。</li></ul>
      <div class="jump"><b>跳转结果</b><span>游戏界面“菜单” → 暂停菜单 → “返回游戏”或“返回主菜单”</span></div>
    `,
  },
  {
    title: '9. 多语言界面',
    lead: '软件支持简体中文、繁体中文和英文。语言设置会同步应用于主菜单、游戏HUD、教程、暂停菜单和结果页面。',
    body: `
      ${screenshot('游戏首页-英文.PNG', '图9-1 切换为英文后的主界面完整画面')}
      <h2>9.1 主界面切换</h2>
      <ol><li>在主界面点击“语言：简体中文”。</li><li>每点击一次切换到下一个可用语言，直到显示目标语言。</li><li>界面文字立即刷新，不需要重启软件。</li></ol>
      <h2>9.2 游戏中切换</h2>
      <p>在关卡中点击“菜单”，再点击语言按钮，同样可以切换语言。关闭暂停菜单后，关卡、步数、时间、密码和教学说明会采用新语言。语言选择保存在本地，下次打开软件时继续使用上次设置。</p>
      <div class="operation-table"><b>英文菜单示例</b><span>START NEW GAME、RESUME GAME、LOAD STAGE、ENTER PASSCODE</span><b>返回中文</b><span>继续点击LANGUAGE按钮直至显示简体中文</span></div>
    `,
  },
  {
    title: '10. 通关、失败与重新挑战',
    lead: '系统会根据方块位置自动判断继续、失败或通关，不需要用户点击确认目标。',
    body: `
      <div class="figure result-flow">
        <div class="move"><b>完成一次翻滚</b><span>系统检查方块姿态与支撑</span></div>
        <div class="branch"><b>仍在棋盘</b><span>继续操作</span></div>
        <div class="branch fail"><b>失去支撑或压碎地砖</b><span>播放掉落或碎裂动画</span><em>失败页面 → 重新开始</em></div>
        <div class="branch success"><b>直立落入目标洞口</b><span>播放入洞动画</span><em>通关页面 → 下一关</em></div>
      </div>
      <h2>10.1 失败处理</h2>
      <p>方块越出棋盘、所有占格失去支撑，或直立压碎易碎地砖时，本次挑战失败。动画结束后系统显示失败提示。点击“重新开始”会恢复该关卡初始棋盘、方块位置、机关状态、步数和计时；返回主菜单则退出本关。</p>
      <h2>10.2 通关处理</h2>
      <p>方块必须直立落入目标洞口才算通关。系统保存本关成绩、解锁下一关并显示获得的星级。点击“下一关”继续挑战；点击返回可回到主界面或关卡列表。全部33关完成后显示全关卡完成页面和累计星数。</p>
    `,
  },
  {
    title: '11. 星级评价、进度与继续游戏',
    lead: '每关评价由玩家实际移动步数与关卡最优步数比较得出，分为一星、二星和三星。',
    body: `
      <div class="figure rating">
        <div class="stars"><b>★★★</b><span>接近或达到最优步数</span></div>
        <div class="stars"><b>★★☆</b><span>超过三星范围但仍较高效</span></div>
        <div class="stars"><b>★☆☆</b><span>完成关卡但使用步数较多</span></div>
      </div>
      <h2>11.1 成绩保存</h2>
      <p>软件在通关时记录关卡完成状态、最佳星级和后续解锁信息。重复挑战同一关时，只保留更高的历史星级；已经获得的星星不会因后续成绩较低而减少。关卡列表通过编号下方的星星展示最佳结果。</p>
      <h2>11.2 继续游戏</h2>
      <p>返回主界面后，“继续游戏”按钮会显示当前可继续的关卡编号。点击该按钮可以快速恢复进度。密码、声音、语言、已查看的教学和关卡星级均保存在本地。清理浏览器或小游戏本地数据、卸载软件或更换未同步数据的设备可能导致本地记录重置。</p>
      <div class="progress-line"><span>开始第一关</span><i></i><span>逐关解锁</span><i></i><span>提高星级</span><i></i><span>完成33关</span></div>
    `,
  },
  {
    title: '12. 完整功能导航与推荐操作顺序',
    lead: '下图汇总各界面的进入方式和返回路径。首次使用建议从“开始新游戏”进入，让教学按关卡进度依次出现。',
    body: `
      <div class="figure navigation-map">
        <div class="nav home"><b>主界面</b><span>开始新游戏</span><span>继续游戏</span><span>选择关卡</span><span>输入密码</span><span>声音 / 语言</span></div>
        <i>→</i><div class="nav"><b>关卡准备</b><span>选择编号</span><span>输入密码</span><span>读取进度</span></div>
        <i>→</i><div class="nav play"><b>游戏界面</b><span>滑动翻滚</span><span>触发机关</span><span>暂停设置</span></div>
        <i>→</i><div class="nav"><b>结果页面</b><span>失败重试</span><span>通关评价</span><span>进入下一关</span></div>
      </div>
      <h2>12.1 首次使用顺序</h2>
      <ol><li>打开软件并等待主界面显示。</li><li>确认语言和声音设置，点击“开始新游戏”。</li><li>阅读随关卡出现的机关教学，按提示关闭教学。</li><li>通过滑动控制方块，直立落入目标洞口。</li><li>查看通关星级并进入下一关；需要暂离时返回主菜单，之后使用“继续游戏”。</li></ol>
      <h2>12.2 熟悉后的使用方式</h2>
      <p>已经熟悉规则的用户可从“选择关卡”重复挑战以提高星级，也可在“输入密码”页面输入六位密码直达指定关卡。遇到特殊地砖时先观察颜色和表面标记，再决定方块应以平躺、直立或分裂状态通过。</p>
    `,
  },
  {
    title: '13. 常见问题与操作注意事项',
    lead: '以下处理方法适用于软件能够正常启动但操作结果与预期不一致的情况。',
    body: `
      <table class="faq-table">
        <thead><tr><th>现象</th><th>原因</th><th>处理方法</th></tr></thead>
        <tbody>
          <tr><td>滑动后方块没有移动</td><td>滑动距离过短、正在播放动画或打开了暂停菜单</td><td>在棋盘空白区域完整滑动，等待当前动画结束，或先点击“返回游戏”</td></tr>
          <tr><td>重压机关没有触发</td><td>方块处于平躺状态，或使用的是分裂后的小方块</td><td>规划路线，使完整长方体直立压在螺旋标记机关上</td></tr>
          <tr><td>易碎地砖突然碎裂</td><td>完整方块直立停在易碎地砖上</td><td>重新开始，让方块保持平躺状态经过该地砖</td></tr>
          <tr><td>两个小方块无法合并</td><td>两个小方块没有位于上下或左右相邻格</td><td>切换活动方块，将两者移动到边相邻位置</td></tr>
          <tr><td>关卡编号不能点击</td><td>该关卡尚未解锁</td><td>先完成前一关，或在密码页面输入有效关卡密码</td></tr>
          <tr><td>没有声音</td><td>软件声音设置关闭或设备处于静音状态</td><td>在主界面或暂停菜单打开声音，并检查设备音量</td></tr>
          <tr><td>网页键盘方向不响应</td><td>页面没有焦点或输入框仍处于编辑状态</td><td>点击游戏区域后使用方向键，退出密码输入框再操作</td></tr>
        </tbody>
      </table>
      <h2>13.1 操作注意事项</h2>
      <ul><li>建议始终使用横屏，避免在关卡运行中频繁旋转设备。</li><li>方块动画未结束时不要连续快速点击菜单按钮。</li><li>输入密码时只输入页面要求的六位数字。</li><li>重要进度以本地数据保存，清理软件数据前应确认影响。</li></ul>
      <h2>13.2 退出软件</h2>
      <p>需要结束游戏时，可先从暂停菜单返回主界面，再使用设备或小游戏容器的返回、关闭功能退出。已完成关卡和设置会在正常操作过程中自动保存，无需单独点击保存按钮。</p>
    `,
  },
];

if (pages.length <= 10 || pages.length > 60) {
  throw new Error(`User manual must contain more than 10 and no more than 60 pages; found ${pages.length}.`);
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
  <title>${productName}软件使用说明书</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #1c2732; }
    body { font-family: Arial, "PingFang SC", "Microsoft YaHei", sans-serif; }
    .page { width: 210mm; height: 297mm; padding: 9mm 13mm 10mm; position: relative; overflow: hidden; break-after: page; page-break-after: always; background: #fff; }
    .page:last-child { break-after: auto; page-break-after: auto; }
    header { height: 8mm; border-bottom: .25mm solid #566575; display: flex; align-items: center; justify-content: flex-start; font-size: 8pt; color: #334252; }
    main { padding-top: 5mm; }
    .chapter { display: flex; align-items: center; gap: 4mm; margin-bottom: 2.5mm; }
    .chapter > span { width: 9mm; height: 9mm; display: grid; place-items: center; background: #b42834; color: #fff; font-size: 9pt; font-weight: 700; }
    h1 { margin: 0; font-size: 19pt; color: #162638; }
    h2 { margin: 3.5mm 0 1.5mm; font-size: 10.5pt; color: #314b62; border-left: 1.2mm solid #d6a83e; padding-left: 2.4mm; }
    p { margin: 1.5mm 0; font-size: 8.8pt; line-height: 1.6; text-align: justify; }
    .lead { margin: 0 0 3mm; color: #46596b; font-size: 9.5pt; line-height: 1.6; }
    ol, ul { margin: 1mm 0 1mm 5mm; padding-left: 4mm; }
    li { margin: 0 0 1.3mm; font-size: 8.5pt; line-height: 1.5; }
    footer { position: absolute; left: 13mm; right: 13mm; bottom: 4mm; border-top: .2mm solid #aab3bc; padding-top: 1.8mm; text-align: center; font-size: 8pt; color: #344454; }
    .figure { border: .25mm solid #aeb9c3; background: #f5f7f9; margin: 3mm 0 4mm; padding: 5mm; }
    .screen-figure { margin: 2.5mm 0 3mm; padding: 2.2mm; border: .25mm solid #9ca8b3; background: #eef1f3; }
    .screen-figure img { display: block; width: 100%; height: auto; object-fit: contain; object-position: center; background: #050709; }
    .screen-figure figcaption { margin-top: 1.5mm; text-align: center; color: #536272; font-size: 7.6pt; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
    .two-column h2 { margin-top: 1.5mm; }
    .two-column.compact p { font-size: 8.2pt; }
    .jump, .notice, .operation-table { margin-top: 3mm; padding: 2.3mm 3mm; display: grid; grid-template-columns: 28mm 1fr; align-items: center; gap: 3mm; background: #eef2f5; border-left: 1.2mm solid #b42834; font-size: 8.3pt; }
    .jump b, .notice b, .operation-table b { color: #8f2630; }
    .notice { border-color: #d6a83e; background: #fff6df; }
    .operation-table { grid-template-columns: 28mm 1fr; row-gap: 2mm; }
    .cover-visual { min-height: 107mm; background: #111820; border: 0; position: relative; overflow: hidden; display: grid; place-items: center; }
    .cover-visual strong { position: absolute; bottom: 9mm; color: #edf2f5; font-size: 12pt; letter-spacing: 2mm; }
    .board { width: 124mm; display: grid; grid-template-columns: repeat(6, 19mm); grid-auto-rows: 13mm; gap: 1.3mm; transform: skewY(-7deg); }
    .tile { background: #d6dbe0; border: .5mm solid #8f99a2; box-shadow: 1.4mm 1.7mm 0 #59636c; }
    .tile-1,.tile-6,.tile-17,.tile-22 { visibility: hidden; }
    .hole { position: absolute; width: 14mm; height: 9mm; right: 29mm; bottom: 24mm; border-radius: 50%; background: #040506; box-shadow: 0 0 0 1.4mm #697580; }
    .block { position: absolute; width: 17mm; height: 35mm; background: #b62e39; border: .6mm solid #da5862; box-shadow: 3mm 3mm 0 #6e1720; z-index: 3; }
    .block-a { left: 61mm; top: 9mm; transform: rotate(-24deg); }.block-b { left: 96mm; top: 28mm; transform: rotate(67deg) scale(.65); opacity: .55; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; }
    .info-grid div { display: flex; justify-content: space-between; padding: 2.4mm 3mm; background: #eef2f4; border-left: 1mm solid #b42834; font-size: 8.5pt; }
    .info-grid span { color: #516273; }
    .startup-flow { min-height: 74mm; display: flex; align-items: center; justify-content: space-between; }
    .startup-flow div { width: 36mm; min-height: 42mm; background: #fff; border-top: 1.2mm solid #385970; padding: 4mm 2mm; display: grid; place-items: center; text-align: center; gap: 2mm; }
    .startup-flow div.active { border-color: #b42834; background: #fff1f2; }
    .startup-flow span { font-size: 7.4pt; line-height: 1.45; color: #5a6875; }.startup-flow i { color: #b42834; font-style: normal; font-size: 14pt; }
    .result-flow { min-height: 90mm; display: grid; grid-template-columns: repeat(2,1fr); gap: 4mm; align-content: center; }
    .result-flow div { background: #fff; padding: 4mm; display: grid; gap: 2mm; text-align: center; border-top: 1.2mm solid #385970; }
    .result-flow .move { grid-column: 1/-1; }.result-flow .fail { border-color: #b42834; }.result-flow .success { border-color: #397761; }
    .result-flow span, .result-flow em { font-size: 8pt; color: #596978; font-style: normal; }.result-flow em { background: #e8edf0; padding: 2mm; }
    .rating { min-height: 83mm; display: grid; grid-template-columns: repeat(3,1fr); gap: 4mm; align-items: center; }
    .stars { min-height: 48mm; padding: 6mm 3mm; background: #fff; display: grid; place-items: center; text-align: center; border-top: 1.2mm solid #d6a83e; }
    .stars b { font-size: 19pt; color: #d1a02d; letter-spacing: 1mm; }.stars span { font-size: 8pt; color: #566675; }
    .progress-line { margin-top: 5mm; display: flex; align-items: center; justify-content: space-between; }
    .progress-line span { padding: 2.5mm; background: #2e4f66; color: #fff; font-size: 7.6pt; }.progress-line i { flex: 1; height: .6mm; background: #d0a23b; }
    .navigation-map { min-height: 88mm; display: flex; align-items: center; justify-content: space-between; }
    .navigation-map .nav { width: 37mm; min-height: 56mm; padding: 4mm 2mm; background: #fff; border-top: 1.2mm solid #385970; display: grid; gap: 2mm; text-align: center; }
    .navigation-map .home { border-color: #d6a83e; }.navigation-map .play { border-color: #b42834; }.navigation-map span { font-size: 7.2pt; color: #596978; }.navigation-map i { color: #b42834; font-style: normal; font-size: 15pt; }
    table { width: 100%; border-collapse: collapse; font-size: 8pt; }
    th { background: #263f54; color: #fff; padding: 2.4mm; text-align: left; }
    td { border: .2mm solid #b7c0c8; padding: 2.2mm; vertical-align: top; line-height: 1.45; }
    tr:nth-child(even) td { background: #edf1f4; }
  </style>
</head>
<body>${pageHtml}</body>
</html>`;

writeFileSync(outputPath, html);
console.log(JSON.stringify({ outputPath, productName, totalPages: pages.length }, null, 2));
