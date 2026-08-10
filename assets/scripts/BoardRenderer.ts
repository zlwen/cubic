import {
  _decorator,
  Color,
  Component,
  instantiate,
  Material,
  MeshRenderer,
  Node,
  primitives,
  Quat,
  tween,
  Tween,
  utils,
  Vec3,
} from 'cc';
import { occupiedCells } from './shared/game/index';
import type { LevelDefinition, PuzzleState, TileDefinition } from './shared/game/index';

const { ccclass, property } = _decorator;

@ccclass('BoardRenderer')
export class BoardRenderer extends Component {
  @property(Node)
  tilePrefab: Node | null = null;

  @property
  tileSize = 1;

  @property(Material)
  litBaseMaterial: Material | null = null;

  private spawnedTiles: Node[] = [];
  private readonly bridgeNodes = new Map<string, Node[]>();
  private readonly bridgeStates = new Map<string, boolean>();
  private readonly switchNodes = new Map<string, Node>();
  private readonly fragileNodes = new Map<string, Node>();
  private readonly breakEffectNodes = new Set<Node>();
  private readonly breakTweenTargets = new Set<object>();
  private readonly materials = new Map<string, Material>();

  render(level: LevelDefinition): void {
    this.clear();
    for (const tile of level.tiles) {
      const tileNode = this.createTile(tile);
      tileNode.setParent(this.node);
      tileNode.setPosition(new Vec3(tile.x * this.tileSize, 0, tile.z * this.tileSize));
      this.spawnedTiles.push(tileNode);
      if (tile.type === 'fragile') this.fragileNodes.set(this.tileKey(tile.x, tile.z), tileNode);
      if (tile.type === 'soft-switch' || tile.type === 'hard-switch') {
        this.switchNodes.set(this.tileKey(tile.x, tile.z), tileNode);
      }
    }
    for (const bridge of level.bridges ?? []) {
      const nodes: Node[] = [];
      for (const cell of bridge.cells) {
        const bridgeNode = this.createBridgeTile(bridge.id);
        bridgeNode.setParent(this.node);
        bridgeNode.setPosition(new Vec3(cell.x * this.tileSize, 0, cell.z * this.tileSize));
        this.spawnedTiles.push(bridgeNode);
        nodes.push(bridgeNode);
      }
      this.bridgeNodes.set(bridge.id, nodes);
    }

    const goalHole = this.createGoalHole();
    goalHole.setParent(this.node);
    goalHole.setPosition(new Vec3(level.goal.x * this.tileSize, 0, level.goal.z * this.tileSize));
    this.spawnedTiles.push(goalHole);
  }

  applyState(state: PuzzleState): void {
    let bridgeChanged = false;
    for (const [bridgeId, nodes] of this.bridgeNodes) {
      const active = state.bridgeStates[bridgeId] === true;
      const previous = this.bridgeStates.get(bridgeId);
      this.bridgeStates.set(bridgeId, active);
      if (previous === undefined) {
        for (const node of nodes) this.snapBridge(node, active);
      } else if (previous !== active) {
        bridgeChanged = true;
        for (const node of nodes) this.animateBridge(node, bridgeId, active);
      }
    }
    if (bridgeChanged) this.animatePressedSwitch(state);
  }

  playFragileBreak(coord: { x: number; z: number }): void {
    const tile = this.fragileNodes.get(this.tileKey(coord.x, coord.z));
    if (!tile?.active) return;
    tile.active = false;

    for (let index = 0; index < 9; index += 1) {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const offsetX = (column - 1) * 0.29;
      const offsetZ = (row - 1) * 0.29;
      const width = 0.22 + (index % 2) * 0.05;
      const depth = 0.21 + ((index + 1) % 3) * 0.025;
      const shard = this.addBox(
        this.node,
        `GlassShard${index + 1}`,
        new Vec3(width, 0.04, depth),
        new Vec3(tile.position.x + offsetX, 0.12, tile.position.z + offsetZ),
        new Color(183, 226, 235, 145),
        this.getLitMaterial(new Color(183, 226, 235, 145), 0.14),
      );
      shard.setRotationFromEuler(0, index * 19, 0);
      const renderer = shard.getComponent(MeshRenderer);
      if (renderer) renderer.shadowCastingMode = MeshRenderer.ShadowCastingMode.ON;
      this.breakEffectNodes.add(shard);
      this.animateGlassShard(shard, index, offsetX, offsetZ);
    }
  }

