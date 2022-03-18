import Control from '../../components/control';
import { ICategoryData } from '../../services/types';
import { AnimatedControl } from '../../components/animatedControl';
import { IQuizScore } from '../gameFieldPage/gameFieldPage';
import './categories.css';

export class CategoriesPage extends AnimatedControl {
  onBack: () => void;
  onSelect: (index: number) => void;
  onScore: (index: number) => void;

  constructor(parentNode: HTMLElement, gameName: string, quizCategoriesData:Array<ICategoryData>, quizScoreData: IQuizScore) {
    super (parentNode, 'div', {default: 'categories_page', hidden: 'hide'});
    this.quickOut();
    const headerWrapper = new Control(this.node, 'div', 'head_panel');
    const backButton = new Control(headerWrapper.node, 'button', 'button_back', 'back');
    const header = new Control(headerWrapper.node, 'h1', 'head_name', gameName);
    backButton.node.onclick = () => {
      this.onBack();
    }
    
    const categoriesContainer = new Control(this.node, 'div', 'categories');
    const categoryButtons  = quizCategoriesData.map((it, i) => {
      return new CategoryItem(categoriesContainer.node, it, quizScoreData, (i + 1).toString(), {
        onSelect: () => {
          this.onSelect(i);
        },
        onScore: () => {
          this.onScore(i);
        }
      });
    });
  }
}

interface ICategoryItemController {
  onScore: () => void;
  onSelect: () => void;
}

class CategoryItem extends Control {
  constructor(parentNode: HTMLElement, data: ICategoryData, scoreData: IQuizScore, categoryName: string, controller: ICategoryItemController) {
    super(parentNode, 'div', 'category');

    const button = new Control(this.node, 'div', 'category_img', categoryName);
    button.node.style.backgroundImage = `url('${data.picture}')`;
    if (!scoreData[data.name]) {
      button.node.classList.add('filter');
    }
    button.node.onclick = () => {
      controller.onSelect();
    }

    if (scoreData[data.name]) {
      const result = new Control(this.node, 'div', 'category_result', '');
      const correctAnswers = scoreData[data.name].filter(result => result).length;
      result.node.textContent = correctAnswers.toString();

      const score = new Control(this.node, 'div', 'category_score', 'score');
      score.node.onclick = () => {
        controller.onScore();
      }
    }
  }
}