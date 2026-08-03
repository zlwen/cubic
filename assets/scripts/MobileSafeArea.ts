import { _decorator, Component, sys, UITransform, view, Widget } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MobileSafeArea')
export class MobileSafeArea extends Component {
  @property
  minPadding = 24;

  onEnable(): void {
    this.applySafeArea();
  }

  applySafeArea(): void {
    const visible = view.getVisibleSize();
    const safe = sys.getSafeAreaRect();
    const widget = this.node.getComponent(Widget) ?? this.node.addComponent(Widget);
    const transform = this.node.getComponent(UITransform);

    widget.isAlignTop = true;
    widget.isAlignBottom = true;
    widget.isAlignLeft = true;
    widget.isAlignRight = true;
    widget.top = Math.max(this.minPadding, visible.height - safe.yMax);
    widget.bottom = Math.max(this.minPadding, safe.y);
    widget.left = Math.max(this.minPadding, safe.x);
    widget.right = Math.max(this.minPadding, visible.width - safe.xMax);

    if (transform) {
      transform.setAnchorPoint(0.5, 0.5);
    }
  }
}
