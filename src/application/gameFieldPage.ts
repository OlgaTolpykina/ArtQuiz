import Control from '../common/control';

import { IQuizSettings } from './settingsPage';
import { SoundManager } from './soundManager';
import { AnimatedControl } from './animatedControl';
import { Timer } from './timer';
// import { Modal } from './modal';

import './modal.css';

interface IQuizOptions {
  gameName: string;
  categoryIndex: number;
  settings: IQuizSettings;
}

export type IQuizResults = Array<boolean>;
export interface IQuizScore {
  [key: string]: IQuizResults | null;
}

export class GameFieldModel {
  private score: IQuizScore;

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    const storageData = localStorage.getItem('score');
    if(!storageData) {
      this.score = {};
    } else {
      const data: IQuizScore = JSON.parse(storageData);
      this.score = data;
    }
  }

  getData() {
    return JSON.parse(JSON.stringify(this.score));
  }
  
  setData(categoryIndex: string, data: Array<boolean>) {
    this.score[categoryIndex] = data;
    console.log('categoryIndex', categoryIndex);
    console.log('this.score', this.score);
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem('score', JSON.stringify(this.score));
  }
}

export class GameFieldPage<QuestionDataType> extends Control {
  onBack: () => void;
  onHome: () => void;
  onFinish: (results: IQuizResults) => void;
  progressIndicator: Control<HTMLElement>;
  results: IQuizResults;
  // answersIndicator: Control<HTMLElement>;
  timer: Timer;
  gameOptions: IQuizOptions;
  private GameQuestionConstructor: IQuestionViewConstructor<QuestionDataType>;
  questionsData: QuestionDataType[];

  constructor(parentNode: HTMLElement, GameQuestionConstructor: IQuestionViewConstructor<QuestionDataType>, gameOptions: IQuizOptions, questionsData: Array<QuestionDataType>) {
    super (parentNode);
    this.GameQuestionConstructor = GameQuestionConstructor;
    this.gameOptions = gameOptions;
    this.questionsData = questionsData;
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
    if (this.gameOptions.settings.timeEnable) {
      this.timer.start(this.gameOptions.settings.time);
      this.timer.onTimeOut = () => {
        question.destroy();
        this.results.push(false);
        SoundManager.fail();
        this.questionCycle(gameName, questions, index + 1, onFinish);
      }
    }

    const question = new this.GameQuestionConstructor(this.node, questions[index]);
    const pagination = new Control(question.node, 'div', 'pagination');
    questions.forEach((question, i) => {
      const paginationItem = new Control(pagination.node, 'div', `pagination_item`, '');
      if (this.results[i] === true) {
        paginationItem.node.classList.add('right');
      } else if (this.results[i] === false) {
        paginationItem.node.classList.add('wrong');
      }
    });

    question.animateIn();
    question.onAnswer = (answerIndex) => {
      const correctAnswerIndex = questions[index].correctAnswerIndex;
      
      const overlay = new Control(this.node, 'div', 'overlay', '');
      const modal = new Control(this.node, 'div', 'modal modal_content', '');
      const answerIndicator = new Control(modal.node, 'div', 'answer_indicator', '');
      const picture = new Control(modal.node, 'div', '', '');
      const pictureImg = new Image(300, 300);
      if (this.gameOptions.gameName === 'pictures') {
        pictureImg.src = questions[index].answers[correctAnswerIndex];
      } else if (this.gameOptions.gameName === 'artists') {
        pictureImg.src = questions[index].artistImgUrl;
      } else {
        throw new Error('Unknown game name' + this.gameOptions.gameName);
      }
      picture.node.append(pictureImg);
      const pictureName = new Control(modal.node, 'div', '', questions[index].correctAnswerPictureName);
      const artistName = new Control(modal.node, 'div', '', questions[index].artistName);
      const pictureYear = new Control(modal.node, 'div', '', questions[index].correctAnswerYear);

      const result = answerIndex === correctAnswerIndex;
      this.results.push(result);
      if (result) {
        answerIndicator.node.style.backgroundImage = 'url("./public/img/right_img.png")';
        SoundManager.ok();
      } else {
        answerIndicator.node.style.backgroundImage = 'url("./public/img/wrong_img.png")';
        SoundManager.fail();
      }

      const nextButton = new Control(modal.node, 'button', '', 'next');
      nextButton.node.onclick = () => {
        modal.destroy();
        question.animateOut().then(() => {
          overlay.destroy();
          question.destroy();
          this.questionCycle(gameName, questions, index + 1, onFinish);
      });
      }
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
