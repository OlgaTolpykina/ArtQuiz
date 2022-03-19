import Control from '../../components/control';
import { AnimatedControl } from '../../components/animatedControl';
import { IQuestionData } from '../../services/types';

export class PictureQuestionView extends AnimatedControl {
  onAnswer: (index: number) => void;

  constructor(parentNode: HTMLElement, questionData: IQuestionData) {
    super(parentNode, 'div', { default: 'wrapper', hidden: 'hide' });
    this.quickOut();

    const question = new Control(
      this.node,
      'div',
      'question_title',
      `Какую картину написал ${questionData.artistName}?`
    );
    const questionsWrapper = new Control(this.node, 'div', 'pictures_wrapper', '');
    const answerButtons = questionData.picturesAnswers.map((it, i) => {
      const button = new Control(questionsWrapper.node, 'button', 'question_img');
      button.node.style.backgroundImage = `url("${it}")`;
      button.node.onclick = () => {
        this.onAnswer(i);
      };
    });
  }
}
