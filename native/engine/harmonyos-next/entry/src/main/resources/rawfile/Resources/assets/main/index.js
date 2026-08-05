System.register("chunks:///_virtual/AudioController.ts", ['cc'], function (exports) {
  var cclegacy, Component, resources, AudioClip, Node, AudioSource, _decorator;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Component = module.Component;
      resources = module.resources;
      AudioClip = module.AudioClip;
      Node = module.Node;
      AudioSource = module.AudioSource;
      _decorator = module._decorator;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "043b2qKf4pJ+IUkwMep4bP3", "AudioController", undefined);
      const {
        ccclass
      } = _decorator;
      let AudioController = exports('AudioController', (_dec = ccclass('AudioController'), _dec(_class = class AudioController extends Component {
        constructor(...args) {
          super(...args);
          this.effectsSource = null;
          this.ambientSource = null;
          this.effects = new Map();
          this.moveIndex = 0;
          this.ambientRequested = false;
          this.soundEnabled = true;
        }
        start() {
          this.effectsSource = this.createSource('EffectsAudio');
          this.ambientSource = this.createSource('AmbientAudio');
          this.ambientSource.loop = true;
          this.ambientSource.volume = 0.32;
          this.loadEffect('audio/move-stone-1', 'move1');
          this.loadEffect('audio/move-stone-2', 'move2');
          this.loadEffect('audio/move-stone-3', 'move3');
          this.loadEffect('audio/fall', 'fall');
          this.loadEffect('audio/complete', 'complete');
          this.loadEffect('audio/ui-click', 'ui');
          resources.load('audio/ambient-loop', AudioClip, (error, clip) => {
            if (error || !this.ambientSource) {
              console.warn('Ambient audio failed to load.', error);
              return;
            }
            this.ambientSource.clip = clip;
            if (this.ambientRequested) {
              this.ambientSource.play();
            }
          });
        }
        playMove() {
          const names = ['move1', 'move2', 'move3'];
          this.play(names[this.moveIndex % names.length], 0.68);
          this.moveIndex += 1;
        }
        beginInteraction() {
          this.ensureAmbient();
        }
        playFall() {
          this.play('fall', 0.82);
        }
        playComplete() {
          this.play('complete', 0.78);
        }
        playUi() {
          this.ensureAmbient();
          this.play('ui', 0.55);
        }
        toggleSound() {
          this.setSoundEnabled(!this.soundEnabled);
          return this.soundEnabled;
        }
        setSoundEnabled(enabled) {
          this.soundEnabled = enabled;
          if (this.effectsSource) {
            this.effectsSource.volume = this.soundEnabled ? 1 : 0;
          }
          if (this.ambientSource) {
            this.ambientSource.volume = this.soundEnabled ? 0.32 : 0;
            if (this.soundEnabled && this.ambientRequested && this.ambientSource.clip) {
              this.ambientSource.play();
            }
          }
        }
        isSoundEnabled() {
          return this.soundEnabled;
        }
        createSource(name) {
          const node = new Node(name);
          node.setParent(this.node);
          return node.addComponent(AudioSource);
        }
        loadEffect(path, name) {
          resources.load(path, AudioClip, (error, clip) => {
            if (error) {
              console.warn(`Audio effect failed to load: ${path}`, error);
              return;
            }
            this.effects.set(name, clip);
          });
        }
        ensureAmbient() {
          var _this$ambientSource;
          this.ambientRequested = true;
          if (this.soundEnabled && (_this$ambientSource = this.ambientSource) != null && _this$ambientSource.clip && !this.ambientSource.playing) {
            this.ambientSource.play();
          }
        }
        play(name, volume) {
          const clip = this.effects.get(name);
          if (clip) {
            var _this$effectsSource;
            (_this$effectsSource = this.effectsSource) == null || _this$effectsSource.playOneShot(clip, volume);
          }
        }
      }) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BlockPresenter.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, _decorator, Component, Tween, Vec3, Quat, tween;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
      Tween = module.Tween;
      Vec3 = module.Vec3;
      Quat = module.Quat;
      tween = module.tween;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "b3414vPjTVIHZiiUYfQpGom", "BlockPresenter", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let BlockPresenter = exports('BlockPresenter', (_dec = ccclass('BlockPresenter'), _dec(_class = (_class2 = class BlockPresenter extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "tileSize", _descriptor, this);
          _initializerDefineProperty(this, "rollDuration", _descriptor2, this);
          this.busy = false;
          this.wholeNode = null;
          this.cubeNodes = [null, null];
          this.activeCubeIndex = 0;
          this.motionTweenTarget = null;
        }
        start() {
          this.resolveNodes();
        }
        isBusy() {
          return this.busy;
        }
        startAttract(state) {
          this.stopAttract();
          this.snapTo(state);
        }
        stopAttract() {
          this.resolveNodes();
          if (this.wholeNode) Tween.stopAllByTarget(this.wholeNode);
          if (this.motionTweenTarget) Tween.stopAllByTarget(this.motionTweenTarget);
          this.motionTweenTarget = null;
          this.busy = false;
        }
        snapTo(state) {
          this.resolveNodes();
          if (state.split) {
            this.activeCubeIndex = state.split.activeCube;
            if (this.wholeNode) this.wholeNode.active = false;
            for (const index of [0, 1]) {
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
        playMove(result, onComplete, durationScale = 1) {
          this.resolveNodes();
          if (result.previous.split) {
            this.playSplitMove(result, onComplete, durationScale);
            return;
          }
          this.playWholeMove(result, onComplete, durationScale);
        }
        playFall(result, onComplete) {
          this.busy = true;
          const node = this.activeVisibleNode();
          if (!node) {
            this.busy = false;
            onComplete();
            return;
          }
          const startPosition = node.position.clone();
          const startRotation = node.rotation.clone();
          const edge = this.partialSupportEdge(result);
          if (!edge) {
            this.playUnsupportedFall(node, startPosition, onComplete);
            return;
          }
          const direction = this.directionVector(edge.direction);
          const axis = this.rotationAxis(edge.direction);
          const relative = startPosition.clone().subtract(edge.pivot);
          const tipAngle = Math.PI * 0.4;
          const tipRotation = new Quat();
          Quat.fromAxisAngle(tipRotation, axis, tipAngle);
          const tipOffset = new Vec3();
          Vec3.transformQuat(tipOffset, relative, tipRotation);
          const tipPosition = edge.pivot.clone().add(tipOffset);
          const progress = {
            value: 0
          };
          const rotationDelta = new Quat();
          const rotation = new Quat();
          const position = new Vec3();
          tween(progress).to(0.68, {
            value: 1
          }, {
            easing: 'linear',
            onUpdate: () => {
              const tipPhase = 0.42;
              if (progress.value <= tipPhase) {
                const phase = progress.value / tipPhase;
                const eased = phase * phase;
                Quat.fromAxisAngle(rotationDelta, axis, tipAngle * eased);
                Vec3.transformQuat(position, relative, rotationDelta);
                position.add(edge.pivot);
              } else {
                const phase = (progress.value - tipPhase) / (1 - tipPhase);
                position.set(tipPosition);
                Vec3.scaleAndAdd(position, position, direction, 0.85 * phase);
                position.y -= 3.2 * phase * phase;
                Quat.fromAxisAngle(rotationDelta, axis, tipAngle + Math.PI * 0.95 * phase);
              }
              node.setPosition(position);
              Quat.multiply(rotation, rotationDelta, startRotation);
              node.setRotation(rotation);
            }
          }).call(() => this.finishFall(onComplete)).start();
        }
        playUnsupportedFall(node, startPosition, onComplete) {
          const progress = {
            value: 0
          };
          const position = new Vec3();
          tween(progress).to(0.48, {
            value: 1
          }, {
            easing: 'linear',
            onUpdate: () => {
              const phase = progress.value;
              position.set(startPosition);
              position.y -= 3.5 * phase * phase;
              node.setPosition(position);
            }
          }).call(() => this.finishFall(onComplete)).start();
        }
        partialSupportEdge(result) {
          if (result.current.split || result.occupiedCells.length !== 2) return null;
          const supportedCells = result.supportedCells ?? [];
          if (supportedCells.length !== 1) return null;
          const supported = supportedCells[0];
          const unsupported = result.occupiedCells.find(cell => cell.x !== supported.x || cell.z !== supported.z);
          if (!unsupported) return null;
          let direction;
          if (unsupported.x < supported.x) direction = 'left';else if (unsupported.x > supported.x) direction = 'right';else if (unsupported.z < supported.z) direction = 'up';else if (unsupported.z > supported.z) direction = 'down';else return null;
          return {
            direction,
            pivot: new Vec3((supported.x + unsupported.x) * this.tileSize * 0.5, 0, (supported.z + unsupported.z) * this.tileSize * 0.5)
          };
        }
        finishFall(onComplete) {
          this.busy = false;
          onComplete();
        }
        playGoalDrop(onComplete) {
          this.busy = true;
          const node = this.wholeNode;
          if (!node) {
            this.busy = false;
            onComplete();
            return;
          }
          const target = node.position.clone().add(new Vec3(0, -3, 0));
          tween(node).delay(0.08).to(0.48, {
            position: target
          }, {
            easing: 'quadIn'
          }).call(() => {
            node.active = false;
            this.busy = false;
            onComplete();
          }).start();
        }
        playWholeMove(result, onComplete, durationScale) {
          var _result$supportedCell;
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
          const horizontalHalfExtent = this.horizontalHalfExtent(start, result.direction);
          const verticalHalfExtent = this.verticalHalfExtent(start);
          const pivot = startPosition.clone().add(new Vec3(direction.x * horizontalHalfExtent, -verticalHalfExtent, direction.z * horizontalHalfExtent));
          const relative = startPosition.clone().subtract(pivot);
          const axis = this.rotationAxis(result.direction);
          const fullyUnsupported = result.status === 'fallen' && (((_result$supportedCell = result.supportedCells) == null ? void 0 : _result$supportedCell.length) ?? 0) === 0;
          const progress = {
            value: 0
          };
          this.motionTweenTarget = progress;
          tween(progress).to(this.rollDuration * durationScale, {
            value: 1
          }, {
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
            }
          }).call(() => {
            this.motionTweenTarget = null;
            if (fullyUnsupported) {
              node.setPosition(targetPosition);
              node.setRotation(targetRotation);
              this.busy = false;
              onComplete();
              return;
            }
            node.setPosition(targetPosition);
            node.setRotation(targetRotation);
            this.snapTo(result.current);
            this.busy = false;
            onComplete();
          }).start();
        }
        playSplitMove(result, onComplete, durationScale) {
          var _result$previous$spli;
          const active = ((_result$previous$spli = result.previous.split) == null ? void 0 : _result$previous$spli.activeCube) ?? 0;
          const node = this.cubeNodes[active];
          if (!node) {
            this.snapTo(result.current);
            onComplete();
            return;
          }
          this.busy = true;
          const destination = result.current.split ? result.current.split.cubes[active] : result.occupiedCells.find(cell => {
            var _result$previous$spli2, _result$previous$spli3;
            return cell.x !== ((_result$previous$spli2 = result.previous.split) == null ? void 0 : _result$previous$spli2.cubes[1 - active].x) || cell.z !== ((_result$previous$spli3 = result.previous.split) == null ? void 0 : _result$previous$spli3.cubes[1 - active].z);
          }) ?? result.occupiedCells[0];
          tween(node).to(0.16 * durationScale, {
            position: this.cubePosition(destination)
          }, {
            easing: 'quadInOut'
          }).call(() => {
            this.snapTo(result.current);
            this.busy = false;
            onComplete();
          }).start();
        }
        resolveNodes() {
          this.wholeNode ?? (this.wholeNode = this.node.getChildByName('WholeBlock'));
          this.cubeNodes = [this.cubeNodes[0] ?? this.node.getChildByName('SplitCubeA'), this.cubeNodes[1] ?? this.node.getChildByName('SplitCubeB')];
        }
        activeVisibleNode() {
          const activeCube = this.cubeNodes[this.activeCubeIndex];
          return activeCube != null && activeCube.active ? activeCube : this.wholeNode;
        }
        cubePosition(coord) {
          return new Vec3(coord.x * this.tileSize, 0.5, coord.z * this.tileSize);
        }
        positionFor(block) {
          const y = block.orientation === 'standing' ? 1 : 0.5;
          let x = block.anchor.x * this.tileSize;
          let z = block.anchor.z * this.tileSize;
          if (block.orientation === 'lying-x') x += this.tileSize * 0.5;else if (block.orientation === 'lying-z') z += this.tileSize * 0.5;
          return new Vec3(x, y, z);
        }
        rotationFor(block) {
          const rotation = new Quat();
          if (block.orientation === 'lying-x') Quat.fromEuler(rotation, 0, 0, 90);else if (block.orientation === 'lying-z') Quat.fromEuler(rotation, 90, 0, 0);
          return rotation;
        }
        directionVector(direction) {
          if (direction === 'left') return new Vec3(-1, 0, 0);
          if (direction === 'right') return new Vec3(1, 0, 0);
          if (direction === 'up') return new Vec3(0, 0, -1);
          return new Vec3(0, 0, 1);
        }
        rotationAxis(direction) {
          if (direction === 'left') return new Vec3(0, 0, 1);
          if (direction === 'right') return new Vec3(0, 0, -1);
          if (direction === 'up') return new Vec3(-1, 0, 0);
          return new Vec3(1, 0, 0);
        }
        horizontalHalfExtent(block, direction) {
          const movesAlongX = direction === 'left' || direction === 'right';
          if (movesAlongX && block.orientation === 'lying-x' || !movesAlongX && block.orientation === 'lying-z') return this.tileSize;
          return this.tileSize * 0.5;
        }
        verticalHalfExtent(block) {
          return block.orientation === 'standing' ? this.tileSize : this.tileSize * 0.5;
        }
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "tileSize", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "rollDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.22;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BoardRenderer.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, Node, Material, _decorator, Component, Vec3, instantiate, Color, MeshRenderer, utils, primitives;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      Node = module.Node;
      Material = module.Material;
      _decorator = module._decorator;
      Component = module.Component;
      Vec3 = module.Vec3;
      instantiate = module.instantiate;
      Color = module.Color;
      MeshRenderer = module.MeshRenderer;
      utils = module.utils;
      primitives = module.primitives;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "f5909ImHYVKL4oq9OHs3OOB", "BoardRenderer", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let BoardRenderer = exports('BoardRenderer', (_dec = ccclass('BoardRenderer'), _dec2 = property(Node), _dec3 = property(Material), _dec(_class = (_class2 = class BoardRenderer extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "tilePrefab", _descriptor, this);
          _initializerDefineProperty(this, "tileSize", _descriptor2, this);
          _initializerDefineProperty(this, "litBaseMaterial", _descriptor3, this);
          this.spawnedTiles = [];
          this.bridgeNodes = new Map();
          this.materials = new Map();
        }
        render(level) {
          this.clear();
          for (const tile of level.tiles) {
            const tileNode = this.createTile(tile);
            tileNode.setParent(this.node);
            tileNode.setPosition(new Vec3(tile.x * this.tileSize, 0, tile.z * this.tileSize));
            this.spawnedTiles.push(tileNode);
          }
          for (const bridge of level.bridges ?? []) {
            const nodes = [];
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
        applyState(state) {
          for (const [bridgeId, nodes] of this.bridgeNodes) {
            const active = state.bridgeStates[bridgeId] === true;
            for (const node of nodes) node.active = active;
          }
        }
        clear() {
          for (const tile of this.spawnedTiles) tile.destroy();
          this.spawnedTiles = [];
          this.bridgeNodes.clear();
        }
        createTile(tile) {
          const tileNode = this.tilePrefab ? instantiate(this.tilePrefab) : new Node(`tile-${tile.x}-${tile.z}`);
          tileNode.name = `tile-${tile.x}-${tile.z}`;
          if (!this.tilePrefab) {
            const sideColor = tile.type === 'fragile' ? new Color(86, 133, 151, 145) : tile.type === 'split' ? new Color(107, 105, 139, 255) : tile.type === 'soft-switch' ? new Color(70, 112, 105, 255) : tile.type === 'hard-switch' ? new Color(125, 94, 41, 255) : new Color(157, 162, 172, 255);
            this.addBase(tileNode, sideColor);
            this.createTileTop(tileNode, tile);
          }
          return tileNode;
        }
        createTileTop(tileNode, tile) {
          if (tile.type === 'fragile') {
            this.addBox(tileNode, 'FragileTop', new Vec3(0.984, 0.035, 0.984), new Vec3(0, 0.105, 0), new Color(176, 217, 226, 155));
            const first = this.addBox(tileNode, 'CrackA', new Vec3(0.72, 0.026, 0.055), new Vec3(0, 0.145, 0), new Color(39, 69, 79, 255));
            const second = this.addBox(tileNode, 'CrackB', new Vec3(0.72, 0.026, 0.055), new Vec3(0, 0.146, 0), new Color(39, 69, 79, 255));
            first.setRotationFromEuler(0, 45, 0);
            second.setRotationFromEuler(0, -45, 0);
            return;
          }
          const topColor = tile.type === 'split' ? new Color(145, 142, 181, 255) : tile.type === 'soft-switch' ? new Color(154, 202, 193, 255) : tile.type === 'hard-switch' ? new Color(218, 185, 105, 255) : new Color(238, 239, 242, 255);
          this.addBox(tileNode, 'StoneTop', new Vec3(0.984, 0.035, 0.984), new Vec3(0, 0.105, 0), topColor);
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
        createBridgeTile(id) {
          const node = new Node(`bridge-${id}`);
          this.addBase(node, new Color(40, 80, 91, 255));
          this.addBox(node, 'BridgeTop', new Vec3(0.984, 0.045, 0.984), new Vec3(0, 0.11, 0), new Color(78, 151, 159, 255));
          return node;
        }
        addBase(parent, color) {
          const renderer = parent.addComponent(MeshRenderer);
          renderer.mesh = utils.createMesh(primitives.box({
            width: 1,
            height: 0.2,
            length: 1
          }));
          renderer.setMaterial(this.getLitMaterial(color), 0);
          this.configureShadowReceiver(renderer);
        }
        createGoalHole() {
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
        addGoalBox(parent, name, size, position, color) {
          const node = this.addBox(parent, name, size, position, color);
          const renderer = node.getComponent(MeshRenderer);
          if (renderer) renderer.shadowCastingMode = MeshRenderer.ShadowCastingMode.ON;
          return node;
        }
        addBox(parent, name, size, position, color, material) {
          const node = new Node(name);
          node.setParent(parent);
          node.setPosition(position);
          const renderer = node.addComponent(MeshRenderer);
          renderer.mesh = utils.createMesh(primitives.box({
            width: size.x,
            height: size.y,
            length: size.z
          }));
          renderer.setMaterial(material ?? this.getLitMaterial(color), 0);
          this.configureShadowReceiver(renderer);
          return node;
        }
        addCylinder(parent, name, radius, height, position, color) {
          const node = new Node(name);
          node.setParent(parent);
          node.setPosition(position);
          const renderer = node.addComponent(MeshRenderer);
          renderer.mesh = utils.createMesh(primitives.cylinder(radius, radius, height, {
            radialSegments: 20
          }));
          renderer.setMaterial(this.getLitMaterial(color), 0);
          this.configureShadowReceiver(renderer);
          return node;
        }
        getLitMaterial(color) {
          const key = `${color.r}-${color.g}-${color.b}-${color.a}`;
          const existing = this.materials.get(key);
          if (existing) return existing;
          const baseMaterial = this.litBaseMaterial;
          if (!baseMaterial) throw new Error('Board lit material is not assigned');
          const material = new Material();
          material.copy(baseMaterial, {
            technique: color.a < 255 ? 1 : 0
          });
          material.setProperty('mainColor', color);
          material.setProperty('roughness', 0.88);
          material.setProperty('metallic', 0);
          this.materials.set(key, material);
          return material;
        }
        configureShadowReceiver(renderer) {
          renderer.receiveShadow = MeshRenderer.ShadowReceivingMode.ON;
          renderer.shadowBias = 0.0005;
          renderer.shadowNormalBias = 0.02;
        }
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "tilePrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tileSize", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "litBaseMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CameraController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './index.ts', './coords.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, Camera, _decorator, Component, Vec3, view, boundsForCells;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      Camera = module.Camera;
      _decorator = module._decorator;
      Component = module.Component;
      Vec3 = module.Vec3;
      view = module.view;
    }, null, function (module) {
      boundsForCells = module.boundsForCells;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "637c3pcLFBGt46peNLT53hO", "CameraController", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let CameraController = exports('CameraController', (_dec = ccclass('CameraController'), _dec2 = property(Camera), _dec(_class = (_class2 = class CameraController extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "camera", _descriptor, this);
        }
        frameLevel(level, horizontalScreenOffset = 0) {
          const cells = [...level.tiles, ...(level.bridges ?? []).reduce((result, bridge) => result.concat(bridge.cells), []), ...(level.splits ?? []).reduce((result, split) => result.concat(split.destinations), []), level.goal];
          const bounds = boundsForCells(cells);
          const centerX = (bounds.minX + bounds.maxX) * 0.5;
          const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
          const target = new Vec3(centerX, 0, centerZ);

          // This fixed offset gives approximately 34 degrees pitch and 18 degrees yaw.
          const cameraOffset = new Vec3(-6, 13, -18);
          const basePosition = target.clone().add(cameraOffset);
          const orthoHeight = this.orthoHeightForBounds(bounds, target, basePosition, horizontalScreenOffset);
          const visible = view.getVisibleSize();
          const aspect = Math.max(1, visible.width / visible.height);
          const forward = target.clone().subtract(basePosition).normalize();
          const right = new Vec3();
          Vec3.cross(right, forward, Vec3.UP).normalize();
          const framedTarget = new Vec3();
          Vec3.scaleAndAdd(framedTarget, target, right, -orthoHeight * aspect * horizontalScreenOffset);
          const position = framedTarget.clone().add(cameraOffset);
          this.node.setPosition(position);
          this.node.lookAt(framedTarget, Vec3.UP);
          if (!this.camera) {
            return;
          }
          this.camera.projection = Camera.ProjectionType.ORTHO;
          this.camera.orthoHeight = orthoHeight;
        }
        orthoHeightForBounds(bounds, target, cameraPosition, horizontalScreenOffset) {
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
          const visibleHorizontalRatio = Math.max(0.35, 1 - Math.abs(horizontalScreenOffset));
          const horizontalWithMargin = horizontalExtent / (aspect * visibleHorizontalRatio) + 0.9;
          return Math.max(3.4, verticalWithMargin, horizontalWithMargin);
        }
      }, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "camera", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/coords.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        boundsForCells: boundsForCells,
        coordKey: coordKey,
        occupiedCells: occupiedCells,
        sameCoord: sameCoord
      });
      cclegacy._RF.push({}, "650eaXOxxFOwLh337UaOKFc", "coords", undefined);
      function coordKey(coord) {
        return `${coord.x},${coord.z}`;
      }
      function sameCoord(a, b) {
        return a.x === b.x && a.z === b.z;
      }
      function occupiedCells(block) {
        const {
          x,
          z
        } = block.anchor;
        if (block.orientation === 'standing') {
          return [{
            x,
            z
          }];
        }
        if (block.orientation === 'lying-x') {
          return [{
            x,
            z
          }, {
            x: x + 1,
            z
          }];
        }
        return [{
          x,
          z
        }, {
          x,
          z: z + 1
        }];
      }
      function boundsForCells(cells) {
        return cells.reduce((bounds, cell) => ({
          minX: Math.min(bounds.minX, cell.x),
          maxX: Math.max(bounds.maxX, cell.x),
          minZ: Math.min(bounds.minZ, cell.z),
          maxZ: Math.max(bounds.maxZ, cell.z)
        }), {
          minX: Infinity,
          maxX: -Infinity,
          minZ: Infinity,
          maxZ: -Infinity
        });
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameplayBootstrap.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './AudioController.ts', './BlockPresenter.ts', './BoardRenderer.ts', './CameraController.ts', './GameplayController.ts', './MobileSafeArea.ts', './TouchInputController.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, Material, _decorator, Component, Camera, Node, Color, MeshRenderer, utils, primitives, Vec3, DirectionalLight, Layers, view, UITransform, Canvas, Widget, HorizontalTextAlignment, EditBox, Label, VerticalTextAlignment, Button, EventHandler, Sprite, SpriteFrame, builtinResMgr, AudioController, BlockPresenter, BoardRenderer, CameraController, GameplayController, MobileSafeArea, TouchInputController;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      Material = module.Material;
      _decorator = module._decorator;
      Component = module.Component;
      Camera = module.Camera;
      Node = module.Node;
      Color = module.Color;
      MeshRenderer = module.MeshRenderer;
      utils = module.utils;
      primitives = module.primitives;
      Vec3 = module.Vec3;
      DirectionalLight = module.DirectionalLight;
      Layers = module.Layers;
      view = module.view;
      UITransform = module.UITransform;
      Canvas = module.Canvas;
      Widget = module.Widget;
      HorizontalTextAlignment = module.HorizontalTextAlignment;
      EditBox = module.EditBox;
      Label = module.Label;
      VerticalTextAlignment = module.VerticalTextAlignment;
      Button = module.Button;
      EventHandler = module.EventHandler;
      Sprite = module.Sprite;
      SpriteFrame = module.SpriteFrame;
      builtinResMgr = module.builtinResMgr;
    }, function (module) {
      AudioController = module.AudioController;
    }, function (module) {
      BlockPresenter = module.BlockPresenter;
    }, function (module) {
      BoardRenderer = module.BoardRenderer;
    }, function (module) {
      CameraController = module.CameraController;
    }, function (module) {
      GameplayController = module.GameplayController;
    }, function (module) {
      MobileSafeArea = module.MobileSafeArea;
    }, function (module) {
      TouchInputController = module.TouchInputController;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "540aeo7ABBGxZZEdWcytu7C", "GameplayBootstrap", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let GameplayBootstrap = exports('GameplayBootstrap', (_dec = ccclass('GameplayBootstrap'), _dec2 = property(Material), _dec(_class = (_class2 = class GameplayBootstrap extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "litBaseMaterial", _descriptor, this);
          this.solidSpriteFrame = null;
        }
        start() {
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
          gameplay.localizedLabels = ui.localizedLabels;
        }
        createChild(name) {
          const node = new Node(name);
          node.setParent(this.node);
          return node;
        }
        createBlock() {
          const node = this.createChild('Block');
          const blockMaterial = this.createLitMaterial(new Color(205, 18, 28, 255), 0.72);
          const edgeMaterial = this.createLitMaterial(new Color(190, 190, 190, 255), 0.68);
          const whole = new Node('WholeBlock');
          whole.setParent(node);
          const renderer = whole.addComponent(MeshRenderer);
          renderer.mesh = utils.createMesh(primitives.box({
            width: 0.9,
            height: 2,
            length: 0.9
          }));
          renderer.setMaterial(blockMaterial, 0);
          this.configureBlockShadows(renderer);
          this.createBlockEdges(whole, 0.9, 2, edgeMaterial);
          this.createSplitCube(node, 'SplitCubeA', blockMaterial, edgeMaterial);
          this.createSplitCube(node, 'SplitCubeB', blockMaterial, edgeMaterial);
          return node;
        }
        createSplitCube(parent, name, material, edgeMaterial) {
          const cube = new Node(name);
          cube.setParent(parent);
          const renderer = cube.addComponent(MeshRenderer);
          renderer.mesh = utils.createMesh(primitives.box({
            width: 0.88,
            height: 0.88,
            length: 0.88
          }));
          renderer.setMaterial(material, 0);
          this.configureBlockShadows(renderer);
          this.createBlockEdges(cube, 0.88, 0.88, edgeMaterial);
          const marker = new Node('SelectionMarker');
          marker.setParent(cube);
          marker.setPosition(0, 0.455, 0);
          const markerRenderer = marker.addComponent(MeshRenderer);
          markerRenderer.mesh = utils.createMesh(primitives.box({
            width: 0.48,
            height: 0.025,
            length: 0.48
          }));
          markerRenderer.setMaterial(this.createFlatMaterial(new Color(229, 229, 238, 255)), 0);
          cube.active = false;
        }
        createBlockEdges(parent, width, height, material) {
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
        createBlockEdge(parent, size, position, material) {
          const edge = new Node('BlockEdge');
          edge.setParent(parent);
          edge.setPosition(position);
          const renderer = edge.addComponent(MeshRenderer);
          renderer.mesh = utils.createMesh(primitives.box({
            width: size.x,
            height: size.y,
            length: size.z
          }));
          renderer.setMaterial(material, 0);
          this.configureBlockShadows(renderer);
        }
        createCamera() {
          var _this$node$parent;
          const node = ((_this$node$parent = this.node.parent) == null ? void 0 : _this$node$parent.getChildByName('Main Camera')) ?? this.createChild('Main Camera');
          const camera = node.getComponent(Camera) ?? node.addComponent(Camera);
          camera.projection = Camera.ProjectionType.ORTHO;
          camera.orthoHeight = 6;
          camera.clearColor = new Color(7, 8, 10, 255);
          node.setPosition(new Vec3(-6, 13, -18));
          node.lookAt(new Vec3(0, 0, 0));
          return node;
        }
        createVoidBackdrop() {
          const node = this.createChild('VoidBackdrop');
          node.setPosition(0, -3.2, 2);
          const renderer = node.addComponent(MeshRenderer);
          renderer.mesh = utils.createMesh(primitives.box({
            width: 70,
            height: 0.08,
            length: 70
          }));
          renderer.setMaterial(this.createFlatMaterial(new Color(9, 10, 12, 255)), 0);
          return node;
        }
        createLight() {
          var _this$node$parent2;
          const existing = (_this$node$parent2 = this.node.parent) == null ? void 0 : _this$node$parent2.getChildByName('Main Light');
          const node = existing ?? this.createChild('Key Light');
          const light = node.getComponent(DirectionalLight) ?? node.addComponent(DirectionalLight);
          light.illuminance = 45000;
          light.csmLevel = 1;
          node.setRotationFromEuler(-45, 35, 0);
          return node;
        }
        createUi() {
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
          const localizedLabels = {};
          const bind = (key, label) => {
            const labels = localizedLabels[key];
            if (labels) labels.push(label);else localizedLabels[key] = [label];
          };
          const gameplayHudRoot = this.createUiRoot('GameplayHud', safeArea, visibleSize.width, visibleSize.height);
          this.stretchToParent(gameplayHudRoot);
          const menuButton = this.createButton(gameplayHudRoot, 'MenuButton', 'MENU', Vec3.ZERO, 'openMenu', 126, 48);
          bind('menu', menuButton.label);
          this.alignCorner(menuButton.button.node, 'left');
          const splitControl = this.createButton(gameplayHudRoot, 'SplitControl', 'SWITCH BLOCK', Vec3.ZERO, 'switchCube', 176, 48);
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
          const passcodeStatLabel = this.createStatLabel(statsCluster, 'PasscodeStat', 'PASSCODE\nRIFT', 195);
          const titleMenuRoot = this.createOverlay('TitleMenu', safeArea, visibleSize.width, visibleSize.height, new Color(6, 7, 9, 148));
          const titleBand = this.createUiRoot('TitleBand', titleMenuRoot, 390, visibleSize.height);
          titleBand.setPosition(-visibleSize.width * 0.5 + 195, 0);
          this.drawPanel(titleBand, 390, visibleSize.height, new Color(12, 14, 17, 238));
          const titleY = Math.min(205, visibleSize.height * 0.32);
          const title = this.createLabel('GameTitle', 'CUBIC', new Vec3(0, titleY, 0), 350, 74, 58);
          title.node.setParent(titleBand);
          const subtitle = this.createLabel('GameSubtitle', 'ROLLING BLOCK PUZZLE', new Vec3(0, titleY - 50, 0), 350, 34, 14);
          subtitle.color = new Color(164, 166, 172, 255);
          subtitle.node.setParent(titleBand);
          bind('gameSubtitle', subtitle);
          const startButton = this.createButton(titleBand, 'StartButton', 'START NEW GAME', new Vec3(0, 82, 0), 'startGame', 300, 42);
          const resume = this.createButton(titleBand, 'ResumeButton', 'RESUME GAME', new Vec3(0, 32, 0), 'resumeGame', 300, 42);
          const loadStageButton = this.createButton(titleBand, 'LoadStageButton', 'LOAD STAGE', new Vec3(0, -18, 0), 'openStageSelect', 300, 42);
          const howToButton = this.createButton(titleBand, 'HowToButton', 'HOW TO PLAY', new Vec3(0, -68, 0), 'showHowToPlay', 300, 42);
          const titleSoundButton = this.createButton(titleBand, 'TitleSoundButton', 'TOGGLE SOUND: ON', new Vec3(0, -118, 0), 'toggleSound', 300, 42);
          const titleLanguageButton = this.createButton(titleBand, 'TitleLanguageButton', 'LANGUAGE: ENGLISH', new Vec3(0, -168, 0), 'cycleLanguage', 300, 42);
          const creditsButton = this.createButton(titleBand, 'CreditsButton', 'CREDITS', new Vec3(0, -218, 0), 'showCredits', 300, 42);
          bind('startNewGame', startButton.label);
          bind('loadStage', loadStageButton.label);
          bind('howToPlay', howToButton.label);
          bind('credits', creditsButton.label);
          const stageSelectRoot = this.createOverlay('StageSelect', safeArea, visibleSize.width, visibleSize.height, new Color(6, 7, 9, 248));
          const stageTitle = this.createLabel('StageTitle', 'LOAD STAGE', new Vec3(0, 205, 0), 500, 52, 34);
          stageTitle.node.setParent(stageSelectRoot);
          bind('loadStage', stageTitle);
          const stageButtons = [];
          const stageButtonLabels = [];
          for (let index = 0; index < 33; index += 1) {
            const column = index % 11;
            const row = Math.floor(index / 11);
            const stageButton = this.createButton(stageSelectRoot, `StageButton${index + 1}`, index < 9 ? `0${index + 1}` : String(index + 1), new Vec3((column - 5) * 61, 118 - row * 56, 0), 'selectStage', 52, 42, String(index));
            stageButtons.push(stageButton.button);
            stageButtonLabels.push(stageButton.label);
          }
          const passcodeInput = this.createPasscodeInput(stageSelectRoot, new Vec3(-70, -96, 0));
          const passcodeButton = this.createButton(stageSelectRoot, 'PasscodeButton', 'ENTER', new Vec3(145, -96, 0), 'submitPasscode', 140, 52);
          bind('enter', passcodeButton.label);
          const passcodeFeedback = this.createLabel('PasscodeFeedback', '', new Vec3(0, -145, 0), 460, 32, 15);
          passcodeFeedback.color = new Color(218, 91, 99, 255);
          passcodeFeedback.node.setParent(stageSelectRoot);
          const stageBackButton = this.createButton(stageSelectRoot, 'StageBackButton', 'BACK', new Vec3(0, -196, 0), 'returnToTitle', 180, 44);
          bind('back', stageBackButton.label);
          stageSelectRoot.active = false;
          const howToPlayRoot = this.createOverlay('HowToPlay', safeArea, visibleSize.width, visibleSize.height, new Color(6, 7, 9, 248));
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
          const howNextButton = this.createButton(howToPlayRoot, 'HowNextButton', 'NEXT', new Vec3(150, -155, 0), 'nextHowTopic', 220, 44);
          const howBackButton = this.createButton(howToPlayRoot, 'HowBackButton', 'BACK', new Vec3(0, -205, 0), 'returnToTitle', 180, 44);
          bind('previous', howPreviousButton.label);
          bind('next', howNextButton.label);
          bind('back', howBackButton.label);
          howToPlayRoot.active = false;
          const creditsRoot = this.createOverlay('Credits', safeArea, visibleSize.width, visibleSize.height, new Color(6, 7, 9, 248));
          const creditsTitle = this.createLabel('CreditsTitle', 'CREDITS', new Vec3(0, 145, 0), 500, 52, 34);
          creditsTitle.node.setParent(creditsRoot);
          bind('credits', creditsTitle);
          const creditsCopy = this.createLabel('CreditsCopy', 'DESIGN & DEVELOPMENT\nCUBIC TEAM\n\nORIGINAL LEVELS, VISUALS & AUDIO\nCREATED FOR CUBIC', new Vec3(0, 15, 0), 620, 210, 18);
          creditsCopy.lineHeight = 28;
          creditsCopy.node.setParent(creditsRoot);
          bind('creditsCopy', creditsCopy);
          const creditsBackButton = this.createButton(creditsRoot, 'CreditsBackButton', 'BACK', new Vec3(0, -155, 0), 'returnToTitle', 180, 44);
          bind('back', creditsBackButton.label);
          creditsRoot.active = false;
          const newGameConfirmRoot = this.createOverlay('NewGameConfirm', safeArea, visibleSize.width, visibleSize.height, new Color(3, 4, 5, 232));
          const confirmPanel = this.createUiRoot('ConfirmPanel', newGameConfirmRoot, 440, 260);
          this.drawPanel(confirmPanel, 440, 260, new Color(25, 27, 31, 252));
          const confirmTitle = this.createLabel('ConfirmTitle', 'START NEW GAME?', new Vec3(0, 78, 0), 380, 46, 28);
          confirmTitle.node.setParent(confirmPanel);
          const confirmCopy = this.createLabel('ConfirmCopy', 'CURRENT CAMPAIGN PROGRESS WILL RESET.', new Vec3(0, 25, 0), 380, 34, 14);
          confirmCopy.color = new Color(174, 177, 184, 255);
          confirmCopy.node.setParent(confirmPanel);
          const confirmNewButton = this.createButton(confirmPanel, 'ConfirmNewButton', 'START', new Vec3(-95, -58, 0), 'confirmNewGame', 170, 48);
          const cancelNewButton = this.createButton(confirmPanel, 'CancelNewButton', 'CANCEL', new Vec3(95, -58, 0), 'cancelNewGame', 170, 48);
          bind('confirmNewGameTitle', confirmTitle);
          bind('confirmNewGameCopy', confirmCopy);
          bind('start', confirmNewButton.label);
          bind('cancel', cancelNewButton.label);
          newGameConfirmRoot.active = false;
          const failureRoot = this.createOverlay('FailureResult', safeArea, visibleSize.width, visibleSize.height, new Color(3, 4, 5, 224));
          const failurePanel = this.createUiRoot('FailurePanel', failureRoot, 420, 270);
          this.drawPanel(failurePanel, 420, 270, new Color(25, 27, 31, 252));
          const failureTitle = this.createLabel('FailureTitle', 'STAGE FAILED', new Vec3(0, 82, 0), 360, 48, 30);
          failureTitle.color = new Color(218, 91, 99, 255);
          failureTitle.node.setParent(failurePanel);
          const failureReasonLabel = this.createLabel('FailureReason', 'FELL INTO THE VOID', new Vec3(0, 30, 0), 360, 34, 15);
          failureReasonLabel.node.setParent(failurePanel);
          const retryButton = this.createButton(failurePanel, 'RetryButton', 'RETRY', new Vec3(-95, -58, 0), 'retryLevel', 170, 48);
          const failureQuitButton = this.createButton(failurePanel, 'FailureQuitButton', 'QUIT TO MENU', new Vec3(95, -58, 0), 'quitResultToMenu', 170, 48);
          bind('stageFailed', failureTitle);
          bind('retry', retryButton.label);
          bind('quitToMenu', failureQuitButton.label);
          failureRoot.active = false;
          const completionRoot = this.createOverlay('CompletionResult', safeArea, visibleSize.width, visibleSize.height, new Color(3, 4, 5, 224));
          const completionPanel = this.createUiRoot('CompletionPanel', completionRoot, 460, 340);
          this.drawPanel(completionPanel, 460, 340, new Color(25, 27, 31, 252));
          const completionTitle = this.createLabel('CompletionTitle', 'STAGE COMPLETE', new Vec3(0, 125, 0), 400, 48, 30);
          completionTitle.color = new Color(154, 202, 193, 255);
          completionTitle.node.setParent(completionPanel);
          const completionStatsLabel = this.createLabel('CompletionStats', '', new Vec3(0, 40, 0), 360, 105, 17);
          completionStatsLabel.lineHeight = 28;
          completionStatsLabel.node.setParent(completionPanel);
          const continueButton = this.createButton(completionPanel, 'ContinueButton', 'CONTINUE', new Vec3(0, -48, 0), 'continueAfterComplete', 300, 48);
          const replayButton = this.createButton(completionPanel, 'ReplayButton', 'REPLAY', new Vec3(-95, -112, 0), 'replayLevel', 170, 44);
          const completeQuitButton = this.createButton(completionPanel, 'CompleteQuitButton', 'QUIT TO MENU', new Vec3(95, -112, 0), 'quitResultToMenu', 170, 44);
          bind('stageComplete', completionTitle);
          bind('replay', replayButton.label);
          bind('quitToMenu', completeQuitButton.label);
          completionRoot.active = false;
          const tutorialRoot = this.createOverlay('Tutorial', safeArea, visibleSize.width, visibleSize.height, new Color(3, 4, 5, 126));
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
          const tutorialSkipButton = this.createButton(tutorialPanel, 'TutorialSkipButton', 'SKIP', new Vec3(tutorialPanelWidth * 0.5 - 220, -66, 0), 'skipTutorial', 140, 40);
          const tutorialNextButton = this.createButton(tutorialPanel, 'TutorialNextButton', 'NEXT', new Vec3(tutorialPanelWidth * 0.5 - 70, -66, 0), 'acknowledgeTutorial', 110, 40);
          bind('skip', tutorialSkipButton.label);
          tutorialRoot.active = false;
          const pauseMenuRoot = this.createOverlay('PauseMenu', safeArea, visibleSize.width, visibleSize.height, new Color(3, 4, 5, 232));
          const pausePanel = this.createUiRoot('PausePanel', pauseMenuRoot, 380, 390);
          this.drawPanel(pausePanel, 380, 390, new Color(25, 27, 31, 252));
          const pauseTitle = this.createLabel('PauseTitle', 'PAUSED', new Vec3(0, 150, 0), 320, 48, 30);
          pauseTitle.node.setParent(pausePanel);
          const returnButton = this.createButton(pausePanel, 'ReturnButton', 'RETURN TO GAME', new Vec3(0, 78, 0), 'returnToGame', 300, 50);
          const soundButton = this.createButton(pausePanel, 'SoundButton', 'TOGGLE SOUND: ON', new Vec3(0, 14, 0), 'toggleSound', 300, 50);
          const pauseLanguageButton = this.createButton(pausePanel, 'PauseLanguageButton', 'LANGUAGE: ENGLISH', new Vec3(0, -50, 0), 'cycleLanguage', 300, 50);
          const quitButton = this.createButton(pausePanel, 'QuitButton', 'QUIT TO MENU', new Vec3(0, -114, 0), 'quitToMenu', 300, 50);
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
            localizedLabels
          };
        }
        createBadge(parent, name, position) {
          const node = this.createUiRoot(name, parent, 104, 104);
          node.setPosition(position);
          this.drawPanel(node, 104, 104, new Color(43, 45, 50, 252));
          const label = this.createLabel(`${name}Label`, '', Vec3.ZERO, 92, 92, 14);
          label.color = new Color(218, 185, 105, 255);
          label.node.setParent(node);
          return label;
        }
        createPasscodeInput(parent, position) {
          const inputWidth = 250;
          const inputHeight = 52;
          const horizontalPadding = 2;
          const node = this.createUiRoot('PasscodeInput', parent, inputWidth, inputHeight);
          node.active = false;
          node.setPosition(position);
          this.drawPanel(node, inputWidth, inputHeight, new Color(25, 27, 31, 245));
          const textLabel = this.createLabel('TEXT_LABEL', '', Vec3.ZERO, inputWidth, inputHeight, 22);
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
            transform == null || transform.setAnchorPoint(0, 1);
            transform == null || transform.setContentSize(inputWidth - horizontalPadding, inputHeight);
            label.node.setPosition(-inputWidth * 0.5 + horizontalPadding, inputHeight * 0.5, label.node.position.z);
            label.verticalAlign = VerticalTextAlignment.CENTER;
          }
          editBox.string = '';
          editBox.placeholder = 'PASSCODE';
          editBox.maxLength = 4;
          editBox.inputMode = EditBox.InputMode.SINGLE_LINE;
          editBox.inputFlag = EditBox.InputFlag.INITIAL_CAPS_ALL_CHARACTERS;
          editBox.returnType = EditBox.KeyboardReturnType.DONE;
          const returnEvent = this.createEventHandler('submitPasscode');
          editBox.editingReturn.push(returnEvent);
          node.active = true;
          return editBox;
        }
        createOverlay(name, parent, width, height, color) {
          const node = this.createUiRoot(name, parent, width, height);
          this.stretchToParent(node);
          this.createSolidRect(node, 'Background', width, height, color);
          return node;
        }
        createUiRoot(name, parent, width, height) {
          const node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          node.setParent(parent);
          node.addComponent(UITransform).setContentSize(width, height);
          return node;
        }
        createLabel(name, text, position, width, height, fontSize) {
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
        createStatLabel(parent, name, value, x) {
          const label = this.createLabel(name, value, new Vec3(x, 0, 0), 120, 58, 15);
          label.lineHeight = 22;
          label.color = new Color(241, 242, 245, 255);
          label.node.setParent(parent);
          return label;
        }
        createButton(parent, name, text, position, handler, width, height, customEventData = '') {
          const buttonNode = this.createUiRoot(name, parent, width, height);
          buttonNode.setPosition(position);
          this.createSolidRect(buttonNode, 'Border', width, height, new Color(105, 108, 116, 255));
          this.createSolidRect(buttonNode, 'Fill', width - 2, height - 2, new Color(43, 45, 50, 246));
          this.createSolidRect(buttonNode, 'Highlight', width - 4, 2, new Color(174, 177, 184, 255), new Vec3(0, height * 0.5 - 3, 0));
          const button = buttonNode.addComponent(Button);
          button.target = buttonNode;
          button.transition = Button.Transition.SCALE;
          button.zoomScale = 1.035;
          button.duration = 0.08;
          button.clickEvents.push(this.createEventHandler(handler, customEventData));
          const label = this.createLabel(`${name}Label`, text, Vec3.ZERO, width - 16, height - 8, 17);
          label.node.setParent(buttonNode);
          return {
            button,
            label
          };
        }
        createEventHandler(handler, customEventData = '') {
          const event = new EventHandler();
          event.target = this.node;
          event.component = 'GameplayController';
          event.handler = handler;
          event.customEventData = customEventData;
          return event;
        }
        drawPanel(node, width, height, color) {
          this.createSolidRect(node, 'Border', width, height, new Color(92, 95, 102, 230));
          this.createSolidRect(node, 'Fill', width - 2, height - 2, color);
        }
        createSolidRect(parent, name, width, height, color, position = Vec3.ZERO) {
          const node = this.createUiRoot(name, parent, width, height);
          node.setPosition(position);
          const sprite = node.addComponent(Sprite);
          sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          sprite.spriteFrame = this.getSolidSpriteFrame();
          sprite.color = color;
          return sprite;
        }
        getSolidSpriteFrame() {
          if (!this.solidSpriteFrame) {
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = builtinResMgr.get('white-texture');
            this.solidSpriteFrame = spriteFrame;
          }
          return this.solidSpriteFrame;
        }
        stretchToParent(node) {
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
        alignCorner(node, side) {
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
        createFlatMaterial(color) {
          const material = new Material();
          material.initialize({
            effectName: 'builtin-unlit'
          });
          material.setProperty('mainColor', color);
          return material;
        }
        createLitMaterial(color, roughness) {
          const baseMaterial = this.litBaseMaterial;
          if (!baseMaterial) throw new Error('Gameplay lit material is not assigned');
          const material = new Material();
          material.copy(baseMaterial);
          material.setProperty('mainColor', color);
          material.setProperty('roughness', roughness);
          material.setProperty('metallic', 0);
          return material;
        }
        configureBlockShadows(renderer) {
          renderer.shadowCastingMode = MeshRenderer.ShadowCastingMode.ON;
          renderer.receiveShadow = MeshRenderer.ShadowReceivingMode.ON;
          renderer.shadowBias = 0.0005;
          renderer.shadowNormalBias = 0.02;
        }
      }, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "litBaseMaterial", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameplayController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './index.ts', './index2.ts', './index3.ts', './AudioController.ts', './BlockPresenter.ts', './BoardRenderer.ts', './CameraController.ts', './ReleaseSaveRepository.ts', './TouchInputController.ts', './PlatformAdapter.ts', './tutorialLevels.ts', './releaseSave.ts', './localization.ts', './onboarding.ts', './PuzzleEngine.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, Label, Node, EditBox, Button, _decorator, Component, game, Game, input, Input, view, KeyCode, getLevelIndexByPasscode, AudioController, BlockPresenter, BoardRenderer, CameraController, ReleaseSaveRepository, TouchInputController, createPlatformAdapter, chapterOneLevels, createDefaultReleaseSave, resetCampaignProgress, resumeSavedRun, getHighestUnlockedIndex, withUnlockedLevel, translate, nextGameLanguage, getLocalizedOnboardingCopy, languageDisplayName, onboardingTopics, pendingOnboardingTopics, PuzzleEngine;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
      Node = module.Node;
      EditBox = module.EditBox;
      Button = module.Button;
      _decorator = module._decorator;
      Component = module.Component;
      game = module.game;
      Game = module.Game;
      input = module.input;
      Input = module.Input;
      view = module.view;
      KeyCode = module.KeyCode;
    }, null, function (module) {
      getLevelIndexByPasscode = module.getLevelIndexByPasscode;
    }, null, function (module) {
      AudioController = module.AudioController;
    }, function (module) {
      BlockPresenter = module.BlockPresenter;
    }, function (module) {
      BoardRenderer = module.BoardRenderer;
    }, function (module) {
      CameraController = module.CameraController;
    }, function (module) {
      ReleaseSaveRepository = module.ReleaseSaveRepository;
    }, function (module) {
      TouchInputController = module.TouchInputController;
    }, function (module) {
      createPlatformAdapter = module.createPlatformAdapter;
    }, function (module) {
      chapterOneLevels = module.chapterOneLevels;
    }, function (module) {
      createDefaultReleaseSave = module.createDefaultReleaseSave;
      resetCampaignProgress = module.resetCampaignProgress;
      resumeSavedRun = module.resumeSavedRun;
      getHighestUnlockedIndex = module.getHighestUnlockedIndex;
      withUnlockedLevel = module.withUnlockedLevel;
    }, function (module) {
      translate = module.translate;
      nextGameLanguage = module.nextGameLanguage;
      getLocalizedOnboardingCopy = module.getLocalizedOnboardingCopy;
      languageDisplayName = module.languageDisplayName;
    }, function (module) {
      onboardingTopics = module.onboardingTopics;
      pendingOnboardingTopics = module.pendingOnboardingTopics;
    }, function (module) {
      PuzzleEngine = module.PuzzleEngine;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39, _descriptor40;
      cclegacy._RF.push({}, "7b3d51DOP1AVIv343HX8N1A", "GameplayController", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      const oppositeDirection = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
      };
      let GameplayController = exports('GameplayController', (_dec = ccclass('GameplayController'), _dec2 = property(BoardRenderer), _dec3 = property(BlockPresenter), _dec4 = property(CameraController), _dec5 = property(TouchInputController), _dec6 = property(AudioController), _dec7 = property(Label), _dec8 = property(Label), _dec9 = property(Label), _dec10 = property(Label), _dec11 = property(Node), _dec12 = property(Node), _dec13 = property(Node), _dec14 = property(Node), _dec15 = property(Node), _dec16 = property(Node), _dec17 = property(Node), _dec18 = property(Node), _dec19 = property(Node), _dec20 = property(Node), _dec21 = property(EditBox), _dec22 = property(Label), _dec23 = property(Label), _dec24 = property(Label), _dec25 = property(Label), _dec26 = property(Label), _dec27 = property(Button), _dec28 = property(Label), _dec29 = property(Label), _dec30 = property(Label), _dec31 = property(Label), _dec32 = property(Label), _dec33 = property(Label), _dec34 = property(Label), _dec35 = property(Label), _dec36 = property(Label), _dec37 = property(Label), _dec38 = property(Label), _dec39 = property(Label), _dec40 = property(Label), _dec41 = property(Node), _dec(_class = (_class2 = class GameplayController extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "board", _descriptor, this);
          _initializerDefineProperty(this, "block", _descriptor2, this);
          _initializerDefineProperty(this, "cameraController", _descriptor3, this);
          _initializerDefineProperty(this, "touchInput", _descriptor4, this);
          _initializerDefineProperty(this, "audioController", _descriptor5, this);
          _initializerDefineProperty(this, "levelStatLabel", _descriptor6, this);
          _initializerDefineProperty(this, "movesStatLabel", _descriptor7, this);
          _initializerDefineProperty(this, "timeStatLabel", _descriptor8, this);
          _initializerDefineProperty(this, "passcodeStatLabel", _descriptor9, this);
          _initializerDefineProperty(this, "gameplayHudRoot", _descriptor10, this);
          _initializerDefineProperty(this, "pauseMenuRoot", _descriptor11, this);
          _initializerDefineProperty(this, "titleMenuRoot", _descriptor12, this);
          _initializerDefineProperty(this, "stageSelectRoot", _descriptor13, this);
          _initializerDefineProperty(this, "howToPlayRoot", _descriptor14, this);
          _initializerDefineProperty(this, "creditsRoot", _descriptor15, this);
          _initializerDefineProperty(this, "newGameConfirmRoot", _descriptor16, this);
          _initializerDefineProperty(this, "failureRoot", _descriptor17, this);
          _initializerDefineProperty(this, "completionRoot", _descriptor18, this);
          _initializerDefineProperty(this, "tutorialRoot", _descriptor19, this);
          _initializerDefineProperty(this, "passcodeInput", _descriptor20, this);
          _initializerDefineProperty(this, "passcodeFeedback", _descriptor21, this);
          _initializerDefineProperty(this, "soundToggleLabel", _descriptor22, this);
          _initializerDefineProperty(this, "titleSoundLabel", _descriptor23, this);
          _initializerDefineProperty(this, "titleLanguageLabel", _descriptor24, this);
          _initializerDefineProperty(this, "pauseLanguageLabel", _descriptor25, this);
          _initializerDefineProperty(this, "resumeButton", _descriptor26, this);
          _initializerDefineProperty(this, "resumeButtonLabel", _descriptor27, this);
          _initializerDefineProperty(this, "failureReasonLabel", _descriptor28, this);
          _initializerDefineProperty(this, "completionStatsLabel", _descriptor29, this);
          _initializerDefineProperty(this, "completionContinueLabel", _descriptor30, this);
          _initializerDefineProperty(this, "tutorialTitleLabel", _descriptor31, this);
          _initializerDefineProperty(this, "tutorialSymbolLabel", _descriptor32, this);
          _initializerDefineProperty(this, "tutorialBodyLabel", _descriptor33, this);
          _initializerDefineProperty(this, "tutorialProgressLabel", _descriptor34, this);
          _initializerDefineProperty(this, "tutorialNextLabel", _descriptor35, this);
          _initializerDefineProperty(this, "howTopicTitleLabel", _descriptor36, this);
          _initializerDefineProperty(this, "howTopicSymbolLabel", _descriptor37, this);
          _initializerDefineProperty(this, "howTopicBodyLabel", _descriptor38, this);
          _initializerDefineProperty(this, "howTopicProgressLabel", _descriptor39, this);
          _initializerDefineProperty(this, "splitControlRoot", _descriptor40, this);
          this.stageButtons = [];
          this.stageButtonLabels = [];
          this.localizedLabels = {};
          this.platform = createPlatformAdapter();
          this.saveRepository = new ReleaseSaveRepository(chapterOneLevels);
          this.mode = 'title';
          this.levelIndex = 0;
          this.engine = null;
          this.bufferedMove = null;
          this.elapsedSeconds = 0;
          this.displayedSecond = -1;
          this.actionLog = [];
          this.saveData = createDefaultReleaseSave(chapterOneLevels);
          this.tutorialQueue = [];
          this.tutorialTotal = 0;
          this.howTopicIndex = 0;
          this.titleAttractEngine = null;
          this.titleAttractRoute = [];
          this.titleAttractStep = 0;
        }
        start() {
          var _this$audioController;
          if (this.touchInput) {
            this.touchInput.onMove = direction => this.requestMove(direction);
          }
          this.saveData = this.saveRepository.load();
          (_this$audioController = this.audioController) == null || _this$audioController.setSoundEnabled(this.saveData.soundEnabled);
          this.applyLocalization();
          game.on(Game.EVENT_HIDE, this.handleGameHide, this);
          input.on(Input.EventType.KEY_DOWN, this.handleKeyDown, this);
          this.showTitleMenu();
        }
        onDestroy() {
          this.stopTitleAttract();
          game.off(Game.EVENT_HIDE, this.handleGameHide, this);
          input.off(Input.EventType.KEY_DOWN, this.handleKeyDown, this);
        }
        update(deltaTime) {
          var _this$engine;
          const state = (_this$engine = this.engine) == null ? void 0 : _this$engine.getState();
          if (this.mode !== 'playing' || !state || state.completed || state.failed) return;
          this.elapsedSeconds += deltaTime;
          const second = Math.floor(this.elapsedSeconds);
          if (second !== this.displayedSecond) {
            this.displayedSecond = second;
            this.updateHud();
          }
        }
        startGame() {
          var _this$audioController2;
          (_this$audioController2 = this.audioController) == null || _this$audioController2.playUi();
          if (this.hasCampaignProgress()) {
            this.showOnly(this.newGameConfirmRoot);
            return;
          }
          this.confirmNewGame();
        }
        confirmNewGame() {
          var _this$audioController3;
          (_this$audioController3 = this.audioController) == null || _this$audioController3.playUi();
          this.saveData = resetCampaignProgress(this.saveData, chapterOneLevels);
          this.saveRepository.save(this.saveData);
          this.loadLevel(0);
        }
        cancelNewGame() {
          var _this$audioController4;
          (_this$audioController4 = this.audioController) == null || _this$audioController4.playUi();
          this.showTitleMenu();
        }
        resumeGame() {
          var _this$audioController5;
          const resumed = resumeSavedRun(this.saveData, chapterOneLevels);
          if (!resumed) {
            this.updateTitleMenu();
            return;
          }
          (_this$audioController5 = this.audioController) == null || _this$audioController5.playUi();
          this.presentRun(resumed.levelIndex, resumed.engine, resumed.actions, resumed.elapsedSeconds);
        }
        openStageSelect() {
          var _this$audioController6;
          (_this$audioController6 = this.audioController) == null || _this$audioController6.playUi();
          this.mode = 'stage-select';
          this.bufferedMove = null;
          this.refreshStageButtons();
          this.showOnly(this.stageSelectRoot);
        }
        selectStage(_event, customEventData) {
          var _this$audioController7;
          const index = Number.parseInt(customEventData, 10);
          if (!Number.isInteger(index) || index < 0 || index > getHighestUnlockedIndex(this.saveData, chapterOneLevels)) return;
          (_this$audioController7 = this.audioController) == null || _this$audioController7.playUi();
          this.loadLevel(index);
        }
        submitPasscode() {
          var _this$passcodeInput, _this$audioController8;
          const index = getLevelIndexByPasscode(((_this$passcodeInput = this.passcodeInput) == null ? void 0 : _this$passcodeInput.string) ?? '');
          if (index < 0) {
            if (this.passcodeFeedback) {
              this.passcodeFeedback.string = translate(this.saveData.language, 'invalidPasscode');
            }
            return;
          }
          (_this$audioController8 = this.audioController) == null || _this$audioController8.playUi();
          this.loadLevel(index);
        }
        showHowToPlay() {
          var _this$audioController9;
          (_this$audioController9 = this.audioController) == null || _this$audioController9.playUi();
          this.mode = 'how-to-play';
          this.bufferedMove = null;
          this.howTopicIndex = 0;
          this.updateHowToPlay();
          this.showOnly(this.howToPlayRoot);
        }
        previousHowTopic() {
          var _this$audioController10;
          if (this.mode !== 'how-to-play') return;
          (_this$audioController10 = this.audioController) == null || _this$audioController10.playUi();
          this.howTopicIndex = (this.howTopicIndex - 1 + onboardingTopics.length) % onboardingTopics.length;
          this.updateHowToPlay();
        }
        nextHowTopic() {
          var _this$audioController11;
          if (this.mode !== 'how-to-play') return;
          (_this$audioController11 = this.audioController) == null || _this$audioController11.playUi();
          this.howTopicIndex = (this.howTopicIndex + 1) % onboardingTopics.length;
          this.updateHowToPlay();
        }
        acknowledgeTutorial() {
          var _this$audioController12;
          if (this.mode !== 'tutorial' || this.tutorialQueue.length === 0) return;
          (_this$audioController12 = this.audioController) == null || _this$audioController12.playUi();
          this.acknowledgeTopics([this.tutorialQueue[0]]);
          this.tutorialQueue.shift();
          this.advanceTutorial();
        }
        skipTutorial() {
          var _this$audioController13;
          if (this.mode !== 'tutorial') return;
          (_this$audioController13 = this.audioController) == null || _this$audioController13.playUi();
          this.acknowledgeTopics(this.tutorialQueue);
          this.tutorialQueue = [];
          this.advanceTutorial();
        }
        showCredits() {
          var _this$audioController14;
          (_this$audioController14 = this.audioController) == null || _this$audioController14.playUi();
          this.mode = 'credits';
          this.bufferedMove = null;
          this.showOnly(this.creditsRoot);
        }
        returnToTitle() {
          var _this$audioController15;
          (_this$audioController15 = this.audioController) == null || _this$audioController15.playUi();
          this.showTitleMenu();
        }
        openMenu() {
          var _this$block, _this$audioController16;
          if (this.mode !== 'playing' || (_this$block = this.block) != null && _this$block.isBusy()) return;
          (_this$audioController16 = this.audioController) == null || _this$audioController16.playUi();
          this.persistCurrentRun();
          this.mode = 'paused';
          this.bufferedMove = null;
          if (this.pauseMenuRoot) this.pauseMenuRoot.active = true;
          this.updateSoundLabels();
        }
        returnToGame() {
          var _this$audioController17;
          if (this.mode !== 'paused') return;
          (_this$audioController17 = this.audioController) == null || _this$audioController17.playUi();
          this.mode = 'playing';
          if (this.pauseMenuRoot) this.pauseMenuRoot.active = false;
          this.updateHud();
        }
        toggleSound() {
          var _this$audioController18, _this$audioController19;
          const enabled = ((_this$audioController18 = this.audioController) == null ? void 0 : _this$audioController18.toggleSound()) ?? true;
          this.saveData = {
            ...this.saveData,
            soundEnabled: enabled
          };
          this.saveRepository.save(this.saveData);
          if (enabled) (_this$audioController19 = this.audioController) == null || _this$audioController19.playUi();
          this.updateSoundLabels();
        }
        cycleLanguage() {
          var _this$audioController20;
          (_this$audioController20 = this.audioController) == null || _this$audioController20.playUi();
          this.saveData = {
            ...this.saveData,
            language: nextGameLanguage(this.saveData.language)
          };
          this.saveRepository.save(this.saveData);
          this.applyLocalization();
        }
        switchCube() {
          var _this$engine2, _this$block2, _this$audioController21, _this$block3;
          if (this.mode !== 'playing' || !((_this$engine2 = this.engine) != null && _this$engine2.getState().split) || (_this$block2 = this.block) != null && _this$block2.isBusy()) return;
          (_this$audioController21 = this.audioController) == null || _this$audioController21.playUi();
          const state = this.engine.switchActiveCube();
          this.actionLog.push('switch-cube');
          (_this$block3 = this.block) == null || _this$block3.snapTo(state);
          this.persistCurrentRun();
          this.updateHud();
        }
        quitToMenu() {
          var _this$audioController22;
          if (this.mode !== 'paused') return;
          (_this$audioController22 = this.audioController) == null || _this$audioController22.playUi();
          this.persistCurrentRun();
          this.showTitleMenu();
        }
        retryLevel() {
          var _this$audioController23;
          if (this.mode !== 'failed') return;
          (_this$audioController23 = this.audioController) == null || _this$audioController23.playUi();
          this.loadLevel(this.levelIndex);
        }
        replayLevel() {
          var _this$audioController24;
          if (this.mode !== 'completed') return;
          (_this$audioController24 = this.audioController) == null || _this$audioController24.playUi();
          this.loadLevel(this.levelIndex);
        }
        continueAfterComplete() {
          var _this$audioController25;
          if (this.mode !== 'completed') return;
          (_this$audioController25 = this.audioController) == null || _this$audioController25.playUi();
          if (this.levelIndex + 1 < chapterOneLevels.length) this.loadLevel(this.levelIndex + 1);else this.showTitleMenu();
        }
        quitResultToMenu() {
          var _this$audioController26;
          if (this.mode !== 'failed' && this.mode !== 'completed') return;
          (_this$audioController26 = this.audioController) == null || _this$audioController26.playUi();
          this.showTitleMenu();
        }
        requestMove(direction) {
          var _this$audioController27;
          if (this.mode !== 'playing' || !this.engine || !this.block) return;
          const state = this.engine.getState();
          if (state.completed || state.failed) return;
          if (this.block.isBusy()) {
            this.bufferedMove = direction;
            return;
          }
          (_this$audioController27 = this.audioController) == null || _this$audioController27.beginInteraction();
          const result = this.engine.move(direction);
          this.presentMove(result);
        }
        loadLevel(index) {
          this.presentRun(index, new PuzzleEngine(chapterOneLevels[index]), [], 0);
        }
        presentRun(index, engine, actions, elapsedSeconds) {
          var _this$board, _this$board2, _this$block4, _this$cameraControlle;
          this.stopTitleAttract();
          this.bufferedMove = null;
          this.levelIndex = index;
          this.engine = engine;
          this.actionLog = [...actions];
          this.elapsedSeconds = elapsedSeconds;
          this.displayedSecond = Math.floor(elapsedSeconds);
          this.mode = 'playing';
          this.hideAllOverlays();
          if (this.gameplayHudRoot) this.gameplayHudRoot.active = true;
          const level = chapterOneLevels[index];
          (_this$board = this.board) == null || _this$board.render(level);
          const state = engine.getState();
          (_this$board2 = this.board) == null || _this$board2.applyState(state);
          (_this$block4 = this.block) == null || _this$block4.snapTo(state);
          (_this$cameraControlle = this.cameraController) == null || _this$cameraControlle.frameLevel(level);
          this.platform.onLevelStarted(level.id);
          this.persistCurrentRun();
          this.updateHud();
          this.startAutomaticTutorial(level);
        }
        showTitleMenu() {
          var _this$board3, _this$board4, _this$block5, _this$cameraControlle2;
          this.stopTitleAttract();
          this.mode = 'title';
          this.bufferedMove = null;
          this.engine = null;
          this.actionLog = [];
          if (this.gameplayHudRoot) this.gameplayHudRoot.active = false;
          this.showOnly(this.titleMenuRoot);
          if (this.passcodeInput) this.passcodeInput.string = '';
          if (this.passcodeFeedback) this.passcodeFeedback.string = '';
          const attractIndex = Math.min(2, chapterOneLevels.length - 1);
          const level = chapterOneLevels[attractIndex];
          const attractEngine = new PuzzleEngine(level);
          const forwardRoute = (level.solution ?? []).filter(action => action !== 'switch-cube').slice(0, -1);
          this.titleAttractEngine = attractEngine;
          this.titleAttractRoute = [...forwardRoute, ...[...forwardRoute].reverse().map(direction => oppositeDirection[direction])];
          this.titleAttractStep = 0;
          (_this$board3 = this.board) == null || _this$board3.render(level);
          (_this$board4 = this.board) == null || _this$board4.applyState(attractEngine.getState());
          (_this$block5 = this.block) == null || _this$block5.startAttract(attractEngine.getState());
          const titleScreenOffset = Math.min(0.45, 390 / Math.max(1, view.getVisibleSize().width));
          (_this$cameraControlle2 = this.cameraController) == null || _this$cameraControlle2.frameLevel(level, titleScreenOffset);
          this.scheduleOnce(this.advanceTitleAttract, 0.55);
          this.updateTitleMenu();
        }
        advanceTitleAttract() {
          const engine = this.titleAttractEngine;
          const block = this.block;
          const direction = this.titleAttractRoute[this.titleAttractStep];
          if (this.mode !== 'title' || !engine || !block || !direction) return;
          const result = engine.move(direction);
          block.playMove(result, () => {
            var _this$board5;
            if (this.mode !== 'title' || this.titleAttractEngine !== engine) return;
            (_this$board5 = this.board) == null || _this$board5.applyState(result.current);
            this.titleAttractStep = (this.titleAttractStep + 1) % this.titleAttractRoute.length;
            this.scheduleOnce(this.advanceTitleAttract, 0.24);
          }, 2);
        }
        stopTitleAttract() {
          var _this$block6;
          this.unschedule(this.advanceTitleAttract);
          this.titleAttractEngine = null;
          this.titleAttractRoute = [];
          this.titleAttractStep = 0;
          (_this$block6 = this.block) == null || _this$block6.stopAttract();
        }
        presentMove(result) {
          if (!this.block || !this.engine) return;
          this.block.playMove(result, () => {
            var _this$board6, _this$audioController29;
            (_this$board6 = this.board) == null || _this$board6.applyState(result.current);
            if (result.status === 'fallen') {
              var _this$audioController28, _this$block7;
              (_this$audioController28 = this.audioController) == null || _this$audioController28.playFall();
              this.platform.vibrateLight();
              this.updateHud();
              (_this$block7 = this.block) == null || _this$block7.playFall(result, () => this.showFailure(result));
              return;
            }
            (_this$audioController29 = this.audioController) == null || _this$audioController29.playMove();
            this.actionLog.push(result.direction);
            this.updateHud();
            if (result.status === 'completed') {
              this.completeLevel(result);
              return;
            }
            this.persistCurrentRun();
            const buffered = this.bufferedMove;
            this.bufferedMove = null;
            if (buffered) this.requestMove(buffered);
          });
        }
        showFailure(result) {
          this.mode = 'failed';
          this.bufferedMove = null;
          if (this.failureReasonLabel) {
            var _result$message;
            this.failureReasonLabel.string = (_result$message = result.message) != null && _result$message.includes('fragile') ? translate(this.saveData.language, 'failureFragile') : translate(this.saveData.language, 'failureVoid');
          }
          this.hideAllOverlays();
          if (this.failureRoot) this.failureRoot.active = true;
        }
        completeLevel(result) {
          var _this$audioController30, _this$block8;
          (_this$audioController30 = this.audioController) == null || _this$audioController30.playComplete();
          this.platform.onLevelCompleted(result.current.levelId, result.current.steps);
          this.platform.vibrateLight();
          const nextIndex = Math.min(this.levelIndex + 1, chapterOneLevels.length - 1);
          this.saveData = withUnlockedLevel(this.saveData, nextIndex, chapterOneLevels);
          this.saveData = {
            ...this.saveData,
            currentRun: this.levelIndex + 1 < chapterOneLevels.length ? {
              levelId: chapterOneLevels[this.levelIndex + 1].id,
              actions: [],
              elapsedSeconds: 0
            } : null
          };
          this.saveRepository.save(this.saveData);
          if (this.completionStatsLabel) {
            this.completionStatsLabel.string = translate(this.saveData.language, 'completionStats', {
              moves: result.current.steps,
              time: this.formattedTime(),
              passcode: chapterOneLevels[this.levelIndex].passcode
            });
          }
          if (this.completionContinueLabel) {
            this.completionContinueLabel.string = this.levelIndex + 1 < chapterOneLevels.length ? translate(this.saveData.language, 'continue') : translate(this.saveData.language, 'returnToMenu');
          }
          (_this$block8 = this.block) == null || _this$block8.playGoalDrop(() => {
            this.mode = 'completed';
            this.bufferedMove = null;
            this.hideAllOverlays();
            if (this.completionRoot) this.completionRoot.active = true;
          });
        }
        handleGameHide() {
          this.persistCurrentRun();
          if (this.mode !== 'playing') return;
          this.mode = 'paused';
          this.bufferedMove = null;
          if (this.pauseMenuRoot) this.pauseMenuRoot.active = true;
          this.updateSoundLabels();
        }
        handleKeyDown(event) {
          if (event.keyCode !== KeyCode.MOBILE_BACK && event.keyCode !== KeyCode.ESCAPE) return;
          if (this.mode === 'playing') {
            this.openMenu();
            return;
          }
          if (this.mode === 'paused') {
            this.returnToGame();
            return;
          }
          if (this.mode === 'tutorial') {
            this.skipTutorial();
            return;
          }
          if (this.mode !== 'title') this.showTitleMenu();
        }
        persistCurrentRun() {
          var _this$engine3;
          const state = (_this$engine3 = this.engine) == null ? void 0 : _this$engine3.getState();
          if (!state || state.failed || state.completed) return;
          this.saveData = {
            ...this.saveData,
            currentRun: {
              levelId: chapterOneLevels[this.levelIndex].id,
              actions: [...this.actionLog],
              elapsedSeconds: this.elapsedSeconds
            }
          };
          this.saveRepository.save(this.saveData);
        }
        startAutomaticTutorial(level) {
          this.tutorialQueue = pendingOnboardingTopics(level, this.saveData.acknowledgedTutorials);
          this.tutorialTotal = this.tutorialQueue.length;
          if (this.tutorialQueue.length === 0) return;
          this.mode = 'tutorial';
          this.bufferedMove = null;
          this.hideAllOverlays();
          if (this.tutorialRoot) this.tutorialRoot.active = true;
          this.updateTutorial();
        }
        advanceTutorial() {
          if (this.tutorialQueue.length > 0) {
            this.updateTutorial();
            return;
          }
          this.mode = 'playing';
          if (this.tutorialRoot) this.tutorialRoot.active = false;
          this.updateHud();
        }
        acknowledgeTopics(topics) {
          const acknowledged = new Set(this.saveData.acknowledgedTutorials);
          for (const topic of topics) acknowledged.add(topic.id);
          this.saveData = {
            ...this.saveData,
            acknowledgedTutorials: [...acknowledged]
          };
          this.saveRepository.save(this.saveData);
        }
        updateTutorial() {
          const topic = this.tutorialQueue[0];
          if (!topic) return;
          const copy = getLocalizedOnboardingCopy(this.saveData.language, topic.id);
          if (this.tutorialTitleLabel) this.tutorialTitleLabel.string = copy.title;
          if (this.tutorialSymbolLabel) this.tutorialSymbolLabel.string = copy.symbol;
          if (this.tutorialBodyLabel) this.tutorialBodyLabel.string = copy.body;
          if (this.tutorialProgressLabel) {
            const position = this.tutorialTotal - this.tutorialQueue.length + 1;
            this.tutorialProgressLabel.string = `${position} / ${this.tutorialTotal}`;
          }
          if (this.tutorialNextLabel) {
            this.tutorialNextLabel.string = this.tutorialQueue.length === 1 ? translate(this.saveData.language, 'gotIt') : translate(this.saveData.language, 'next');
          }
        }
        updateHowToPlay() {
          const topic = onboardingTopics[this.howTopicIndex];
          if (!topic) return;
          const copy = getLocalizedOnboardingCopy(this.saveData.language, topic.id);
          if (this.howTopicTitleLabel) this.howTopicTitleLabel.string = copy.title;
          if (this.howTopicSymbolLabel) this.howTopicSymbolLabel.string = copy.symbol;
          if (this.howTopicBodyLabel) this.howTopicBodyLabel.string = copy.body;
          if (this.howTopicProgressLabel) {
            this.howTopicProgressLabel.string = `${this.howTopicIndex + 1} / ${onboardingTopics.length}`;
          }
        }
        refreshStageButtons() {
          const highest = getHighestUnlockedIndex(this.saveData, chapterOneLevels);
          this.stageButtons.forEach((button, index) => {
            const unlocked = index <= highest;
            button.interactable = unlocked;
            const label = this.stageButtonLabels[index];
            if (label) {
              label.string = unlocked ? this.twoDigits(index + 1) : '--';
              label.color.set(unlocked ? 241 : 104, unlocked ? 242 : 107, unlocked ? 245 : 114, 255);
            }
          });
        }
        updateTitleMenu() {
          const resumed = resumeSavedRun(this.saveData, chapterOneLevels);
          if (this.resumeButton) this.resumeButton.interactable = resumed !== null;
          if (this.resumeButtonLabel) {
            this.resumeButtonLabel.string = resumed ? translate(this.saveData.language, 'resumeGameStage', {
              stage: this.twoDigits(resumed.levelIndex + 1)
            }) : translate(this.saveData.language, 'resumeGame');
            this.resumeButtonLabel.color.set(resumed ? 245 : 104, resumed ? 242 : 107, resumed ? 236 : 114, 255);
          }
          this.updateSoundLabels();
        }
        updateHud() {
          var _this$engine4;
          const state = (_this$engine4 = this.engine) == null ? void 0 : _this$engine4.getState();
          if (!state) return;
          const level = chapterOneLevels[this.levelIndex];
          if (this.levelStatLabel) {
            this.levelStatLabel.string = `${translate(this.saveData.language, 'level')}\n${this.twoDigits(this.levelIndex + 1)} / ${chapterOneLevels.length}`;
          }
          if (this.movesStatLabel) {
            this.movesStatLabel.string = `${translate(this.saveData.language, 'moves')}\n${state.steps}`;
          }
          if (this.timeStatLabel) {
            this.timeStatLabel.string = `${translate(this.saveData.language, 'time')}\n${this.formattedTime()}`;
          }
          if (this.passcodeStatLabel) {
            this.passcodeStatLabel.string = `${translate(this.saveData.language, 'passcode')}\n${level.passcode}`;
          }
          if (this.splitControlRoot) {
            this.splitControlRoot.active = this.mode === 'playing' && state.split !== null;
          }
        }
        updateSoundLabels() {
          var _this$audioController31;
          const state = translate(this.saveData.language, ((_this$audioController31 = this.audioController) == null ? void 0 : _this$audioController31.isSoundEnabled()) === false ? 'soundOff' : 'soundOn');
          const text = translate(this.saveData.language, 'soundSetting', {
            state
          });
          if (this.soundToggleLabel) this.soundToggleLabel.string = text;
          if (this.titleSoundLabel) this.titleSoundLabel.string = text;
        }
        applyLocalization() {
          var _this$passcodeFeedbac;
          const language = this.saveData.language;
          for (const key of Object.keys(this.localizedLabels)) {
            for (const label of this.localizedLabels[key] ?? []) {
              label.string = translate(language, key);
            }
          }
          const passcodeText = translate(language, 'passcode');
          if (this.passcodeInput) this.passcodeInput.placeholder = passcodeText;
          if ((_this$passcodeFeedbac = this.passcodeFeedback) != null && _this$passcodeFeedbac.string) {
            this.passcodeFeedback.string = translate(language, 'invalidPasscode');
          }
          const languageText = translate(language, 'languageSetting', {
            language: languageDisplayName(language)
          });
          if (this.titleLanguageLabel) this.titleLanguageLabel.string = languageText;
          if (this.pauseLanguageLabel) this.pauseLanguageLabel.string = languageText;
          this.updateTitleMenu();
          this.updateHud();
          if (this.mode === 'tutorial') this.updateTutorial();
          if (this.mode === 'how-to-play') this.updateHowToPlay();
        }
        showOnly(root) {
          this.hideAllOverlays();
          if (root) root.active = true;
        }
        hideAllOverlays() {
          for (const root of [this.titleMenuRoot, this.pauseMenuRoot, this.stageSelectRoot, this.howToPlayRoot, this.creditsRoot, this.newGameConfirmRoot, this.failureRoot, this.completionRoot, this.tutorialRoot]) {
            if (root) root.active = false;
          }
        }
        hasCampaignProgress() {
          return this.saveData.currentRun !== null || getHighestUnlockedIndex(this.saveData, chapterOneLevels) > 0;
        }
        formattedTime() {
          const minutes = Math.floor(this.elapsedSeconds / 60);
          const seconds = Math.floor(this.elapsedSeconds % 60);
          return `${this.twoDigits(minutes)}:${this.twoDigits(seconds)}`;
        }
        twoDigits(value) {
          return value < 10 ? `0${value}` : String(value);
        }
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "board", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "block", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "cameraController", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "touchInput", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "audioController", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "levelStatLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "movesStatLabel", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "timeStatLabel", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "passcodeStatLabel", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "gameplayHudRoot", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "pauseMenuRoot", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "titleMenuRoot", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "stageSelectRoot", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "howToPlayRoot", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "creditsRoot", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "newGameConfirmRoot", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "failureRoot", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "completionRoot", [_dec19], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "tutorialRoot", [_dec20], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "passcodeInput", [_dec21], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "passcodeFeedback", [_dec22], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "soundToggleLabel", [_dec23], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "titleSoundLabel", [_dec24], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "titleLanguageLabel", [_dec25], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "pauseLanguageLabel", [_dec26], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "resumeButton", [_dec27], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "resumeButtonLabel", [_dec28], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "failureReasonLabel", [_dec29], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "completionStatsLabel", [_dec30], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "completionContinueLabel", [_dec31], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor31 = _applyDecoratedDescriptor(_class2.prototype, "tutorialTitleLabel", [_dec32], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor32 = _applyDecoratedDescriptor(_class2.prototype, "tutorialSymbolLabel", [_dec33], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor33 = _applyDecoratedDescriptor(_class2.prototype, "tutorialBodyLabel", [_dec34], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor34 = _applyDecoratedDescriptor(_class2.prototype, "tutorialProgressLabel", [_dec35], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor35 = _applyDecoratedDescriptor(_class2.prototype, "tutorialNextLabel", [_dec36], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor36 = _applyDecoratedDescriptor(_class2.prototype, "howTopicTitleLabel", [_dec37], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor37 = _applyDecoratedDescriptor(_class2.prototype, "howTopicSymbolLabel", [_dec38], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor38 = _applyDecoratedDescriptor(_class2.prototype, "howTopicBodyLabel", [_dec39], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor39 = _applyDecoratedDescriptor(_class2.prototype, "howTopicProgressLabel", [_dec40], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor40 = _applyDecoratedDescriptor(_class2.prototype, "splitControlRoot", [_dec41], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/HarmonyOSAdapter.ts", ['cc', './PlatformAdapter.ts'], function (exports) {
  var cclegacy, DefaultPlatformAdapter;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      DefaultPlatformAdapter = module.DefaultPlatformAdapter;
    }],
    execute: function () {
      cclegacy._RF.push({}, "423dcPFj4pFGpAKyqynG4Le", "HarmonyOSAdapter", undefined);
      class HarmonyOSAdapter extends DefaultPlatformAdapter {
        constructor(...args) {
          super(...args);
          this.name = 'harmonyos-next';
        }
        getSafeAreaInsets() {
          return super.getSafeAreaInsets();
        }
        vibrateLight() {
          super.vibrateLight();
        }
      }
      exports('HarmonyOSAdapter', HarmonyOSAdapter);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/index.ts", ['cc', './coords.ts', './level.ts', './localization.ts', './movement.ts', './onboarding.ts', './PuzzleEngine.ts', './releaseSave.ts', './solver.ts', './types.ts'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      var _setter = {};
      _setter.boundsForCells = module.boundsForCells;
      _setter.coordKey = module.coordKey;
      _setter.occupiedCells = module.occupiedCells;
      _setter.sameCoord = module.sameCoord;
      exports(_setter);
    }, function (module) {
      var _setter = {};
      _setter.LevelMap = module.LevelMap;
      _setter.assertValidLevel = module.assertValidLevel;
      _setter.validateLevel = module.validateLevel;
      exports(_setter);
    }, function (module) {
      var _setter = {};
      _setter.gameLanguages = module.gameLanguages;
      _setter.getLocalizedOnboardingCopy = module.getLocalizedOnboardingCopy;
      _setter.hasCompleteLocalizationCatalogs = module.hasCompleteLocalizationCatalogs;
      _setter.isGameLanguage = module.isGameLanguage;
      _setter.languageDisplayName = module.languageDisplayName;
      _setter.languageFromLocale = module.languageFromLocale;
      _setter.nextGameLanguage = module.nextGameLanguage;
      _setter.translate = module.translate;
      exports(_setter);
    }, function (module) {
      exports('rollBlock', module.rollBlock);
    }, function (module) {
      var _setter = {};
      _setter.onboardingTopics = module.onboardingTopics;
      _setter.onboardingTopicsForLevel = module.onboardingTopicsForLevel;
      _setter.pendingOnboardingTopics = module.pendingOnboardingTopics;
      exports(_setter);
    }, function (module) {
      exports('PuzzleEngine', module.PuzzleEngine);
    }, function (module) {
      var _setter = {};
      _setter.RELEASE_SAVE_VERSION = module.RELEASE_SAVE_VERSION;
      _setter.createDefaultReleaseSave = module.createDefaultReleaseSave;
      _setter.decodeReleaseSave = module.decodeReleaseSave;
      _setter.getHighestUnlockedIndex = module.getHighestUnlockedIndex;
      _setter.normalizeReleaseSave = module.normalizeReleaseSave;
      _setter.resetCampaignProgress = module.resetCampaignProgress;
      _setter.resumeSavedRun = module.resumeSavedRun;
      _setter.serializeReleaseSave = module.serializeReleaseSave;
      _setter.tutorialTopicIds = module.tutorialTopicIds;
      _setter.withUnlockedLevel = module.withUnlockedLevel;
      exports(_setter);
    }, function (module) {
      exports('findSolution', module.findSolution);
    }, null],
    execute: function () {
      cclegacy._RF.push({}, "19bddwLi/VO64Wr/PRa8ACk", "index", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/index2.ts", ['cc', './index.ts', './tutorialLevels.ts', './level.ts', './PuzzleEngine.ts'], function (exports) {
  var cclegacy, tutorialLevels, chapterOneLevels, validateLevel, PuzzleEngine;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      tutorialLevels = module.tutorialLevels;
      chapterOneLevels = module.chapterOneLevels;
      var _setter = {};
      _setter.chapterOneLevels = module.chapterOneLevels;
      _setter.tutorialLevels = module.tutorialLevels;
      exports(_setter);
    }, function (module) {
      validateLevel = module.validateLevel;
    }, function (module) {
      PuzzleEngine = module.PuzzleEngine;
    }],
    execute: function () {
      exports({
        getLevelById: getLevelById,
        getLevelIndexByPasscode: getLevelIndexByPasscode,
        validateTutorialContent: validateTutorialContent
      });
      cclegacy._RF.push({}, "24a5fk7nYVO9o7GJDJbgEgT", "index", undefined);
      function getLevelById(id) {
        return tutorialLevels.find(level => level.id === id);
      }
      function getLevelIndexByPasscode(input) {
        const normalized = input.trim().toUpperCase();
        if (!/^[A-Z]{4}$/.test(normalized)) {
          return -1;
        }
        return chapterOneLevels.findIndex(level => level.passcode === normalized);
      }
      function validateTutorialContent() {
        const errors = [];
        const seenIds = new Set();
        const seenTitles = new Set();
        const seenPasscodes = new Set();
        const disallowedTerms = ['bloxorz'];
        if (chapterOneLevels.length !== 33) {
          errors.push(`The campaign must contain 33 levels, found ${chapterOneLevels.length}.`);
        }
        for (const level of tutorialLevels) {
          if (seenIds.has(level.id)) {
            errors.push(`Duplicate level id: ${level.id}`);
          }
          seenIds.add(level.id);
          if (seenTitles.has(level.title)) {
            errors.push(`Duplicate level title: ${level.title}`);
          }
          seenTitles.add(level.title);
          if (!/^[A-Z]{4}$/.test(level.passcode)) {
            errors.push(`${level.id}: passcode must contain exactly four uppercase ASCII letters.`);
          } else if (seenPasscodes.has(level.passcode)) {
            errors.push(`${level.id}: duplicate passcode: ${level.passcode}`);
          }
          seenPasscodes.add(level.passcode);
          const validation = validateLevel(level);
          errors.push(...validation.errors.map(error => `${level.id}: ${error}`));
          const title = level.title.toLowerCase();
          for (const term of disallowedTerms) {
            if (title.includes(term)) {
              errors.push(`${level.id}: title must not include protected source branding.`);
            }
          }
          if (!level.solution || level.solution.length === 0) {
            errors.push(`${level.id}: solution is required for first playable verification.`);
            continue;
          }
          const moveCount = level.solution.filter(action => action !== 'switch-cube').length;
          if (level.par !== moveCount) {
            errors.push(`${level.id}: par must match the reviewed solution length.`);
          }
          const boardCells = [...level.tiles, ...(level.bridges ?? []).reduce((cells, bridge) => [...cells, ...bridge.cells], []), ...(level.splits ?? []).reduce((cells, split) => [...cells, ...split.destinations], []), level.goal];
          const xs = boardCells.map(cell => cell.x);
          const zs = boardCells.map(cell => cell.z);
          const width = Math.max(...xs) - Math.min(...xs) + 1;
          const depth = Math.max(...zs) - Math.min(...zs) + 1;
          if (width > 13 || depth > 13) {
            errors.push(`${level.id}: board bounds exceed the mobile campaign limit.`);
          }
          const engine = new PuzzleEngine(level);
          for (const action of level.solution) {
            if (action === 'switch-cube') {
              if (!engine.getState().split) {
                errors.push(`${level.id}: solution switches cubes outside split mode.`);
                break;
              }
              engine.switchActiveCube();
            } else {
              const result = engine.move(action);
              if (result.status === 'invalid' || result.status === 'fallen') {
                errors.push(`${level.id}: solution contains a ${result.status} ${action} action.`);
                break;
              }
            }
          }
          const state = engine.getState();
          if (!state.completed) {
            errors.push(`${level.id}: documented solution does not complete the level.`);
          }
        }
        return errors;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/index3.ts", ['cc', './PlatformAdapter.ts', './HarmonyOSAdapter.ts'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      var _setter = {};
      _setter.DefaultPlatformAdapter = module.DefaultPlatformAdapter;
      _setter.createPlatformAdapter = module.createPlatformAdapter;
      exports(_setter);
    }, function (module) {
      exports('HarmonyOSAdapter', module.HarmonyOSAdapter);
    }],
    execute: function () {
      cclegacy._RF.push({}, "bafa25wH5NGjp/YO8RMXj+R", "index", undefined);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/level.ts", ['cc', './coords.ts'], function (exports) {
  var cclegacy, coordKey, occupiedCells;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      coordKey = module.coordKey;
      occupiedCells = module.occupiedCells;
    }],
    execute: function () {
      exports({
        assertValidLevel: assertValidLevel,
        validateLevel: validateLevel
      });
      cclegacy._RF.push({}, "88b27JFm0VBk5jti6ubvkID", "level", undefined);
      const tileTypes = new Set(['normal', 'fragile', 'soft-switch', 'hard-switch', 'split']);
      class LevelMap {
        constructor(definition) {
          this.tilesByCoord = void 0;
          this.bridgeIdByCoord = void 0;
          this.switchesByCoord = void 0;
          this.splitsByCoord = void 0;
          this.definition = definition;
          this.tilesByCoord = new Map(definition.tiles.map(tile => [coordKey(tile), tile]));
          const bridgeEntries = [];
          for (const bridge of definition.bridges ?? []) {
            for (const cell of bridge.cells) bridgeEntries.push([coordKey(cell), bridge.id]);
          }
          this.bridgeIdByCoord = new Map(bridgeEntries);
          this.switchesByCoord = new Map((definition.switches ?? []).map(item => [coordKey(item), item]));
          this.splitsByCoord = new Map((definition.splits ?? []).map(item => [coordKey(item), item]));
        }
        hasStaticTile(coord) {
          return this.tilesByCoord.has(coordKey(coord));
        }
        tileAt(coord) {
          return this.tilesByCoord.get(coordKey(coord));
        }
        switchAt(coord) {
          return this.switchesByCoord.get(coordKey(coord));
        }
        splitAt(coord) {
          return this.splitsByCoord.get(coordKey(coord));
        }
        supports(cells, bridgeStates) {
          return cells.every(cell => this.supportsCell(cell, bridgeStates));
        }
        supportedCells(cells, bridgeStates) {
          return cells.filter(cell => this.supportsCell(cell, bridgeStates));
        }
        supportsCell(coord, bridgeStates) {
          if (this.hasStaticTile(coord)) return true;
          const bridgeId = this.bridgeIdByCoord.get(coordKey(coord));
          return bridgeId ? bridgeStates[bridgeId] === true : false;
        }
      }
      exports('LevelMap', LevelMap);
      function validateLevel(level) {
        const errors = [];
        const staticKeys = new Set();
        const potentialSupportKeys = new Set();
        if (!level.id.trim()) errors.push('Level id is required.');
        if (!level.title.trim()) errors.push('Level title is required.');
        if (!level.author.trim()) errors.push('Level author is required.');
        if (level.original !== true) errors.push('Level must be marked as original content.');
        if (level.tiles.length === 0) errors.push('Level must contain at least one tile.');
        for (const tile of level.tiles) {
          const key = coordKey(tile);
          if (staticKeys.has(key)) errors.push(`Duplicate tile at ${key}.`);
          staticKeys.add(key);
          potentialSupportKeys.add(key);
          if (!tileTypes.has(tile.type)) errors.push(`Unsupported tile type at ${key}.`);
        }
        const bridgeIds = new Set();
        for (const bridge of level.bridges ?? []) {
          if (!bridge.id.trim()) errors.push('Bridge id is required.');
          if (bridgeIds.has(bridge.id)) errors.push(`Duplicate bridge id: ${bridge.id}.`);
          bridgeIds.add(bridge.id);
          if (bridge.cells.length === 0) errors.push(`Bridge ${bridge.id} must contain at least one cell.`);
          for (const cell of bridge.cells) {
            const key = coordKey(cell);
            if (potentialSupportKeys.has(key)) errors.push(`Duplicate support cell at ${key}.`);
            potentialSupportKeys.add(key);
          }
        }
        for (const cell of occupiedCells(level.start)) {
          if (!staticKeys.has(coordKey(cell))) {
            errors.push(`Start cell ${coordKey(cell)} must be a static board tile.`);
          }
        }
        const goalKey = coordKey(level.goal);
        if (potentialSupportKeys.has(goalKey)) {
          errors.push(`Goal hole ${goalKey} must not contain a supporting tile.`);
        }
        for (let zOffset = -1; zOffset <= 1; zOffset += 1) {
          for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
            if (xOffset === 0 && zOffset === 0) continue;
            const neighbor = coordKey({
              x: level.goal.x + xOffset,
              z: level.goal.z + zOffset
            });
            if (!potentialSupportKeys.has(neighbor)) {
              errors.push(`Goal hole ${goalKey} is not surrounded by board cells; missing ${neighbor}.`);
            }
          }
        }
        const switchKeys = new Set();
        for (const item of level.switches ?? []) {
          const key = coordKey(item);
          if (switchKeys.has(key)) errors.push(`Duplicate switch definition at ${key}.`);
          switchKeys.add(key);
          const tile = level.tiles.find(candidate => coordKey(candidate) === key);
          if ((tile == null ? void 0 : tile.type) !== 'soft-switch' && (tile == null ? void 0 : tile.type) !== 'hard-switch') {
            errors.push(`Switch definition ${key} must reference a switch tile.`);
          }
          if (item.actions.length === 0) errors.push(`Switch ${key} must contain at least one action.`);
          for (const action of item.actions) {
            if (!bridgeIds.has(action.bridgeId)) {
              errors.push(`Switch ${key} references unknown bridge ${action.bridgeId}.`);
            }
            if (action.mode !== 'enable' && action.mode !== 'disable' && action.mode !== 'toggle') {
              errors.push(`Switch ${key} has unsupported action mode.`);
            }
          }
        }
        for (const tile of level.tiles) {
          if ((tile.type === 'soft-switch' || tile.type === 'hard-switch') && !switchKeys.has(coordKey(tile))) {
            errors.push(`Switch tile ${coordKey(tile)} is missing a switch definition.`);
          }
        }
        const splitKeys = new Set();
        for (const item of level.splits ?? []) {
          const key = coordKey(item);
          if (splitKeys.has(key)) errors.push(`Duplicate split definition at ${key}.`);
          splitKeys.add(key);
          const tile = level.tiles.find(candidate => coordKey(candidate) === key);
          if ((tile == null ? void 0 : tile.type) !== 'split') errors.push(`Split definition ${key} must reference a split tile.`);
          const [first, second] = item.destinations;
          if (coordKey(first) === coordKey(second)) errors.push(`Split ${key} destinations must be distinct.`);
          for (const destination of item.destinations) {
            if (!potentialSupportKeys.has(coordKey(destination))) {
              errors.push(`Split ${key} destination ${coordKey(destination)} is unsupported.`);
            }
          }
        }
        for (const tile of level.tiles) {
          if (tile.type === 'split' && !splitKeys.has(coordKey(tile))) {
            errors.push(`Split tile ${coordKey(tile)} is missing a split definition.`);
          }
        }
        return {
          valid: errors.length === 0,
          errors
        };
      }
      function assertValidLevel(level) {
        const result = validateLevel(level);
        if (!result.valid) throw new Error(result.errors.join('\n'));
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/localization.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        getLocalizedOnboardingCopy: getLocalizedOnboardingCopy,
        hasCompleteLocalizationCatalogs: hasCompleteLocalizationCatalogs,
        isGameLanguage: isGameLanguage,
        languageDisplayName: languageDisplayName,
        languageFromLocale: languageFromLocale,
        nextGameLanguage: nextGameLanguage,
        translate: translate
      });
      cclegacy._RF.push({}, "09996zMFuFP5rt8N4DPD7tR", "localization", undefined);
      const gameLanguages = exports('gameLanguages', ['zh-CN', 'zh-TW', 'en']);
      const englishUi = {
        gameSubtitle: 'ROLLING BLOCK PUZZLE',
        menu: 'MENU',
        switchBlock: 'SWITCH BLOCK',
        level: 'LEVEL',
        moves: 'MOVES',
        time: 'TIME',
        passcode: 'PASSCODE',
        startNewGame: 'START NEW GAME',
        resumeGame: 'RESUME GAME',
        resumeGameStage: 'RESUME GAME  -  {stage}',
        loadStage: 'LOAD STAGE',
        howToPlay: 'HOW TO PLAY',
        soundSetting: 'TOGGLE SOUND: {state}',
        soundOn: 'ON',
        soundOff: 'OFF',
        languageSetting: 'LANGUAGE: {language}',
        credits: 'CREDITS',
        enter: 'ENTER',
        back: 'BACK',
        previous: 'PREVIOUS',
        next: 'NEXT',
        gotIt: 'GOT IT',
        skip: 'SKIP',
        creditsCopy: 'DESIGN & DEVELOPMENT\nCUBIC TEAM\n\nORIGINAL LEVELS, VISUALS & AUDIO\nCREATED FOR CUBIC',
        confirmNewGameTitle: 'START NEW GAME?',
        confirmNewGameCopy: 'CURRENT CAMPAIGN PROGRESS WILL RESET.',
        start: 'START',
        cancel: 'CANCEL',
        stageFailed: 'STAGE FAILED',
        failureVoid: 'FELL INTO THE VOID',
        failureFragile: 'FRAGILE TILE BROKE',
        retry: 'RETRY',
        quitToMenu: 'QUIT TO MENU',
        stageComplete: 'STAGE COMPLETE',
        continue: 'CONTINUE',
        returnToMenu: 'RETURN TO MENU',
        replay: 'REPLAY',
        paused: 'PAUSED',
        returnToGame: 'RETURN TO GAME',
        invalidPasscode: 'INVALID PASSCODE',
        completionStats: 'MOVES  {moves}\nTIME  {time}\nPASSCODE  {passcode}'
      };
      const uiCatalogs = {
        en: englishUi,
        'zh-CN': {
          gameSubtitle: '滚动方块谜题',
          menu: '菜单',
          switchBlock: '切换方块',
          level: '关卡',
          moves: '步数',
          time: '时间',
          passcode: '密码',
          startNewGame: '开始新游戏',
          resumeGame: '继续游戏',
          resumeGameStage: '继续游戏  -  {stage}',
          loadStage: '选择关卡',
          howToPlay: '游戏玩法',
          soundSetting: '声音：{state}',
          soundOn: '开',
          soundOff: '关',
          languageSetting: '语言：{language}',
          credits: '制作人员',
          enter: '确认',
          back: '返回',
          previous: '上一项',
          next: '下一项',
          gotIt: '知道了',
          skip: '跳过',
          creditsCopy: '设计与开发\nCUBIC 团队\n\n原创关卡、画面与音效\n为 CUBIC 创作',
          confirmNewGameTitle: '开始新游戏？',
          confirmNewGameCopy: '当前关卡进度将被重置。',
          start: '开始',
          cancel: '取消',
          stageFailed: '关卡失败',
          failureVoid: '方块掉入虚空',
          failureFragile: '易碎地砖破裂',
          retry: '重新开始',
          quitToMenu: '返回主菜单',
          stageComplete: '关卡完成',
          continue: '继续',
          returnToMenu: '返回主菜单',
          replay: '重玩本关',
          paused: '已暂停',
          returnToGame: '返回游戏',
          invalidPasscode: '密码无效',
          completionStats: '步数  {moves}\n时间  {time}\n密码  {passcode}'
        },
        'zh-TW': {
          gameSubtitle: '滾動方塊謎題',
          menu: '選單',
          switchBlock: '切換方塊',
          level: '關卡',
          moves: '步數',
          time: '時間',
          passcode: '密碼',
          startNewGame: '開始新遊戲',
          resumeGame: '繼續遊戲',
          resumeGameStage: '繼續遊戲  -  {stage}',
          loadStage: '選擇關卡',
          howToPlay: '遊戲玩法',
          soundSetting: '聲音：{state}',
          soundOn: '開',
          soundOff: '關',
          languageSetting: '語言：{language}',
          credits: '製作人員',
          enter: '確認',
          back: '返回',
          previous: '上一項',
          next: '下一項',
          gotIt: '知道了',
          skip: '跳過',
          creditsCopy: '設計與開發\nCUBIC 團隊\n\n原創關卡、畫面與音效\n為 CUBIC 創作',
          confirmNewGameTitle: '開始新遊戲？',
          confirmNewGameCopy: '目前關卡進度將被重設。',
          start: '開始',
          cancel: '取消',
          stageFailed: '關卡失敗',
          failureVoid: '方塊掉入虛空',
          failureFragile: '易碎地磚破裂',
          retry: '重新開始',
          quitToMenu: '返回主選單',
          stageComplete: '關卡完成',
          continue: '繼續',
          returnToMenu: '返回主選單',
          replay: '重玩本關',
          paused: '已暫停',
          returnToGame: '返回遊戲',
          invalidPasscode: '密碼無效',
          completionStats: '步數  {moves}\n時間  {time}\n密碼  {passcode}'
        }
      };
      const onboardingCatalogs = {
        en: {
          movement: {
            title: 'ROLL THE BLOCK',
            symbol: '  UP\nLEFT  RIGHT\n DOWN',
            body: 'Swipe up, down, left, or right. Each swipe rolls the block one step in that screen direction.'
          },
          goal: {
            title: 'ENTER THE GOAL',
            symbol: 'UPRIGHT\n  +\n HOLE',
            body: 'Finish the stage by standing the whole block upright over the dark hole so it can drop inside.'
          },
          fragile: {
            title: 'FRAGILE TILE',
            symbol: 'GLASS\n  X',
            body: 'You may cross this translucent tile while lying down. Standing upright on it will break it.'
          },
          'soft-switch': {
            title: 'SOFT SWITCH',
            symbol: 'ROUND\nPRESS',
            body: 'Any part of the whole block or either split cube can press a round soft switch.'
          },
          'hard-switch': {
            title: 'HARD SWITCH',
            symbol: 'STAND\n  X',
            body: 'An X-marked hard switch responds only when the unsplit whole block stands upright on it.'
          },
          bridge: {
            title: 'CONTROLLED BRIDGE',
            symbol: 'ON  /  OFF',
            body: 'Switches can enable, disable, or toggle connected bridge spans. Check the route after every press.'
          },
          split: {
            title: 'SPLIT TILE',
            symbol: 'ONE\n2\nTWO',
            body: 'Stand upright on the four-mark tile to divide the block into two independently positioned cubes.'
          },
          'switch-cube': {
            title: 'SWITCH ACTIVE CUBE',
            symbol: 'A  /  B',
            body: 'Only the highlighted cube moves. Use Switch Block at the upper left to select the other cube.'
          },
          recombine: {
            title: 'RECOMBINE',
            symbol: 'A + B\nBLOCK',
            body: 'Move the two cubes onto orthogonally adjacent tiles. They will automatically reform the whole block.'
          }
        },
        'zh-CN': {
          movement: {
            title: '滚动方块',
            symbol: '  上\n左    右\n  下',
            body: '向上、下、左或右滑动。每次滑动都会让方块沿屏幕方向滚动一步。'
          },
          goal: {
            title: '进入目标洞',
            symbol: '直立\n +\n洞口',
            body: '让完整方块直立在黑色洞口上并掉入其中，即可完成关卡。'
          },
          fragile: {
            title: '易碎地砖',
            symbol: '玻璃\n X',
            body: '方块平躺时可以经过透明地砖；直立在上面会将其压碎。'
          },
          'soft-switch': {
            title: '轻触机关',
            symbol: '圆形\n按压',
            body: '完整方块的任一部分或分裂后的任一小方块都能按下圆形机关。'
          },
          'hard-switch': {
            title: '重压机关',
            symbol: '直立\n X',
            body: '带 X 标记的机关只会在完整方块直立压上去时触发。'
          },
          bridge: {
            title: '可控桥梁',
            symbol: '开 / 关',
            body: '机关可以开启、关闭或切换相连的桥梁。每次触发后都要重新观察路线。'
          },
          split: {
            title: '分裂地砖',
            symbol: '一体\n 2\n两块',
            body: '完整方块直立在四点标记上时，会分裂成两个可独立移动的小方块。'
          },
          'switch-cube': {
            title: '切换活动方块',
            symbol: 'A / B',
            body: '只有高亮的小方块会移动。使用左上角的“切换方块”选择另一个。'
          },
          recombine: {
            title: '重新组合',
            symbol: 'A + B\n方块',
            body: '让两个小方块移动到上下或左右相邻的地砖，它们会自动重新组合。'
          }
        },
        'zh-TW': {
          movement: {
            title: '滾動方塊',
            symbol: '  上\n左    右\n  下',
            body: '向上、下、左或右滑動。每次滑動都會讓方塊沿螢幕方向滾動一步。'
          },
          goal: {
            title: '進入目標洞',
            symbol: '直立\n +\n洞口',
            body: '讓完整方塊直立在黑色洞口上並掉入其中，即可完成關卡。'
          },
          fragile: {
            title: '易碎地磚',
            symbol: '玻璃\n X',
            body: '方塊平躺時可以經過透明地磚；直立在上面會將其壓碎。'
          },
          'soft-switch': {
            title: '輕觸機關',
            symbol: '圓形\n按壓',
            body: '完整方塊的任一部分或分裂後的任一小方塊都能按下圓形機關。'
          },
          'hard-switch': {
            title: '重壓機關',
            symbol: '直立\n X',
            body: '帶 X 標記的機關只會在完整方塊直立壓上去時觸發。'
          },
          bridge: {
            title: '可控橋梁',
            symbol: '開 / 關',
            body: '機關可以開啟、關閉或切換相連的橋梁。每次觸發後都要重新觀察路線。'
          },
          split: {
            title: '分裂地磚',
            symbol: '一體\n 2\n兩塊',
            body: '完整方塊直立在四點標記上時，會分裂成兩個可獨立移動的小方塊。'
          },
          'switch-cube': {
            title: '切換活動方塊',
            symbol: 'A / B',
            body: '只有高亮的小方塊會移動。使用左上角的「切換方塊」選擇另一個。'
          },
          recombine: {
            title: '重新組合',
            symbol: 'A + B\n方塊',
            body: '讓兩個小方塊移動到上下或左右相鄰的地磚，它們會自動重新組合。'
          }
        }
      };
      function translate(language, key, params = {}) {
        var _uiCatalogs$language;
        return replaceParams(((_uiCatalogs$language = uiCatalogs[language]) == null ? void 0 : _uiCatalogs$language[key]) ?? englishUi[key], params);
      }
      function getLocalizedOnboardingCopy(language, topicId) {
        var _onboardingCatalogs$l;
        return ((_onboardingCatalogs$l = onboardingCatalogs[language]) == null ? void 0 : _onboardingCatalogs$l[topicId]) ?? onboardingCatalogs.en[topicId];
      }
      function languageFromLocale(locale) {
        const normalized = (locale ?? '').trim().toLowerCase().replace(/_/g, '-');
        if (normalized === 'zh' || normalized.startsWith('zh-')) {
          if (/(^|-)hant($|-)/.test(normalized)) return 'zh-TW';
          if (/(^|-)hans($|-)/.test(normalized)) return 'zh-CN';
          if (/(^|-)(tw|hk|mo)($|-)/.test(normalized)) return 'zh-TW';
          return 'zh-CN';
        }
        return 'en';
      }
      function nextGameLanguage(language) {
        const index = gameLanguages.indexOf(language);
        return gameLanguages[(index + 1) % gameLanguages.length];
      }
      function languageDisplayName(language) {
        if (language === 'zh-CN') return '简体中文';
        if (language === 'zh-TW') return '繁體中文';
        return 'English';
      }
      function isGameLanguage(value) {
        return typeof value === 'string' && gameLanguages.indexOf(value) >= 0;
      }
      function hasCompleteLocalizationCatalogs() {
        const uiKeys = Object.keys(englishUi).sort().join('|');
        const topicKeys = Object.keys(onboardingCatalogs.en).sort().join('|');
        return gameLanguages.every(language => Object.keys(uiCatalogs[language]).sort().join('|') === uiKeys && Object.keys(onboardingCatalogs[language]).sort().join('|') === topicKeys);
      }
      function replaceParams(template, params) {
        return template.replace(/\{([a-zA-Z0-9]+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./AudioController.ts', './BlockPresenter.ts', './BoardRenderer.ts', './CameraController.ts', './GameplayBootstrap.ts', './GameplayController.ts', './MobileSafeArea.ts', './ReleaseSaveRepository.ts', './TouchInputController.ts', './PuzzleEngine.ts', './coords.ts', './index.ts', './level.ts', './localization.ts', './movement.ts', './onboarding.ts', './releaseSave.ts', './solver.ts', './types.ts', './index2.ts', './tutorialLevels.ts', './HarmonyOSAdapter.ts', './PlatformAdapter.ts', './index3.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/MobileSafeArea.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, _decorator, Component, view, sys, Widget, UITransform;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
      view = module.view;
      sys = module.sys;
      Widget = module.Widget;
      UITransform = module.UITransform;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "6c5e8p0329A7p6AwJKJuOp8", "MobileSafeArea", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let MobileSafeArea = exports('MobileSafeArea', (_dec = ccclass('MobileSafeArea'), _dec(_class = (_class2 = class MobileSafeArea extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "minPadding", _descriptor, this);
        }
        onEnable() {
          this.applySafeArea();
        }
        applySafeArea() {
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
      }, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "minPadding", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 24;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/movement.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('rollBlock', rollBlock);
      cclegacy._RF.push({}, "ab878Os+FdPh7CZFegackDz", "movement", undefined);
      function rollBlock(block, direction) {
        const {
          x,
          z
        } = block.anchor;
        if (block.orientation === 'standing') {
          switch (direction) {
            case 'left':
              return {
                anchor: {
                  x: x - 2,
                  z
                },
                orientation: 'lying-x'
              };
            case 'right':
              return {
                anchor: {
                  x: x + 1,
                  z
                },
                orientation: 'lying-x'
              };
            case 'up':
              return {
                anchor: {
                  x,
                  z: z - 2
                },
                orientation: 'lying-z'
              };
            case 'down':
              return {
                anchor: {
                  x,
                  z: z + 1
                },
                orientation: 'lying-z'
              };
          }
        }
        if (block.orientation === 'lying-x') {
          switch (direction) {
            case 'left':
              return {
                anchor: {
                  x: x - 1,
                  z
                },
                orientation: 'standing'
              };
            case 'right':
              return {
                anchor: {
                  x: x + 2,
                  z
                },
                orientation: 'standing'
              };
            case 'up':
              return {
                anchor: {
                  x,
                  z: z - 1
                },
                orientation: 'lying-x'
              };
            case 'down':
              return {
                anchor: {
                  x,
                  z: z + 1
                },
                orientation: 'lying-x'
              };
          }
        }
        switch (direction) {
          case 'left':
            return {
              anchor: {
                x: x - 1,
                z
              },
              orientation: 'lying-z'
            };
          case 'right':
            return {
              anchor: {
                x: x + 1,
                z
              },
              orientation: 'lying-z'
            };
          case 'up':
            return {
              anchor: {
                x,
                z: z - 1
              },
              orientation: 'standing'
            };
          case 'down':
            return {
              anchor: {
                x,
                z: z + 2
              },
              orientation: 'standing'
            };
        }
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/onboarding.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        onboardingTopicsForLevel: onboardingTopicsForLevel,
        pendingOnboardingTopics: pendingOnboardingTopics
      });
      cclegacy._RF.push({}, "6b416RS/iZMDbn7w4mKidS4", "onboarding", undefined);
      const onboardingTopics = exports('onboardingTopics', [{
        id: 'movement',
        title: 'ROLL THE BLOCK',
        symbol: '  UP\nLEFT  RIGHT\n DOWN',
        body: 'Swipe up, down, left, or right. Each swipe rolls the block one step in that screen direction.'
      }, {
        id: 'goal',
        title: 'ENTER THE GOAL',
        symbol: 'UPRIGHT\n  +\n HOLE',
        body: 'Finish the stage by standing the whole block upright over the dark hole so it can drop inside.'
      }, {
        id: 'fragile',
        title: 'FRAGILE TILE',
        symbol: 'GLASS\n  X',
        body: 'You may cross this translucent tile while lying down. Standing upright on it will break it.'
      }, {
        id: 'soft-switch',
        title: 'SOFT SWITCH',
        symbol: 'ROUND\nPRESS',
        body: 'Any part of the whole block or either split cube can press a round soft switch.'
      }, {
        id: 'hard-switch',
        title: 'HARD SWITCH',
        symbol: 'STAND\n  X',
        body: 'An X-marked hard switch responds only when the unsplit whole block stands upright on it.'
      }, {
        id: 'bridge',
        title: 'CONTROLLED BRIDGE',
        symbol: 'ON  /  OFF',
        body: 'Switches can enable, disable, or toggle connected bridge spans. Check the route after every press.'
      }, {
        id: 'split',
        title: 'SPLIT TILE',
        symbol: 'ONE\n2\nTWO',
        body: 'Stand upright on the four-mark tile to divide the block into two independently positioned cubes.'
      }, {
        id: 'switch-cube',
        title: 'SWITCH ACTIVE CUBE',
        symbol: 'A  /  B',
        body: 'Only the highlighted cube moves. Use Switch Block at the upper left to select the other cube.'
      }, {
        id: 'recombine',
        title: 'RECOMBINE',
        symbol: 'A + B\nBLOCK',
        body: 'Move the two cubes onto orthogonally adjacent tiles. They will automatically reform the whole block.'
      }]);
      function onboardingTopicsForLevel(level) {
        var _level$bridges, _level$splits;
        const included = new Set(['movement', 'goal']);
        const tileTypes = new Set(level.tiles.map(tile => tile.type));
        if (tileTypes.has('fragile')) included.add('fragile');
        if (tileTypes.has('soft-switch')) included.add('soft-switch');
        if (tileTypes.has('hard-switch')) included.add('hard-switch');
        if ((((_level$bridges = level.bridges) == null ? void 0 : _level$bridges.length) ?? 0) > 0) included.add('bridge');
        if ((((_level$splits = level.splits) == null ? void 0 : _level$splits.length) ?? 0) > 0 || tileTypes.has('split')) {
          included.add('split');
          included.add('switch-cube');
          included.add('recombine');
        }
        return onboardingTopics.filter(topic => included.has(topic.id));
      }
      function pendingOnboardingTopics(level, acknowledged) {
        const acknowledgedSet = new Set(acknowledged);
        return onboardingTopicsForLevel(level).filter(topic => !acknowledgedSet.has(topic.id));
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PlatformAdapter.ts", ['cc'], function (exports) {
  var cclegacy, sys;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      sys = module.sys;
    }],
    execute: function () {
      exports('createPlatformAdapter', createPlatformAdapter);
      cclegacy._RF.push({}, "3b7d5e2qW5BuJjhuLRW8Ent", "PlatformAdapter", undefined);
      class DefaultPlatformAdapter {
        constructor() {
          this.name = 'default';
        }
        getSafeAreaInsets() {
          return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          };
        }
        vibrateLight() {
          var _globalThis$navigator;
          if (sys.isNative && sys.os === sys.OS.OPENHARMONY) {
            // A missing synchronous ArkTS reflection target blocks Cocos' script thread.
            return;
          }
          (_globalThis$navigator = globalThis.navigator) == null || _globalThis$navigator.vibrate == null || _globalThis$navigator.vibrate(35);
        }
        onLevelStarted(_levelId) {
          // Intentionally empty. Native adapters can report lifecycle events later.
        }
        onLevelCompleted(_levelId, _steps) {
          // Intentionally empty. Native adapters can report lifecycle events later.
        }
      }
      exports('DefaultPlatformAdapter', DefaultPlatformAdapter);
      function createPlatformAdapter() {
        return new DefaultPlatformAdapter();
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PuzzleEngine.ts", ['cc', './coords.ts', './level.ts', './movement.ts'], function (exports) {
  var cclegacy, occupiedCells, sameCoord, coordKey, assertValidLevel, LevelMap, rollBlock;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      occupiedCells = module.occupiedCells;
      sameCoord = module.sameCoord;
      coordKey = module.coordKey;
    }, function (module) {
      assertValidLevel = module.assertValidLevel;
      LevelMap = module.LevelMap;
    }, function (module) {
      rollBlock = module.rollBlock;
    }],
    execute: function () {
      cclegacy._RF.push({}, "587a3KG8URHy7cbzp/wMuBY", "PuzzleEngine", undefined);
      class PuzzleEngine {
        constructor(level) {
          this.levelMap = void 0;
          this.history = [];
          this.state = void 0;
          this.level = level;
          assertValidLevel(level);
          this.levelMap = new LevelMap(level);
          this.state = this.initialState();
        }
        getState() {
          return this.cloneState(this.state);
        }
        getOccupiedCells() {
          if (this.state.split) {
            return this.state.split.cubes.map(cube => ({
              ...cube
            }));
          }
          return occupiedCells(this.state.block);
        }
        move(direction) {
          const previous = this.getState();
          if (this.state.failed || this.state.completed) {
            return this.invalidResult(previous, direction, 'Level is already resolved.');
          }
          return this.state.split ? this.moveSplit(previous, direction, this.state.split) : this.moveWhole(previous, direction);
        }
        switchActiveCube() {
          if (!this.state.split || this.state.failed || this.state.completed) {
            return this.getState();
          }
          const previous = this.getState();
          this.history.push(previous);
          this.state = {
            ...this.state,
            split: {
              cubes: this.cloneCubes(this.state.split.cubes),
              activeCube: this.state.split.activeCube === 0 ? 1 : 0
            }
          };
          return this.getState();
        }
        undo() {
          const previous = this.history.pop();
          if (previous) this.state = previous;
          return this.getState();
        }
        restart() {
          this.history = [];
          this.state = this.initialState();
          return this.getState();
        }
        canUndo() {
          return this.history.length > 0;
        }
        moveWhole(previous, direction) {
          var _this$levelMap$tileAt;
          const nextBlock = rollBlock(this.state.block, direction);
          const nextCells = occupiedCells(nextBlock);
          if (nextBlock.orientation === 'standing' && sameCoord(nextBlock.anchor, this.level.goal)) {
            return this.commit(previous, direction, {
              ...this.state,
              block: nextBlock,
              split: null,
              steps: this.state.steps + 1,
              completed: true
            }, 'completed', nextCells, 'The block dropped into the goal hole.');
          }
          if (!this.levelMap.supports(nextCells, this.state.bridgeStates)) {
            const supportedCells = this.levelMap.supportedCells(nextCells, this.state.bridgeStates);
            return this.commitFailure(previous, direction, {
              ...this.state,
              block: nextBlock,
              split: null,
              steps: this.state.steps + 1
            }, nextCells, 'The block fell from the board.', supportedCells);
          }
          if (nextBlock.orientation === 'standing' && ((_this$levelMap$tileAt = this.levelMap.tileAt(nextBlock.anchor)) == null ? void 0 : _this$levelMap$tileAt.type) === 'fragile') {
            return this.commitFailure(previous, direction, {
              ...this.state,
              block: nextBlock,
              split: null,
              steps: this.state.steps + 1
            }, nextCells, 'The standing block broke a fragile tile.', []);
          }
          let bridgeStates = this.applyWholeSwitches(nextBlock, this.state.bridgeStates);
          const splitDefinition = nextBlock.orientation === 'standing' ? this.levelMap.splitAt(nextBlock.anchor) : undefined;
          const split = splitDefinition ? {
            cubes: this.cloneCubes(splitDefinition.destinations),
            activeCube: 0
          } : null;
          if (split && !this.levelMap.supports(split.cubes, bridgeStates)) {
            const supportedCells = this.levelMap.supportedCells(split.cubes, bridgeStates);
            return this.commitFailure(previous, direction, {
              ...this.state,
              block: nextBlock,
              split,
              bridgeStates,
              steps: this.state.steps + 1
            }, split.cubes, 'A split cube destination is unsupported.', supportedCells);
          }
          return this.commit(previous, direction, {
            ...this.state,
            block: nextBlock,
            split,
            bridgeStates,
            steps: this.state.steps + 1
          }, 'moved', (split == null ? void 0 : split.cubes) ?? nextCells);
        }
        moveSplit(previous, direction, split) {
          const active = split.activeCube;
          const cubes = this.cloneCubes(split.cubes);
          cubes[active] = this.moveCube(cubes[active], direction);
          if (!this.levelMap.supports([cubes[active]], this.state.bridgeStates)) {
            const supportedCells = this.levelMap.supportedCells(cubes, this.state.bridgeStates);
            return this.commitFailure(previous, direction, {
              ...this.state,
              split: {
                cubes,
                activeCube: active
              },
              steps: this.state.steps + 1
            }, cubes, 'The active split cube fell from the board.', supportedCells);
          }
          const bridgeStates = this.applySoftSwitch(cubes[active], this.state.bridgeStates);
          const recombined = this.recombinedBlock(cubes);
          return this.commit(previous, direction, {
            ...this.state,
            block: recombined ?? this.state.block,
            split: recombined ? null : {
              cubes,
              activeCube: active
            },
            bridgeStates,
            steps: this.state.steps + 1
          }, 'moved', recombined ? occupiedCells(recombined) : cubes);
        }
        applyWholeSwitches(block, current) {
          let result = {
            ...current
          };
          const applied = new Set();
          for (const cell of occupiedCells(block)) {
            const tile = this.levelMap.tileAt(cell);
            const qualifies = (tile == null ? void 0 : tile.type) === 'soft-switch' || (tile == null ? void 0 : tile.type) === 'hard-switch' && block.orientation === 'standing';
            if (!qualifies || applied.has(coordKey(cell))) continue;
            result = this.applySwitch(cell, result);
            applied.add(coordKey(cell));
          }
          return result;
        }
        applySoftSwitch(cell, current) {
          var _this$levelMap$tileAt2;
          return ((_this$levelMap$tileAt2 = this.levelMap.tileAt(cell)) == null ? void 0 : _this$levelMap$tileAt2.type) === 'soft-switch' ? this.applySwitch(cell, current) : {
            ...current
          };
        }
        applySwitch(cell, current) {
          const next = {
            ...current
          };
          for (const action of ((_this$levelMap$switch = this.levelMap.switchAt(cell)) == null ? void 0 : _this$levelMap$switch.actions) ?? []) {
            var _this$levelMap$switch;
            if (action.mode === 'enable') next[action.bridgeId] = true;else if (action.mode === 'disable') next[action.bridgeId] = false;else next[action.bridgeId] = !next[action.bridgeId];
          }
          return next;
        }
        recombinedBlock(cubes) {
          const [first, second] = cubes;
          if (first.z === second.z && Math.abs(first.x - second.x) === 1) {
            return {
              anchor: {
                x: Math.min(first.x, second.x),
                z: first.z
              },
              orientation: 'lying-x'
            };
          }
          if (first.x === second.x && Math.abs(first.z - second.z) === 1) {
            return {
              anchor: {
                x: first.x,
                z: Math.min(first.z, second.z)
              },
              orientation: 'lying-z'
            };
          }
          return null;
        }
        moveCube(cube, direction) {
          if (direction === 'left') return {
            x: cube.x - 1,
            z: cube.z
          };
          if (direction === 'right') return {
            x: cube.x + 1,
            z: cube.z
          };
          if (direction === 'up') return {
            x: cube.x,
            z: cube.z - 1
          };
          return {
            x: cube.x,
            z: cube.z + 1
          };
        }
        commitFailure(previous, direction, candidate, cells, message, supportedCells) {
          return this.commit(previous, direction, {
            ...candidate,
            failed: true,
            completed: false
          }, 'fallen', cells, message, supportedCells);
        }
        commit(previous, direction, candidate, status, cells, message, supportedCells) {
          this.history.push(previous);
          this.state = this.cloneState(candidate);
          return {
            status,
            direction,
            previous,
            current: this.getState(),
            occupiedCells: cells.map(cell => ({
              ...cell
            })),
            supportedCells: supportedCells == null ? void 0 : supportedCells.map(cell => ({
              ...cell
            })),
            message
          };
        }
        invalidResult(previous, direction, message) {
          return {
            status: 'invalid',
            direction,
            previous,
            current: this.getState(),
            occupiedCells: this.getOccupiedCells(),
            message
          };
        }
        initialState() {
          const bridgeStates = {};
          for (const bridge of this.level.bridges ?? []) {
            bridgeStates[bridge.id] = bridge.initiallyActive;
          }
          return {
            levelId: this.level.id,
            block: {
              anchor: {
                ...this.level.start.anchor
              },
              orientation: this.level.start.orientation
            },
            split: null,
            bridgeStates,
            steps: 0,
            failed: false,
            completed: false
          };
        }
        cloneState(state) {
          return {
            ...state,
            block: {
              anchor: {
                ...state.block.anchor
              },
              orientation: state.block.orientation
            },
            split: state.split ? {
              cubes: this.cloneCubes(state.split.cubes),
              activeCube: state.split.activeCube
            } : null,
            bridgeStates: {
              ...state.bridgeStates
            }
          };
        }
        cloneCubes(cubes) {
          return [{
            ...cubes[0]
          }, {
            ...cubes[1]
          }];
        }
      }
      exports('PuzzleEngine', PuzzleEngine);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/releaseSave.ts", ['cc', './PuzzleEngine.ts', './localization.ts'], function (exports) {
  var cclegacy, PuzzleEngine, isGameLanguage;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      PuzzleEngine = module.PuzzleEngine;
    }, function (module) {
      isGameLanguage = module.isGameLanguage;
    }],
    execute: function () {
      exports({
        createDefaultReleaseSave: createDefaultReleaseSave,
        decodeReleaseSave: decodeReleaseSave,
        getHighestUnlockedIndex: getHighestUnlockedIndex,
        normalizeReleaseSave: normalizeReleaseSave,
        resetCampaignProgress: resetCampaignProgress,
        resumeSavedRun: resumeSavedRun,
        serializeReleaseSave: serializeReleaseSave,
        withUnlockedLevel: withUnlockedLevel
      });
      cclegacy._RF.push({}, "fae88mwotJHlL7VFNvV7pr1", "releaseSave", undefined);
      const RELEASE_SAVE_VERSION = exports('RELEASE_SAVE_VERSION', 1);
      const tutorialTopicIds = exports('tutorialTopicIds', ['movement', 'goal', 'fragile', 'soft-switch', 'hard-switch', 'bridge', 'split', 'switch-cube', 'recombine']);
      const directions = new Set(['up', 'down', 'left', 'right', 'switch-cube']);
      const tutorialTopics = new Set(tutorialTopicIds);
      function createDefaultReleaseSave(levels, language = 'en') {
        if (levels.length === 0) throw new Error('At least one level is required for release save data.');
        return {
          version: RELEASE_SAVE_VERSION,
          currentRun: null,
          highestUnlockedLevelId: levels[0].id,
          soundEnabled: true,
          language,
          acknowledgedTutorials: []
        };
      }
      function decodeReleaseSave(serialized, levels, fallbackLanguage = 'en') {
        if (!serialized) return createDefaultReleaseSave(levels, fallbackLanguage);
        try {
          return normalizeReleaseSave(JSON.parse(serialized), levels, fallbackLanguage);
        } catch {
          return createDefaultReleaseSave(levels, fallbackLanguage);
        }
      }
      function normalizeReleaseSave(input, levels, fallbackLanguage = 'en') {
        const defaults = createDefaultReleaseSave(levels, fallbackLanguage);
        if (!isRecord(input)) return defaults;
        const highestUnlockedLevelId = validLevelId(input.highestUnlockedLevelId, levels) ?? defaults.highestUnlockedLevelId;
        const soundEnabled = typeof input.soundEnabled === 'boolean' ? input.soundEnabled : defaults.soundEnabled;
        const language = isGameLanguage(input.language) ? input.language : defaults.language;
        const acknowledgedTutorials = Array.isArray(input.acknowledgedTutorials) ? [...new Set(input.acknowledgedTutorials.filter(isTutorialTopicId))] : defaults.acknowledgedTutorials;
        const currentRun = input.version === RELEASE_SAVE_VERSION ? normalizeSavedRun(input.currentRun, levels) : null;
        return {
          version: RELEASE_SAVE_VERSION,
          currentRun,
          highestUnlockedLevelId,
          soundEnabled,
          language,
          acknowledgedTutorials
        };
      }
      function serializeReleaseSave(save) {
        return JSON.stringify(save);
      }
      function resumeSavedRun(save, levels) {
        const run = save.currentRun;
        if (!run) return null;
        const levelIndex = levels.findIndex(level => level.id === run.levelId);
        if (levelIndex < 0) return null;
        const engine = replayActions(levels[levelIndex], run.actions);
        if (!engine) return null;
        return {
          levelIndex,
          engine,
          actions: [...run.actions],
          elapsedSeconds: run.elapsedSeconds
        };
      }
      function getHighestUnlockedIndex(save, levels) {
        const index = levels.findIndex(level => level.id === save.highestUnlockedLevelId);
        return index < 0 ? 0 : index;
      }
      function withUnlockedLevel(save, levelIndex, levels) {
        const boundedIndex = Math.max(0, Math.min(Math.floor(levelIndex), levels.length - 1));
        const currentHighest = getHighestUnlockedIndex(save, levels);
        if (boundedIndex <= currentHighest) return save;
        return {
          ...save,
          highestUnlockedLevelId: levels[boundedIndex].id
        };
      }
      function resetCampaignProgress(save, levels) {
        if (levels.length === 0) throw new Error('At least one level is required to reset campaign progress.');
        return {
          ...save,
          currentRun: null,
          highestUnlockedLevelId: levels[0].id
        };
      }
      function normalizeSavedRun(input, levels) {
        if (!isRecord(input)) return null;
        const levelId = validLevelId(input.levelId, levels);
        if (!levelId || !Array.isArray(input.actions)) return null;
        const actions = input.actions.filter(isPuzzleAction);
        if (actions.length !== input.actions.length) return null;
        const elapsedSeconds = typeof input.elapsedSeconds === 'number' && Number.isFinite(input.elapsedSeconds) && input.elapsedSeconds >= 0 ? input.elapsedSeconds : 0;
        const level = levels.find(candidate => candidate.id === levelId);
        if (!level || !replayActions(level, actions)) return null;
        return {
          levelId,
          actions,
          elapsedSeconds
        };
      }
      function replayActions(level, actions) {
        const engine = new PuzzleEngine(level);
        for (const action of actions) {
          if (action === 'switch-cube') {
            if (!engine.getState().split) return null;
            engine.switchActiveCube();
            continue;
          }
          const result = engine.move(action);
          if (result.status !== 'moved') return null;
        }
        const state = engine.getState();
        return state.failed || state.completed ? null : engine;
      }
      function validLevelId(input, levels) {
        if (typeof input !== 'string') return null;
        return levels.some(level => level.id === input) ? input : null;
      }
      function isPuzzleAction(value) {
        return typeof value === 'string' && directions.has(value);
      }
      function isTutorialTopicId(value) {
        return typeof value === 'string' && tutorialTopics.has(value);
      }
      function isRecord(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ReleaseSaveRepository.ts", ['cc', './index.ts', './releaseSave.ts', './localization.ts'], function (exports) {
  var cclegacy, sys, decodeReleaseSave, createDefaultReleaseSave, serializeReleaseSave, languageFromLocale;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      sys = module.sys;
    }, null, function (module) {
      decodeReleaseSave = module.decodeReleaseSave;
      createDefaultReleaseSave = module.createDefaultReleaseSave;
      serializeReleaseSave = module.serializeReleaseSave;
    }, function (module) {
      languageFromLocale = module.languageFromLocale;
    }],
    execute: function () {
      cclegacy._RF.push({}, "e26cdM2kpxFkJOaUYuw6xk2", "ReleaseSaveRepository", undefined);
      const RELEASE_SAVE_KEY = 'cubic.release-save.v1';
      class ReleaseSaveRepository {
        constructor(levels) {
          this.levels = levels;
        }
        load() {
          try {
            return decodeReleaseSave(sys.localStorage.getItem(RELEASE_SAVE_KEY), this.levels, languageFromLocale(sys.languageCode));
          } catch (error) {
            console.warn('Release save could not be loaded.', error);
            return createDefaultReleaseSave(this.levels, languageFromLocale(sys.languageCode));
          }
        }
        save(data) {
          try {
            sys.localStorage.setItem(RELEASE_SAVE_KEY, serializeReleaseSave(data));
          } catch (error) {
            console.warn('Release save could not be written.', error);
          }
        }
        reset() {
          const data = createDefaultReleaseSave(this.levels, languageFromLocale(sys.languageCode));
          this.save(data);
          return data;
        }
      }
      exports('ReleaseSaveRepository', ReleaseSaveRepository);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/solver.ts", ['cc', './PuzzleEngine.ts'], function (exports) {
  var cclegacy, PuzzleEngine;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      PuzzleEngine = module.PuzzleEngine;
    }],
    execute: function () {
      exports('findSolution', findSolution);
      cclegacy._RF.push({}, "da89bls5KVFBYWkBTzDQoSs", "solver", undefined);
      const directions = ['up', 'down', 'left', 'right'];
      function findSolution(level, maxVisited = 20_000) {
        const initial = new PuzzleEngine(level).getState();
        const queue = [[]];
        const seen = new Set([stateKey(initial)]);
        let queueIndex = 0;
        while (queueIndex < queue.length && seen.size < maxVisited) {
          const path = queue[queueIndex];
          queueIndex += 1;
          const engine = replay(level, path);
          const actions = engine.getState().split ? [...directions, 'switch-cube'] : directions;
          for (const action of actions) {
            const candidate = new PuzzleEngine(level);
            replayInto(candidate, path);
            if (action === 'switch-cube') candidate.switchActiveCube();else candidate.move(action);
            const state = candidate.getState();
            if (state.failed) continue;
            const nextPath = [...path, action];
            if (state.completed) {
              return {
                solution: nextPath,
                visitedStates: seen.size,
                exhausted: false
              };
            }
            const key = stateKey(state);
            if (seen.has(key)) continue;
            seen.add(key);
            queue.push(nextPath);
            if (seen.size >= maxVisited) break;
          }
        }
        return {
          solution: null,
          visitedStates: seen.size,
          exhausted: queueIndex >= queue.length
        };
      }
      function replay(level, path) {
        const engine = new PuzzleEngine(level);
        replayInto(engine, path);
        return engine;
      }
      function replayInto(engine, path) {
        for (const action of path) {
          if (action === 'switch-cube') engine.switchActiveCube();else engine.move(action);
        }
      }
      function stateKey(state) {
        const block = `${state.block.anchor.x},${state.block.anchor.z},${state.block.orientation}`;
        const split = state.split ? `${state.split.cubes[0].x},${state.split.cubes[0].z};${state.split.cubes[1].x},${state.split.cubes[1].z};${state.split.activeCube}` : '-';
        const bridges = Object.keys(state.bridgeStates).sort().map(id => `${id}:${state.bridgeStates[id] ? 1 : 0}`).join(';');
        return `${block}|${split}|${bridges}`;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TouchInputController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, _decorator, Component, input, Input, Node, Button;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
      input = module.input;
      Input = module.Input;
      Node = module.Node;
      Button = module.Button;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "f84f8yUwfNBKqLJPzVTT+xs", "TouchInputController", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let TouchInputController = exports('TouchInputController', (_dec = ccclass('TouchInputController'), _dec(_class = (_class2 = class TouchInputController extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "minSwipeDistance", _descriptor, this);
          this.onMove = null;
          this.startPosition = null;
        }
        onEnable() {
          input.on(Input.EventType.TOUCH_START, this.handleTouchStart, this);
          input.on(Input.EventType.TOUCH_END, this.handleTouchEnd, this);
          input.on(Input.EventType.TOUCH_CANCEL, this.handleTouchCancel, this);
        }
        onDisable() {
          input.off(Input.EventType.TOUCH_START, this.handleTouchStart, this);
          input.off(Input.EventType.TOUCH_END, this.handleTouchEnd, this);
          input.off(Input.EventType.TOUCH_CANCEL, this.handleTouchCancel, this);
        }
        handleTouchStart(event) {
          const target = event.target instanceof Node ? event.target : null;
          if (this.isButtonTarget(target)) {
            this.startPosition = null;
            return;
          }
          this.startPosition = event.getUILocation();
        }
        handleTouchEnd(event) {
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
        handleTouchCancel() {
          this.startPosition = null;
        }
        isButtonTarget(target) {
          let current = target;
          while (current) {
            if (current.getComponent(Button)) {
              return true;
            }
            current = current.parent;
          }
          return false;
        }
      }, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "minSwipeDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 32;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/tutorialLevels.ts", ['cc', './index.ts', './coords.ts', './movement.ts'], function (exports) {
  var cclegacy, occupiedCells, rollBlock;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, null, function (module) {
      occupiedCells = module.occupiedCells;
    }, function (module) {
      rollBlock = module.rollBlock;
    }],
    execute: function () {
      cclegacy._RF.push({}, "a43a2mBVeNMlpapvOfC5jJZ", "tutorialLevels", undefined);
      const author = 'Cubic Team';
      function key(coord) {
        return `${coord.x},${coord.z}`;
      }
      function cloneCoord(coord) {
        return {
          x: coord.x,
          z: coord.z
        };
      }
      function goalRing(goal) {
        const result = [];
        for (let z = -1; z <= 1; z += 1) {
          for (let x = -1; x <= 1; x += 1) {
            if (x !== 0 || z !== 0) result.push({
              x: goal.x + x,
              z: goal.z + z
            });
          }
        }
        return result;
      }
      function wholeTrace(solution) {
        let block = {
          anchor: {
            x: 0,
            z: 0
          },
          orientation: 'standing'
        };
        const frames = [{
          cells: occupiedCells(block),
          whole: block,
          landed: false
        }];
        for (const direction of solution) {
          block = rollBlock(block, direction);
          frames.push({
            cells: occupiedCells(block),
            whole: block,
            landed: true
          });
        }
        return frames;
      }
      function splitTrace(prefix, split, suffix) {
        let block = {
          anchor: {
            x: 0,
            z: 0
          },
          orientation: 'standing'
        };
        const frames = [{
          cells: occupiedCells(block),
          whole: block,
          landed: false
        }];
        for (let index = 0; index < prefix.length; index += 1) {
          block = rollBlock(block, prefix[index]);
          if (index + 1 < prefix.length) {
            frames.push({
              cells: occupiedCells(block),
              whole: block,
              landed: true
            });
          }
        }
        if (block.orientation !== 'standing') throw new Error('Split prefix must end standing.');
        const splitDefinition = {
          ...block.anchor,
          destinations: [cloneCoord(split.destinations[0]), cloneCoord(split.destinations[1])]
        };
        const cubes = [cloneCoord(split.destinations[0]), cloneCoord(split.destinations[1])];
        let active = 0;
        frames.push({
          cells: cubes.map(cloneCoord),
          whole: null,
          landed: true
        });
        for (const action of split.actions) {
          if (action === 'switch-cube') {
            active = active === 0 ? 1 : 0;
            frames.push({
              cells: cubes.map(cloneCoord),
              whole: null,
              landed: false
            });
            continue;
          }
          const current = cubes[active];
          cubes[active] = action === 'left' ? {
            x: current.x - 1,
            z: current.z
          } : action === 'right' ? {
            x: current.x + 1,
            z: current.z
          } : action === 'up' ? {
            x: current.x,
            z: current.z - 1
          } : {
            x: current.x,
            z: current.z + 1
          };
          const [first, second] = cubes;
          if (first.z === second.z && Math.abs(first.x - second.x) === 1) {
            block = {
              anchor: {
                x: Math.min(first.x, second.x),
                z: first.z
              },
              orientation: 'lying-x'
            };
            frames.push({
              cells: occupiedCells(block),
              whole: block,
              landed: true
            });
          } else if (first.x === second.x && Math.abs(first.z - second.z) === 1) {
            block = {
              anchor: {
                x: first.x,
                z: Math.min(first.z, second.z)
              },
              orientation: 'lying-z'
            };
            frames.push({
              cells: occupiedCells(block),
              whole: block,
              landed: true
            });
          } else {
            frames.push({
              cells: cubes.map(cloneCoord),
              whole: null,
              landed: true
            });
          }
        }
        if (!frames[frames.length - 1].whole) throw new Error('Split actions must recombine the cubes.');
        for (const direction of suffix) {
          block = rollBlock(block, direction);
          frames.push({
            cells: occupiedCells(block),
            whole: block,
            landed: true
          });
        }
        return {
          frames,
          solution: [...prefix, ...split.actions, ...suffix],
          splitDefinition
        };
      }
      function buildLevel(meta, frames, solution, mechanics = {}, splitDefinition) {
        const final = frames[frames.length - 1].whole;
        if (!final || final.orientation !== 'standing') throw new Error(`${meta.id} must finish standing.`);
        const goal = cloneCoord(final.anchor);
        const tileTypes = new Map();
        for (const frame of frames.slice(0, -1)) {
          for (const cell of frame.cells) tileTypes.set(key(cell), 'normal');
        }
        for (const cell of goalRing(goal)) tileTypes.set(key(cell), 'normal');
        tileTypes.delete(key(goal));
        if (splitDefinition) tileTypes.set(key(splitDefinition), 'split');
        const firstSeen = new Map();
        const standingCells = new Set();
        frames.forEach((frame, index) => {
          var _frame$whole;
          for (const cell of frame.cells) {
            if (!firstSeen.has(key(cell))) firstSeen.set(key(cell), index);
          }
          if (((_frame$whole = frame.whole) == null ? void 0 : _frame$whole.orientation) === 'standing') standingCells.add(key(frame.whole.anchor));
        });
        const bridges = [];
        const switches = [];
        const reserved = new Set(splitDefinition ? [key(splitDefinition)] : []);
        const gates = mechanics.gates ?? [];
        for (const gate of gates) {
          var _frame$whole2;
          if (gate.switchFrame === undefined) continue;
          const frame = frames[gate.switchFrame];
          const cell = gate.switchCellIndex === undefined ? ((_frame$whole2 = frame.whole) == null ? void 0 : _frame$whole2.orientation) === 'standing' ? frame.whole.anchor : frame.cells[0] : frame.cells[gate.switchCellIndex];
          reserved.add(key(cell));
        }
        for (let gateIndex = 0; gateIndex < gates.length; gateIndex += 1) {
          var _switchFrame$whole, _gate$bridgePlacement;
          const gate = gates[gateIndex];
          const usableEnd = Math.max(3, frames.length - 2);
          const switchTarget = Math.max(1, Math.floor((gateIndex + 1) * usableEnd / (gates.length + 2)));
          const bridgeTarget = Math.max(switchTarget + 1, Math.floor((gateIndex + 2) * usableEnd / (gates.length + 2)));
          const switchFrameIndex = gate.switchFrame ?? findSwitchFrame(frames, gate.type, switchTarget, frames.length - 1, reserved, tileTypes);
          const switchFrame = frames[switchFrameIndex];
          const switchCell = gate.switchCellIndex === undefined ? ((_switchFrame$whole = switchFrame.whole) == null ? void 0 : _switchFrame$whole.orientation) === 'standing' ? switchFrame.whole.anchor : switchFrame.cells.find(cell => !reserved.has(key(cell))) : switchFrame.cells[gate.switchCellIndex];
          const switchKey = key(switchCell);
          reserved.add(switchKey);
          tileTypes.set(switchKey, gate.type);
          const bridgeId = `gate-${gateIndex + 1}`;
          const bridgeCells = [];
          const bridgeCellCount = ((_gate$bridgePlacement = gate.bridgePlacements) == null ? void 0 : _gate$bridgePlacement.length) ?? gate.bridgeCellCount ?? 1;
          for (let cellIndex = 0; cellIndex < bridgeCellCount; cellIndex += 1) {
            var _gate$bridgePlacement2;
            const placement = (_gate$bridgePlacement2 = gate.bridgePlacements) == null ? void 0 : _gate$bridgePlacement2[cellIndex];
            const bridgeCell = placement ? frames[placement.frame].cells[placement.cellIndex ?? 0] : findBridgeCell(frames, bridgeTarget + cellIndex, switchFrameIndex, firstSeen, reserved, goal);
            reserved.add(key(bridgeCell));
            tileTypes.delete(key(bridgeCell));
            bridgeCells.push(cloneCoord(bridgeCell));
          }
          bridges.push({
            id: bridgeId,
            cells: bridgeCells,
            initiallyActive: false
          });
          switches.push({
            ...cloneCoord(switchCell),
            actions: [{
              bridgeId,
              mode: gate.mode ?? 'enable'
            }]
          });
        }
        let fragileRemaining = mechanics.fragileCount ?? 0;
        const fragileFrames = frames.slice(1, -1).filter(frame => {
          var _frame$whole3;
          return frame.landed && ((_frame$whole3 = frame.whole) == null ? void 0 : _frame$whole3.orientation) !== 'standing';
        }).sort((first, second) => Number(first.whole !== null) - Number(second.whole !== null));
        for (const frame of fragileFrames) {
          var _frame$whole4;
          if (fragileRemaining === 0) break;
          if (!frame.landed || ((_frame$whole4 = frame.whole) == null ? void 0 : _frame$whole4.orientation) === 'standing') continue;
          for (const cell of frame.cells) {
            const cellKey = key(cell);
            if (fragileRemaining === 0) break;
            if (reserved.has(cellKey) || standingCells.has(cellKey) || tileTypes.get(cellKey) !== 'normal') continue;
            tileTypes.set(cellKey, 'fragile');
            reserved.add(cellKey);
            fragileRemaining -= 1;
          }
        }
        if (fragileRemaining > 0) throw new Error(`${meta.id} lacks safe fragile placements.`);
        const tiles = [...tileTypes.entries()].map(([coord, type]) => {
          const [x, z] = coord.split(',').map(Number);
          return {
            x,
            z,
            type
          };
        });
        return {
          ...meta,
          author,
          original: true,
          start: {
            anchor: {
              x: 0,
              z: 0
            },
            orientation: 'standing'
          },
          goal,
          tiles,
          bridges: bridges.length > 0 ? bridges : undefined,
          switches: switches.length > 0 ? switches : undefined,
          splits: splitDefinition ? [splitDefinition] : undefined,
          solution,
          par: solution.filter(action => action !== 'switch-cube').length
        };
      }
      function findSwitchFrame(frames, type, target, before, reserved, tileTypes) {
        const candidates = [];
        for (let index = 1; index < Math.min(before, frames.length - 1); index += 1) {
          var _frame$whole5;
          const frame = frames[index];
          if (!frame.landed) continue;
          if (!frame.whole) continue;
          if (type === 'hard-switch' && ((_frame$whole5 = frame.whole) == null ? void 0 : _frame$whole5.orientation) !== 'standing') continue;
          if (!frame.cells.some(cell => !reserved.has(key(cell)) && tileTypes.has(key(cell)))) continue;
          candidates.push(index);
        }
        if (candidates.length === 0) throw new Error(`No ${type} placement before frame ${before}.`);
        return candidates.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best);
      }
      function findBridgeCell(frames, target, after, firstSeen, reserved, goal) {
        for (let index = Math.max(after + 1, target); index < frames.length - 1; index += 1) {
          const cell = frames[index].cells.find(candidate => firstSeen.get(key(candidate)) > after && !reserved.has(key(candidate)) && key(candidate) !== key(goal));
          if (cell) return cell;
        }
        for (let index = after + 1; index < frames.length - 1; index += 1) {
          const cell = frames[index].cells.find(candidate => firstSeen.get(key(candidate)) > after && !reserved.has(key(candidate)) && key(candidate) !== key(goal));
          if (cell) return cell;
        }
        throw new Error(`No bridge placement after frame ${after}.`);
      }
      const wholeBlueprints = [{
        meta: {
          id: 'south-step',
          title: 'South Step',
          passcode: 'RIFT'
        },
        route: ['left', 'left']
      }, {
        meta: {
          id: 'first-roll',
          title: 'First Roll',
          passcode: 'CUBE'
        },
        route: ['up', 'right', 'right', 'up']
      }, {
        meta: {
          id: 'quiet-corner',
          title: 'Quiet Corner',
          passcode: 'VEIL'
        },
        route: ['left', 'up', 'left', 'up', 'left', 'down']
      }, {
        meta: {
          id: 'narrow-return',
          title: 'Narrow Return',
          passcode: 'TILT'
        },
        route: ['up', 'left', 'down', 'down', 'left', 'up']
      }, {
        meta: {
          id: 'gate-primer',
          title: 'Gate Primer',
          passcode: 'GATE'
        },
        route: ['left', 'down', 'down', 'left', 'left', 'up', 'up', 'left'],
        mechanics: {
          gates: [{
            type: 'soft-switch'
          }]
        }
      }, {
        meta: {
          id: 'copper-relay',
          title: 'Copper Relay',
          passcode: 'RLAY'
        },
        route: ['left', 'down', 'down', 'left', 'down', 'right', 'right', 'down'],
        mechanics: {
          gates: [{
            type: 'hard-switch'
          }]
        }
      }, {
        meta: {
          id: 'twin-causeway',
          title: 'Twin Causeway',
          passcode: 'TWAY'
        },
        route: ['right', 'up', 'right', 'up', 'up', 'up', 'right', 'up'],
        mechanics: {
          gates: [{
            type: 'soft-switch'
          }]
        }
      }, {
        meta: {
          id: 'brittle-turn',
          title: 'Brittle Turn',
          passcode: 'BRIT'
        },
        route: ['right', 'down', 'right', 'down', 'left', 'down', 'right', 'right'],
        mechanics: {
          fragileCount: 1
        }
      }, {
        meta: {
          id: 'thin-margin',
          title: 'Thin Margin',
          passcode: 'MRGN'
        },
        route: ['up', 'right', 'down', 'left', 'down', 'left', 'left', 'down', 'down', 'right'],
        mechanics: {
          fragileCount: 2
        }
      }, {
        meta: {
          id: 'ember-plate',
          title: 'Ember Plate',
          passcode: 'EMPL'
        },
        route: ['down', 'right', 'down', 'down', 'right', 'right', 'up', 'right', 'down', 'left', 'left', 'left'],
        mechanics: {
          fragileCount: 2,
          gates: [{
            type: 'soft-switch'
          }]
        }
      }, {
        meta: {
          id: 'toggle-run',
          title: 'Toggle Run',
          passcode: 'TGLR'
        },
        route: ['right', 'right', 'up', 'left', 'down', 'right', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'left'],
        mechanics: {
          gates: [{
            type: 'soft-switch',
            mode: 'toggle'
          }, {
            type: 'hard-switch'
          }]
        }
      }, {
        meta: {
          id: 'locked-arc',
          title: 'Locked Arc',
          passcode: 'LARC'
        },
        route: ['left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'left', 'left'],
        mechanics: {
          gates: [{
            type: 'hard-switch'
          }, {
            type: 'soft-switch'
          }]
        }
      }, {
        meta: {
          id: 'hollow-route',
          title: 'Hollow Route',
          passcode: 'HLLO'
        },
        route: ['left', 'left', 'left', 'down', 'left', 'down', 'down', 'down', 'down', 'left', 'up', 'up', 'right', 'right', 'right'],
        mechanics: {
          fragileCount: 3,
          gates: [{
            type: 'soft-switch'
          }]
        }
      }, {
        meta: {
          id: 'counterweight',
          title: 'Counterweight',
          passcode: 'CWGT'
        },
        route: ['up', 'left', 'up', 'left', 'left', 'down', 'right', 'up', 'right', 'right', 'right', 'down', 'right'],
        mechanics: {
          fragileCount: 2,
          gates: [{
            type: 'hard-switch'
          }, {
            type: 'soft-switch'
          }]
        }
      }];
      const splitSuffixes = [['right', 'down', 'down', 'left', 'up', 'right', 'down', 'left', 'up', 'right', 'up', 'left'], ['right', 'right', 'up', 'right'], ['up', 'left', 'up', 'up', 'right'], ['up', 'left', 'left', 'left', 'down', 'left'], ['left', 'down', 'left', 'down', 'right', 'right'], ['up', 'left', 'up', 'right', 'right', 'right', 'up'], ['left', 'up', 'up', 'up', 'up', 'up', 'left', 'left'], ['up', 'left', 'up', 'right', 'right', 'right', 'up', 'up'], ['right', 'right', 'down', 'right', 'down', 'left', 'left', 'down', 'down', 'down'], ['up', 'right', 'up', 'left', 'left', 'left', 'left', 'left', 'up'], ['left', 'down', 'down', 'right', 'down', 'right', 'up', 'right', 'right', 'down', 'left'], ['up', 'right', 'up', 'left', 'left', 'left', 'up', 'up'], ['right', 'right', 'up', 'right', 'up', 'left', 'left', 'up', 'up', 'up'], ['down', 'right', 'down', 'left', 'left', 'left', 'left', 'left', 'down']];
      const splitMetas = [{
        id: 'first-divide',
        title: 'First Divide',
        passcode: 'DUAL'
      }, {
        id: 'separate-ways',
        title: 'Separate Ways',
        passcode: 'APAR'
      }, {
        id: 'pairing-point',
        title: 'Pairing Point',
        passcode: 'PAIR'
      }, {
        id: 'offset-twins',
        title: 'Offset Twins',
        passcode: 'OFST'
      }, {
        id: 'relay-cubes',
        title: 'Relay Cubes',
        passcode: 'RCUB'
      }, {
        id: 'split-current',
        title: 'Split Current',
        passcode: 'SCUR'
      }, {
        id: 'reunion',
        title: 'Reunion',
        passcode: 'REUN'
      }, {
        id: 'fragile-relay',
        title: 'Fragile Relay',
        passcode: 'FREL'
      }, {
        id: 'broken-circuit',
        title: 'Broken Circuit',
        passcode: 'BCIR'
      }, {
        id: 'crossed-signals',
        title: 'Crossed Signals',
        passcode: 'XSIG'
      }, {
        id: 'dual-gate',
        title: 'Dual Gate',
        passcode: 'DGAT'
      }, {
        id: 'shifting-span',
        title: 'Shifting Span',
        passcode: 'SHFT'
      }, {
        id: 'split-furnace',
        title: 'Split Furnace',
        passcode: 'SFUR'
      }, {
        id: 'return-vector',
        title: 'Return Vector',
        passcode: 'RVEC'
      }];
      const splitPlans = [{
        destinations: [{
          x: 0,
          z: 3
        }, {
          x: 3,
          z: 3
        }],
        actions: ['right', 'right']
      }, {
        destinations: [{
          x: 0,
          z: 3
        }, {
          x: 3,
          z: 3
        }],
        actions: ['switch-cube', 'left', 'left']
      }, {
        destinations: [{
          x: 5,
          z: 0
        }, {
          x: 5,
          z: 3
        }],
        actions: ['down', 'down']
      }, {
        destinations: [{
          x: 5,
          z: 0
        }, {
          x: 5,
          z: 3
        }],
        actions: ['switch-cube', 'up', 'up']
      }];
      const advancedSplitPlans = [{
        destinations: [{
          x: 0,
          z: 3
        }, {
          x: 5,
          z: 3
        }],
        actions: ['up', 'up', 'right', 'right', 'switch-cube', 'up', 'up', 'left', 'left']
      }, {
        destinations: [{
          x: 5,
          z: 0
        }, {
          x: 5,
          z: 5
        }],
        actions: ['left', 'left', 'down', 'down', 'switch-cube', 'left', 'left', 'up', 'up']
      }, {
        destinations: [{
          x: -2,
          z: 2
        }, {
          x: 4,
          z: 2
        }],
        actions: ['down', 'down', 'right', 'right', 'right', 'switch-cube', 'down', 'down', 'left', 'left']
      }, {
        destinations: [{
          x: 4,
          z: -2
        }, {
          x: 4,
          z: 4
        }],
        actions: ['left', 'left', 'down', 'down', 'down', 'switch-cube', 'left', 'left', 'up', 'up']
      }];
      const isolatedSplitPlan = {
        destinations: [{
          x: 0,
          z: 5
        }, {
          x: 5,
          z: 5
        }],
        actions: ['down', 'down', 'right', 'right', 'switch-cube', 'down', 'down', 'left', 'left']
      };
      const isolatedMirrorSplitPlan = {
        destinations: [{
          x: 1,
          z: 5
        }, {
          x: -4,
          z: 5
        }],
        actions: ['down', 'down', 'left', 'left', 'switch-cube', 'down', 'down', 'right', 'right']
      };
      const isolatedWideMirrorSplitPlan = {
        destinations: [{
          x: 1,
          z: 5
        }, {
          x: -5,
          z: 5
        }],
        actions: ['down', 'down', 'left', 'left', 'left', 'switch-cube', 'down', 'down', 'right', 'right']
      };
      const forcedDualRoutePlan = {
        destinations: [{
          x: 0,
          z: 5
        }, {
          x: 5,
          z: 5
        }],
        actions: ['switch-cube', 'down', 'down', 'left', 'left', 'switch-cube', 'down', 'down', 'right', 'right']
      };
      const forcedDualRouteMirrorPlan = {
        destinations: [{
          x: 1,
          z: 5
        }, {
          x: -4,
          z: 5
        }],
        actions: ['switch-cube', 'down', 'down', 'right', 'right', 'switch-cube', 'down', 'down', 'left', 'left']
      };
      const mirroredVerticalSplitPlan = {
        destinations: [{
          x: 1,
          z: 0
        }, {
          x: 1,
          z: 5
        }],
        actions: ['right', 'right', 'down', 'down', 'switch-cube', 'right', 'right', 'up', 'up']
      };
      const standingRouteA = ['up', 'right', 'down', 'left', 'down', 'left', 'left', 'down', 'down', 'right'];
      const standingRouteB = ['left', 'down', 'down', 'down', 'right', 'right', 'up', 'right', 'down', 'left', 'down'];
      const standingRouteC = ['left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'left', 'left'];
      const standingRouteD = ['right', 'right', 'up', 'left', 'down', 'right', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'left'];
      const standingRouteE = ['down', 'down', 'right', 'up', 'left', 'down', 'left', 'down', 'left', 'left', 'up', 'up', 'up', 'up'];
      const standingRouteF = ['left', 'left', 'down', 'right', 'up', 'left', 'up', 'left', 'up', 'up', 'right', 'right', 'right', 'right'];
      const standingRouteG = ['up', 'up', 'left', 'down', 'right', 'up', 'right', 'up', 'right', 'right', 'down', 'down', 'down', 'down'];
      const advancedSplitRoutes = {
        1: {
          plan: forcedDualRoutePlan,
          suffix: ['down', 'up', 'right', 'down', 'up', 'up', 'up', 'down', 'left', 'left', 'right', 'up', 'up', 'right', 'down', 'right', 'down', 'up', 'up', 'right', 'up', 'left', 'up', 'right', 'right']
        },
        2: {
          plan: advancedSplitPlans[1],
          suffix: ['down', 'left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'right', 'right', 'right', 'right']
        },
        3: {
          plan: isolatedMirrorSplitPlan,
          suffix: ['down', 'right', 'down', 'right', 'down', 'right', 'right', 'right', 'up', 'up', 'left', 'left', 'right', 'down', 'right', 'up', 'up', 'up']
        },
        4: {
          plan: forcedDualRouteMirrorPlan,
          suffix: ['up', 'right', 'right', 'up', 'up', 'left', 'left', 'right', 'up', 'up', 'left', 'down', 'left', 'up', 'left', 'right', 'up', 'left', 'up', 'up', 'right']
        },
        5: {
          plan: isolatedWideMirrorSplitPlan,
          suffix: ['right', 'down', 'up', 'up', 'up', 'right', 'up', 'right', 'up', 'up', 'right', 'right', 'right', 'left', 'down', 'down', 'right', 'down', 'left']
        },
        6: {
          plan: advancedSplitPlans[1],
          suffix: ['down', ...standingRouteC]
        },
        7: {
          plan: mirroredVerticalSplitPlan,
          suffix: ['down', ...standingRouteE]
        },
        8: {
          plan: advancedSplitPlans[3],
          suffix: ['down', ...standingRouteD]
        },
        9: {
          plan: advancedSplitPlans[0],
          suffix: ['left', 'left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'right', 'right', 'right', 'right']
        },
        10: {
          plan: isolatedSplitPlan,
          suffix: ['right', ...standingRouteD]
        },
        11: {
          plan: isolatedSplitPlan,
          suffix: ['left', ...standingRouteE]
        },
        12: {
          plan: isolatedSplitPlan,
          suffix: ['right', ...standingRouteC]
        },
        13: {
          plan: advancedSplitPlans[0],
          suffix: ['left', ...standingRouteF]
        }
      };
      const lateWholeBlueprints = [{
        meta: {
          id: 'iron-labyrinth',
          title: 'Iron Labyrinth',
          passcode: 'IRON'
        },
        route: ['right', 'right', 'left', 'left', 'up', 'up', 'down', 'down', ...standingRouteB, ...standingRouteA],
        mechanics: {
          fragileCount: 10,
          gates: [{
            type: 'hard-switch',
            bridgeCellCount: 3,
            switchFrame: 2
          }, {
            type: 'hard-switch',
            bridgeCellCount: 3,
            switchFrame: 6
          }]
        }
      }, {
        meta: {
          id: 'triple-relay',
          title: 'Triple Relay',
          passcode: 'TRLY'
        },
        route: ['right', 'right', 'left', 'left', 'up', 'up', 'down', 'down', 'left', 'left', 'right', 'right', 'down', 'down', 'right', 'up', 'left', 'down', 'left', 'down', 'left', 'left', 'up', 'up', 'up', 'up'],
        mechanics: {
          fragileCount: 10,
          gates: [{
            type: 'hard-switch',
            bridgeCellCount: 2,
            switchFrame: 2
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2,
            switchFrame: 6
          }, {
            type: 'hard-switch',
            bridgeCellCount: 3,
            switchFrame: 10
          }]
        }
      }, {
        meta: {
          id: 'divided-works',
          title: 'Divided Works',
          passcode: 'DWRK'
        },
        route: ['right', 'right', 'left', 'left', 'up', 'up', 'down', 'down', 'left', 'left', 'right', 'right', 'down', 'down', 'up', 'up', ...standingRouteG, ...standingRouteB],
        mechanics: {
          fragileCount: 8,
          gates: [{
            type: 'hard-switch',
            bridgeCellCount: 3,
            switchFrame: 2
          }, {
            type: 'hard-switch',
            bridgeCellCount: 3,
            switchFrame: 6
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2,
            switchFrame: 10
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2,
            switchFrame: 14
          }]
        }
      }];
      const openingLevels = wholeBlueprints.map(blueprint => {
        const frames = wholeTrace(blueprint.route);
        return buildLevel(blueprint.meta, frames, blueprint.route, blueprint.mechanics);
      });
      function mechanicsForSplitLevel(index) {
        if (index === 1) return {
          fragileCount: 4,
          gates: [{
            type: 'soft-switch',
            switchFrame: 7,
            switchCellIndex: 1,
            bridgePlacements: [{
              frame: 11,
              cellIndex: 0
            }, {
              frame: 12,
              cellIndex: 0
            }]
          }]
        };
        if (index === 3) return {
          fragileCount: 4,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2,
            switchFrame: 8,
            switchCellIndex: 1
          }]
        };
        if (index === 4) return {
          fragileCount: 5,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2,
            switchFrame: 7,
            switchCellIndex: 1
          }]
        };
        if (index === 5) return {
          fragileCount: 5,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2,
            switchFrame: 9,
            switchCellIndex: 1
          }]
        };
        if (index < 3) return {};
        if (index < 7) return {
          fragileCount: index % 2
        };
        if (index === 7) return {
          fragileCount: 6,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2
          }]
        };
        if (index === 8) return {
          fragileCount: 8,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2
          }]
        };
        if (index === 9) return {
          fragileCount: 6,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2
          }]
        };
        if (index === 10) return {
          fragileCount: 8,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2,
            switchFrame: 8,
            switchCellIndex: 1
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2
          }]
        };
        if (index === 11) return {
          fragileCount: 9,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 2,
            switchFrame: 8,
            switchCellIndex: 1
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2
          }]
        };
        if (index === 12) return {
          fragileCount: 10,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 3,
            switchFrame: 8,
            switchCellIndex: 1
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2
          }]
        };
        return {
          fragileCount: 10,
          gates: [{
            type: 'soft-switch',
            bridgeCellCount: 3
          }, {
            type: 'hard-switch',
            bridgeCellCount: 2
          }]
        };
      }
      const splitLevels = splitMetas.map((meta, index) => {
        const advanced = advancedSplitRoutes[index];
        const plan = (advanced == null ? void 0 : advanced.plan) ?? splitPlans[index % splitPlans.length];
        const trace = splitTrace(['right', 'right'], plan, (advanced == null ? void 0 : advanced.suffix) ?? splitSuffixes[index]);
        const mechanics = mechanicsForSplitLevel(index);
        return buildLevel(meta, trace.frames, trace.solution, mechanics, trace.splitDefinition);
      });
      const lateLevels = lateWholeBlueprints.map(blueprint => {
        const frames = wholeTrace(blueprint.route);
        return buildLevel(blueprint.meta, frames, blueprint.route, blueprint.mechanics);
      });
      function buildLateSplitLevel(meta, plan, suffix, mechanics) {
        const trace = splitTrace(['right', 'right'], plan, suffix);
        return buildLevel(meta, trace.frames, trace.solution, mechanics, trace.splitDefinition);
      }
      const fractureGrid = buildLateSplitLevel({
        id: 'fracture-grid',
        title: 'Fracture Grid',
        passcode: 'FGRD'
      }, advancedSplitPlans[2], ['right', 'right', 'right', 'up', 'left', 'down', 'right', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'left'], {
        fragileCount: 8,
        gates: [{
          type: 'hard-switch',
          bridgeCellCount: 3
        }, {
          type: 'soft-switch',
          bridgeCellCount: 2
        }, {
          type: 'hard-switch',
          bridgeCellCount: 3
        }]
      });
      const lastFoundry = buildLateSplitLevel({
        id: 'last-foundry',
        title: 'Last Foundry',
        passcode: 'LAST'
      }, splitPlans[3], ['up', 'left', 'left', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'down', 'down', 'left', 'up', 'up', 'up', 'up', 'up', 'left', 'up', 'right'], {
        fragileCount: 5,
        gates: [{
          type: 'hard-switch'
        }, {
          type: 'soft-switch'
        }, {
          type: 'hard-switch'
        }]
      });
      const chapterOneLevels = exports('chapterOneLevels', [...openingLevels, ...splitLevels, lateLevels[0], lateLevels[1], fractureGrid, lateLevels[2], lastFoundry]);
      const tutorialLevels = exports('tutorialLevels', chapterOneLevels);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/types.ts", ['cc'], function () {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "896eecGih1MTpx0VEa9RXdd", "types", undefined);
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});