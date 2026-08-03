import {
  _decorator,
  Button,
  Component,
  EditBox,
  EventKeyboard,
  game,
  Game,
  input,
  Input,
  KeyCode,
  Label,
  Node,
} from 'cc';
import {
  createDefaultReleaseSave,
  getHighestUnlockedIndex,
  getLocalizedOnboardingCopy,
  languageDisplayName,
  nextGameLanguage,
  onboardingTopics,
  pendingOnboardingTopics,
  PuzzleEngine,
  resetCampaignProgress,
  resumeSavedRun,
  translate,
  withUnlockedLevel,
} from './shared/game/index';
import type {
  Direction,
  MoveResult,
  OnboardingTopic,
  PuzzleAction,
  ReleaseSaveData,
  UiTextKey,
} from './shared/game/index';
import { chapterOneLevels, getLevelIndexByPasscode } from './shared/levels/index';
import { createPlatformAdapter } from './shared/platform/index';
import { AudioController } from './AudioController';
import { BlockPresenter } from './BlockPresenter';
import { BoardRenderer } from './BoardRenderer';
import { CameraController } from './CameraController';
import { ReleaseSaveRepository } from './ReleaseSaveRepository';
import { TouchInputController } from './TouchInputController';

const { ccclass, property } = _decorator;

type GameMode =
  | 'title'
  | 'stage-select'
  | 'how-to-play'
  | 'credits'
  | 'playing'
  | 'paused'
  | 'tutorial'
  | 'failed'
  | 'completed';

@ccclass('GameplayController')
export class GameplayController extends Component {
  @property(BoardRenderer)
  board: BoardRenderer | null = null;

  @property(BlockPresenter)
  block: BlockPresenter | null = null;

  @property(CameraController)
  cameraController: CameraController | null = null;

  @property(TouchInputController)
  touchInput: TouchInputController | null = null;

  @property(AudioController)
  audioController: AudioController | null = null;

  @property(Label)
  levelStatLabel: Label | null = null;

  @property(Label)
  movesStatLabel: Label | null = null;

  @property(Label)
  timeStatLabel: Label | null = null;

  @property(Label)
  passcodeStatLabel: Label | null = null;

  @property(Node)
  gameplayHudRoot: Node | null = null;

  @property(Node)
  pauseMenuRoot: Node | null = null;

  @property(Node)
  titleMenuRoot: Node | null = null;

  @property(Node)
  stageSelectRoot: Node | null = null;

  @property(Node)
  howToPlayRoot: Node | null = null;

  @property(Node)
  creditsRoot: Node | null = null;

  @property(Node)
  newGameConfirmRoot: Node | null = null;

  @property(Node)
  failureRoot: Node | null = null;

  @property(Node)
  completionRoot: Node | null = null;

  @property(Node)
  tutorialRoot: Node | null = null;

  @property(EditBox)
  passcodeInput: EditBox | null = null;

  @property(Label)
  passcodeFeedback: Label | null = null;

  @property(Label)
  soundToggleLabel: Label | null = null;

  @property(Label)
  titleSoundLabel: Label | null = null;

  @property(Label)
  titleLanguageLabel: Label | null = null;

  @property(Label)
  pauseLanguageLabel: Label | null = null;

  @property(Button)
  resumeButton: Button | null = null;

  @property(Label)
  resumeButtonLabel: Label | null = null;

  @property(Label)
  failureReasonLabel: Label | null = null;

  @property(Label)
  completionStatsLabel: Label | null = null;

  @property(Label)
  completionContinueLabel: Label | null = null;

  @property(Label)
  tutorialTitleLabel: Label | null = null;

  @property(Label)
  tutorialSymbolLabel: Label | null = null;

  @property(Label)
  tutorialBodyLabel: Label | null = null;

  @property(Label)
  tutorialProgressLabel: Label | null = null;

  @property(Label)
  tutorialNextLabel: Label | null = null;

  @property(Label)
  howTopicTitleLabel: Label | null = null;

  @property(Label)
  howTopicSymbolLabel: Label | null = null;

  @property(Label)
  howTopicBodyLabel: Label | null = null;

  @property(Label)
  howTopicProgressLabel: Label | null = null;

  @property(Node)
  splitControlRoot: Node | null = null;

