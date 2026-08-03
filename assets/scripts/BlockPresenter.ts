import { _decorator, Component, Node, Quat, tween, Vec3 } from 'cc';
import type { BlockState, Direction, MoveResult, PuzzleState } from './shared/game/index';

const { ccclass, property } = _decorator;

@ccclass('BlockPresenter')
export class BlockPresenter extends Component {
  @property
  tileSize = 1;

  @property
  rollDuration = 0.22;

  private busy = false;
  private wholeNode: Node | null = null;
  private cubeNodes: [Node | null, Node | null] = [null, null];
  private activeCubeIndex: 0 | 1 = 0;

  start(): void {
    this.resolveNodes();
  }

  isBusy(): boolean {
    return this.busy;
  }

  snapTo(state: PuzzleState): void {
    this.resolveNodes();
    if (state.split) {
      this.activeCubeIndex = state.split.activeCube;
      if (this.wholeNode) this.wholeNode.active = false;
      for (const index of [0, 1] as const) {
        const cube = this.cubeNodes[index];
        if (!cube) continue;
        cube.active = true;
        cube.setPosition(this.cubePosition(state.split.cubes[index]));
        const isActive = state.split.activeCube === index;
        const scale = isActive ? 1.08 : 0.96;
        cube.setScale(scale, scale, scale);
        const marker = cube.getChildByName('SelectionMarker');
        if (marker) marker.active = isActive;
      }
      return;
    }

    for (const cube of this.cubeNodes) {
      if (cube) cube.active = false;
    }
    if (!this.wholeNode) return;
    this.wholeNode.active = true;
    this.wholeNode.setScale(Vec3.ONE);
    this.wholeNode.setPosition(this.positionFor(state.block));
    this.wholeNode.setRotation(this.rotationFor(state.block));
  }

  playMove(result: MoveResult, onComplete: () => void): void {
    this.resolveNodes();
    if (result.previous.split) {
      this.playSplitMove(result, onComplete);
      return;
    }
    this.playWholeMove(result, onComplete);
  }

  playFall(onComplete: () => void): void {
    this.busy = true;
    const node = this.activeVisibleNode();
    if (!node) {
      this.busy = false;
      onComplete();
      return;
    }
    const target = node.position.clone().add(new Vec3(0, -2.5, 0));
    tween(node)
      .to(0.34, { position: target }, { easing: 'quadIn' })
      .call(() => {
        this.busy = false;
        onComplete();
      })
      .start();
  }

  playGoalDrop(onComplete: () => void): void {
    this.busy = true;
    const node = this.wholeNode;
    if (!node) {
      this.busy = false;
      onComplete();
      return;
    }
    const target = node.position.clone().add(new Vec3(0, -3, 0));
    tween(node)
      .delay(0.08)
      .to(0.48, { position: target }, { easing: 'quadIn' })
      .call(() => {
        node.active = false;
        this.busy = false;
        onComplete();
      })
      .start();
  }

  private playWholeMove(result: MoveResult, onComplete: () => void): void {
    const node = this.wholeNode;
    if (!node) {
      this.snapTo(result.current);
      onComplete();
      return;
    }
    this.busy = true;
    const start = result.previous.block;
    const startPosition = this.positionFor(start);
    const startRotation = this.rotationFor(start);
    const target = result.current.block;
    const targetPosition = this.positionFor(target);
    const targetRotation = this.rotationFor(target);
    const direction = this.directionVector(result.direction);
    const pivot = startPosition.clone().add(new Vec3(
      direction.x * this.horizontalHalfExtent(start, result.direction),
      -this.verticalHalfExtent(start),
      direction.z * this.horizontalHalfExtent(start, result.direction),
    ));
    const relative = startPosition.clone().subtract(pivot);
    const axis = this.rotationAxis(result.direction);
    const progress = { value: 0 };

    tween(progress)
      .to(this.rollDuration, { value: 1 }, {
        easing: 'quadInOut',
        onUpdate: () => {
          const rotationDelta = new Quat();
          Quat.fromAxisAngle(rotationDelta, axis, Math.PI * 0.5 * progress.value);
          const offset = new Vec3();
          Vec3.transformQuat(offset, relative, rotationDelta);
          node.setPosition(pivot.clone().add(offset));
          const rotation = new Quat();
          Quat.multiply(rotation, rotationDelta, startRotation);
          node.setRotation(rotation);
        },
      })
      .call(() => {
        node.setPosition(targetPosition);
        node.setRotation(targetRotation);
        this.snapTo(result.current);
        this.busy = false;
        onComplete();
      })
      .start();
  }

