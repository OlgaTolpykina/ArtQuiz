import Control from '../../components/control';
import { AnimatedControl } from '../../components/animatedControl';
import { IQuestionData } from '../../services/types';

import './pictureQuestion.css';

export class ArtistQuestionView extends AnimatedControl {
  onAnswer: (index: number) => void;

  constructor(parentNode: HTMLElement, questionData: IQuestionData) {
    super(parentNode, 'div', { default: 'wrapper', hidden: 'hide' });
    this.quickOut();

    const question = new Control(this.node, 'div', 'question_title', 'Кто автор данной картины?');
    const questionImg = new Control(this.node, 'div', 'artists_img', '');
    questionImg.node.style.backgroundImage = `url("${questionData.imgUrl}")`;
    const answersWrapper = new Control(this.node, 'div', 'artists_answers', '');
    const answerButtons = questionData.artistsAnswers.map((it, i) => {
      const button = new Control(answersWrapper.node, 'button', 'artists_answer', it.toString());
      button.node.onclick = () => {
        this.onAnswer(i);
      };
    });
  }
}