  stageButtons: Button[] = [];
  stageButtonLabels: Label[] = [];
  localizedLabels: Partial<Record<UiTextKey, Label[]>> = {};

  private readonly platform = createPlatformAdapter();
  private readonly saveRepository = new ReleaseSaveRepository(chapterOneLevels);
  private mode: GameMode = 'title';
  private levelIndex = 0;
  private engine: PuzzleEngine | null = null;
  private bufferedMove: Direction | null = null;
  private elapsedSeconds = 0;
  private displayedSecond = -1;
  private actionLog: PuzzleAction[] = [];
  private saveData: ReleaseSaveData = createDefaultReleaseSave(chapterOneLevels);
  private tutorialQueue: OnboardingTopic[] = [];
  private tutorialTotal = 0;
  private howTopicIndex = 0;

  start(): void {
    if (this.touchInput) {
      this.touchInput.onMove = (direction) => this.requestMove(direction);
    }
    this.saveData = this.saveRepository.load();
    this.audioController?.setSoundEnabled(this.saveData.soundEnabled);
    this.applyLocalization();
    game.on(Game.EVENT_HIDE, this.handleGameHide, this);
    input.on(Input.EventType.KEY_DOWN, this.handleKeyDown, this);
    this.showTitleMenu();
  }

  onDestroy(): void {
    game.off(Game.EVENT_HIDE, this.handleGameHide, this);
    input.off(Input.EventType.KEY_DOWN, this.handleKeyDown, this);
  }

  update(deltaTime: number): void {
    const state = this.engine?.getState();
    if (this.mode !== 'playing' || !state || state.completed || state.failed) return;
    this.elapsedSeconds += deltaTime;
    const second = Math.floor(this.elapsedSeconds);
    if (second !== this.displayedSecond) {
      this.displayedSecond = second;
      this.updateHud();
    }
  }

  startGame(): void {
    this.audioController?.playUi();
    if (this.hasCampaignProgress()) {
      this.showOnly(this.newGameConfirmRoot);
      return;
    }
    this.confirmNewGame();
  }

  confirmNewGame(): void {
    this.audioController?.playUi();
    this.saveData = resetCampaignProgress(this.saveData, chapterOneLevels);
    this.saveRepository.save(this.saveData);
    this.loadLevel(0);
  }

  cancelNewGame(): void {
    this.audioController?.playUi();
    this.showTitleMenu();
  }

  resumeGame(): void {
    const resumed = resumeSavedRun(this.saveData, chapterOneLevels);
    if (!resumed) {
      this.updateTitleMenu();
      return;
    }
    this.audioController?.playUi();
    this.presentRun(resumed.levelIndex, resumed.engine, resumed.actions, resumed.elapsedSeconds);
  }

  openStageSelect(): void {
    this.audioController?.playUi();
    this.mode = 'stage-select';
    this.bufferedMove = null;
    this.refreshStageButtons();
    this.showOnly(this.stageSelectRoot);
  }

  selectStage(_event: unknown, customEventData: string): void {
    const index = Number.parseInt(customEventData, 10);
    if (!Number.isInteger(index)
      || index < 0
      || index > getHighestUnlockedIndex(this.saveData, chapterOneLevels)) return;
    this.audioController?.playUi();
    this.loadLevel(index);
  }

  submitPasscode(): void {
    const index = getLevelIndexByPasscode(this.passcodeInput?.string ?? '');
    if (index < 0) {
      if (this.passcodeFeedback) {
        this.passcodeFeedback.string = translate(this.saveData.language, 'invalidPasscode');
      }
      return;
    }
    this.audioController?.playUi();
    this.loadLevel(index);
  }

  showHowToPlay(): void {
    this.audioController?.playUi();
    this.mode = 'how-to-play';
    this.bufferedMove = null;
    this.howTopicIndex = 0;
    this.updateHowToPlay();
    this.showOnly(this.howToPlayRoot);
  }

  previousHowTopic(): void {
    if (this.mode !== 'how-to-play') return;
    this.audioController?.playUi();
    this.howTopicIndex = (this.howTopicIndex - 1 + onboardingTopics.length) % onboardingTopics.length;
    this.updateHowToPlay();
  }

