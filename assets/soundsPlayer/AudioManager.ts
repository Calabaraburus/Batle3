//  AudioManager.ts - ClbBlast
//
//  Calabaraburus (c) 2023
//
//  Author:Natalchishin Taras

import { Node, AudioSource, AudioClip, resources, director, assert } from "cc";

/**
 * this is a sington class for audio play, can be easily called from anywhere in you project.
 */
export class AudioManager {
  private static mgrNodeName = "__audioMgr__";

  private _volumeSound = 0.4;
  private _volumeMusic = 0.4;

  public get volumeSound() {
    return this._volumeSound;
  }

  public set volumeSound(value) {
    this._volumeSound = value;
    this._soundSource.volume = value;
  }

  public get volumeMusic() {
    return this._volumeMusic;
  }

  public set volumeMusic(value) {
    this._volumeMusic = value;
    this._audioSource.volume = value
  }

  private static _inst: AudioManager | null;

  public static get instance(): AudioManager {
    if (this._inst == null) {
      this._inst = new AudioManager();
    }
    return this._inst;
  }

  private _empty: AudioClip;

  private _audioSource: AudioSource;
  private _soundSource: AudioSource;
  constructor() {
    // add to the scene.
    const scene = director.getScene();

    assert(scene != null, "Scene is null");

    let audioMgr = scene.getChildByName(AudioManager.mgrNodeName);

    if (audioMgr == null) {
      // create a node as audioMgr
      audioMgr = new Node();
      audioMgr.name = AudioManager.mgrNodeName;

      scene.addChild(audioMgr);

      //@en make it as a persistent node, so it won't be destroied when scene change.
      director.addPersistRootNode(audioMgr);

      //@en add AudioSource componrnt to play audios.
      this._audioSource = audioMgr.addComponent(AudioSource);

      this._soundSource = audioMgr.addComponent(AudioSource);

      resources.load("audio/empty", AudioClip, (err, clip) => {
        if (err) {
          throw Error("Can't load empty.mp3");
        }

        this._empty = clip;
      });

    } else {
      const ast = audioMgr.getComponents(AudioSource);

      assert(ast != null, "Can't find audio source");

      this._audioSource = ast[0];
      this._soundSource = ast[1];
    }
  }

  public get audioSource() {
    return this._audioSource;
  }

  public get soundSource() {
    return this._soundSource;
  }

  public get isMusicPlaying(): boolean {
    return this._audioSource.playing;
  }

  /**
   * @en
   * play short audio, such as strikes,explosions
   * @zh
   * 播放短音频,比如 打击音效，爆炸音效等
   * @param sound clip or url for the audio
   * @param volume
   */
  playEffect(sound: AudioClip | string, oneShot = true) {
    if (sound instanceof AudioClip) {
      if (oneShot) {
        this._soundSource.playOneShot(sound);
      } else {
        this._soundSource.clip = sound;
        this._soundSource.play();
      }
    } else {
      resources.load(sound, (err, clip: AudioClip) => {
        if (err) {
          console.log(err);
        } else {
          this._soundSource.playOneShot(clip);
        }
      });
    }
    this._soundSource.volume = this._volumeSound;
  }

  /**
   * @en
   * play long audio, such as the bg music
   * @zh
   * 播放长音频，比如 背景音乐
   * @param sound clip or url for the sound
   * @param volume
   */
  play(sound: AudioClip | string) {

    if (sound instanceof AudioClip) {
      this._audioSource.clip = sound;

      this._audioSource.play();
      this.audioSource.volume = this._volumeMusic;

    } else {
      resources.load(sound, (err, clip: AudioClip) => {
        if (err) {
          console.log(err);
        } else {
          this._audioSource.clip = clip;

          this._audioSource.play();
          this.audioSource.volume = this._volumeMusic;
        }
      });
    }
  }

  /**
   * stop the audio play
   */
  stop() {
    this.stopMusic();
    this.stopSound();
  }

  stopMusic() {
    this._audioSource.volume = 0;
    this._audioSource.stop();
  }

  stopSound() {
    this._soundSource.volume = 0
    this._soundSource.stop();
  }

  /**
   * pause the audio play
   */
  pause() {
    this._audioSource.pause();
  }

  /**
   * resume the audio play
   */
  resume() {
    this._audioSource.play();
  }

  public static Clear() {
    const scene = director.getScene();

    assert(scene != null, "Scene is null");

    let audioMgr = scene.getChildByName(AudioManager.mgrNodeName);

    if (audioMgr != null) {
      this._inst?.stop();
      scene.removeChild(audioMgr);
      audioMgr.destroy();
    }

    this._inst = null;
  }
}