  clear(): void {
    for (const target of this.breakTweenTargets) Tween.stopAllByTarget(target);
    this.breakTweenTargets.clear();
    for (const effect of this.breakEffectNodes) effect.destroy();
    this.breakEffectNodes.clear();
    for (const tile of this.spawnedTiles) tile.destroy();
    this.spawnedTiles = [];
    this.bridgeNodes.clear();
    this.bridgeStates.clear();
    this.switchNodes.clear();
    this.fragileNodes.clear();
  }

  private createTile(tile: TileDefinition): Node {
    const tileNode = this.tilePrefab ? instantiate(this.tilePrefab) : new Node(`tile-${tile.x}-${tile.z}`);
    tileNode.name = `tile-${tile.x}-${tile.z}`;
    if (!this.tilePrefab) {
      const sideColor = tile.type === 'fragile'
        ? new Color(112, 172, 187, 92)
        : new Color(157, 162, 172, 255);
      this.addBase(tileNode, sideColor, tile.type === 'fragile' ? 0.18 : 0.88);
      this.createTileTop(tileNode, tile);
    }
    return tileNode;
  }

  private createTileTop(tileNode: Node, tile: TileDefinition): void {
    if (tile.type === 'fragile') {
      const glassColor = new Color(184, 226, 234, 112);
      const edgeColor = new Color(218, 244, 248, 185);
      const glassMaterial = this.getLitMaterial(glassColor, 0.12);
      const edgeMaterial = this.getLitMaterial(edgeColor, 0.16);
      this.addBox(tileNode, 'GlassTop', new Vec3(0.984, 0.035, 0.984), new Vec3(0, 0.105, 0), glassColor, glassMaterial);
      this.addBox(tileNode, 'GlassEdgeNorth', new Vec3(0.94, 0.025, 0.025), new Vec3(0, 0.135, -0.47), edgeColor, edgeMaterial);
      this.addBox(tileNode, 'GlassEdgeSouth', new Vec3(0.94, 0.025, 0.025), new Vec3(0, 0.135, 0.47), edgeColor, edgeMaterial);
      this.addBox(tileNode, 'GlassEdgeWest', new Vec3(0.025, 0.025, 0.94), new Vec3(-0.47, 0.135, 0), edgeColor, edgeMaterial);
      this.addBox(tileNode, 'GlassEdgeEast', new Vec3(0.025, 0.025, 0.94), new Vec3(0.47, 0.135, 0), edgeColor, edgeMaterial);
      return;
    }

    const topColor = new Color(238, 239, 242, 255);
    this.addBox(
      tileNode,
      'StoneTop',
      new Vec3(0.984, 0.035, 0.984),
      new Vec3(0, 0.105, 0),
      topColor,
    );

    if (tile.type === 'soft-switch') {
      this.addCylinder(tileNode, 'SoftSwitchOuter', 0.24, 0.045, new Vec3(0, 0.15, 0), new Color(39, 127, 114, 255));
      this.addCylinder(tileNode, 'SoftSwitchInner', 0.15, 0.05, new Vec3(0, 0.17, 0), topColor);
    } else if (tile.type === 'hard-switch') {
      const first = this.addBox(tileNode, 'HardSwitchA', new Vec3(0.58, 0.045, 0.1), new Vec3(0, 0.16, 0), new Color(173, 94, 35, 255));
      const second = this.addBox(tileNode, 'HardSwitchB', new Vec3(0.58, 0.045, 0.1), new Vec3(0, 0.162, 0), new Color(173, 94, 35, 255));
      first.setRotationFromEuler(0, 45, 0);
      second.setRotationFromEuler(0, -45, 0);
    } else if (tile.type === 'split') {
      const markerColor = new Color(102, 91, 158, 255);
      const left = this.addCylinder(tileNode, 'SplitDoorLeft', 0.21, 0.04, new Vec3(-0.22, 0.155, 0), markerColor, 3);
      const right = this.addCylinder(tileNode, 'SplitDoorRight', 0.21, 0.04, new Vec3(0.22, 0.155, 0), markerColor, 3);
      left.setRotationFromEuler(0, -90, 0);
      right.setRotationFromEuler(0, 90, 0);
      this.addBox(tileNode, 'SplitDoorDivider', new Vec3(0.045, 0.04, 0.5), new Vec3(0, 0.155, 0), markerColor);
    }
  }

