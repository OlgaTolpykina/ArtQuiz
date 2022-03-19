import Control from '../../components/control';
import { ICategoryData, IQuestionData } from '../../services/types';
import { AnimatedControl } from '../../components/animatedControl';
import { IQuizResults, IQuizScore } from '../gameFieldPage/gameFieldPage';
// import './categories.css';
// import './modal.css';

export class ScoreDetailsPage extends AnimatedControl {
  onBack: () => void;

  constructor(
    parentNode: HTMLElement,
    categoryIndex: number,
    quizCategoriesData: Array<ICategoryData>,
    quizScoreData: IQuizResults
  ) {
    super(parentNode, 'div', { default: 'categories_page', hidden: 'hide' });
    this.quickOut();
    const headerWrapper = new Control(this.node, 'div', 'head_panel');
    const backButton = new Control(headerWrapper.node, 'button', 'button_back', 'back');
    const header = new Control(headerWrapper.node, 'h1', 'head_name', 'результат');
    backButton.node.onclick = () => {
      this.onBack();
    };

    const questionContainer = new Control(this.node, 'div', 'categories');
    const categoryButtons = quizCategoriesData[categoryIndex].questions.map((it, i) => {
      return new QuestionItem(questionContainer.node, it, quizScoreData[i + 1]);
    });
  }
}

class QuestionItem extends Control {
  constructor(parentNode: HTMLElement, data: IQuestionData, result: boolean) {
    super(parentNode, 'div', 'category');
    const button = new Control(this.node, 'div', 'score_img');
    button.node.style.backgroundImage = `url('${data.imgUrl}')`;
    const answerIndicator = new Control(this.node, 'div', 'answer_indicator score_details', '');
    if (!result) {
      button.node.classList.add('filter');
      answerIndicator.node.style.backgroundImage = 'url("./public/img/wrong_img.png")';
    } else {
      answerIndicator.node.style.backgroundImage = 'url("./public/img/right_img.png")';
    }
    button.node.onclick = () => {
      const infoWrapper = new Control(this.node, 'div', 'answer_info details_wrapper', '');
      const artistName = new Control(infoWrapper.node, 'p', 'picture_details', data.artistName);
      const artistPictureName = new Control(infoWrapper.node, 'p', 'picture_details', data.correctAnswerPictureName);
      const correctAnswerYear = new Control(
        infoWrapper.node,
        'p',
        'picture_details',
        data.correctAnswerYear.toString()
      );
    };
  }
}
