import Control from '../components/control';
import { CategoriesPage } from '../pages/categoriesPage/categoriesPage';
import { SettingsModel, SettingsPage } from '../pages/settingsPage/settingsPage';
import { GameFieldPage, GameFieldModel } from '../pages/gameFieldPage/gameFieldPage';
import { GameOverPage } from '../pages/resultPage/gameOverPage';
import { StartPage } from '../pages/startPage/startPage';
import { ArtistQuestionView } from '../pages/questionsPage/artistQuestionView';
import { PictureQuestionView } from '../pages/questionsPage/pictureQuestionView';
import { ScoreDetailsPage } from '../pages/scoreDetailsPage/scoreDetailsPage';
import { QuizDataModel } from '../services/quizDataModel';
import { SoundManager } from '../services/soundManager';
import footer from '../components/footer/footer';
import '../components/footer/footer.css';
import './application.css';

export class Application extends Control {
  private model: QuizDataModel;
  settingsModel: SettingsModel;
  header: Control<HTMLElement>;
  main: Control<HTMLElement>;
  gameFieldModel: GameFieldModel;

  constructor(parentNode: HTMLElement) {
    super (parentNode, 'div', 'global_wrapper');

    this.header = new Control(this.node, 'div', 'global_header');
    const title = new Control(this.header.node, 'h1', 'global_title', 'artquiz');
    this.main = new Control(this.node, 'div', 'global_main');
    this.node.append(footer.getTemplate());
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
    const questions = this.model.getQuestions(gameName, categoryIndex);
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

  private scoreCycle(gameName: string, categoryIndex: number) {
    console.log(categoryIndex);
    const scoreDetails = new ScoreDetailsPage(this.main.node, categoryIndex, this.model.getCategoriesData(gameName), this.gameFieldModel.getData()[categoryIndex + 1]);
    scoreDetails.animateIn();
    scoreDetails.onBack = () => {
      scoreDetails.animateOut().then(() => {
        scoreDetails.destroy();
        this.categoryCycle(gameName);
      });
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

      categories.onScore = (index) => {
        categories.animateOut().then(() => {
          categories.destroy()
          this.scoreCycle(gameName, index);
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