  private playSplitMove(result: MoveResult, onComplete: () => void): void {
    const active = result.previous.split?.activeCube ?? 0;
    const node = this.cubeNodes[active];
    if (!node) {
      this.snapTo(result.current);
      onComplete();
      return;
    }
    this.busy = true;
    const destination = result.current.split
      ? result.current.split.cubes[active]
      : result.occupiedCells.find((cell) =>
          cell.x !== result.previous.split?.cubes[1 - active].x
          || cell.z !== result.previous.split?.cubes[1 - active].z)
        ?? result.occupiedCells[0];
    tween(node)
      .to(0.16, { position: this.cubePosition(destination) }, { easing: 'quadInOut' })
      .call(() => {
        this.snapTo(result.current);
        this.busy = false;
        onComplete();
      })
      .start();
  }

  private resolveNodes(): void {
    this.wholeNode ??= this.node.getChildByName('WholeBlock');
    this.cubeNodes = [
      this.cubeNodes[0] ?? this.node.getChildByName('SplitCubeA'),
      this.cubeNodes[1] ?? this.node.getChildByName('SplitCubeB'),
    ];
  }

  private activeVisibleNode(): Node | null {
    const activeCube = this.cubeNodes[this.activeCubeIndex];
    return activeCube?.active ? activeCube : this.wholeNode;
  }

  private cubePosition(coord: { x: number; z: number }): Vec3 {
    return new Vec3(coord.x * this.tileSize, 0.5, coord.z * this.tileSize);
  }

  private positionFor(block: BlockState): Vec3 {
    const y = block.orientation === 'standing' ? 1 : 0.5;
    let x = block.anchor.x * this.tileSize;
    let z = block.anchor.z * this.tileSize;
    if (block.orientation === 'lying-x') x += this.tileSize * 0.5;
    else if (block.orientation === 'lying-z') z += this.tileSize * 0.5;
    return new Vec3(x, y, z);
  }

  private rotationFor(block: BlockState): Quat {
    const rotation = new Quat();
    if (block.orientation === 'lying-x') Quat.fromEuler(rotation, 0, 0, 90);
    else if (block.orientation === 'lying-z') Quat.fromEuler(rotation, 90, 0, 0);
    return rotation;
  }

  private directionVector(direction: Direction): Vec3 {
    if (direction === 'left') return new Vec3(-1, 0, 0);
    if (direction === 'right') return new Vec3(1, 0, 0);
    if (direction === 'up') return new Vec3(0, 0, -1);
    return new Vec3(0, 0, 1);
  }

  private rotationAxis(direction: Direction): Vec3 {
    if (direction === 'left') return new Vec3(0, 0, 1);
    if (direction === 'right') return new Vec3(0, 0, -1);
    if (direction === 'up') return new Vec3(-1, 0, 0);
    return new Vec3(1, 0, 0);
  }

  private horizontalHalfExtent(block: BlockState, direction: Direction): number {
    const movesAlongX = direction === 'left' || direction === 'right';
    if ((movesAlongX && block.orientation === 'lying-x')
      || (!movesAlongX && block.orientation === 'lying-z')) return this.tileSize;
    return this.tileSize * 0.5;
  }

  private verticalHalfExtent(block: BlockState): number {
    return block.orientation === 'standing' ? this.tileSize : this.tileSize * 0.5;
  }
}
