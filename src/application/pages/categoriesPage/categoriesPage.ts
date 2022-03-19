import Control from '../../components/control';
import { ICategoryData } from '../../services/types';
import { AnimatedControl } from '../../components/animatedControl';
import { IQuizScore } from '../gameFieldPage/gameFieldPage';

export class CategoriesPage extends AnimatedControl {
  onBack: () => void;
  onSelect: (index: number) => void;
  onScore: (index: number) => void;

  constructor(
    parentNode: HTMLElement,
    gameName: string,
    quizCategoriesData: Array<ICategoryData>,
    quizScoreData: IQuizScore
  ) {
    super(parentNode, 'div', { default: 'categories_page', hidden: 'hide' });
    this.quickOut();
    const headerWrapper = new Control(this.node, 'div', 'head_panel');
    const backButton = new Control(headerWrapper.node, 'button', 'button_back', '');
    const gameType = gameName === 'pictures' ? 'картины' : 'художники';
    const header = new Control(headerWrapper.node, 'h1', 'head_name', gameType);
    backButton.node.onclick = () => {
      this.onBack();
    };

    const categoriesContainer = new Control(this.node, 'div', 'categories');
    const categoryButtons = quizCategoriesData.map((it, i) => {
      return new CategoryItem(categoriesContainer.node, it, quizScoreData, (i + 1).toString(), {
        onSelect: () => {
          this.onSelect(i);
        },
        onScore: () => {
          this.onScore(i);
        },
      });
    });
  }
}

interface ICategoryItemController {
  onScore: () => void;
  onSelect: () => void;
}

class CategoryItem extends Control {
  constructor(
    parentNode: HTMLElement,
    data: ICategoryData,
    scoreData: IQuizScore,
    categoryName: string,
    controller: ICategoryItemController
  ) {
    super(parentNode, 'div', 'category');

    const categoryNameField = new Control(this.node, 'p', 'category_name', categoryName);
    if (scoreData[data.name]) {
      const categoryResult = new Control(this.node, 'div', 'category_result', '');
      const correctAnswers = scoreData[data.name].filter((result) => result).length;
      categoryResult.node.textContent = `${correctAnswers.toString()} / 10`;

      const score = new Control(this.node, 'div', 'category_score', 'score');
      score.node.onclick = () => {
        controller.onScore();
      };
    }

    const button = new Control(this.node, 'div', 'category_img', '');
    button.node.style.backgroundImage = `url('${data.picture}')`;
    if (!scoreData[data.name]) {
      button.node.classList.add('filter');
    }
    button.node.onclick = () => {
      controller.onSelect();
    };
  }
}
