import Control from '../common/control';
import './modal.css';

export class Modal extends Control {
  onNextQuestion: () => void;

  constructor(parentNode: HTMLElement) {
    super(parentNode);
    const overlay = new Control(this.node, 'div', 'overlay', '');
    const modal = new Control(this.node, 'div', 'modal modal_content', '');

    const nextButton = new Control(modal.node, 'button', '', 'next');
    nextButton.node.onclick = () => {
      this.onNextQuestion();
    }
  }
}
