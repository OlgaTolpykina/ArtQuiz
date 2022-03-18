import Control from '../../components/control';
import { AnimatedControl } from '../../components/animatedControl';
import { IQuestionData } from '../../services/types';

import './pictureQuestion.css';

export class ArtistQuestionView extends AnimatedControl {
  onAnswer: (index: number) => void;

  constructor(parentNode: HTMLElement, questionData: IQuestionData) {
    super (parentNode, 'div', { default: 'wrapper', hidden: 'hide'});
    this.quickOut();

    const question = new Control(this.node, 'div', '', 'Вопрос?');
    const img = new Image(200, 200);
    img.src = questionData.imgUrl;
    question.node.append(img);
    const answerButtons = questionData.artistsAnswers.map((it, i) => {
      const button = new Control(this.node, 'button', '', it.toString());
      button.node.onclick = () => {
        this.onAnswer(i);
      }
    })
  }
}