  nextHowTopic(): void {
    if (this.mode !== 'how-to-play') return;
    this.audioController?.playUi();
    this.howTopicIndex = (this.howTopicIndex + 1) % onboardingTopics.length;
    this.updateHowToPlay();
  }

  acknowledgeTutorial(): void {
    if (this.mode !== 'tutorial' || this.tutorialQueue.length === 0) return;
    this.audioController?.playUi();
    this.acknowledgeTopics([this.tutorialQueue[0]]);
    this.tutorialQueue.shift();
    this.advanceTutorial();
  }

  skipTutorial(): void {
    if (this.mode !== 'tutorial') return;
    this.audioController?.playUi();
    this.acknowledgeTopics(this.tutorialQueue);
    this.tutorialQueue = [];
    this.advanceTutorial();
  }

  showCredits(): void {
    this.audioController?.playUi();
    this.mode = 'credits';
    this.bufferedMove = null;
    this.showOnly(this.creditsRoot);
  }

  returnToTitle(): void {
    this.audioController?.playUi();
    this.showTitleMenu();
  }

  openMenu(): void {
    if (this.mode !== 'playing' || this.block?.isBusy()) return;
    this.audioController?.playUi();
    this.persistCurrentRun();
    this.mode = 'paused';
    this.bufferedMove = null;
    if (this.pauseMenuRoot) this.pauseMenuRoot.active = true;
    this.updateSoundLabels();
  }

  returnToGame(): void {
    if (this.mode !== 'paused') return;
    this.audioController?.playUi();
    this.mode = 'playing';
    if (this.pauseMenuRoot) this.pauseMenuRoot.active = false;
    this.updateHud();
  }

  toggleSound(): void {
    const enabled = this.audioController?.toggleSound() ?? true;
    this.saveData = { ...this.saveData, soundEnabled: enabled };
    this.saveRepository.save(this.saveData);
    if (enabled) this.audioController?.playUi();
    this.updateSoundLabels();
  }

  cycleLanguage(): void {
    this.audioController?.playUi();
    this.saveData = {
      ...this.saveData,
      language: nextGameLanguage(this.saveData.language),
    };
    this.saveRepository.save(this.saveData);
    this.applyLocalization();
  }

  switchCube(): void {
    if (this.mode !== 'playing' || !this.engine?.getState().split || this.block?.isBusy()) return;
    this.audioController?.playUi();
    const state = this.engine.switchActiveCube();
    this.actionLog.push('switch-cube');
    this.block?.snapTo(state);
    this.persistCurrentRun();
    this.updateHud();
  }

  quitToMenu(): void {
    if (this.mode !== 'paused') return;
    this.audioController?.playUi();
    this.persistCurrentRun();
    this.showTitleMenu();
  }

  retryLevel(): void {
    if (this.mode !== 'failed') return;
    this.audioController?.playUi();
    this.loadLevel(this.levelIndex);
  }

  replayLevel(): void {
    if (this.mode !== 'completed') return;
    this.audioController?.playUi();
    this.loadLevel(this.levelIndex);
  }

  continueAfterComplete(): void {
    if (this.mode !== 'completed') return;
    this.audioController?.playUi();
    if (this.levelIndex + 1 < chapterOneLevels.length) this.loadLevel(this.levelIndex + 1);
    else this.showTitleMenu();
  }

  quitResultToMenu(): void {
    if (this.mode !== 'failed' && this.mode !== 'completed') return;
    this.audioController?.playUi();
    this.showTitleMenu();
  }

  requestMove(direction: Direction): void {
    if (this.mode !== 'playing' || !this.engine || !this.block) return;
    const state = this.engine.getState();
    if (state.completed || state.failed) return;
    if (this.block.isBusy()) {
      this.bufferedMove = direction;
      return;
    }

    this.audioController?.beginInteraction();
    const result = this.engine.move(direction);
    this.presentMove(result);
  }

  private loadLevel(index: number): void {
    this.presentRun(index, new PuzzleEngine(chapterOneLevels[index]), [], 0);
  }

