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
    if (!storageData) {
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
  timerWrapper: Control<HTMLElement>;
  timerInput: Control<HTMLInputElement>;
  timerIndicator: Control<HTMLElement>;

  constructor(
    parentNode: HTMLElement,
    GameQuestionConstructor: IQuestionViewConstructor,
    gameOptions: IQuizOptions,
    questionsData: Array<IQuestionData>
  ) {
    super(parentNode, 'div', 'content_wrapper');
    this.GameQuestionConstructor = GameQuestionConstructor;
    this.gameOptions = gameOptions;
    this.questionsData = questionsData;
    const gameType = gameOptions.gameName === 'pictures' ? 'картины' : 'художники';
    const header = new Control(
      this.node,
      'h1',
      'head_name uppercase',
      `${gameType} - ${gameOptions.categoryIndex + 1} категория`
    );

    this.timerWrapper = new Control(this.node, 'div', 'timer_wrapper');
    const backButton = new Control(this.timerWrapper.node, 'button', 'button_exit button_questions', '');
    backButton.node.onclick = () => {
      this.onBack();
    };

    this.timer = new Timer(this.timerWrapper.node);

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

    if (this.gameOptions.settings.timeEnable) {
      this.timerInput = new Control<HTMLInputElement>(this.timerWrapper.node, 'input', 'timer_input');
      this.timerInput.node.type = 'range';
      this.timerInput.node.value = '0.3';
      this.timerInput.node.min = '0';
      this.timerInput.node.max = '1';
      this.timerInput.node.step = '0.001';
      this.timerIndicator = new Control(this.timerWrapper.node, 'div', 'progress', ``);

      this.timer.start(this.gameOptions.settings.time, this.timerInput, this.timerIndicator);
      this.timer.onTimeOut = () => {
        this.timerInput.destroy();
        this.timerIndicator.destroy();
        question.destroy();
        this.results.push(false);
        if (this.gameOptions.settings.soundsEnable) {
          SoundManager.fail();
        }
        this.questionCycle(gameName, questions, index + 1, onFinish);
      };
    }

    const question = new this.GameQuestionConstructor(this.node, questions[index]);
    const pagination = new Control(question.node, 'div', 'pagination');
    if (this.gameOptions.gameName === 'artists') pagination.node.classList.add('artists');
    questions.forEach((item, i) => {
      const paginationItem = new Control(pagination.node, 'div', `pagination_item`, '');
      if (this.results[i] === true) {
        paginationItem.node.classList.add('right');
      } else if (this.results[i] === false) {
        paginationItem.node.classList.add('wrong');
      }
    });

    this.progressIndicator = new Control(question.node, 'div', 'questions_indicator', '');
    this.progressIndicator.node.textContent = `${index + 1} / ${questions.length}`;

    question.animateIn();
    question.onAnswer = (answerIndex) => {
      this.timer.stop();
      const correctAnswerIndex = questions[index].correctAnswerIndex;

      const overlay = new Control(this.node, 'div', 'overlay', '');
      const modal = new Control(this.node, 'div', 'modal modal_content', '');
      const answerIndicator = new Control(modal.node, 'div', 'answer_indicator', '');

      const picture = new Control(modal.node, 'div', 'answer_img', '');
      picture.node.style.backgroundImage = `url("${questions[index].imgUrl}")`;

      const pictureName = new Control(modal.node, 'div', 'answer_details', questions[index].correctAnswerPictureName);
      const artistName = new Control(modal.node, 'div', 'answer_details', questions[index].artistName);
      const pictureYear = new Control(
        modal.node,
        'div',
        'answer_details',
        questions[index].correctAnswerYear.toString()
      );

      const result = answerIndex === correctAnswerIndex;
      this.results.push(result);
      if (result) {
        answerIndicator.node.style.backgroundImage = 'url("./public/img/right_img.png")';
        if (this.gameOptions.settings.soundsEnable) {
          SoundManager.ok();
        }
      } else {
        answerIndicator.node.style.backgroundImage = 'url("./public/img/wrong_img.png")';
        if (this.gameOptions.settings.soundsEnable) {
          SoundManager.fail();
        }
      }

      const nextButton = new Control(modal.node, 'button', 'button_next', 'next');
      nextButton.node.onclick = () => {
        if (this.timerInput) {
          this.timerInput.destroy();
          this.timerIndicator.destroy();
        }
        modal.destroy();
        question.animateOut().then(() => {
          overlay.destroy();
          question.destroy();
          this.questionCycle(gameName, questions, index + 1, onFinish);
        });
      };
    };
  }

  destroy(): void {
    this.timer.stop();
    super.destroy();
  }
}

interface IQuestionView {
  onAnswer: (index: number) => void;
}
interface IQuestionViewConstructor {
  new (parentNode: HTMLElement, data: IQuestionData): IQuestionView & AnimatedControl;
}
