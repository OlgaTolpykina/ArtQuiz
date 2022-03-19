class SoundManagerClass {
  private baseUrl = './public/sound/';
  private cache = new Map<string, Blob>();
  private soundList: Array<string> = ['ok', 'fail'];

  preload() {
    const results = Promise.all(this.soundList.map((it) => this.preloadFile(`${this.baseUrl}${it}.mp3`)));
    results.then((res) => {
      this.soundList.forEach((soundName, i) => {
        this.cache.set(soundName, res[i]);
      });
    });
  }

  private preloadFile(url: string) {
    return fetch(url).then((res) => res.blob());
  }

  ok() {
    this.playSound('ok');
  }

  fail() {
    this.playSound('fail');
  }

  playSound(name: string) {
    const cached = this.cache.get(name);
    if (cached) {
      const audio = new Audio(URL.createObjectURL(cached));
      audio.play();
    } else {
      const audio = new Audio(`${this.baseUrl}${name}.mp3`);
      audio.play();
    }
  }
}

export const SoundManager = new SoundManagerClass();