  private presentRun(
    index: number,
    engine: PuzzleEngine,
    actions: readonly PuzzleAction[],
    elapsedSeconds: number,
  ): void {
    this.block?.stopAttract();
    this.bufferedMove = null;
    this.levelIndex = index;
    this.engine = engine;
    this.actionLog = [...actions];
    this.elapsedSeconds = elapsedSeconds;
    this.displayedSecond = Math.floor(elapsedSeconds);
    this.mode = 'playing';
    this.hideAllOverlays();
    if (this.gameplayHudRoot) this.gameplayHudRoot.active = true;

    const level = chapterOneLevels[index];
    this.board?.render(level);
    const state = engine.getState();
    this.board?.applyState(state);
    this.block?.snapTo(state);
    this.cameraController?.frameLevel(level);
    this.platform.onLevelStarted(level.id);
    this.persistCurrentRun();
    this.updateHud();
    this.startAutomaticTutorial(level);
  }

  private showTitleMenu(): void {
    this.mode = 'title';
    this.bufferedMove = null;
    this.engine = null;
    this.actionLog = [];
    if (this.gameplayHudRoot) this.gameplayHudRoot.active = false;
    this.showOnly(this.titleMenuRoot);
    if (this.passcodeInput) this.passcodeInput.string = '';
    if (this.passcodeFeedback) this.passcodeFeedback.string = '';

    const attractIndex = Math.min(4, chapterOneLevels.length - 1);
    const level = chapterOneLevels[attractIndex];
    const attractEngine = new PuzzleEngine(level);
    this.board?.render(level);
    this.board?.applyState(attractEngine.getState());
    this.block?.startAttract(attractEngine.getState());
    this.cameraController?.frameLevel(level);
    this.updateTitleMenu();
  }

  private presentMove(result: MoveResult): void {
    if (!this.block || !this.engine) return;
    this.block.playMove(result, () => {
      this.board?.applyState(result.current);
      if (result.status === 'fallen') {
        this.audioController?.playFall();
        this.platform.vibrateLight();
        this.updateHud();
        this.block?.playFall(result, () => this.showFailure(result));
        return;
      }

      this.audioController?.playMove();
      this.actionLog.push(result.direction);
      this.updateHud();
      if (result.status === 'completed') {
        this.completeLevel(result);
        return;
      }

      this.persistCurrentRun();
      const buffered = this.bufferedMove;
      this.bufferedMove = null;
      if (buffered) this.requestMove(buffered);
    });
  }

  private showFailure(result: MoveResult): void {
    this.mode = 'failed';
    this.bufferedMove = null;
    if (this.failureReasonLabel) {
      this.failureReasonLabel.string = result.message?.includes('fragile')
        ? translate(this.saveData.language, 'failureFragile')
        : translate(this.saveData.language, 'failureVoid');
    }
    this.hideAllOverlays();
    if (this.failureRoot) this.failureRoot.active = true;
  }

  private completeLevel(result: MoveResult): void {
    this.audioController?.playComplete();
    this.platform.onLevelCompleted(result.current.levelId, result.current.steps);
    this.platform.vibrateLight();
    const nextIndex = Math.min(this.levelIndex + 1, chapterOneLevels.length - 1);
    this.saveData = withUnlockedLevel(this.saveData, nextIndex, chapterOneLevels);
    this.saveData = {
      ...this.saveData,
      currentRun: this.levelIndex + 1 < chapterOneLevels.length
        ? { levelId: chapterOneLevels[this.levelIndex + 1].id, actions: [], elapsedSeconds: 0 }
        : null,
    };
    this.saveRepository.save(this.saveData);
    if (this.completionStatsLabel) {
      this.completionStatsLabel.string = translate(this.saveData.language, 'completionStats', {
        moves: result.current.steps,
        time: this.formattedTime(),
        passcode: chapterOneLevels[this.levelIndex].passcode,
      });
    }
    if (this.completionContinueLabel) {
      this.completionContinueLabel.string = this.levelIndex + 1 < chapterOneLevels.length
        ? translate(this.saveData.language, 'continue')
        : translate(this.saveData.language, 'returnToMenu');
    }
    this.block?.playGoalDrop(() => {
      this.mode = 'completed';
      this.bufferedMove = null;
      this.hideAllOverlays();
      if (this.completionRoot) this.completionRoot.active = true;
    });
  }

