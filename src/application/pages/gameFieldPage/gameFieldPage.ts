import Control from '../../components/control';
import { IQuizSettings } from '../settingsPage/settingsPage';
import { SoundManager } from '../../services/soundManager';
import { AnimatedControl } from '../../components/animatedControl';
import { IQuestionData } from '../../services/types';
import { Timer } from '../../services/timer';
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
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem('score', JSON.stringify(this.score));
  }
}

export class GameFieldPage extends Control {
  onBack: () => void;
  onHome: () => void;
  onFinish: (results: IQuizResults) => void;
  progressIndicator: Control<HTMLElement>;
  results: IQuizResults;
  timer: Timer;
  gameOptions: IQuizOptions;
  private GameQuestionConstructor: IQuestionViewConstructor;
  questionsData: IQuestionData[];

  constructor(parentNode: HTMLElement, GameQuestionConstructor: IQuestionViewConstructor, gameOptions: IQuizOptions, questionsData: Array<IQuestionData>) {
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

  questionCycle(gameName: string, questions: Array<IQuestionData>, index: number, onFinish: () => void) {
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
      pictureImg.src = questions[index].imgUrl;
      picture.node.append(pictureImg);

      const pictureName = new Control(modal.node, 'div', '', questions[index].correctAnswerPictureName);
      const artistName = new Control(modal.node, 'div', '', questions[index].artistName);
      const pictureYear = new Control(modal.node, 'div', '', questions[index].correctAnswerYear.toString());

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
interface IQuestionViewConstructor{
  new (parentNode:HTMLElement, data:IQuestionData): IQuestionView & AnimatedControl;
}