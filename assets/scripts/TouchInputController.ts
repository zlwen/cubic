import { _decorator, Button, Component, EventTouch, input, Input, Node, Vec2 } from 'cc';
import type { Direction } from './shared/game/index';

const { ccclass, property } = _decorator;

@ccclass('TouchInputController')
export class TouchInputController extends Component {
  @property
  minSwipeDistance = 32;

  onMove: ((direction: Direction) => void) | null = null;

  private startPosition: Vec2 | null = null;

  onEnable(): void {
    input.on(Input.EventType.TOUCH_START, this.handleTouchStart, this);
    input.on(Input.EventType.TOUCH_END, this.handleTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.handleTouchCancel, this);
  }

  onDisable(): void {
    input.off(Input.EventType.TOUCH_START, this.handleTouchStart, this);
    input.off(Input.EventType.TOUCH_END, this.handleTouchEnd, this);
    input.off(Input.EventType.TOUCH_CANCEL, this.handleTouchCancel, this);
  }

  private handleTouchStart(event: EventTouch): void {
    const target = event.target instanceof Node ? event.target : null;
    if (this.isButtonTarget(target)) {
      this.startPosition = null;
      return;
    }
    this.startPosition = event.getUILocation();
  }

  private handleTouchEnd(event: EventTouch): void {
    if (!this.startPosition || !this.onMove) {
      return;
    }

    const end = event.getUILocation();
    const dx = end.x - this.startPosition.x;
    const dy = end.y - this.startPosition.y;
    this.startPosition = null;

    if (Math.hypot(dx, dy) < this.minSwipeDistance) {
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      this.onMove(dx < 0 ? 'right' : 'left');
    } else {
      this.onMove(dy < 0 ? 'up' : 'down');
    }
  }

  private handleTouchCancel(): void {
    this.startPosition = null;
  }

  private isButtonTarget(target: Node | null): boolean {
    let current = target;
    while (current) {
      if (current.getComponent(Button)) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
}