  private handleGameHide(): void {
    this.persistCurrentRun();
    if (this.mode !== 'playing') return;
    this.mode = 'paused';
    this.bufferedMove = null;
    if (this.pauseMenuRoot) this.pauseMenuRoot.active = true;
    this.updateSoundLabels();
  }

  private handleKeyDown(event: EventKeyboard): void {
    if (event.keyCode !== KeyCode.MOBILE_BACK && event.keyCode !== KeyCode.ESCAPE) return;
    if (this.mode === 'playing') {
      this.openMenu();
      return;
    }
    if (this.mode === 'paused') {
      this.returnToGame();
      return;
    }
    if (this.mode === 'tutorial') {
      this.skipTutorial();
      return;
    }
    if (this.mode !== 'title') this.showTitleMenu();
  }

  private persistCurrentRun(): void {
    const state = this.engine?.getState();
    if (!state || state.failed || state.completed) return;
    this.saveData = {
      ...this.saveData,
      currentRun: {
        levelId: chapterOneLevels[this.levelIndex].id,
        actions: [...this.actionLog],
        elapsedSeconds: this.elapsedSeconds,
      },
    };
    this.saveRepository.save(this.saveData);
  }

  private startAutomaticTutorial(level: typeof chapterOneLevels[number]): void {
    this.tutorialQueue = pendingOnboardingTopics(level, this.saveData.acknowledgedTutorials);
    this.tutorialTotal = this.tutorialQueue.length;
    if (this.tutorialQueue.length === 0) return;
    this.mode = 'tutorial';
    this.bufferedMove = null;
    this.hideAllOverlays();
    if (this.tutorialRoot) this.tutorialRoot.active = true;
    this.updateTutorial();
  }

  private advanceTutorial(): void {
    if (this.tutorialQueue.length > 0) {
      this.updateTutorial();
      return;
    }
    this.mode = 'playing';
    if (this.tutorialRoot) this.tutorialRoot.active = false;
    this.updateHud();
  }

  private acknowledgeTopics(topics: readonly OnboardingTopic[]): void {
    const acknowledged = new Set(this.saveData.acknowledgedTutorials);
    for (const topic of topics) acknowledged.add(topic.id);
    this.saveData = { ...this.saveData, acknowledgedTutorials: [...acknowledged] };
    this.saveRepository.save(this.saveData);
  }

  private updateTutorial(): void {
    const topic = this.tutorialQueue[0];
    if (!topic) return;
    const copy = getLocalizedOnboardingCopy(this.saveData.language, topic.id);
    if (this.tutorialTitleLabel) this.tutorialTitleLabel.string = copy.title;
    if (this.tutorialSymbolLabel) this.tutorialSymbolLabel.string = copy.symbol;
    if (this.tutorialBodyLabel) this.tutorialBodyLabel.string = copy.body;
    if (this.tutorialProgressLabel) {
      const position = this.tutorialTotal - this.tutorialQueue.length + 1;
      this.tutorialProgressLabel.string = `${position} / ${this.tutorialTotal}`;
    }
    if (this.tutorialNextLabel) {
      this.tutorialNextLabel.string = this.tutorialQueue.length === 1
        ? translate(this.saveData.language, 'gotIt')
        : translate(this.saveData.language, 'next');
    }
  }

  private updateHowToPlay(): void {
    const topic = onboardingTopics[this.howTopicIndex];
    if (!topic) return;
    const copy = getLocalizedOnboardingCopy(this.saveData.language, topic.id);
    if (this.howTopicTitleLabel) this.howTopicTitleLabel.string = copy.title;
    if (this.howTopicSymbolLabel) this.howTopicSymbolLabel.string = copy.symbol;
    if (this.howTopicBodyLabel) this.howTopicBodyLabel.string = copy.body;
    if (this.howTopicProgressLabel) {
      this.howTopicProgressLabel.string = `${this.howTopicIndex + 1} / ${onboardingTopics.length}`;
    }
  }

  private refreshStageButtons(): void {
    const highest = getHighestUnlockedIndex(this.saveData, chapterOneLevels);
    this.stageButtons.forEach((button, index) => {
      const unlocked = index <= highest;
      button.interactable = unlocked;
      const label = this.stageButtonLabels[index];
      if (label) {
        label.string = unlocked ? this.twoDigits(index + 1) : '--';
        label.color.set(unlocked ? 241 : 104, unlocked ? 242 : 107, unlocked ? 245 : 114, 255);
      }
    });
  }

