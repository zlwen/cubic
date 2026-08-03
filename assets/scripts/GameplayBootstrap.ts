import {
  _decorator,
  Button,
  Camera,
  Canvas,
  Color,
  Component,
  DirectionalLight,
  EditBox,
  EventHandler,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Layers,
  Material,
  MeshRenderer,
  Node,
  primitives,
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

const { ccclass, property } = _decorator;

interface GameplayUi {
  readonly levelStatLabel: Label;
  readonly movesStatLabel: Label;
  readonly timeStatLabel: Label;
  readonly passcodeStatLabel: Label;
  readonly gameplayHudRoot: Node;
  readonly pauseMenuRoot: Node;
  readonly titleMenuRoot: Node;
  readonly passcodeInput: EditBox;
  readonly passcodeFeedback: Label;
  readonly soundToggleLabel: Label;
  readonly splitControlRoot: Node;
}

@ccclass('GameplayBootstrap')
export class GameplayBootstrap extends Component {
  @property(Material)
  litBaseMaterial: Material | null = null;

  start(): void {
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
    gameplay.passcodeInput = ui.passcodeInput;
    gameplay.passcodeFeedback = ui.passcodeFeedback;
    gameplay.soundToggleLabel = ui.soundToggleLabel;
    gameplay.splitControlRoot = ui.splitControlRoot;
  }

  private createChild(name: string): Node {
    const node = new Node(name);
    node.setParent(this.node);
    return node;
  }

  private createBlock(): Node {
    const node = this.createChild('Block');
    const blockMaterial = this.createLitMaterial(new Color(205, 18, 28, 255), 0.72);
    const whole = new Node('WholeBlock');
    whole.setParent(node);
    const renderer = whole.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: 0.9, height: 2, length: 0.9 }));
    renderer.setMaterial(blockMaterial, 0);
    this.configureBlockShadows(renderer);
    this.createSplitCube(node, 'SplitCubeA', blockMaterial);
    this.createSplitCube(node, 'SplitCubeB', blockMaterial);
    return node;
  }

  private createSplitCube(parent: Node, name: string, material: Material): void {
    const cube = new Node(name);
    cube.setParent(parent);
    const renderer = cube.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: 0.88, height: 0.88, length: 0.88 }));
    renderer.setMaterial(material, 0);
    this.configureBlockShadows(renderer);
    const marker = new Node('SelectionMarker');
    marker.setParent(cube);
    marker.setPosition(0, 0.455, 0);
    const markerRenderer = marker.addComponent(MeshRenderer);
    markerRenderer.mesh = utils.createMesh(primitives.box({ width: 0.48, height: 0.025, length: 0.48 }));
    markerRenderer.setMaterial(this.createFlatMaterial(new Color(229, 229, 238, 255)), 0);
    cube.active = false;
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
    );
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
    const passcodeStatLabel = this.createStatLabel(statsCluster, 'PasscodeStat', 'PASSCODE\nCUBE', 195);

    const titleMenuRoot = this.createOverlay(
      'TitleMenu',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(8, 9, 11, 252),
    );
    const title = this.createLabel('GameTitle', 'CUBIC', new Vec3(0, 145, 0), 620, 86, 66);
    title.node.setParent(titleMenuRoot);
    const subtitle = this.createLabel(
      'GameSubtitle',
      'ROLLING BLOCK PUZZLE',
      new Vec3(0, 95, 0),
      520,
      34,
      16,
    );
    subtitle.color = new Color(164, 166, 172, 255);
    subtitle.node.setParent(titleMenuRoot);
    this.createButton(titleMenuRoot, 'StartButton', 'START GAME', new Vec3(0, 32, 0), 'startGame', 280, 52);
    const passcodeInput = this.createPasscodeInput(titleMenuRoot, new Vec3(-70, -58, 0));
    this.createButton(titleMenuRoot, 'PasscodeButton', 'ENTER', new Vec3(145, -58, 0), 'submitPasscode', 140, 52);
    const passcodeFeedback = this.createLabel(
      'PasscodeFeedback',
      '',
      new Vec3(0, -116, 0),
      460,
      32,
      15,
    );
    passcodeFeedback.color = new Color(218, 91, 99, 255);
    passcodeFeedback.node.setParent(titleMenuRoot);

    const pauseMenuRoot = this.createOverlay(
      'PauseMenu',
      safeArea,
      visibleSize.width,
      visibleSize.height,
      new Color(3, 4, 5, 232),
    );
    const pausePanel = this.createUiRoot('PausePanel', pauseMenuRoot, 380, 320);
    this.drawPanel(pausePanel, 380, 320, new Color(25, 27, 31, 252));
    const pauseTitle = this.createLabel('PauseTitle', 'PAUSED', new Vec3(0, 118, 0), 320, 48, 30);
    pauseTitle.node.setParent(pausePanel);
    this.createButton(
      pausePanel,
      'ReturnButton',
      'RETURN TO GAME',
      new Vec3(0, 52, 0),
      'returnToGame',
      300,
      50,
    );
    const soundButton = this.createButton(
      pausePanel,
      'SoundButton',
      'TOGGLE SOUND: ON',
      new Vec3(0, -12, 0),
      'toggleSound',
      300,
      50,
    );
    this.createButton(
      pausePanel,
      'QuitButton',
      'QUIT TO MENU',
      new Vec3(0, -76, 0),
      'quitToMenu',
      300,
      50,
    );
    pauseMenuRoot.active = false;

    return {
      levelStatLabel,
      movesStatLabel,
      timeStatLabel,
      passcodeStatLabel,
      gameplayHudRoot,
      pauseMenuRoot,
      titleMenuRoot,
      passcodeInput,
      passcodeFeedback,
      soundToggleLabel: soundButton.label,
      splitControlRoot: splitControl.button.node,
    };
  }

  private createPasscodeInput(parent: Node, position: Vec3): EditBox {
    const node = this.createUiRoot('PasscodeInput', parent, 250, 52);
    node.setPosition(position);
    this.drawPanel(node, 250, 52, new Color(25, 27, 31, 245));

    const textLabel = this.createLabel('InputText', '', Vec3.ZERO, 220, 44, 22);
    textLabel.node.setParent(node);
    const placeholderLabel = this.createLabel('InputPlaceholder', 'PASSCODE', Vec3.ZERO, 220, 44, 18);
    placeholderLabel.color = new Color(137, 139, 145, 255);
    placeholderLabel.node.setParent(node);

    const editBox = node.addComponent(EditBox);
    editBox.textLabel = textLabel;
    editBox.placeholderLabel = placeholderLabel;
    editBox.placeholder = 'PASSCODE';
    editBox.maxLength = 4;
    editBox.inputMode = EditBox.InputMode.SINGLE_LINE;
    editBox.inputFlag = EditBox.InputFlag.INITIAL_CAPS_ALL_CHARACTERS;
    editBox.returnType = EditBox.KeyboardReturnType.DONE;

    const returnEvent = this.createEventHandler('submitPasscode');
    editBox.editingReturn.push(returnEvent);
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
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    graphics.rect(-width * 0.5, -height * 0.5, width, height);
    graphics.fill();
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
  ): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    node.addComponent(UITransform).setContentSize(width, height);
    node.setPosition(position);
    const label = node.addComponent(Label);
    label.string = text;
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
  ): { button: Button; label: Label } {
    const buttonNode = this.createUiRoot(name, parent, width, height);
    buttonNode.setPosition(position);
    const graphics = buttonNode.addComponent(Graphics);
    graphics.fillColor = new Color(43, 45, 50, 246);
    graphics.rect(-width * 0.5, -height * 0.5, width, height);
    graphics.fill();
    graphics.strokeColor = new Color(105, 108, 116, 255);
    graphics.lineWidth = 1;
    graphics.rect(-width * 0.5, -height * 0.5, width, height);
    graphics.stroke();
    graphics.fillColor = new Color(174, 177, 184, 255);
    graphics.rect(-width * 0.5 + 2, height * 0.5 - 3, width - 4, 2);
    graphics.fill();

    const button = buttonNode.addComponent(Button);
    button.target = buttonNode;
    button.transition = Button.Transition.SCALE;
    button.zoomScale = 1.035;
    button.duration = 0.08;
    button.clickEvents.push(this.createEventHandler(handler));

    const label = this.createLabel(`${name}Label`, text, Vec3.ZERO, width - 16, height - 8, 17);
    label.node.setParent(buttonNode);
    return { button, label };
  }

  private createEventHandler(handler: string): EventHandler {
    const event = new EventHandler();
    event.target = this.node;
    event.component = 'GameplayController';
    event.handler = handler;
    return event;
  }

  private drawPanel(node: Node, width: number, height: number, color: Color): void {
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    graphics.rect(-width * 0.5, -height * 0.5, width, height);
    graphics.fill();
    graphics.strokeColor = new Color(92, 95, 102, 230);
    graphics.lineWidth = 1;
    graphics.rect(-width * 0.5, -height * 0.5, width, height);
    graphics.stroke();
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
