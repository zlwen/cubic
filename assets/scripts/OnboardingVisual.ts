import { _decorator, Color, Component, Graphics } from 'cc';
import type { TutorialTopicId } from './shared/game/index';

const { ccclass } = _decorator;
type Point = readonly [number, number];

const COLORS = {
  stoneTop: new Color(238, 239, 242, 255),
  stoneSide: new Color(157, 162, 172, 255),
  stoneEdge: new Color(112, 118, 128, 255),
  glassTop: new Color(184, 226, 234, 112),
  glassSide: new Color(112, 172, 187, 92),
  glassEdge: new Color(218, 244, 248, 205),
  softSwitch: new Color(39, 127, 114, 255),
  hardSwitch: new Color(173, 94, 35, 255),
  splitSwitch: new Color(102, 91, 158, 255),
  bridgeTop: new Color(78, 151, 159, 255),
  bridgeSide: new Color(40, 80, 91, 255),
  blockTop: new Color(218, 48, 57, 255),
  blockLeft: new Color(166, 18, 29, 255),
  blockRight: new Color(118, 12, 22, 255),
  blockEdge: new Color(190, 190, 190, 255),
  goal: new Color(4, 5, 8, 255),
  goalRim: new Color(105, 108, 116, 255),
  guide: new Color(218, 185, 105, 255),
};

@ccclass('OnboardingVisual')
export class OnboardingVisual extends Component {
  private graphics: Graphics | null = null;
  private topic: TutorialTopicId | null = null;

  setTopic(topic: TutorialTopicId): void {
    this.topic = topic;
    this.drawTopic(topic);
  }

  onEnable(): void {
    if (this.topic) this.drawTopic(this.topic);
  }

  private drawTopic(topic: TutorialTopicId): void {
    const graphics = this.graphics ?? this.node.getComponent(Graphics) ?? this.node.addComponent(Graphics);
    this.graphics = graphics;
    graphics.clear();
    switch (topic) {
      case 'movement': this.drawMovement(graphics); break;
      case 'goal': this.drawGoal(graphics); break;
      case 'fragile': this.drawFragile(graphics); break;
      case 'soft-switch': this.drawSoftSwitch(graphics); break;
      case 'hard-switch': this.drawHardSwitch(graphics); break;
      case 'bridge': this.drawBridge(graphics); break;
      case 'split': this.drawSplit(graphics); break;
      case 'switch-cube': this.drawSwitchCube(graphics); break;
      case 'recombine': this.drawRecombine(graphics); break;
    }
  }

  private drawMovement(graphics: Graphics): void {
    this.drawTile(graphics, 0, -7, 'stone', 58, 30);
    this.drawBlock(graphics, 0, 2, 20, 28);
    this.drawChevron(graphics, 0, 43, 0, 7);
    this.drawChevron(graphics, 0, -40, 0, -7);
    this.drawChevron(graphics, -43, 1, -7, 0);
    this.drawChevron(graphics, 43, 1, 7, 0);
  }

  private drawGoal(graphics: Graphics): void {
    this.drawTile(graphics, -27, -11, 'stone', 43, 22);
    this.drawTile(graphics, 27, -11, 'stone', 43, 22);
    this.drawHole(graphics, 0, 12, 48, 25);
    this.drawBlock(graphics, 0, 21, 17, 23);
  }

  private drawFragile(graphics: Graphics): void {
    this.drawTile(graphics, 0, 2, 'glass', 76, 40);
    this.strokePolygon(graphics, [[-31, 2], [0, 18], [31, 2], [0, -14]], COLORS.glassEdge, 1.5);
  }

  private drawSoftSwitch(graphics: Graphics): void {
    this.drawTile(graphics, 0, 0, 'stone', 76, 40);
    graphics.fillColor = COLORS.softSwitch;
    graphics.ellipse(0, 2, 18, 9);
    graphics.fill();
    graphics.fillColor = COLORS.stoneTop;
    graphics.ellipse(0, 4, 11, 5.5);
    graphics.fill();
  }

  private drawHardSwitch(graphics: Graphics): void {
    this.drawTile(graphics, 0, 0, 'stone', 76, 40);
    graphics.strokeColor = COLORS.hardSwitch;
    graphics.lineWidth = 7;
    graphics.moveTo(-17, 11);
    graphics.lineTo(17, -7);
    graphics.moveTo(17, 11);
    graphics.lineTo(-17, -7);
    graphics.stroke();
  }

  private drawBridge(graphics: Graphics): void {
    this.drawTile(graphics, -22, 12, 'bridge', 48, 25);
    this.drawTile(graphics, 22, -12, 'bridge', 48, 25);
    graphics.strokeColor = COLORS.guide;
    graphics.lineWidth = 2;
    graphics.moveTo(-34, -28);
    graphics.lineTo(-26, -34);
    graphics.lineTo(-18, -28);
    graphics.moveTo(18, 32);
    graphics.lineTo(26, 38);
    graphics.lineTo(34, 32);
    graphics.stroke();
  }

  private drawSplit(graphics: Graphics): void {
    this.drawTile(graphics, 0, 0, 'stone', 76, 40);
    this.fillPolygon(graphics, [[-27, 7], [-8, 15], [-8, -3]], COLORS.splitSwitch);
    this.fillPolygon(graphics, [[27, 7], [8, 15], [8, -3]], COLORS.splitSwitch);
    graphics.strokeColor = COLORS.splitSwitch;
    graphics.lineWidth = 4;
    graphics.moveTo(0, 16);
    graphics.lineTo(0, -8);
    graphics.stroke();
  }

