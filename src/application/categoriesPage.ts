import Control from '../common/control';
import { ICategoryData } from './quizDataModel';
import { AnimatedControl } from './animatedControl';
import './categories.css';

export class CategoriesPage extends AnimatedControl {
  onBack: () => void;
  onSelect: (index: number) => void;

  constructor(parentNode: HTMLElement, gameName: string, quizCategoriesData:Array<ICategoryData>) {
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
      return new CategoryItem(categoriesContainer.node, it, (i + 1).toString(), {
        onSelect: () => {
          this.onSelect(i);
        },
        onScore: () => {
          console.log('score', i);
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
  constructor(parentNode: HTMLElement, data: ICategoryData, categoryName: string, controller: ICategoryItemController) {
    super(parentNode, 'div', 'category');

    const button = new Control(this.node, 'div', 'category_img', categoryName);
      button.node.style.backgroundImage = `url('${data.picture}')`;
      button.node.classList.add('filter');
      button.node.onclick = () => {
       controller.onSelect();
      }
    const score = new Control(this.node, 'div', 'category_score', 'score');
    score.node.onclick = () => {
      controller.onScore();
    }
  }
}