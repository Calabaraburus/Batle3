import { _decorator, AudioClip, AudioSource, director, Node } from "cc";
import { Service } from "../entities/services/Service";
const { ccclass, property } = _decorator;

@ccclass("AudioManager_old")
export class AudioManager_old extends Service {
  @property(AudioClip)
  sounds: AudioClip[] = [];

  @property(AudioClip)
  music: AudioClip[] = [];

  private _audioSource: AudioSource;
  private _soundSource: AudioSource;

  // private _inst: AudioManager;
  // public get inst(): AudioManager {
  //   if (this._inst == null) {
  //     this._inst = new AudioManager();
  //   }
  //   return this._inst;
  // }

  constructor() {
    super();

    if (!director.getScene()?.getChildByName("__audioMgr__")) {
      const audioMgr = new Node();
      audioMgr.name = "__audioMgr__";

      director.getScene()?.addChild(audioMgr);

      director.addPersistRootNode(audioMgr);

      this._audioSource = audioMgr.addComponent(AudioSource);
    }

    if (!director.getScene()?.getChildByName("__soundMgr__")) {
      const soundMgr = new Node();
      soundMgr.name = "__soundMgr__";

      director.getScene()?.addChild(soundMgr);

      director.addPersistRootNode(soundMgr);

      this._soundSource = soundMgr.addComponent(AudioSource);
    }
  }

  get audioSource() {
    return this._audioSource;
  }

  get soundSource() {
    return this._soundSource;
  }

  playSoundEffect(soundName: string) {
    const sound = this.getTargetSound(soundName);
    if (!sound) return;
    this.soundSource.playOneShot(sound, 1);
  }

  playMusic(audioName: string) {
    const music = this.getTargetMusic(audioName);
    if (!music) return;
    this.audioSource.clip = music;
    this.audioSource.play();
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

  changeVolume(audioSource: AudioSource) {
    if (audioSource.volume == 1) {
      audioSource.volume = 0;
    } else {
      audioSource.volume = 1;
    }
  }
}
