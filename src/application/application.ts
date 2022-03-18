import Control from '../common/control';
import { CategoriesPage } from './categoriesPage';
import { SettingsModel, SettingsPage } from './settingsPage';
import { GameFieldPage, GameFieldModel } from './gameFieldPage';
import { GameOverPage } from './gameOverPage';
import { StartPage } from './startPage';
import { QuizDataModel } from './quizDataModel';
import { SoundManager } from './soundManager';

import './application.css';
import { ArtistQuestionView } from './artistQuestionView';
import { PictureQuestionView } from './pictureQuestionView';

export class Application extends Control {
  private model: QuizDataModel;
  settingsModel: SettingsModel;
  header: Control<HTMLElement>;
  main: Control<HTMLElement>;
  footer: Control<HTMLElement>;
  gameFieldModel: GameFieldModel;

  constructor(parentNode: HTMLElement) {
    super (parentNode, 'div', 'global_wrapper');

    this.header = new Control(this.node, 'div', 'global_header');
    this.main = new Control(this.node, 'div', 'global_main');
    this.footer = new Control(this.node, 'div', 'global_footer');
    //preloader
    const preloader = new Control(this.node, 'div', '', 'loading....');
    SoundManager.preload();
    this.settingsModel = new SettingsModel();
    this.settingsModel.loadFromStorage();
    this.model = new QuizDataModel();
    this.model.build().then(result => {
      preloader.destroy();
      this.mainCycle();
    });
    this.gameFieldModel = new GameFieldModel();
  }

  private gameCycle(gameName: string, categoryIndex: number, categoryNameIndex: string) {
    const questions = this.model.getQuestions(categoryIndex);
    let gameField: GameFieldPage;

    if (gameName === 'artists') {
      gameField = new GameFieldPage(this.main.node, ArtistQuestionView, {gameName: gameName, categoryIndex: categoryIndex, settings:this.settingsModel.getData()}, questions);
    } else if (gameName === 'pictures') {
      gameField = new GameFieldPage(this.main.node, PictureQuestionView, {gameName: gameName, categoryIndex: categoryIndex, settings:this.settingsModel.getData()}, questions);
    } else {
      throw new Error('Unknown game name' + gameName);
    }
    gameField.onHome = () => {
      gameField.destroy()
      this.mainCycle();
    }
    gameField.onBack = () => {
      gameField.destroy();
      this.categoryCycle(gameName);
    }
    gameField.onFinish = (result) => {
      gameField.destroy();
      const gameOverPage = new GameOverPage(this.main.node, result);
      this.gameFieldModel.setData(categoryNameIndex
        , result);
      gameOverPage.onHome = () => {
        gameOverPage.destroy();
        this.mainCycle();
      }
      gameOverPage.onNext = () => {
        gameOverPage.destroy();
        this.gameCycle(gameName, categoryIndex + 1, categoryNameIndex);
      }
    }
  }

  private categoryCycle(gameName: string) {
    const categories = new CategoriesPage(this.main.node, gameName, this.model.getCategoriesData(gameName), this.gameFieldModel.getData());
      categories.animateIn();
      categories.onBack = () => {
        categories.animateOut().then(() => {
          categories.destroy();
          this.mainCycle();
        });
      }
      
      categories.onSelect = (index) => {
        const categoryNameIndex = this.model.getCategoriesData(gameName)[index];
        categories.animateOut().then(() => {
          categories.destroy()
          this.gameCycle(gameName, index, categoryNameIndex.name);
        });
      }
  }

  private mainCycle() {
    const startPage = new StartPage(this.main.node);
    startPage.animateIn();
    startPage.onGameSelect = (gameName) => {
      startPage.animateOut().then(() =>{
        startPage.destroy();
        this.categoryCycle(gameName);
      });
    }
    startPage.onSettings = () => {
      startPage.animateOut().then(() => {
        startPage.destroy();

        const settingsPage = new SettingsPage(this.main.node, this.settingsModel.getData());
        settingsPage.onBack = () => {
          settingsPage.destroy();
          this.mainCycle();
        }
        settingsPage.onSave = (settings) => {
          console.log(settings);
          settingsPage.destroy();
          this.settingsModel.setData(settings);
          this.mainCycle();
        }
      });
    }
  }
}