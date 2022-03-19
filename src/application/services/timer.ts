import Control from '../components/control';

export class Timer extends Control {
  onTimeOut: () => void;
  timer: number;
  initialTime: number;
  inputTimer: number;

  start(time: number, timerInput: Control<HTMLInputElement>, timerIndicator: Control<HTMLElement>) {
    this.initialTime = time;
    if (this.timer || this.inputTimer) {
      this.stop();
    }
    timerInput.node.value = '0';
    let currentTime = time;
    let currentTime1 = time;
    const render = (timeCurrent: number) => {
      const timeToShow = timeCurrent >= 10 ? timeCurrent.toString() : `0${timeCurrent}`;
      timerIndicator.node.textContent = `00:${timeToShow}`;
    };
    render(time);
    this.timer = window.setInterval(() => {
      currentTime--;
      render(currentTime);
      if (currentTime <= 0) {
        this.onTimeOut();
      }
    }, 1000);

    this.inputTimer = window.setInterval(() => {
      currentTime1 -= 0.005;
      const value = (time - currentTime1) / time;
      timerInput.node.value = value.toString();
      console.log(timerInput.node.value, value);
      const percent = 100;
      timerInput.node.style.background = `linear-gradient(to right, #ffbca2 0%, #ffbca2 ${value * percent}%, #a4a4a4 ${
        value * percent
      }%, #a4a4a4 100%)`;
    }, 5);
  }

  stop() {
    window.clearInterval(this.timer);
    window.clearInterval(this.inputTimer);
  }
}
