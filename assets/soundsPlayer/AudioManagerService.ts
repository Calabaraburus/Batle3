import { _decorator, AudioClip, CCString, Component, Node } from "cc";
import { Service } from "../entities/services/Service";
import { AudioManager } from "./AudioManager";
import { Queue } from "../scripts/Queue";
const { ccclass, property } = _decorator;

@ccclass("AudioManagerService")
export class AudioManagerService extends Service {
  static instance: AudioManagerService;

  private _currentMusicList: string[] = [];
  private _currentMusicId = 0;
  private _musicStoped = true;
  private _taskQueue: Queue<() => void> = new Queue<() => void>;
  private _soundVolume = 0;
  private _musicVolume = 0;

  @property(AudioClip)
  sounds: AudioClip[] = [];

  @property(AudioClip)
  music: AudioClip[] = [];

  onLoad() {
        if (!AudioManagerService.instance) {
            AudioManagerService.instance = this;
        } else {
            console.warn('AudioManagerService: duplicate detected, destroying!');
            this.node.destroy();
        }
    }

  get currentMusicList() {
    return this._currentMusicList;
  }

  set currentMusicList(value: string[]) {
    this._currentMusicList = value;
    this._currentMusicId = 0;

    this.refreshMusic()
  }

  playSoundEffect(soundName: string, oneShot = true) {
    const sound = this.getTargetSound(soundName);
    if (!sound) return;
    if (!oneShot) {
      this._taskQueue.enqueue(() => AudioManager.instance.playEffect(sound, oneShot));
    } else {
      AudioManager.instance.playEffect(sound, oneShot);
    }
  }

  refreshMusic() {
    this.stopMusic();

    this._taskQueue.enqueue(() => this.internalRefreshMusic());
  }



  playMusic(audioName: string) {
    this._taskQueue.enqueue(() => this.internalPlayMusic(audioName));
  }

  stopMusic() {
    this._taskQueue.enqueue(() => this.internalStopMusic());
  }

  stop() {
    this.stopMusic();
  }

  private internalRefreshMusic() {
    this._musicStoped = false;
  }

  private internalStopMusic() {
    this._musicStoped = true;
    AudioManager.instance.stop();
  }

  private internalPlayMusic(audioName: string) {
    const music = this.getTargetMusic(audioName);
    if (!music) return;

    this.changeMusicVolume(this._musicVolume);
    this.changeSoundVolume(this._soundVolume);

    AudioManager.instance.play(music);

    this._musicStoped = false;
  }

  getTargetSound(soundName: string) {
    return this.sounds.find((sound) => {
      return sound.name == soundName;
    });
  }

  getTargetMusic(audioName: string) {
    return this.music.find((audioClip) => {
      return audioClip.name == audioName;
    });
  }

  changeMusicVolume(volume: number) {
    this._musicVolume = volume;
    AudioManager.instance.volumeMusic = volume;
  }

  changeSoundVolume(volume: number) {
    this._soundVolume = volume;
    AudioManager.instance.volumeSound = volume;
  }

  protected update(dt: number): void {

    if (!this._taskQueue.isEmpty) {
      const task = this._taskQueue.dequeue();
      task();
      return;
    }

    if (!AudioManager.instance.isMusicPlaying && !this._musicStoped) {
      this.playMusic(this.currentMusicList[this._currentMusicId]);

      this._currentMusicId++;
      if (this._currentMusicId >= this.currentMusicList.length) {
        this._currentMusicId = 0;
      }

    }
  }
}