  private updateTitleMenu(): void {
    const resumed = resumeSavedRun(this.saveData, chapterOneLevels);
    if (this.resumeButton) this.resumeButton.interactable = resumed !== null;
    if (this.resumeButtonLabel) {
      this.resumeButtonLabel.string = resumed
        ? translate(this.saveData.language, 'resumeGameStage', {
          stage: this.twoDigits(resumed.levelIndex + 1),
        })
        : translate(this.saveData.language, 'resumeGame');
      this.resumeButtonLabel.color.set(resumed ? 245 : 104, resumed ? 242 : 107, resumed ? 236 : 114, 255);
    }
    this.updateSoundLabels();
  }

  private updateHud(): void {
    const state = this.engine?.getState();
    if (!state) return;
    const level = chapterOneLevels[this.levelIndex];
    if (this.levelStatLabel) {
      this.levelStatLabel.string = `${translate(this.saveData.language, 'level')}\n${this.twoDigits(this.levelIndex + 1)} / ${chapterOneLevels.length}`;
    }
    if (this.movesStatLabel) {
      this.movesStatLabel.string = `${translate(this.saveData.language, 'moves')}\n${state.steps}`;
    }
    if (this.timeStatLabel) {
      this.timeStatLabel.string = `${translate(this.saveData.language, 'time')}\n${this.formattedTime()}`;
    }
    if (this.passcodeStatLabel) {
      this.passcodeStatLabel.string = `${translate(this.saveData.language, 'passcode')}\n${level.passcode}`;
    }
    if (this.splitControlRoot) {
      this.splitControlRoot.active = this.mode === 'playing' && state.split !== null;
    }
  }

  private updateSoundLabels(): void {
    const state = translate(
      this.saveData.language,
      this.audioController?.isSoundEnabled() === false ? 'soundOff' : 'soundOn',
    );
    const text = translate(this.saveData.language, 'soundSetting', { state });
    if (this.soundToggleLabel) this.soundToggleLabel.string = text;
    if (this.titleSoundLabel) this.titleSoundLabel.string = text;
  }

  private applyLocalization(): void {
    const language = this.saveData.language;
    for (const key of Object.keys(this.localizedLabels) as UiTextKey[]) {
      for (const label of this.localizedLabels[key] ?? []) {
        label.string = translate(language, key);
      }
    }

    const passcodeText = translate(language, 'passcode');
    if (this.passcodeInput) this.passcodeInput.placeholder = passcodeText;
    if (this.passcodeFeedback?.string) {
      this.passcodeFeedback.string = translate(language, 'invalidPasscode');
    }

    const languageText = translate(language, 'languageSetting', {
      language: languageDisplayName(language),
    });
    if (this.titleLanguageLabel) this.titleLanguageLabel.string = languageText;
    if (this.pauseLanguageLabel) this.pauseLanguageLabel.string = languageText;

    this.updateTitleMenu();
    this.updateHud();
    if (this.mode === 'tutorial') this.updateTutorial();
    if (this.mode === 'how-to-play') this.updateHowToPlay();
  }

  private showOnly(root: Node | null): void {
    this.hideAllOverlays();
    if (root) root.active = true;
  }

  private hideAllOverlays(): void {
    for (const root of [
      this.titleMenuRoot,
      this.pauseMenuRoot,
      this.stageSelectRoot,
      this.howToPlayRoot,
      this.creditsRoot,
      this.newGameConfirmRoot,
      this.failureRoot,
      this.completionRoot,
      this.tutorialRoot,
    ]) {
      if (root) root.active = false;
    }
  }

  private hasCampaignProgress(): boolean {
    return this.saveData.currentRun !== null
      || getHighestUnlockedIndex(this.saveData, chapterOneLevels) > 0;
  }

  private formattedTime(): string {
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = Math.floor(this.elapsedSeconds % 60);
    return `${this.twoDigits(minutes)}:${this.twoDigits(seconds)}`;
  }

  private twoDigits(value: number): string {
    return value < 10 ? `0${value}` : String(value);
  }
}
