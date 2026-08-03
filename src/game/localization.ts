import type { TutorialTopicId } from './releaseSave';

export const gameLanguages = ['zh-CN', 'zh-TW', 'en'] as const;

export type GameLanguage = typeof gameLanguages[number];

const englishUi = {
  gameSubtitle: 'ROLLING BLOCK PUZZLE',
  menu: 'MENU',
  switchBlock: 'SWITCH BLOCK',
  level: 'LEVEL',
  moves: 'MOVES',
  time: 'TIME',
  passcode: 'PASSCODE',
  startNewGame: 'START NEW GAME',
  resumeGame: 'RESUME GAME',
  resumeGameStage: 'RESUME GAME  -  {stage}',
  loadStage: 'LOAD STAGE',
  howToPlay: 'HOW TO PLAY',
  soundSetting: 'TOGGLE SOUND: {state}',
  soundOn: 'ON',
  soundOff: 'OFF',
  languageSetting: 'LANGUAGE: {language}',
  credits: 'CREDITS',
  enter: 'ENTER',
  back: 'BACK',
  previous: 'PREVIOUS',
  next: 'NEXT',
  gotIt: 'GOT IT',
  skip: 'SKIP',
  creditsCopy: 'DESIGN & DEVELOPMENT\nCUBIC TEAM\n\nORIGINAL LEVELS, VISUALS & AUDIO\nCREATED FOR CUBIC',
  confirmNewGameTitle: 'START NEW GAME?',
  confirmNewGameCopy: 'CURRENT CAMPAIGN PROGRESS WILL RESET.',
  start: 'START',
  cancel: 'CANCEL',
  stageFailed: 'STAGE FAILED',
  failureVoid: 'FELL INTO THE VOID',
  failureFragile: 'FRAGILE TILE BROKE',
  retry: 'RETRY',
  quitToMenu: 'QUIT TO MENU',
  stageComplete: 'STAGE COMPLETE',
  continue: 'CONTINUE',
  returnToMenu: 'RETURN TO MENU',
  replay: 'REPLAY',
  paused: 'PAUSED',
  returnToGame: 'RETURN TO GAME',
  invalidPasscode: 'INVALID PASSCODE',
  completionStats: 'MOVES  {moves}\nTIME  {time}\nPASSCODE  {passcode}',
} as const;

export type UiTextKey = keyof typeof englishUi;
type UiCatalog = Record<UiTextKey, string>;

const uiCatalogs: Record<GameLanguage, UiCatalog> = {
  en: englishUi,
  'zh-CN': {
    gameSubtitle: '滚动方块谜题',
    menu: '菜单',
    switchBlock: '切换方块',
    level: '关卡',
    moves: '步数',
    time: '时间',
    passcode: '密码',
    startNewGame: '开始新游戏',
    resumeGame: '继续游戏',
    resumeGameStage: '继续游戏  -  {stage}',
    loadStage: '选择关卡',
    howToPlay: '游戏玩法',
    soundSetting: '声音：{state}',
    soundOn: '开',
    soundOff: '关',
    languageSetting: '语言：{language}',
    credits: '制作人员',
    enter: '确认',
    back: '返回',
    previous: '上一项',
    next: '下一项',
    gotIt: '知道了',
    skip: '跳过',
    creditsCopy: '设计与开发\nCUBIC 团队\n\n原创关卡、画面与音效\n为 CUBIC 创作',
    confirmNewGameTitle: '开始新游戏？',
    confirmNewGameCopy: '当前关卡进度将被重置。',
    start: '开始',
    cancel: '取消',
    stageFailed: '关卡失败',
    failureVoid: '方块掉入虚空',
    failureFragile: '易碎地砖破裂',
    retry: '重新开始',
    quitToMenu: '返回主菜单',
    stageComplete: '关卡完成',
    continue: '继续',
    returnToMenu: '返回主菜单',
    replay: '重玩本关',
    paused: '已暂停',
    returnToGame: '返回游戏',
    invalidPasscode: '密码无效',
    completionStats: '步数  {moves}\n时间  {time}\n密码  {passcode}',
  },
  'zh-TW': {
    gameSubtitle: '滾動方塊謎題',
    menu: '選單',
    switchBlock: '切換方塊',
    level: '關卡',
    moves: '步數',
    time: '時間',
    passcode: '密碼',
    startNewGame: '開始新遊戲',
    resumeGame: '繼續遊戲',
    resumeGameStage: '繼續遊戲  -  {stage}',
    loadStage: '選擇關卡',
    howToPlay: '遊戲玩法',
    soundSetting: '聲音：{state}',
    soundOn: '開',
    soundOff: '關',
    languageSetting: '語言：{language}',
    credits: '製作人員',
    enter: '確認',
    back: '返回',
    previous: '上一項',
    next: '下一項',
    gotIt: '知道了',
    skip: '跳過',
    creditsCopy: '設計與開發\nCUBIC 團隊\n\n原創關卡、畫面與音效\n為 CUBIC 創作',
    confirmNewGameTitle: '開始新遊戲？',
    confirmNewGameCopy: '目前關卡進度將被重設。',
    start: '開始',
    cancel: '取消',
    stageFailed: '關卡失敗',
    failureVoid: '方塊掉入虛空',
    failureFragile: '易碎地磚破裂',
    retry: '重新開始',
    quitToMenu: '返回主選單',
    stageComplete: '關卡完成',
    continue: '繼續',
    returnToMenu: '返回主選單',
    replay: '重玩本關',
    paused: '已暫停',
    returnToGame: '返回遊戲',
    invalidPasscode: '密碼無效',
    completionStats: '步數  {moves}\n時間  {time}\n密碼  {passcode}',
  },
};