  private drawSwitchCube(graphics: Graphics): void {
    this.drawTile(graphics, -23, -9, 'stone', 45, 23);
    this.drawTile(graphics, 23, 9, 'stone', 45, 23);
    this.drawBlock(graphics, -23, -1, 17, 18);
    this.drawBlock(graphics, 23, 17, 17, 18);
    graphics.strokeColor = COLORS.guide;
    graphics.lineWidth = 2;
    graphics.ellipse(-23, 0, 20, 11);
    graphics.stroke();
  }

  private drawRecombine(graphics: Graphics): void {
    this.drawTile(graphics, -24, -7, 'stone', 46, 24);
    this.drawTile(graphics, 24, 7, 'stone', 46, 24);
    this.drawBlock(graphics, -24, 2, 17, 18);
    this.drawBlock(graphics, 24, 16, 17, 18);
    this.drawChevron(graphics, -4, 4, 6, 2);
    this.drawChevron(graphics, 5, 12, -6, -2);
  }

  private drawTile(
    graphics: Graphics,
    x: number,
    y: number,
    kind: 'stone' | 'glass' | 'bridge',
    width: number,
    height: number,
  ): void {
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const depth = 9;
    const top: Point[] = [[x, y + halfHeight], [x + halfWidth, y], [x, y - halfHeight], [x - halfWidth, y]];
    const right: Point[] = [[x + halfWidth, y], [x, y - halfHeight], [x, y - halfHeight - depth], [x + halfWidth, y - depth]];
    const left: Point[] = [[x - halfWidth, y], [x, y - halfHeight], [x, y - halfHeight - depth], [x - halfWidth, y - depth]];
    const topColor = kind === 'glass' ? COLORS.glassTop : kind === 'bridge' ? COLORS.bridgeTop : COLORS.stoneTop;
    const sideColor = kind === 'glass' ? COLORS.glassSide : kind === 'bridge' ? COLORS.bridgeSide : COLORS.stoneSide;
    const edgeColor = kind === 'glass' ? COLORS.glassEdge : COLORS.stoneEdge;
    this.fillPolygon(graphics, left, sideColor);
    this.fillPolygon(graphics, right, this.darken(sideColor, 0.78));
    this.fillPolygon(graphics, top, topColor);
    this.strokePolygon(graphics, top, edgeColor, kind === 'glass' ? 2 : 1);
  }

  private drawHole(graphics: Graphics, x: number, y: number, width: number, height: number): void {
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const rim: Point[] = [[x, y + halfHeight], [x + halfWidth, y], [x, y - halfHeight], [x - halfWidth, y]];
    this.fillPolygon(graphics, rim, COLORS.goalRim);
    const inset = 5;
    this.fillPolygon(graphics, [
      [x, y + halfHeight - inset],
      [x + halfWidth - inset * 1.7, y],
      [x, y - halfHeight + inset],
      [x - halfWidth + inset * 1.7, y],
    ], COLORS.goal);
  }

  private drawBlock(graphics: Graphics, x: number, y: number, width: number, height: number): void {
    const halfWidth = width * 0.5;
    const topHeight = width * 0.28;
    const left: Point[] = [[x - halfWidth, y + height], [x, y + height - topHeight], [x, y - topHeight], [x - halfWidth, y]];
    const right: Point[] = [[x + halfWidth, y + height], [x, y + height - topHeight], [x, y - topHeight], [x + halfWidth, y]];
    const top: Point[] = [[x, y + height + topHeight], [x + halfWidth, y + height], [x, y + height - topHeight], [x - halfWidth, y + height]];
    this.fillPolygon(graphics, left, COLORS.blockLeft);
    this.fillPolygon(graphics, right, COLORS.blockRight);
    this.fillPolygon(graphics, top, COLORS.blockTop);
    this.strokePolygon(graphics, [...left, ...right.slice(1), ...top.slice(1)], COLORS.blockEdge, 0.8);
  }

  private drawChevron(graphics: Graphics, x: number, y: number, dx: number, dy: number): void {
    const perpendicularX = dy * 0.55;
    const perpendicularY = -dx * 0.55;
    graphics.strokeColor = COLORS.guide;
    graphics.lineWidth = 2;
    graphics.moveTo(x - dx + perpendicularX, y - dy + perpendicularY);
    graphics.lineTo(x, y);
    graphics.lineTo(x - dx - perpendicularX, y - dy - perpendicularY);
    graphics.stroke();
  }

  private fillPolygon(graphics: Graphics, points: readonly Point[], color: Color): void {
    graphics.fillColor = color;
    graphics.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index += 1) graphics.lineTo(points[index][0], points[index][1]);
    graphics.close();
    graphics.fill();
  }

  private strokePolygon(graphics: Graphics, points: readonly Point[], color: Color, width: number): void {
    graphics.strokeColor = color;
    graphics.lineWidth = width;
    graphics.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index += 1) graphics.lineTo(points[index][0], points[index][1]);
    graphics.close();
    graphics.stroke();
  }

  private darken(color: Color, factor: number): Color {
    return new Color(color.r * factor, color.g * factor, color.b * factor, color.a);
  }
}
