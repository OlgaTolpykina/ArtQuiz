import Control from '../components/control';

export class Timer extends Control {
  onTimeOut: () => void;
  timer: number;
  initialTime: number;

  // constructor(parentNode: HTMLElement) {
  //   super(parentNode);
  // }

  start(time: number) {
    this.initialTime = time;
    if (this.timer) {
      this.stop();
    }

    let currentTime = time;
    const render = (timeCurrent: number) => {
      this.node.textContent = `${this.initialTime} / ${timeCurrent}`;
    };
    render(time);
    this.timer = window.setInterval(() => {
      currentTime--;
      render(currentTime);
      if (currentTime <= 0) {
        this.onTimeOut();
      }
    }, 1000);
  }

  stop() {
    window.clearInterval(this.timer);
  }
}