export interface OnboardingCopy {
  readonly title: string;
  readonly symbol: string;
  readonly body: string;
}

const onboardingCatalogs: Record<GameLanguage, Record<TutorialTopicId, OnboardingCopy>> = {
  en: {
    movement: {
      title: 'ROLL THE BLOCK',
      symbol: '  UP\nLEFT  RIGHT\n DOWN',
      body: 'Swipe up, down, left, or right. Each swipe rolls the block one step in that screen direction.',
    },
    goal: {
      title: 'ENTER THE GOAL',
      symbol: 'UPRIGHT\n  +\n HOLE',
      body: 'Finish the stage by standing the whole block upright over the dark hole so it can drop inside.',
    },
    fragile: {
      title: 'FRAGILE TILE',
      symbol: 'GLASS\n  X',
      body: 'You may cross this translucent tile while lying down. Standing upright on it will break it.',
    },
    'soft-switch': {
      title: 'SOFT SWITCH',
      symbol: 'ROUND\nPRESS',
      body: 'Any part of the whole block or either split cube can press a round soft switch.',
    },
    'hard-switch': {
      title: 'HARD SWITCH',
      symbol: 'STAND\n  X',
      body: 'An X-marked hard switch responds only when the unsplit whole block stands upright on it.',
    },
    bridge: {
      title: 'CONTROLLED BRIDGE',
      symbol: 'ON  /  OFF',
      body: 'Switches can enable, disable, or toggle connected bridge spans. Check the route after every press.',
    },
    split: {
      title: 'SPLIT TILE',
      symbol: 'ONE\n2\nTWO',
      body: 'Stand upright on the four-mark tile to divide the block into two independently positioned cubes.',
    },
    'switch-cube': {
      title: 'SWITCH ACTIVE CUBE',
      symbol: 'A  /  B',
      body: 'Only the highlighted cube moves. Use Switch Block at the upper left to select the other cube.',
    },
    recombine: {
      title: 'RECOMBINE',
      symbol: 'A + B\nBLOCK',
      body: 'Move the two cubes onto orthogonally adjacent tiles. They will automatically reform the whole block.',
    },
  },
  'zh-CN': {
    movement: {
      title: '滚动方块',
      symbol: '  上\n左    右\n  下',
      body: '向上、下、左或右滑动。每次滑动都会让方块沿屏幕方向滚动一步。',
    },
    goal: {
      title: '进入目标洞',
      symbol: '直立\n +\n洞口',
      body: '让完整方块直立在黑色洞口上并掉入其中，即可完成关卡。',
    },
    fragile: {
      title: '易碎地砖',
      symbol: '玻璃\n X',
      body: '方块平躺时可以经过透明地砖；直立在上面会将其压碎。',
    },
    'soft-switch': {
      title: '轻触机关',
      symbol: '圆形\n按压',
      body: '完整方块的任一部分或分裂后的任一小方块都能按下圆形机关。',
    },
    'hard-switch': {
      title: '重压机关',
      symbol: '直立\n X',
      body: '带 X 标记的机关只会在完整方块直立压上去时触发。',
    },
    bridge: {
      title: '可控桥梁',
      symbol: '开 / 关',
      body: '机关可以开启、关闭或切换相连的桥梁。每次触发后都要重新观察路线。',
    },
    split: {
      title: '分裂地砖',
      symbol: '一体\n 2\n两块',
      body: '完整方块直立在四点标记上时，会分裂成两个可独立移动的小方块。',
    },
    'switch-cube': {
      title: '切换活动方块',
      symbol: 'A / B',
      body: '只有高亮的小方块会移动。使用左上角的“切换方块”选择另一个。',
    },
    recombine: {
      title: '重新组合',
      symbol: 'A + B\n方块',
      body: '让两个小方块移动到上下或左右相邻的地砖，它们会自动重新组合。',
    },
  },
  'zh-TW': {
    movement: {
      title: '滾動方塊',
      symbol: '  上\n左    右\n  下',
      body: '向上、下、左或右滑動。每次滑動都會讓方塊沿螢幕方向滾動一步。',
    },
    goal: {
      title: '進入目標洞',
      symbol: '直立\n +\n洞口',
      body: '讓完整方塊直立在黑色洞口上並掉入其中，即可完成關卡。',
    },
    fragile: {
      title: '易碎地磚',
      symbol: '玻璃\n X',
      body: '方塊平躺時可以經過透明地磚；直立在上面會將其壓碎。',
    },
    'soft-switch': {
      title: '輕觸機關',
      symbol: '圓形\n按壓',
      body: '完整方塊的任一部分或分裂後的任一小方塊都能按下圓形機關。',
    },
    'hard-switch': {
      title: '重壓機關',
      symbol: '直立\n X',
      body: '帶 X 標記的機關只會在完整方塊直立壓上去時觸發。',
    },
    bridge: {
      title: '可控橋梁',
      symbol: '開 / 關',
      body: '機關可以開啟、關閉或切換相連的橋梁。每次觸發後都要重新觀察路線。',
    },
    split: {
      title: '分裂地磚',
      symbol: '一體\n 2\n兩塊',
      body: '完整方塊直立在四點標記上時，會分裂成兩個可獨立移動的小方塊。',
    },
    'switch-cube': {
      title: '切換活動方塊',
      symbol: 'A / B',
      body: '只有高亮的小方塊會移動。使用左上角的「切換方塊」選擇另一個。',
    },
    recombine: {
      title: '重新組合',
      symbol: 'A + B\n方塊',
      body: '讓兩個小方塊移動到上下或左右相鄰的地磚，它們會自動重新組合。',
    },
  },
};

