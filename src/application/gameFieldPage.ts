import Control from '../common/control';

import { IQuizSettings } from './settingsPage';
import { SoundManager } from './soundManager';
import { AnimatedControl } from './animatedControl';
import { Timer } from './timer';

interface IQuizOptions {
  gameName: string;
  categoryIndex: number;
  settings: IQuizSettings;
}

type IQuizResults = Array<boolean>;
export class GameFieldPage<QuestionDataType> extends Control {
  onBack: () => void;
  onHome: () => void;
  onFinish: (results: IQuizResults) => void;
  progressIndicator: Control<HTMLElement>;
  results: IQuizResults;
  answersIndicator: Control<HTMLElement>;
  timer: Timer;
  gameOptions: IQuizOptions;
  private GameQuestionConstructor: IQuestionViewConstructor<QuestionDataType>;

  constructor(parentNode: HTMLElement, GameQuestionConstructor: IQuestionViewConstructor<QuestionDataType>, gameOptions: IQuizOptions, questionsData: Array<QuestionDataType>) {
    super (parentNode);
    this.GameQuestionConstructor = GameQuestionConstructor;
    this.gameOptions = gameOptions;
    const header = new Control(this.node, 'h1', '', `${gameOptions.gameName} - ${gameOptions.categoryIndex}`);
    
    const backButton = new Control(this.node, 'button', '', 'back');
    backButton.node.onclick = () => {
      this.onBack();
    }

    const homeButton = new Control(this.node, 'button', '', 'home');
    homeButton.node.onclick = () => {
      this.onHome();
    }

    this.timer = new Timer(this.node);
    this.progressIndicator = new Control(this.node, 'div', '', '');
    this.answersIndicator = new Control(this.node, 'div', '', '');

    this.results = []; 
    
    this.questionCycle(gameOptions.gameName, questionsData, 0, () => {
      this.onFinish(this.results);
    });
  }

  questionCycle(gameName: string, questions: Array<any>, index: number, onFinish: () => void) {
    if (index >= questions.length) {
      onFinish();
      return;
    }

    this.progressIndicator.node.textContent = `${index + 1} / ${questions.length}`;
    this.answersIndicator.node.textContent = this.results.map(it => it ? '+' : '-').join(' ');
    if (this.gameOptions.settings.timeEnable) {
      this.timer.start(this.gameOptions.settings.time);
      this.timer.onTimeOut = () => {
        question.destroy();
        this.results.push(false);
        SoundManager.fail();
        this.questionCycle(gameName, questions, index + 1, onFinish);
      }
    }

    const question = new this.GameQuestionConstructor(this.node, questions[index]); //new PictureQuestionView(this.node, questions[index]);
    question.animateIn();
    question.onAnswer = (answerIndex) => {
      question.animateOut().then(() => {
        question.destroy();
        const result = answerIndex === questions[index].correctAnswerIndex
        if (result) {
          SoundManager.ok();
        } else {
          SoundManager.fail();
        }
        this.results.push(result);
        this.questionCycle(gameName, questions, index + 1, onFinish);
      });
    }
  }

  destroy(): void {
    this.timer.stop();
    super.destroy();
  }
}

interface IQuestionView {
  onAnswer:(index:number)=>void;
}
interface IQuestionViewConstructor<DataType>{
  new (parentNode:HTMLElement, data:DataType): IQuestionView & AnimatedControl;
}
