import {
  _decorator,
  Button,
  Camera,
  Canvas,
  Color,
  Component,
  builtinResMgr,
  DirectionalLight,
  EditBox,
  EventHandler,
  HorizontalTextAlignment,
  Label,
  Layers,
  Material,
  MeshRenderer,
  Node,
  primitives,
  resources,
  Sprite,
  SpriteFrame,
  Texture2D,
  TTFFont,
  UITransform,
  utils,
  Vec3,
  VerticalTextAlignment,
  view,
  Widget,
} from 'cc';
import { AudioController } from './AudioController';
import { BlockPresenter } from './BlockPresenter';
import { BoardRenderer } from './BoardRenderer';
import { CameraController } from './CameraController';
import { GameplayController } from './GameplayController';
import { MobileSafeArea } from './MobileSafeArea';
import { TouchInputController } from './TouchInputController';
import { UiButtonVisual, type UiButtonPalette } from './UiButtonVisual';
import type { UiTextKey } from './shared/game/index';

const { ccclass, property } = _decorator;

interface GameplayUi {
  readonly levelStatLabel: Label;
  readonly movesStatLabel: Label;
  readonly timeStatLabel: Label;
  readonly passcodeStatLabel: Label;
  readonly gameplayHudRoot: Node;
  readonly pauseMenuRoot: Node;
  readonly titleMenuRoot: Node;
  readonly stageSelectRoot: Node;
  readonly howToPlayRoot: Node;
  readonly creditsRoot: Node;
  readonly newGameConfirmRoot: Node;
  readonly failureRoot: Node;
  readonly completionRoot: Node;
  readonly tutorialRoot: Node;
  readonly passcodeInput: EditBox;
  readonly passcodeFeedback: Label;
  readonly soundToggleLabel: Label;
  readonly titleSoundLabel: Label;
  readonly titleLanguageLabel: Label;
  readonly pauseLanguageLabel: Label;
  readonly resumeButton: Button;
  readonly resumeButtonLabel: Label;
  readonly failureReasonLabel: Label;
  readonly completionStatsLabel: Label;
  readonly completionStarsLabel: Label;
  readonly completionContinueLabel: Label;
  readonly tutorialTitleLabel: Label;
  readonly tutorialSymbolLabel: Label;
  readonly tutorialBodyLabel: Label;
  readonly tutorialProgressLabel: Label;
  readonly tutorialNextLabel: Label;
  readonly howTopicTitleLabel: Label;
  readonly howTopicSymbolLabel: Label;
  readonly howTopicBodyLabel: Label;
  readonly howTopicProgressLabel: Label;
  readonly splitControlRoot: Node;
  readonly stageButtons: Button[];
  readonly stageButtonLabels: Label[];
  readonly stageStarLabels: Label[];
  readonly localizedLabels: Partial<Record<UiTextKey, Label[]>>;
}

type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger' | 'stage';
type LabelFontRole = 'ui' | 'display';

@ccclass('GameplayBootstrap')
export class GameplayBootstrap extends Component {
  @property(Material)
  litBaseMaterial: Material | null = null;

  private solidSpriteFrame: SpriteFrame | null = null;
  private logoSpriteFrame: SpriteFrame | null = null;
  private uiFont: TTFFont | null = null;
  private displayFont: TTFFont | null = null;

  start(): void {
    let pending = 3;
    const complete = (): void => {
      pending -= 1;
      if (pending === 0) this.initialize();
    };
    resources.load('fonts/NotoSansSC-Medium', TTFFont, (error, font) => {
      if (error) console.warn('UI font failed to load.', error);
      else this.uiFont = font;
      complete();
    });
    resources.load('fonts/Oxanium-SemiBold', TTFFont, (error, font) => {
      if (error) console.warn('Display font failed to load.', error);
      else this.displayFont = font;
      complete();
    });
    resources.load('ui/cubic-mark/texture', Texture2D, (error, texture) => {
      if (error) console.warn('Game logo failed to load.', error);
      else {
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = texture;
        spriteFrame.packable = false;
        this.logoSpriteFrame = spriteFrame;
      }
      complete();
    });
  }

