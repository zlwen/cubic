import { _decorator, Camera, Component, Vec3, view } from 'cc';
import { boundsForCells } from './shared/game/index';
import type { LevelDefinition } from './shared/game/index';

const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
  @property(Camera)
  camera: Camera | null = null;

  frameLevel(level: LevelDefinition): void {
    const cells = [
      ...level.tiles,
      ...((level.bridges ?? []).reduce<Array<{ x: number; z: number }>>(
        (result, bridge) => result.concat(bridge.cells),
        [],
      )),
      ...((level.splits ?? []).reduce<Array<{ x: number; z: number }>>(
        (result, split) => result.concat(split.destinations),
        [],
      )),
      level.goal,
    ];
    const bounds = boundsForCells(cells);
    const centerX = (bounds.minX + bounds.maxX) * 0.5;
    const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
    const target = new Vec3(centerX, 0, centerZ);

    // This fixed offset gives approximately 34 degrees pitch and 18 degrees yaw.
    const position = target.clone().add(new Vec3(-6, 13, -18));
    this.node.setPosition(position);
    this.node.lookAt(target, Vec3.UP);

    if (!this.camera) {
      return;
    }
    this.camera.projection = Camera.ProjectionType.ORTHO;
    this.camera.orthoHeight = this.orthoHeightForBounds(bounds, target, position);
  }

  private orthoHeightForBounds(
    bounds: ReturnType<typeof boundsForCells>,
    target: Vec3,
    cameraPosition: Vec3,
  ): number {
    const forward = target.clone().subtract(cameraPosition).normalize();
    const right = new Vec3();
    Vec3.cross(right, forward, Vec3.UP);
    right.normalize();
    const cameraUp = new Vec3();
    Vec3.cross(cameraUp, right, forward);
    cameraUp.normalize();

    let horizontalExtent = 0;
    let verticalExtent = 0;
    const xValues = [bounds.minX - 0.55, bounds.maxX + 0.55];
    const yValues = [-0.75, 2.15];
    const zValues = [bounds.minZ - 0.55, bounds.maxZ + 0.55];
    for (const x of xValues) {
      for (const y of yValues) {
        for (const z of zValues) {
          const relative = new Vec3(x, y, z).subtract(target);
          horizontalExtent = Math.max(horizontalExtent, Math.abs(Vec3.dot(relative, right)));
          verticalExtent = Math.max(verticalExtent, Math.abs(Vec3.dot(relative, cameraUp)));
        }
      }
    }

    const visible = view.getVisibleSize();
    const aspect = Math.max(1, visible.width / visible.height);
    const verticalWithMargin = verticalExtent + 0.9;
    const horizontalWithMargin = horizontalExtent / aspect + 0.9;
    return Math.max(3.4, verticalWithMargin, horizontalWithMargin);
  }
}
