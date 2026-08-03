import { _decorator, AudioClip, AudioSource, Component, Node, resources } from 'cc';

const { ccclass } = _decorator;

type EffectName = 'move1' | 'move2' | 'move3' | 'fall' | 'complete' | 'ui';

@ccclass('AudioController')
export class AudioController extends Component {
  private effectsSource: AudioSource | null = null;
  private ambientSource: AudioSource | null = null;
  private readonly effects = new Map<EffectName, AudioClip>();
  private moveIndex = 0;
  private ambientRequested = false;
  private soundEnabled = true;

  start(): void {
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

  playMove(): void {
    const names: readonly EffectName[] = ['move1', 'move2', 'move3'];
    this.play(names[this.moveIndex % names.length], 0.68);
    this.moveIndex += 1;
  }

  beginInteraction(): void {
    this.ensureAmbient();
  }

  playFall(): void {
    this.play('fall', 0.82);
  }

  playComplete(): void {
    this.play('complete', 0.78);
  }

  playUi(): void {
    this.ensureAmbient();
    this.play('ui', 0.55);
  }

  toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (this.effectsSource) {
      this.effectsSource.volume = this.soundEnabled ? 1 : 0;
    }
    if (this.ambientSource) {
      this.ambientSource.volume = this.soundEnabled ? 0.32 : 0;
      if (this.soundEnabled && this.ambientRequested && this.ambientSource.clip) {
        this.ambientSource.play();
      }
    }
    return this.soundEnabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  private createSource(name: string): AudioSource {
    const node = new Node(name);
    node.setParent(this.node);
    return node.addComponent(AudioSource);
  }

  private loadEffect(path: string, name: EffectName): void {
    resources.load(path, AudioClip, (error, clip) => {
      if (error) {
        console.warn(`Audio effect failed to load: ${path}`, error);
        return;
      }
      this.effects.set(name, clip);
    });
  }

  private ensureAmbient(): void {
    this.ambientRequested = true;
    if (this.soundEnabled && this.ambientSource?.clip && !this.ambientSource.playing) {
      this.ambientSource.play();
    }
  }

  private play(name: EffectName, volume: number): void {
    const clip = this.effects.get(name);
    if (clip) {
      this.effectsSource?.playOneShot(clip, volume);
    }
  }
}
