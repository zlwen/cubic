import {
  _decorator,
  Color,
  Component,
  instantiate,
  Material,
  MeshRenderer,
  Node,
  primitives,
  utils,
  Vec3,
} from 'cc';
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
  private readonly materials = new Map<string, Material>();

  render(level: LevelDefinition): void {
    this.clear();
    for (const tile of level.tiles) {
      const tileNode = this.createTile(tile);
      tileNode.setParent(this.node);
      tileNode.setPosition(new Vec3(tile.x * this.tileSize, 0, tile.z * this.tileSize));
      this.spawnedTiles.push(tileNode);
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
    for (const [bridgeId, nodes] of this.bridgeNodes) {
      const active = state.bridgeStates[bridgeId] === true;
      for (const node of nodes) node.active = active;
    }
  }

  clear(): void {
    for (const tile of this.spawnedTiles) tile.destroy();
    this.spawnedTiles = [];
    this.bridgeNodes.clear();
  }

  private createTile(tile: TileDefinition): Node {
    const tileNode = this.tilePrefab ? instantiate(this.tilePrefab) : new Node(`tile-${tile.x}-${tile.z}`);
    tileNode.name = `tile-${tile.x}-${tile.z}`;
    if (!this.tilePrefab) {
      const sideColor = tile.type === 'fragile'
        ? new Color(86, 133, 151, 145)
        : tile.type === 'split'
          ? new Color(107, 105, 139, 255)
          : tile.type === 'soft-switch'
            ? new Color(70, 112, 105, 255)
            : tile.type === 'hard-switch'
              ? new Color(125, 94, 41, 255)
              : new Color(157, 162, 172, 255);
      this.addBase(tileNode, sideColor);
      this.createTileTop(tileNode, tile);
    }
    return tileNode;
  }

  private createTileTop(tileNode: Node, tile: TileDefinition): void {
    if (tile.type === 'fragile') {
      this.addBox(tileNode, 'FragileTop', new Vec3(0.984, 0.035, 0.984), new Vec3(0, 0.105, 0), new Color(176, 217, 226, 155));
      const first = this.addBox(tileNode, 'CrackA', new Vec3(0.72, 0.026, 0.055), new Vec3(0, 0.145, 0), new Color(39, 69, 79, 255));
      const second = this.addBox(tileNode, 'CrackB', new Vec3(0.72, 0.026, 0.055), new Vec3(0, 0.146, 0), new Color(39, 69, 79, 255));
      first.setRotationFromEuler(0, 45, 0);
      second.setRotationFromEuler(0, -45, 0);
      return;
    }

    const topColor = tile.type === 'split'
      ? new Color(145, 142, 181, 255)
      : tile.type === 'soft-switch'
        ? new Color(154, 202, 193, 255)
        : tile.type === 'hard-switch'
          ? new Color(218, 185, 105, 255)
          : new Color(238, 239, 242, 255);
    this.addBox(
      tileNode,
      'StoneTop',
      new Vec3(0.984, 0.035, 0.984),
      new Vec3(0, 0.105, 0),
      topColor,
    );

    if (tile.type === 'soft-switch') {
      this.addCylinder(tileNode, 'SoftSwitch', 0.24, 0.07, new Vec3(0, 0.165, 0), new Color(32, 78, 72, 255));
    } else if (tile.type === 'hard-switch') {
      const first = this.addBox(tileNode, 'HardSwitchA', new Vec3(0.58, 0.045, 0.1), new Vec3(0, 0.16, 0), new Color(91, 58, 15, 255));
      const second = this.addBox(tileNode, 'HardSwitchB', new Vec3(0.58, 0.045, 0.1), new Vec3(0, 0.162, 0), new Color(91, 58, 15, 255));
      first.setRotationFromEuler(0, 45, 0);
      second.setRotationFromEuler(0, -45, 0);
    } else if (tile.type === 'split') {
      for (const [x, z] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
        this.addBox(tileNode, 'SplitMarker', new Vec3(0.12, 0.025, 0.12), new Vec3(x, 0.145, z), new Color(224, 224, 235, 255));
      }
    }
  }

  private createBridgeTile(id: string): Node {
    const node = new Node(`bridge-${id}`);
    this.addBase(node, new Color(40, 80, 91, 255));
    this.addBox(node, 'BridgeTop', new Vec3(0.984, 0.045, 0.984), new Vec3(0, 0.11, 0), new Color(78, 151, 159, 255));
    return node;
  }

  private addBase(parent: Node, color: Color): void {
    const renderer = parent.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box({ width: 1, height: 0.2, length: 1 }));
    renderer.setMaterial(this.getLitMaterial(color), 0);
    this.configureShadowReceiver(renderer);
  }

  private createGoalHole(): Node {
    const hole = new Node('GoalHole');
    const shaftColor = new Color(4, 5, 7, 255);
    const rimColor = new Color(105, 108, 116, 255);
    this.addBox(hole, 'ShaftNorth', new Vec3(0.88, 0.7, 0.035), new Vec3(0, -0.25, -0.45), shaftColor);
    this.addBox(hole, 'ShaftSouth', new Vec3(0.88, 0.7, 0.035), new Vec3(0, -0.25, 0.45), shaftColor);
    this.addBox(hole, 'ShaftWest', new Vec3(0.035, 0.7, 0.88), new Vec3(-0.45, -0.25, 0), shaftColor);
    this.addBox(hole, 'ShaftEast', new Vec3(0.035, 0.7, 0.88), new Vec3(0.45, -0.25, 0), shaftColor);
    this.addBox(hole, 'ShaftFloor', new Vec3(0.86, 0.025, 0.86), new Vec3(0, -0.62, 0), shaftColor);
    this.addBox(hole, 'RimNorth', new Vec3(0.94, 0.035, 0.05), new Vec3(0, 0.03, -0.47), rimColor);
    this.addBox(hole, 'RimSouth', new Vec3(0.94, 0.035, 0.05), new Vec3(0, 0.03, 0.47), rimColor);
    this.addBox(hole, 'RimWest', new Vec3(0.05, 0.035, 0.84), new Vec3(-0.47, 0.03, 0), rimColor);
    this.addBox(hole, 'RimEast', new Vec3(0.05, 0.035, 0.84), new Vec3(0.47, 0.03, 0), rimColor);
    return hole;
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

  private addCylinder(parent: Node, name: string, radius: number, height: number, position: Vec3, color: Color): Node {
    const node = new Node(name);
    node.setParent(parent);
    node.setPosition(position);
    const renderer = node.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.cylinder(radius, radius, height, { radialSegments: 20 }));
    renderer.setMaterial(this.getLitMaterial(color), 0);
    this.configureShadowReceiver(renderer);
    return node;
  }

  private getLitMaterial(color: Color): Material {
    const key = `${color.r}-${color.g}-${color.b}-${color.a}`;
    const existing = this.materials.get(key);
    if (existing) return existing;
    const baseMaterial = this.litBaseMaterial;
    if (!baseMaterial) throw new Error('Board lit material is not assigned');
    const material = new Material();
    material.copy(baseMaterial, { technique: color.a < 255 ? 1 : 0 });
    material.setProperty('mainColor', color);
    material.setProperty('roughness', 0.88);
    material.setProperty('metallic', 0);
    this.materials.set(key, material);
    return material;
  }

  private configureShadowReceiver(renderer: MeshRenderer): void {
    renderer.receiveShadow = MeshRenderer.ShadowReceivingMode.ON;
    renderer.shadowBias = 0.0005;
    renderer.shadowNormalBias = 0.02;
  }

}
