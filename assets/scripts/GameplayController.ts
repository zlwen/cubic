import { _decorator, Component, EditBox, Label, Node } from 'cc';
import { PuzzleEngine } from './shared/game/index';
import type { Direction, MoveResult } from './shared/game/index';
import { chapterOneLevels, getLevelIndexByPasscode } from './shared/levels/index';
import { createPlatformAdapter } from './shared/platform/index';
import { AudioController } from './AudioController';
import { BlockPresenter } from './BlockPresenter';
import { BoardRenderer } from './BoardRenderer';
import { CameraController } from './CameraController';
import { TouchInputController } from './TouchInputController';

const { ccclass, property } = _decorator;

type GameMode = 'title' | 'playing' | 'paused';

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

  @property(EditBox)
  passcodeInput: EditBox | null = null;

  @property(Label)
  passcodeFeedback: Label | null = null;

  @property(Label)
  soundToggleLabel: Label | null = null;

  @property(Node)
  splitControlRoot: Node | null = null;

  private readonly platform = createPlatformAdapter();
  private mode: GameMode = 'title';
  private levelIndex = 0;
  private engine: PuzzleEngine | null = null;
  private bufferedMove: Direction | null = null;
  private elapsedSeconds = 0;
  private displayedSecond = -1;

  start(): void {
    if (this.touchInput) {
      this.touchInput.onMove = (direction) => this.requestMove(direction);
    }
    this.showTitleMenu();
  }

  update(deltaTime: number): void {
    const state = this.engine?.getState();
    if (this.mode !== 'playing' || !state || state.completed || state.failed) {
      return;
    }
    this.elapsedSeconds += deltaTime;
    const second = Math.floor(this.elapsedSeconds);
    if (second !== this.displayedSecond) {
      this.displayedSecond = second;
      this.updateHud();
    }
  }

  startGame(): void {
    this.audioController?.playUi();
    this.loadLevel(0);
  }

  submitPasscode(): void {
    const index = getLevelIndexByPasscode(this.passcodeInput?.string ?? '');
    if (index < 0) {
      if (this.passcodeFeedback) {
        this.passcodeFeedback.string = 'INVALID PASSCODE';
      }
      return;
    }

    this.audioController?.playUi();
    this.loadLevel(index);
  }

  openMenu(): void {
    if (this.mode !== 'playing' || this.block?.isBusy()) {
      return;
    }
    this.audioController?.playUi();
    this.mode = 'paused';
    if (this.pauseMenuRoot) {
      this.pauseMenuRoot.active = true;
    }
    this.updateSoundLabel();
  }

  returnToGame(): void {
    if (this.mode !== 'paused') {
      return;
    }
    this.audioController?.playUi();
    this.mode = 'playing';
    if (this.pauseMenuRoot) {
      this.pauseMenuRoot.active = false;
    }
  }

  toggleSound(): void {
    const enabled = this.audioController?.toggleSound() ?? true;
    if (enabled) {
      this.audioController?.playUi();
    }
    this.updateSoundLabel();
  }

  switchCube(): void {
    if (this.mode !== 'playing' || !this.engine?.getState().split || this.block?.isBusy()) {
      return;
    }
    this.audioController?.playUi();
    const state = this.engine.switchActiveCube();
    this.block?.snapTo(state);
    this.updateHud();
  }

  quitToMenu(): void {
    if (this.mode !== 'paused') {
      return;
    }
    this.audioController?.playUi();
    this.showTitleMenu();
  }

  requestMove(direction: Direction): void {
    if (this.mode !== 'playing' || !this.engine || !this.block) {
      return;
    }

    const state = this.engine.getState();
    if (state.completed || state.failed) {
      return;
    }

    if (this.block.isBusy()) {
      this.bufferedMove = direction;
      return;
    }

    this.audioController?.beginInteraction();
    const result = this.engine.move(direction);
    this.presentMove(result);
  }

  private loadLevel(index: number): void {
    this.bufferedMove = null;
    this.levelIndex = index;
    this.elapsedSeconds = 0;
    this.displayedSecond = 0;
    this.mode = 'playing';
    if (this.titleMenuRoot) {
      this.titleMenuRoot.active = false;
    }
    if (this.pauseMenuRoot) {
      this.pauseMenuRoot.active = false;
    }
    if (this.gameplayHudRoot) {
      this.gameplayHudRoot.active = true;
    }
    if (this.passcodeFeedback) {
      this.passcodeFeedback.string = '';
    }

    const level = chapterOneLevels[index];
    this.engine = new PuzzleEngine(level);
    this.board?.render(level);
    const state = this.engine.getState();
    this.board?.applyState(state);
    this.block?.snapTo(state);
    this.cameraController?.frameLevel(level);
    this.platform.onLevelStarted(level.id);
    this.updateHud();
  }

  private showTitleMenu(): void {
    this.mode = 'title';
    this.bufferedMove = null;
    if (this.gameplayHudRoot) {
      this.gameplayHudRoot.active = false;
    }
    if (this.pauseMenuRoot) {
      this.pauseMenuRoot.active = false;
    }
    if (this.titleMenuRoot) {
      this.titleMenuRoot.active = true;
    }
    if (this.passcodeInput) {
      this.passcodeInput.string = '';
    }
    if (this.passcodeFeedback) {
      this.passcodeFeedback.string = '';
    }
  }

  private presentMove(result: MoveResult): void {
    if (!this.block || !this.engine) {
      return;
    }

    this.block.playMove(result, () => {
      this.board?.applyState(result.current);
      if (result.status === 'fallen') {
        this.audioController?.playFall();
        this.platform.vibrateLight();
        this.updateHud();
        this.block?.playFall(() => this.loadLevel(this.levelIndex));
        return;
      }

      this.audioController?.playMove();
      this.updateHud();
      if (result.status === 'completed') {
        this.audioController?.playComplete();
        this.platform.onLevelCompleted(result.current.levelId, result.current.steps);
        this.platform.vibrateLight();
        this.block?.playGoalDrop(() => {
          if (this.levelIndex + 1 < chapterOneLevels.length) {
            this.loadLevel(this.levelIndex + 1);
          } else {
            this.showTitleMenu();
          }
        });
        return;
      }

      const buffered = this.bufferedMove;
      this.bufferedMove = null;
      if (buffered) {
        this.requestMove(buffered);
      }
    });
  }

  private updateHud(): void {
    const state = this.engine?.getState();
    if (!state) {
      return;
    }

    const level = chapterOneLevels[this.levelIndex];
    const number = this.twoDigits(this.levelIndex + 1);
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = Math.floor(this.elapsedSeconds % 60);
    const time = `${this.twoDigits(minutes)}:${this.twoDigits(seconds)}`;
    if (this.levelStatLabel) this.levelStatLabel.string = `LEVEL\n${number} / ${chapterOneLevels.length}`;
    if (this.movesStatLabel) this.movesStatLabel.string = `MOVES\n${state.steps}`;
    if (this.timeStatLabel) this.timeStatLabel.string = `TIME\n${time}`;
    if (this.passcodeStatLabel) this.passcodeStatLabel.string = `PASSCODE\n${level.passcode}`;
    if (this.splitControlRoot) {
      this.splitControlRoot.active = this.mode === 'playing' && state.split !== null;
    }
  }

  private twoDigits(value: number): string {
    return value < 10 ? `0${value}` : String(value);
  }

  private updateSoundLabel(): void {
    if (this.soundToggleLabel) {
      const state = this.audioController?.isSoundEnabled() === false ? 'OFF' : 'ON';
      this.soundToggleLabel.string = `TOGGLE SOUND: ${state}`;
    }
  }
}