  private createBridgeTile(id: string): Node {
    const node = new Node(`bridge-${id}`);
    this.addBase(node, new Color(40, 80, 91, 255));
    this.addBox(node, 'BridgeTop', new Vec3(0.984, 0.045, 0.984), new Vec3(0, 0.11, 0), new Color(78, 151, 159, 255));
    return node;
  }

  private snapBridge(node: Node, active: boolean): void {
    Tween.stopAllByTarget(node);
    node.setScale(1, 1, 1);
    node.setPosition(node.position.x, active ? 0 : -0.26, node.position.z);
    node.active = active;
  }

  private animateBridge(node: Node, bridgeId: string, active: boolean): void {
    Tween.stopAllByTarget(node);
    const x = node.position.x;
    const z = node.position.z;
    node.active = true;
    if (active) {
      node.setPosition(x, Math.min(node.position.y, -0.22), z);
      node.setScale(0.94, 0.76, 0.94);
      tween(node)
        .to(0.2, {
          position: new Vec3(x, 0.055, z),
          scale: new Vec3(1.035, 1.08, 1.035),
        }, { easing: 'quadOut' })
        .to(0.11, {
          position: new Vec3(x, 0, z),
          scale: new Vec3(1, 1, 1),
        }, { easing: 'quadInOut' })
        .start();
      return;
    }

    tween(node)
      .to(0.08, {
        position: new Vec3(x, 0.035, z),
        scale: new Vec3(1.025, 1.04, 1.025),
      }, { easing: 'quadOut' })
      .to(0.22, {
        position: new Vec3(x, -0.26, z),
        scale: new Vec3(0.94, 0.76, 0.94),
      }, { easing: 'quadIn' })
      .call(() => {
        if (this.bridgeStates.get(bridgeId) === false) node.active = false;
      })
      .start();
  }

  private animatePressedSwitch(state: PuzzleState): void {
    const cells = state.split ? state.split.cubes : occupiedCells(state.block);
    for (const cell of cells) {
      const switchNode = this.switchNodes.get(this.tileKey(cell.x, cell.z));
      if (!switchNode) continue;
      const parts = [
        switchNode.getChildByName('SoftSwitchOuter'),
        switchNode.getChildByName('SoftSwitchInner'),
        switchNode.getChildByName('HardSwitchA'),
        switchNode.getChildByName('HardSwitchB'),
      ];
      for (const part of parts) {
        if (!part) continue;
        Tween.stopAllByTarget(part);
        const rest = part.position.clone();
        tween(part)
          .to(0.07, {
            position: new Vec3(rest.x, rest.y - 0.035, rest.z),
            scale: new Vec3(1.06, 0.72, 1.06),
          }, { easing: 'quadOut' })
          .to(0.15, {
            position: rest,
            scale: new Vec3(1, 1, 1),
          }, { easing: 'quadInOut' })
          .start();
      }
    }
  }

