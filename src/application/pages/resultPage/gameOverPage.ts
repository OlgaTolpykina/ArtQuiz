import Control from '../../components/control';

export class GameOverPage extends Control {
  onNext: () => void;
  onHome: () => void;

  constructor(parentNode: HTMLElement, results: Array<boolean>) {
    super(parentNode, 'div', 'results_wrapper');

    const resultPhrase = new Control(this.node, 'p', '');
    const resultIndicator = new Control(this.node, 'div', 'results', '');
    const correctAnswers = results.filter((result: boolean) => result).length;
    resultIndicator.node.textContent = `${correctAnswers} / ${results.length}`;
    const resultImg = new Control(this.node, 'div', '', '');

    if (correctAnswers <= 3) {
      resultPhrase.node.textContent = 'Могло быть и хуже...';
      resultImg.node.style.backgroundImage = 'url("./public/img/champion-cup-1")';
    } else if (correctAnswers > 3 && correctAnswers <= 7) {
      resultPhrase.node.textContent = 'Хороший результат';
      resultImg.node.style.backgroundImage = 'url("./public/img/champion-cup-2")';
    } else {
      resultPhrase.node.textContent = 'Прекрасный результат';
      resultImg.node.style.backgroundImage = 'url("./public/img/champion-cup-3")';
    }

    const nextButton = new Control(this.node, 'button', '', 'next');
    nextButton.node.onclick = () => {
      this.onNext();
    };

    const homeButton = new Control(this.node, 'button', '', 'home');
    homeButton.node.onclick = () => {
      this.onHome();
    };
  }
}