  private initialize(): void {
    const boardRoot = this.createChild('BoardRoot');
    const blockRoot = this.createBlock();
    this.createVoidBackdrop();
    const cameraNode = this.createCamera();
    this.createLight();
    const ui = this.createUi();

    const board = boardRoot.addComponent(BoardRenderer);
    board.litBaseMaterial = this.litBaseMaterial;
    const block = blockRoot.addComponent(BlockPresenter);
    const cameraController = cameraNode.addComponent(CameraController);
    cameraController.camera = cameraNode.getComponent(Camera);
    const touchInput = this.node.addComponent(TouchInputController);
    const audioController = this.node.addComponent(AudioController);

    const gameplay = this.node.addComponent(GameplayController);
    gameplay.board = board;
    gameplay.block = block;
    gameplay.cameraController = cameraController;
    gameplay.touchInput = touchInput;
    gameplay.audioController = audioController;
    gameplay.levelStatLabel = ui.levelStatLabel;
    gameplay.movesStatLabel = ui.movesStatLabel;
    gameplay.timeStatLabel = ui.timeStatLabel;
    gameplay.passcodeStatLabel = ui.passcodeStatLabel;
    gameplay.gameplayHudRoot = ui.gameplayHudRoot;
    gameplay.pauseMenuRoot = ui.pauseMenuRoot;
    gameplay.titleMenuRoot = ui.titleMenuRoot;
    gameplay.stageSelectRoot = ui.stageSelectRoot;
    gameplay.howToPlayRoot = ui.howToPlayRoot;
    gameplay.creditsRoot = ui.creditsRoot;
    gameplay.newGameConfirmRoot = ui.newGameConfirmRoot;
    gameplay.failureRoot = ui.failureRoot;
    gameplay.completionRoot = ui.completionRoot;
    gameplay.tutorialRoot = ui.tutorialRoot;
    gameplay.passcodeInput = ui.passcodeInput;
    gameplay.passcodeFeedback = ui.passcodeFeedback;
    gameplay.soundToggleLabel = ui.soundToggleLabel;
    gameplay.titleSoundLabel = ui.titleSoundLabel;
    gameplay.titleLanguageLabel = ui.titleLanguageLabel;
    gameplay.pauseLanguageLabel = ui.pauseLanguageLabel;
    gameplay.resumeButton = ui.resumeButton;
    gameplay.resumeButtonLabel = ui.resumeButtonLabel;
    gameplay.failureReasonLabel = ui.failureReasonLabel;
    gameplay.completionStatsLabel = ui.completionStatsLabel;
    gameplay.completionStarsLabel = ui.completionStarsLabel;
    gameplay.completionContinueLabel = ui.completionContinueLabel;
    gameplay.tutorialTitleLabel = ui.tutorialTitleLabel;
    gameplay.tutorialSymbolLabel = ui.tutorialSymbolLabel;
    gameplay.tutorialBodyLabel = ui.tutorialBodyLabel;
    gameplay.tutorialProgressLabel = ui.tutorialProgressLabel;
    gameplay.tutorialNextLabel = ui.tutorialNextLabel;
    gameplay.howTopicTitleLabel = ui.howTopicTitleLabel;
    gameplay.howTopicSymbolLabel = ui.howTopicSymbolLabel;
    gameplay.howTopicBodyLabel = ui.howTopicBodyLabel;
    gameplay.howTopicProgressLabel = ui.howTopicProgressLabel;
    gameplay.splitControlRoot = ui.splitControlRoot;
    gameplay.stageButtons = ui.stageButtons;
    gameplay.stageButtonLabels = ui.stageButtonLabels;
    gameplay.stageStarLabels = ui.stageStarLabels;
    gameplay.localizedLabels = ui.localizedLabels;
  }

  private createChild(name: string): Node {
    const node = new Node(name);
    node.setParent(this.node);
    return node;
  }

