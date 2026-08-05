import { _decorator, Button, Color, Component, Label, Node, Sprite, tween, Tween, Vec3 } from 'cc';

const { ccclass } = _decorator;

export interface UiButtonPalette {
  readonly fill: Color;
  readonly hoverFill: Color;
  readonly pressedFill: Color;
  readonly disabledFill: Color;
  readonly border: Color;
  readonly disabledBorder: Color;
  readonly text: Color;
  readonly disabledText: Color;
  readonly accent: Color;
  readonly disabledAccent: Color;
}

@ccclass('UiButtonVisual')
export class UiButtonVisual extends Component {
  private button: Button | null = null;
  private label: Label | null = null;
  private fillSprites: Sprite[] = [];
  private borderSprites: Sprite[] = [];
  private accentSprites: Sprite[] = [];
  private palette: UiButtonPalette | null = null;
  private restingScale = new Vec3(1, 1, 1);
  private restingLabelPosition = new Vec3();
  private pressed = false;
  private hovered = false;
  private lastInteractable = true;

  setup(
    button: Button,
    label: Label,
    fillSprites: readonly Sprite[],
    borderSprites: readonly Sprite[],
    accentSprites: readonly Sprite[],
    palette: UiButtonPalette,
  ): void {
    this.button = button;
    this.label = label;
    this.fillSprites = [...fillSprites];
    this.borderSprites = [...borderSprites];
    this.accentSprites = [...accentSprites];
    this.palette = palette;
    this.restingScale.set(this.node.scale);
    this.restingLabelPosition.set(label.node.position);
    this.lastInteractable = button.interactable;
    this.applyState();
  }

  onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.handlePress, this);
    this.node.on(Node.EventType.TOUCH_END, this.handleRelease, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.handleRelease, this);
    this.node.on(Node.EventType.MOUSE_ENTER, this.handleMouseEnter, this);
    this.node.on(Node.EventType.MOUSE_LEAVE, this.handleMouseLeave, this);
  }

  onDisable(): void {
    this.node.off(Node.EventType.TOUCH_START, this.handlePress, this);
    this.node.off(Node.EventType.TOUCH_END, this.handleRelease, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.handleRelease, this);
    this.node.off(Node.EventType.MOUSE_ENTER, this.handleMouseEnter, this);
    this.node.off(Node.EventType.MOUSE_LEAVE, this.handleMouseLeave, this);
    this.restorePosition();
  }

  update(): void {
    if (!this.button || this.lastInteractable === this.button.interactable) return;
    this.lastInteractable = this.button.interactable;
    if (!this.button.interactable) {
      this.pressed = false;
      this.hovered = false;
      this.restorePosition();
    }
    this.applyState();
  }

  private handlePress(): void {
    if (!this.button?.interactable) return;
    this.pressed = true;
    this.applyState();
    this.animateScale(0.972, 0.055);
    this.shiftLabel(-1);
  }

  private handleRelease(): void {
    if (!this.pressed) return;
    this.pressed = false;
    this.applyState();
    this.animateScale(1, 0.1);
    this.shiftLabel(0);
  }

  private handleMouseEnter(): void {
    this.hovered = true;
    this.applyState();
  }

  private handleMouseLeave(): void {
    this.hovered = false;
    this.handleRelease();
    this.applyState();
  }

  private applyState(): void {
    if (!this.button || !this.label || !this.palette) return;
    const disabled = !this.button.interactable;
    const fill = disabled
      ? this.palette.disabledFill
      : this.pressed
        ? this.palette.pressedFill
        : this.hovered
          ? this.palette.hoverFill
          : this.palette.fill;
    const border = disabled ? this.palette.disabledBorder : this.palette.border;
    const accent = disabled ? this.palette.disabledAccent : this.palette.accent;
    const text = disabled ? this.palette.disabledText : this.palette.text;
    this.setSpritesColor(this.fillSprites, fill);
    this.setSpritesColor(this.borderSprites, border);
    this.setSpritesColor(this.accentSprites, accent);
    this.label.color = this.copyColor(text);
  }

  private setSpritesColor(sprites: readonly Sprite[], color: Color): void {
    for (const sprite of sprites) sprite.color = this.copyColor(color);
  }

  private copyColor(color: Color): Color {
    return new Color(color.r, color.g, color.b, color.a);
  }

  private animateScale(scale: number, duration: number): void {
    Tween.stopAllByTarget(this.node);
    tween(this.node)
      .to(duration, {
        scale: new Vec3(
          this.restingScale.x * scale,
          this.restingScale.y * scale,
          this.restingScale.z,
        ),
      })
      .start();
  }

  private shiftLabel(offsetY: number): void {
    this.label?.node.setPosition(
      this.restingLabelPosition.x,
      this.restingLabelPosition.y + offsetY,
      this.restingLabelPosition.z,
    );
  }

  private restorePosition(): void {
    Tween.stopAllByTarget(this.node);
    this.node.setScale(this.restingScale);
    this.shiftLabel(0);
  }
}