export function translate(
  language: GameLanguage,
  key: UiTextKey,
  params: Readonly<Record<string, string | number>> = {},
): string {
  return replaceParams(uiCatalogs[language]?.[key] ?? englishUi[key], params);
}

export function getLocalizedOnboardingCopy(
  language: GameLanguage,
  topicId: TutorialTopicId,
): OnboardingCopy {
  return onboardingCatalogs[language]?.[topicId] ?? onboardingCatalogs.en[topicId];
}

export function languageFromLocale(locale: string | null | undefined): GameLanguage {
  const normalized = (locale ?? '').trim().toLowerCase().replace(/_/g, '-');
  if (normalized === 'zh' || normalized.startsWith('zh-')) {
    if (/(^|-)hant($|-)/.test(normalized)) return 'zh-TW';
    if (/(^|-)hans($|-)/.test(normalized)) return 'zh-CN';
    if (/(^|-)(tw|hk|mo)($|-)/.test(normalized)) return 'zh-TW';
    return 'zh-CN';
  }
  return 'en';
}

export function nextGameLanguage(language: GameLanguage): GameLanguage {
  const index = gameLanguages.indexOf(language);
  return gameLanguages[(index + 1) % gameLanguages.length];
}

export function languageDisplayName(language: GameLanguage): string {
  if (language === 'zh-CN') return '简体中文';
  if (language === 'zh-TW') return '繁體中文';
  return 'English';
}

export function isGameLanguage(value: unknown): value is GameLanguage {
  return typeof value === 'string' && gameLanguages.indexOf(value as GameLanguage) >= 0;
}

export function hasCompleteLocalizationCatalogs(): boolean {
  const uiKeys = Object.keys(englishUi).sort().join('|');
  const topicKeys = Object.keys(onboardingCatalogs.en).sort().join('|');
  return gameLanguages.every((language) =>
    Object.keys(uiCatalogs[language]).sort().join('|') === uiKeys
    && Object.keys(onboardingCatalogs[language]).sort().join('|') === topicKeys);
}

function replaceParams(
  template: string,
  params: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{([a-zA-Z0-9]+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match);
}