  private createBlock(): Node {
    const node = this.createChild('Block');
    const blockMaterial = this.createLitMaterial(new Color(205, 18, 28, 255), 0.72);
    const edgeMaterial = this.createLitMaterial(new Color(190, 190, 190, 255), 0.68);
    const whole = new Node('WholeBlock');
    whole.setParent(node);
    const renderer = whole.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: 0.9, height: 2, length: 0.9 }));
    renderer.setMaterial(blockMaterial, 0);
    this.configureBlockShadows(renderer);
    this.createBlockEdges(whole, 0.9, 2, edgeMaterial);
    this.createSplitCube(node, 'SplitCubeA', blockMaterial, edgeMaterial);
    this.createSplitCube(node, 'SplitCubeB', blockMaterial, edgeMaterial);
    return node;
  }

  private createSplitCube(
    parent: Node,
    name: string,
    material: Material,
    edgeMaterial: Material,
  ): void {
    const cube = new Node(name);
    cube.setParent(parent);
    const renderer = cube.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: 0.88, height: 0.88, length: 0.88 }));
    renderer.setMaterial(material, 0);
    this.configureBlockShadows(renderer);
    this.createBlockEdges(cube, 0.88, 0.88, edgeMaterial);
    const marker = new Node('SelectionMarker');
    marker.setParent(cube);
    marker.setPosition(0, 0.455, 0);
    const markerRenderer = marker.addComponent(MeshRenderer);
    markerRenderer.mesh = utils.createMesh(primitives.box({ width: 0.48, height: 0.025, length: 0.48 }));
    markerRenderer.setMaterial(this.createFlatMaterial(new Color(229, 229, 238, 255)), 0);
    cube.active = false;
  }

  private createBlockEdges(parent: Node, width: number, height: number, material: Material): void {
    const thickness = 0.012;
    const side = width * 0.5 - thickness * 0.2;
    const top = height * 0.5 - thickness * 0.2;
    for (const x of [-side, side]) {
      for (const z of [-side, side]) {
        this.createBlockEdge(parent, new Vec3(thickness, height, thickness), new Vec3(x, 0, z), material);
      }
    }
    for (const y of [-top, top]) {
      for (const z of [-side, side]) {
        this.createBlockEdge(parent, new Vec3(width, thickness, thickness), new Vec3(0, y, z), material);
      }
      for (const x of [-side, side]) {
        this.createBlockEdge(parent, new Vec3(thickness, thickness, width), new Vec3(x, y, 0), material);
      }
    }
  }

  private createBlockEdge(parent: Node, size: Vec3, position: Vec3, material: Material): void {
    const edge = new Node('BlockEdge');
    edge.setParent(parent);
    edge.setPosition(position);
    const renderer = edge.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: size.x, height: size.y, length: size.z }));
    renderer.setMaterial(material, 0);
    this.configureBlockShadows(renderer);
  }

  private createCamera(): Node {
    const node = this.node.parent?.getChildByName('Main Camera') ?? this.createChild('Main Camera');
    const camera = node.getComponent(Camera) ?? node.addComponent(Camera);
    camera.projection = Camera.ProjectionType.ORTHO;
    camera.orthoHeight = 6;
    camera.clearColor = new Color(7, 8, 10, 255);
    node.setPosition(new Vec3(-6, 13, -18));
    node.lookAt(new Vec3(0, 0, 0));
    return node;
  }

  private createVoidBackdrop(): Node {
    const node = this.createChild('VoidBackdrop');
    node.setPosition(0, -3.2, 2);
    const renderer = node.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: 70, height: 0.08, length: 70 }));
    renderer.setMaterial(this.createFlatMaterial(new Color(9, 10, 12, 255)), 0);
    return node;
  }

  private createLight(): Node {
    const existing = this.node.parent?.getChildByName('Main Light');
    const node = existing ?? this.createChild('Key Light');
    const light = node.getComponent(DirectionalLight) ?? node.addComponent(DirectionalLight);
    light.illuminance = 45000;
    light.csmLevel = 1;
    node.setRotationFromEuler(-45, 35, 0);
    return node;
  }

  private createUi(): GameplayUi {
    const canvasNode = this.createChild('Canvas');
    canvasNode.layer = Layers.Enum.UI_2D;
    const visibleSize = view.getVisibleSize();
    canvasNode.addComponent(UITransform).setContentSize(visibleSize);
    const canvas = canvasNode.addComponent(Canvas);

    const uiCameraNode = new Node('UI Camera');
    uiCameraNode.setParent(canvasNode);
    const uiCamera = uiCameraNode.addComponent(Camera);
    uiCamera.projection = Camera.ProjectionType.ORTHO;
    uiCamera.priority = 1;
    uiCamera.clearFlags = Camera.ClearFlag.DEPTH_ONLY;
    uiCamera.visibility = Layers.Enum.UI_2D;
    uiCamera.near = 0;
    uiCamera.far = 2000;
    canvas.cameraComponent = uiCamera;

    const safeArea = this.createUiRoot('SafeArea', canvasNode, visibleSize.width, visibleSize.height);
    safeArea.addComponent(MobileSafeArea);
    const localizedLabels: Partial<Record<UiTextKey, Label[]>> = {};
    const bind = (key: UiTextKey, label: Label): void => {
      const labels = localizedLabels[key];
      if (labels) labels.push(label);
      else localizedLabels[key] = [label];
    };

    const gameplayHudRoot = this.createUiRoot(
      'GameplayHud',
      safeArea,
      visibleSize.width,
      visibleSize.height,
    );
    this.stretchToParent(gameplayHudRoot);
    const menuButton = this.createButton(
      gameplayHudRoot,
      'MenuButton',
      'MENU',
      Vec3.ZERO,
      'openMenu',
      126,
      48,
      '',
      'subtle',
    );
    bind('menu', menuButton.label);
    this.alignCorner(menuButton.button.node, 'left');
    const splitControl = this.createButton(
      gameplayHudRoot,
      'SplitControl',
      'SWITCH BLOCK',
      Vec3.ZERO,
      'switchCube',
      176,
      48,
    );
    bind('switchBlock', splitControl.label);
    const splitWidget = splitControl.button.node.addComponent(Widget);
    splitWidget.isAlignTop = true;
    splitWidget.isAlignLeft = true;
    splitWidget.top = 0;
    splitWidget.left = 140;
    splitControl.button.node.active = false;

    const statsCluster = this.createUiRoot('StatsCluster', gameplayHudRoot, 520, 62);
    this.alignCorner(statsCluster, 'right');
    const levelStatLabel = this.createStatLabel(statsCluster, 'LevelStat', 'LEVEL\n01 / 33', -195);
    const movesStatLabel = this.createStatLabel(statsCluster, 'MovesStat', 'MOVES\n0', -65);
    const timeStatLabel = this.createStatLabel(statsCluster, 'TimeStat', 'TIME\n00:00', 65);
    const passcodeStatLabel = this.createStatLabel(statsCluster, 'PasscodeStat', 'PASSCODE\n780464', 195);

    const titleMenuRoot = this.createOverlay(
      'TitleMenu',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(6, 7, 9, 148),
    );
    const titleBand = this.createUiRoot('TitleBand', titleMenuRoot, 390, visibleSize.height);
    titleBand.setPosition(-visibleSize.width * 0.5 + 195, 0);
    this.drawPanel(titleBand, 390, visibleSize.height, new Color(12, 14, 17, 238));
    const titleY = Math.min(205, visibleSize.height * 0.32);
    if (this.logoSpriteFrame) {
      const logoSize = Math.min(82, visibleSize.height * 0.15);
      const logoNode = this.createUiRoot('GameLogo', titleBand, logoSize, logoSize);
      logoNode.setPosition(-96, titleY);
      const logo = logoNode.addComponent(Sprite);
      logo.sizeMode = Sprite.SizeMode.CUSTOM;
      logo.spriteFrame = this.logoSpriteFrame;
    }
    const title = this.createLabel('GameTitle', 'CUBIC', new Vec3(40, titleY, 0), 250, 74, 58, 'display');
    title.node.setParent(titleBand);
    const subtitle = this.createLabel(
      'GameSubtitle',
      'ROLLING BLOCK PUZZLE',
      new Vec3(0, titleY - 50, 0),
      350,
      34,
      14,
    );
    subtitle.color = new Color(164, 166, 172, 255);
    subtitle.node.setParent(titleBand);
    bind('gameSubtitle', subtitle);
    const startButton = this.createButton(titleBand, 'StartButton', 'START NEW GAME', new Vec3(0, 82, 0), 'startGame', 300, 42, '', 'primary');
    const resume = this.createButton(titleBand, 'ResumeButton', 'RESUME GAME', new Vec3(0, 32, 0), 'resumeGame', 300, 42);
    const loadStageButton = this.createButton(titleBand, 'LoadStageButton', 'LOAD STAGE', new Vec3(0, -18, 0), 'openStageSelect', 300, 42);
    const howToButton = this.createButton(titleBand, 'HowToButton', 'HOW TO PLAY', new Vec3(0, -68, 0), 'showHowToPlay', 300, 42);
    const titleSoundButton = this.createButton(titleBand, 'TitleSoundButton', 'TOGGLE SOUND: ON', new Vec3(0, -118, 0), 'toggleSound', 300, 42, '', 'subtle');
    const titleLanguageButton = this.createButton(titleBand, 'TitleLanguageButton', 'LANGUAGE: ENGLISH', new Vec3(0, -168, 0), 'cycleLanguage', 300, 42, '', 'subtle');
    const creditsButton = this.createButton(titleBand, 'CreditsButton', 'CREDITS', new Vec3(0, -218, 0), 'showCredits', 300, 42, '', 'subtle');
    bind('startNewGame', startButton.label);
    bind('loadStage', loadStageButton.label);
    bind('howToPlay', howToButton.label);
    bind('credits', creditsButton.label);

    const stageSelectRoot = this.createOverlay(
      'StageSelect',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(6, 7, 9, 248),
    );
    const stageTitle = this.createLabel('StageTitle', 'LOAD STAGE', new Vec3(0, 205, 0), 500, 52, 34);
    stageTitle.node.setParent(stageSelectRoot);
    bind('loadStage', stageTitle);
    const stageButtons: Button[] = [];
    const stageButtonLabels: Label[] = [];
    const stageStarLabels: Label[] = [];
    for (let index = 0; index < 33; index += 1) {
      const column = index % 11;
      const row = Math.floor(index / 11);
      const stageButton = this.createButton(
        stageSelectRoot,
        `StageButton${index + 1}`,
        index < 9 ? `0${index + 1}` : String(index + 1),
        new Vec3((column - 5) * 61, 118 - row * 56, 0),
        'selectStage',
        52,
        42,
        String(index),
        'stage',
      );
      stageButton.label.fontSize = 14;
      stageButton.label.lineHeight = 18;
      stageButton.label.node.getComponent(UITransform)?.setContentSize(32, 18);
      stageButton.label.node.setPosition(0, 6, 0);
      const starLabel = this.createLabel(
        `StageStars${index + 1}`,
        '',
        new Vec3(0, -10, 0),
        38,
        10,
        8,
      );
      starLabel.lineHeight = 10;
      starLabel.color = new Color(218, 185, 105, 255);
      starLabel.node.setParent(stageButton.button.node);
      stageButtons.push(stageButton.button);
      stageButtonLabels.push(stageButton.label);
      stageStarLabels.push(starLabel);
    }
    const passcodeInput = this.createPasscodeInput(stageSelectRoot, new Vec3(-70, -96, 0));
    const passcodeButton = this.createButton(stageSelectRoot, 'PasscodeButton', 'ENTER', new Vec3(145, -96, 0), 'submitPasscode', 140, 52, '', 'primary');
    bind('enter', passcodeButton.label);
    const passcodeFeedback = this.createLabel(
      'PasscodeFeedback',
      '',
      new Vec3(0, -145, 0),
      460,
      32,
      15,
    );
    passcodeFeedback.color = new Color(218, 91, 99, 255);
    passcodeFeedback.node.setParent(stageSelectRoot);
    const stageBackButton = this.createButton(stageSelectRoot, 'StageBackButton', 'BACK', new Vec3(0, -196, 0), 'returnToTitle', 180, 44, '', 'subtle');
    bind('back', stageBackButton.label);
    stageSelectRoot.active = false;

    const howToPlayRoot = this.createOverlay(
      'HowToPlay',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(6, 7, 9, 248),
    );
    const howTitle = this.createLabel('HowTitle', 'HOW TO PLAY', new Vec3(0, 205, 0), 600, 52, 34);
    howTitle.node.setParent(howToPlayRoot);
    bind('howToPlay', howTitle);
    const howTopicSymbolLabel = this.createBadge(howToPlayRoot, 'HowTopicBadge', new Vec3(-280, 30, 0));
    const howTopicTitleLabel = this.createLabel('HowTopicTitle', '', new Vec3(100, 95, 0), 540, 44, 27);
    howTopicTitleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
    howTopicTitleLabel.node.setParent(howToPlayRoot);
    const howTopicBodyLabel = this.createLabel('HowTopicBody', '', new Vec3(100, 15, 0), 540, 120, 18);
    howTopicBodyLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
    howTopicBodyLabel.lineHeight = 26;
    howTopicBodyLabel.node.setParent(howToPlayRoot);
    const howTopicProgressLabel = this.createLabel('HowTopicProgress', '1 / 9', new Vec3(0, -105, 0), 180, 32, 15);
    howTopicProgressLabel.color = new Color(164, 166, 172, 255);
    howTopicProgressLabel.node.setParent(howToPlayRoot);
    const howPreviousButton = this.createButton(howToPlayRoot, 'HowPreviousButton', 'PREVIOUS', new Vec3(-150, -155, 0), 'previousHowTopic', 220, 44);
    const howNextButton = this.createButton(howToPlayRoot, 'HowNextButton', 'NEXT', new Vec3(150, -155, 0), 'nextHowTopic', 220, 44, '', 'primary');
    const howBackButton = this.createButton(howToPlayRoot, 'HowBackButton', 'BACK', new Vec3(0, -205, 0), 'returnToTitle', 180, 44, '', 'subtle');
    bind('previous', howPreviousButton.label);
    bind('next', howNextButton.label);
    bind('back', howBackButton.label);
    howToPlayRoot.active = false;

    const creditsRoot = this.createOverlay(
      'Credits',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(6, 7, 9, 248),
    );
    const creditsTitle = this.createLabel('CreditsTitle', 'CREDITS', new Vec3(0, 145, 0), 500, 52, 34);
    creditsTitle.node.setParent(creditsRoot);
    bind('credits', creditsTitle);
    const creditsCopy = this.createLabel(
      'CreditsCopy',
      'DESIGN & DEVELOPMENT\nCUBIC TEAM\n\nLEVEL DATA\nBLOXORZ.GBA / JACOB COUGHENOUR\nMIT LICENSE',
      new Vec3(0, 15, 0),
      620,
      210,
      18,
    );
    creditsCopy.lineHeight = 28;
    creditsCopy.node.setParent(creditsRoot);
    bind('creditsCopy', creditsCopy);
    const creditsBackButton = this.createButton(creditsRoot, 'CreditsBackButton', 'BACK', new Vec3(0, -155, 0), 'returnToTitle', 180, 44, '', 'subtle');
    bind('back', creditsBackButton.label);
    creditsRoot.active = false;

    const newGameConfirmRoot = this.createOverlay(
      'NewGameConfirm',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(3, 4, 5, 232),
    );
    const confirmPanel = this.createUiRoot('ConfirmPanel', newGameConfirmRoot, 440, 260);
    this.drawPanel(confirmPanel, 440, 260, new Color(25, 27, 31, 252));
    const confirmTitle = this.createLabel('ConfirmTitle', 'START NEW GAME?', new Vec3(0, 78, 0), 380, 46, 28);
    confirmTitle.node.setParent(confirmPanel);
    const confirmCopy = this.createLabel('ConfirmCopy', 'CURRENT CAMPAIGN PROGRESS WILL RESET.', new Vec3(0, 25, 0), 380, 34, 14);
    confirmCopy.color = new Color(174, 177, 184, 255);
    confirmCopy.node.setParent(confirmPanel);
    const confirmNewButton = this.createButton(confirmPanel, 'ConfirmNewButton', 'START', new Vec3(-95, -58, 0), 'confirmNewGame', 170, 48, '', 'danger');
    const cancelNewButton = this.createButton(confirmPanel, 'CancelNewButton', 'CANCEL', new Vec3(95, -58, 0), 'cancelNewGame', 170, 48);
    bind('confirmNewGameTitle', confirmTitle);
    bind('confirmNewGameCopy', confirmCopy);
    bind('start', confirmNewButton.label);
    bind('cancel', cancelNewButton.label);
    newGameConfirmRoot.active = false;

    const failureRoot = this.createOverlay(
      'FailureResult',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(3, 4, 5, 224),
    );
    const failurePanel = this.createUiRoot('FailurePanel', failureRoot, 420, 270);
    this.drawPanel(failurePanel, 420, 270, new Color(25, 27, 31, 252));
    const failureTitle = this.createLabel('FailureTitle', 'STAGE FAILED', new Vec3(0, 82, 0), 360, 48, 30);
    failureTitle.color = new Color(218, 91, 99, 255);
    failureTitle.node.setParent(failurePanel);
    const failureReasonLabel = this.createLabel('FailureReason', 'FELL INTO THE VOID', new Vec3(0, 30, 0), 360, 34, 15);
    failureReasonLabel.node.setParent(failurePanel);
    const retryButton = this.createButton(failurePanel, 'RetryButton', 'RETRY', new Vec3(-95, -58, 0), 'retryLevel', 170, 48, '', 'primary');
    const failureQuitButton = this.createButton(failurePanel, 'FailureQuitButton', 'QUIT TO MENU', new Vec3(95, -58, 0), 'quitResultToMenu', 170, 48, '', 'danger');
    bind('stageFailed', failureTitle);
    bind('retry', retryButton.label);
    bind('quitToMenu', failureQuitButton.label);
    failureRoot.active = false;

    const completionRoot = this.createOverlay(
      'CompletionResult',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(3, 4, 5, 224),
    );
    const completionPanel = this.createUiRoot('CompletionPanel', completionRoot, 460, 360);
    this.drawPanel(completionPanel, 460, 360, new Color(25, 27, 31, 252));
    const completionTitle = this.createLabel('CompletionTitle', 'STAGE COMPLETE', new Vec3(0, 137, 0), 400, 48, 30);
    completionTitle.color = new Color(154, 202, 193, 255);
    completionTitle.node.setParent(completionPanel);
    const completionStarsLabel = this.createLabel('CompletionStars', '☆☆☆', new Vec3(0, 96, 0), 300, 36, 30);
    completionStarsLabel.color = new Color(218, 185, 105, 255);
    completionStarsLabel.node.setParent(completionPanel);
    const completionStatsLabel = this.createLabel('CompletionStats', '', new Vec3(0, 30, 0), 390, 84, 17);
    completionStatsLabel.lineHeight = 28;
    completionStatsLabel.node.setParent(completionPanel);
    const continueButton = this.createButton(completionPanel, 'ContinueButton', 'CONTINUE', new Vec3(0, -58, 0), 'continueAfterComplete', 300, 48, '', 'primary');
    const replayButton = this.createButton(completionPanel, 'ReplayButton', 'REPLAY', new Vec3(-95, -122, 0), 'replayLevel', 170, 44);
    const completeQuitButton = this.createButton(completionPanel, 'CompleteQuitButton', 'QUIT TO MENU', new Vec3(95, -122, 0), 'quitResultToMenu', 170, 44, '', 'danger');
    bind('stageComplete', completionTitle);
    bind('replay', replayButton.label);
    bind('quitToMenu', completeQuitButton.label);
    completionRoot.active = false;

    const tutorialRoot = this.createOverlay(
      'Tutorial',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(3, 4, 5, 126),
    );
    const tutorialPanelWidth = Math.min(820, visibleSize.width - 40);
    const tutorialPanel = this.createUiRoot('TutorialPanel', tutorialRoot, tutorialPanelWidth, 190);
    tutorialPanel.setPosition(0, -visibleSize.height * 0.5 + 115);
    this.drawPanel(tutorialPanel, tutorialPanelWidth, 190, new Color(20, 22, 26, 250));
    const tutorialSymbolLabel = this.createBadge(tutorialPanel, 'TutorialBadge', new Vec3(-tutorialPanelWidth * 0.5 + 60, 8, 0));
    const tutorialTitleLabel = this.createLabel('TutorialTitle', '', new Vec3(55, 54, 0), tutorialPanelWidth - 220, 40, 25);
    tutorialTitleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
    tutorialTitleLabel.node.setParent(tutorialPanel);
    const tutorialBodyLabel = this.createLabel('TutorialBody', '', new Vec3(55, -2, 0), tutorialPanelWidth - 220, 66, 16);
    tutorialBodyLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
    tutorialBodyLabel.lineHeight = 22;
    tutorialBodyLabel.node.setParent(tutorialPanel);
    const tutorialProgressLabel = this.createLabel('TutorialProgress', '', new Vec3(-tutorialPanelWidth * 0.5 + 180, -67, 0), 180, 28, 13);
    tutorialProgressLabel.color = new Color(164, 166, 172, 255);
    tutorialProgressLabel.node.setParent(tutorialPanel);
    const tutorialSkipButton = this.createButton(tutorialPanel, 'TutorialSkipButton', 'SKIP', new Vec3(tutorialPanelWidth * 0.5 - 220, -66, 0), 'skipTutorial', 140, 40, '', 'subtle');
    const tutorialNextButton = this.createButton(tutorialPanel, 'TutorialNextButton', 'NEXT', new Vec3(tutorialPanelWidth * 0.5 - 70, -66, 0), 'acknowledgeTutorial', 110, 40, '', 'primary');
    bind('skip', tutorialSkipButton.label);
    tutorialRoot.active = false;

    const pauseMenuRoot = this.createOverlay(
      'PauseMenu',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(3, 4, 5, 232),
    );
    const pausePanel = this.createUiRoot('PausePanel', pauseMenuRoot, 380, 390);
    this.drawPanel(pausePanel, 380, 390, new Color(25, 27, 31, 252));
    const pauseTitle = this.createLabel('PauseTitle', 'PAUSED', new Vec3(0, 150, 0), 320, 48, 30);
    pauseTitle.node.setParent(pausePanel);
    const returnButton = this.createButton(
      pausePanel,
      'ReturnButton',
      'RETURN TO GAME',
      new Vec3(0, 78, 0),
      'returnToGame',
      300,
      50,
      '',
      'primary',
    );
    const soundButton = this.createButton(
      pausePanel,
      'SoundButton',
      'TOGGLE SOUND: ON',
      new Vec3(0, 14, 0),
      'toggleSound',
      300,
      50,
    );
    const pauseLanguageButton = this.createButton(
      pausePanel,
      'PauseLanguageButton',
      'LANGUAGE: ENGLISH',
      new Vec3(0, -50, 0),
      'cycleLanguage',
      300,
      50,
    );
    const quitButton = this.createButton(
      pausePanel,
      'QuitButton',
      'QUIT TO MENU',
      new Vec3(0, -114, 0),
      'quitToMenu',
      300,
      50,
      '',
      'danger',
    );
    bind('paused', pauseTitle);
    bind('returnToGame', returnButton.label);
    bind('quitToMenu', quitButton.label);
    pauseMenuRoot.active = false;

    return {
      levelStatLabel,
      movesStatLabel,
      timeStatLabel,
      passcodeStatLabel,
      gameplayHudRoot,
      pauseMenuRoot,
      titleMenuRoot,
      stageSelectRoot,
      howToPlayRoot,
      creditsRoot,
      newGameConfirmRoot,
      failureRoot,
      completionRoot,
      tutorialRoot,
      passcodeInput,
      passcodeFeedback,
      soundToggleLabel: soundButton.label,
      titleSoundLabel: titleSoundButton.label,
      titleLanguageLabel: titleLanguageButton.label,
      pauseLanguageLabel: pauseLanguageButton.label,
      resumeButton: resume.button,
      resumeButtonLabel: resume.label,
      failureReasonLabel,
      completionStatsLabel,
      completionStarsLabel,
      completionContinueLabel: continueButton.label,
      tutorialTitleLabel,
      tutorialSymbolLabel,
      tutorialBodyLabel,
      tutorialProgressLabel,
      tutorialNextLabel: tutorialNextButton.label,
      howTopicTitleLabel,
      howTopicSymbolLabel,
      howTopicBodyLabel,
      howTopicProgressLabel,
      splitControlRoot: splitControl.button.node,
      stageButtons,
      stageButtonLabels,
      stageStarLabels,
      localizedLabels,
    };
  }

  private createBadge(parent: Node, name: string, position: Vec3): Label {
    const node = this.createUiRoot(name, parent, 104, 104);
    node.setPosition(position);
    this.drawPanel(node, 104, 104, new Color(43, 45, 50, 252));
    const label = this.createLabel(`${name}Label`, '', Vec3.ZERO, 92, 92, 14);
    label.color = new Color(218, 185, 105, 255);
    label.node.setParent(node);
    return label;
  }

  private createPasscodeInput(
    parent: Node,
    position: Vec3,
  ): EditBox {
    const inputWidth = 250;
    const inputHeight = 52;
    const horizontalPadding = 2;
    const node = this.createUiRoot('PasscodeInput', parent, inputWidth, inputHeight);
    node.active = false;
    node.setPosition(position);
    this.drawPanel(node, inputWidth, inputHeight, new Color(25, 27, 31, 245));

    const textLabel = this.createLabel('TEXT_LABEL', '', Vec3.ZERO, inputWidth, inputHeight, 22, 'display');
    textLabel.node.setParent(node);
    const placeholderLabel = this.createLabel('PLACEHOLDER_LABEL', 'PASSCODE', Vec3.ZERO, inputWidth, inputHeight, 18);
    placeholderLabel.color = new Color(137, 139, 145, 255);
    placeholderLabel.node.setParent(node);

    const editBox = node.addComponent(EditBox);
    editBox.textLabel = textLabel;
    editBox.placeholderLabel = placeholderLabel;
    textLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
    placeholderLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
    for (const label of [textLabel, placeholderLabel]) {
      const transform = label.node.getComponent(UITransform);
      label.overflow = Label.Overflow.CLAMP;
      label.enableWrapText = false;
      transform?.setAnchorPoint(0, 1);
      transform?.setContentSize(inputWidth - horizontalPadding, inputHeight);
      label.node.setPosition(
        -inputWidth * 0.5 + horizontalPadding,
        inputHeight * 0.5,
        label.node.position.z,
      );
      label.verticalAlign = VerticalTextAlignment.CENTER;
    }
    editBox.string = '';
    editBox.placeholder = 'PASSCODE';
    editBox.maxLength = 6;
    editBox.inputMode = EditBox.InputMode.NUMERIC;
    editBox.inputFlag = EditBox.InputFlag.DEFAULT;
    editBox.returnType = EditBox.KeyboardReturnType.DONE;

    const returnEvent = this.createEventHandler('submitPasscode');
    editBox.editingReturn.push(returnEvent);
    node.active = true;
    return editBox;
  }

  private createOverlay(
    name: string,
    parent: Node,
    width: number,
    height: number,
    color: Color,
  ): Node {
    const node = this.createUiRoot(name, parent, width, height);
    this.stretchToParent(node);
    this.createSolidRect(node, 'Background', width, height, color);
    return node;
  }

  private createUiRoot(name: string, parent: Node, width: number, height: number): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    node.setParent(parent);
    node.addComponent(UITransform).setContentSize(width, height);
    return node;
  }

  private createLabel(
    name: string,
    text: string,
    position: Vec3,
    width: number,
    height: number,
    fontSize: number,
    fontRole: LabelFontRole = 'ui',
  ): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    node.addComponent(UITransform).setContentSize(width, height);
    node.setPosition(position);
    const label = node.addComponent(Label);
    label.string = text;
    label.font = fontRole === 'display' ? this.displayFont : this.uiFont;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.horizontalAlign = HorizontalTextAlignment.CENTER;
    label.verticalAlign = VerticalTextAlignment.CENTER;
    label.color = new Color(245, 242, 236, 255);
    return label;
  }

  private createStatLabel(parent: Node, name: string, value: string, x: number): Label {
    const label = this.createLabel(name, value, new Vec3(x, 0, 0), 120, 58, 15);
    label.lineHeight = 22;
    label.color = new Color(241, 242, 245, 255);
    label.node.setParent(parent);
    return label;
  }

  private createButton(
    parent: Node,
    name: string,
    text: string,
    position: Vec3,
    handler: string,
    width: number,
    height: number,
    customEventData = '',
    variant: ButtonVariant = 'secondary',
  ): { button: Button; label: Label } {
    const buttonNode = this.createUiRoot(name, parent, width, height);
    buttonNode.setPosition(position);
    const palette = this.createButtonPalette(variant);
    const borderSprites = this.createChamferedRect(
      buttonNode,
      'Border',
      width,
      height,
      palette.border,
    );
    const fillSprites = this.createChamferedRect(
      buttonNode,
      'Fill',
      width - 3,
      height - 3,
      palette.fill,
    );
    const accent = this.createSolidRect(
      buttonNode,
      'Accent',
      variant === 'stage' ? 2 : 3,
      Math.max(12, height - 18),
      palette.accent,
      new Vec3(-width * 0.5 + 8, 0, 0),
    );

    const button = buttonNode.addComponent(Button);
    button.target = buttonNode;
    button.transition = Button.Transition.NONE;
    button.clickEvents.push(this.createEventHandler(handler, customEventData));

    const label = this.createLabel(
      `${name}Label`,
      text,
      Vec3.ZERO,
      width - 20,
      height - 8,
      variant === 'stage' ? 16 : 17,
      variant === 'stage' ? 'display' : 'ui',
    );
    label.node.setParent(buttonNode);
    buttonNode.addComponent(UiButtonVisual).setup(
      button,
      label,
      fillSprites,
      borderSprites,
      [accent],
      palette,
    );
    return { button, label };
  }

  private createButtonPalette(variant: ButtonVariant): UiButtonPalette {
    const disabledFill = new Color(39, 42, 47, 245);
    const disabledBorder = new Color(67, 72, 79, 235);
    const disabledText = new Color(112, 116, 124, 255);
    const disabledAccent = new Color(76, 80, 87, 220);
    if (variant === 'primary') {
      return {
        fill: new Color(154, 36, 45, 252),
        hoverFill: new Color(181, 46, 55, 255),
        pressedFill: new Color(122, 26, 35, 255),
        disabledFill,
        border: new Color(220, 84, 91, 255),
        disabledBorder,
        text: new Color(250, 246, 239, 255),
        disabledText,
        accent: new Color(230, 188, 101, 255),
        disabledAccent,
      };
    }
    if (variant === 'danger') {
      return {
        fill: new Color(64, 28, 34, 252),
        hoverFill: new Color(86, 34, 42, 255),
        pressedFill: new Color(47, 22, 27, 255),
        disabledFill,
        border: new Color(151, 61, 69, 255),
        disabledBorder,
        text: new Color(238, 174, 178, 255),
        disabledText,
        accent: new Color(218, 91, 99, 255),
        disabledAccent,
      };
    }
    if (variant === 'subtle') {
      return {
        fill: new Color(20, 23, 27, 238),
        hoverFill: new Color(32, 36, 42, 252),
        pressedFill: new Color(14, 17, 20, 255),
        disabledFill,
        border: new Color(66, 72, 81, 235),
        disabledBorder,
        text: new Color(198, 201, 207, 255),
        disabledText,
        accent: new Color(112, 119, 129, 255),
        disabledAccent,
      };
    }
    if (variant === 'stage') {
      return {
        fill: new Color(28, 32, 37, 250),
        hoverFill: new Color(43, 48, 55, 255),
        pressedFill: new Color(19, 22, 26, 255),
        disabledFill,
        border: new Color(86, 93, 103, 245),
        disabledBorder,
        text: new Color(240, 239, 235, 255),
        disabledText,
        accent: new Color(218, 185, 105, 255),
        disabledAccent,
      };
    }
    return {
      fill: new Color(34, 38, 44, 250),
      hoverFill: new Color(47, 52, 60, 255),
      pressedFill: new Color(25, 29, 34, 255),
      disabledFill,
      border: new Color(103, 111, 123, 250),
      disabledBorder,
      text: new Color(242, 240, 235, 255),
      disabledText,
      accent: new Color(164, 173, 184, 255),
      disabledAccent,
    };
  }

  private createEventHandler(handler: string, customEventData = ''): EventHandler {
    const event = new EventHandler();
    event.target = this.node;
    event.component = 'GameplayController';
    event.handler = handler;
    event.customEventData = customEventData;
    return event;
  }

  private drawPanel(node: Node, width: number, height: number, color: Color): void {
    this.createChamferedRect(node, 'Border', width, height, new Color(92, 99, 110, 235));
    this.createChamferedRect(node, 'Fill', width - 3, height - 3, color);
    this.createSolidRect(
      node,
      'PanelAccent',
      Math.min(58, width * 0.2),
      2,
      new Color(190, 63, 70, 245),
      new Vec3(-width * 0.5 + Math.min(42, width * 0.14), height * 0.5 - 5, 0),
    );
  }

  private createChamferedRect(
    parent: Node,
    name: string,
    width: number,
    height: number,
    color: Color,
  ): Sprite[] {
    const root = this.createUiRoot(name, parent, width, height);
    const chamfer = Math.min(7, Math.max(3, Math.floor(Math.min(width, height) * 0.14)));
    const capHeight = 2;
    const shoulderHeight = chamfer - capHeight;
    const capY = height * 0.5 - capHeight * 0.5;
    const shoulderY = height * 0.5 - capHeight - shoulderHeight * 0.5;
    return [
      this.createSolidRect(
        root,
        'TopCap',
        width - chamfer * 2,
        capHeight,
        color,
        new Vec3(0, capY, 0),
      ),
      this.createSolidRect(
        root,
        'TopShoulder',
        width - chamfer,
        shoulderHeight,
        color,
        new Vec3(0, shoulderY, 0),
      ),
      this.createSolidRect(root, 'Center', width, height - chamfer * 2, color),
      this.createSolidRect(
        root,
        'BottomShoulder',
        width - chamfer,
        shoulderHeight,
        color,
        new Vec3(0, -shoulderY, 0),
      ),
      this.createSolidRect(
        root,
        'BottomCap',
        width - chamfer * 2,
        capHeight,
        color,
        new Vec3(0, -capY, 0),
      ),
    ];
  }

  private createSolidRect(
    parent: Node,
    name: string,
    width: number,
    height: number,
    color: Color,
    position = Vec3.ZERO,
  ): Sprite {
    const node = this.createUiRoot(name, parent, width, height);
    node.setPosition(position);
    const sprite = node.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame = this.getSolidSpriteFrame();
    sprite.color = color;
    return sprite;
  }

  private getSolidSpriteFrame(): SpriteFrame {
    if (!this.solidSpriteFrame) {
      const spriteFrame = new SpriteFrame();
      spriteFrame.texture = builtinResMgr.get<Texture2D>('white-texture');
      spriteFrame.packable = false;
      this.solidSpriteFrame = spriteFrame;
    }
    return this.solidSpriteFrame;
  }

  private stretchToParent(node: Node): void {
    const widget = node.addComponent(Widget);
    widget.isAlignTop = true;
    widget.isAlignBottom = true;
    widget.isAlignLeft = true;
    widget.isAlignRight = true;
    widget.top = 0;
    widget.bottom = 0;
    widget.left = 0;
    widget.right = 0;
  }

  private alignCorner(node: Node, side: 'left' | 'right'): void {
    const widget = node.addComponent(Widget);
    widget.isAlignTop = true;
    widget.top = 0;
    if (side === 'left') {
      widget.isAlignLeft = true;
      widget.left = 0;
    } else {
      widget.isAlignRight = true;
      widget.right = 0;
    }
  }

  private createFlatMaterial(color: Color): Material {
    const material = new Material();
    material.initialize({ effectName: 'builtin-unlit' });
    material.setProperty('mainColor', color);
    return material;
  }

  private createLitMaterial(color: Color, roughness: number): Material {
    const baseMaterial = this.litBaseMaterial;
    if (!baseMaterial) throw new Error('Gameplay lit material is not assigned');
    const material = new Material();
    material.copy(baseMaterial);
    material.setProperty('mainColor', color);
    material.setProperty('roughness', roughness);
    material.setProperty('metallic', 0);
    return material;
  }

  private configureBlockShadows(renderer: MeshRenderer): void {
    renderer.shadowCastingMode = MeshRenderer.ShadowCastingMode.ON;
    renderer.receiveShadow = MeshRenderer.ShadowReceivingMode.ON;
    renderer.shadowBias = 0.0005;
    renderer.shadowNormalBias = 0.02;
  }

}