  private addBase(parent: Node, color: Color, roughness = 0.88): void {
    const renderer = parent.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: 1, height: 0.2, length: 1 }));
    renderer.setMaterial(this.getLitMaterial(color, roughness), 0);
    this.configureShadowReceiver(renderer);
  }

  private createGoalHole(): Node {
    const hole = new Node('GoalHole');
    const shaftColor = new Color(18, 19, 23, 255);
    const floorColor = new Color(2, 3, 5, 255);
    const rimColor = new Color(105, 108, 116, 255);
    this.addGoalBox(hole, 'ShaftNorth', new Vec3(0.88, 0.7, 0.035), new Vec3(0, -0.25, -0.45), shaftColor);
    this.addGoalBox(hole, 'ShaftSouth', new Vec3(0.88, 0.7, 0.035), new Vec3(0, -0.25, 0.45), shaftColor);
    this.addGoalBox(hole, 'ShaftWest', new Vec3(0.035, 0.7, 0.88), new Vec3(-0.45, -0.25, 0), shaftColor);
    this.addGoalBox(hole, 'ShaftEast', new Vec3(0.035, 0.7, 0.88), new Vec3(0.45, -0.25, 0), shaftColor);
    this.addGoalBox(hole, 'ShaftFloor', new Vec3(0.86, 0.025, 0.86), new Vec3(0, -0.62, 0), floorColor);
    this.addGoalBox(hole, 'RimNorth', new Vec3(0.94, 0.035, 0.05), new Vec3(0, 0.03, -0.47), rimColor);
    this.addGoalBox(hole, 'RimSouth', new Vec3(0.94, 0.035, 0.05), new Vec3(0, 0.03, 0.47), rimColor);
    this.addGoalBox(hole, 'RimWest', new Vec3(0.05, 0.035, 0.84), new Vec3(-0.47, 0.03, 0), rimColor);
    this.addGoalBox(hole, 'RimEast', new Vec3(0.05, 0.035, 0.84), new Vec3(0.47, 0.03, 0), rimColor);
    return hole;
  }

  private addGoalBox(
    parent: Node,
    name: string,
    size: Vec3,
    position: Vec3,
    color: Color,
  ): Node {
    const node = this.addBox(parent, name, size, position, color);
    const renderer = node.getComponent(MeshRenderer);
    if (renderer) renderer.shadowCastingMode = MeshRenderer.ShadowCastingMode.ON;
    return node;
  }

  private addBox(parent: Node, name: string, size: Vec3, position: Vec3, color: Color, material?: Material): Node {
    const node = new Node(name);
    node.setParent(parent);
    node.setPosition(position);
    const renderer = node.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: size.x, height: size.y, length: size.z }));
    renderer.setMaterial(material ?? this.getLitMaterial(color), 0);
    this.configureShadowReceiver(renderer);
    return node;
  }

  private addCylinder(
    parent: Node,
    name: string,
    radius: number,
    height: number,
    position: Vec3,
    color: Color,
    radialSegments = 20,
  ): Node {
    const node = new Node(name);
    node.setParent(parent);
    node.setPosition(position);
    const renderer = node.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.cylinder(radius, radius, height, { radialSegments }));
    renderer.setMaterial(this.getLitMaterial(color), 0);
    this.configureShadowReceiver(renderer);
    return node;
  }

  private getLitMaterial(color: Color, roughness = 0.88): Material {
    const key = `${color.r}-${color.g}-${color.b}-${color.a}-${roughness}`;
    const existing = this.materials.get(key);
    if (existing) return existing;
    const baseMaterial = this.litBaseMaterial;
    if (!baseMaterial) throw new Error('Board lit material is not assigned');
    const material = new Material();
    material.copy(baseMaterial, { technique: color.a < 255 ? 1 : 0 });
    material.setProperty('mainColor', color);
    material.setProperty('roughness', roughness);
    material.setProperty('metallic', 0);
    this.materials.set(key, material);
    return material;
  }

  private animateGlassShard(
    shard: Node,
    index: number,
    offsetX: number,
    offsetZ: number,
  ): void {
    const start = shard.position.clone();
    const radialX = offsetX * 1.25 + ((index % 2 === 0 ? 1 : -1) * 0.08);
    const radialZ = offsetZ * 1.25 + ((index % 3 === 0 ? -1 : 1) * 0.07);
    const lift = 0.22 + (index % 3) * 0.055;
    const progress = { value: 0 };
    const position = new Vec3();
    const rotation = new Quat();
    this.breakTweenTargets.add(progress);
    tween(progress)
      .to(0.58, { value: 1 }, {
        easing: 'linear',
        onUpdate: () => {
          const phase = progress.value;
          position.set(
            start.x + radialX * phase,
            start.y + lift * Math.sin(Math.PI * phase) - 1.75 * phase * phase,
            start.z + radialZ * phase,
          );
          shard.setPosition(position);
          Quat.fromEuler(
            rotation,
            (index + 2) * 83 * phase,
            index * 19 + (index + 1) * 61 * phase,
            (index + 1) * 47 * phase,
          );
          shard.setRotation(rotation);
          const scale = phase < 0.72 ? 1 : Math.max(0, 1 - (phase - 0.72) / 0.28);
          shard.setScale(scale, scale, scale);
        },
      })
      .call(() => {
        this.breakTweenTargets.delete(progress);
        this.breakEffectNodes.delete(shard);
        shard.destroy();
      })
      .start();
  }

  private tileKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  private configureShadowReceiver(renderer: MeshRenderer): void {
    renderer.receiveShadow = MeshRenderer.ShadowReceivingMode.ON;
    renderer.shadowBias = 0.0005;
    renderer.shadowNormalBias = 0.02;
  }

}
