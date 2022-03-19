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

export class Application extends Control {
  private model: QuizDataModel;
  settingsModel: SettingsModel;
  header: Control<HTMLElement>;
  main: Control<HTMLElement>;
  gameFieldModel: GameFieldModel;
  settingsButton: Control<HTMLElement>;
  logo: Control<HTMLElement>;

  constructor(parentNode: HTMLElement) {
    super(parentNode, 'div', 'global_wrapper');

    this.header = new Control(this.node, 'div', 'global_header');
    this.logo = new Control(this.header.node, 'div', 'logo-small');
    this.settingsButton = new Control(this.header.node, 'div', 'settings', '');

    this.main = new Control(this.node, 'div', 'global_main');
    this.node.append(footer.getTemplate());

    const preloader = new Control(this.node, 'div', '', 'loading....');
    SoundManager.preload();
    this.settingsModel = new SettingsModel();
    this.settingsModel.loadFromStorage();
    this.model = new QuizDataModel();
    this.model.build().then((result) => {
      preloader.destroy();
      this.mainCycle();
    });
    this.gameFieldModel = new GameFieldModel();
  }

  private gameCycle(gameName: string, categoryIndex: number, categoryNameIndex: string) {
    this.logo.node.style.backgroundImage = '';
    const questions = this.model.getQuestions(gameName, categoryIndex);
    let gameField: GameFieldPage;

    if (gameName === 'artists') {
      gameField = new GameFieldPage(
        this.main.node,
        ArtistQuestionView,
        { gameName: gameName, categoryIndex: categoryIndex, settings: this.settingsModel.getData() },
        questions
      );
    } else if (gameName === 'pictures') {
      gameField = new GameFieldPage(
        this.main.node,
        PictureQuestionView,
        { gameName: gameName, categoryIndex: categoryIndex, settings: this.settingsModel.getData() },
        questions
      );
    } else {
      throw new Error('Unknown game name' + gameName);
    }
    gameField.onHome = () => {
      gameField.destroy();
      this.mainCycle();
    };
    gameField.onBack = () => {
      gameField.destroy();
      this.categoryCycle(gameName);
    };
    gameField.onFinish = (result) => {
      gameField.destroy();
      const gameOverPage = new GameOverPage(this.main.node, result);
      this.gameFieldModel.setData(categoryNameIndex, result);
      gameOverPage.onHome = () => {
        gameOverPage.destroy();
        this.mainCycle();
      };
      gameOverPage.onNext = () => {
        gameOverPage.destroy();
        this.gameCycle(gameName, categoryIndex + 1, categoryNameIndex);
      };
    };
  }

  private scoreCycle(gameName: string, categoryIndex: number) {
    const scoreDetails = new ScoreDetailsPage(
      this.main.node,
      categoryIndex,
      this.model.getCategoriesData(gameName),
      this.gameFieldModel.getData()[categoryIndex + 1]
    );
    scoreDetails.animateIn();
    scoreDetails.onBack = () => {
      scoreDetails.animateOut().then(() => {
        scoreDetails.destroy();
        this.categoryCycle(gameName);
      });
    };
  }

  private categoryCycle(gameName: string) {
    this.node.style.backgroundImage = '';
    this.logo.node.style.backgroundImage = 'url("./public/img/logo-small.png")';
    if (this.header.node.children.length < 2)
      this.settingsButton = new Control(this.header.node, 'div', 'settings', '');
    const categories = new CategoriesPage(
      this.main.node,
      gameName,
      this.model.getCategoriesData(gameName),
      this.gameFieldModel.getData()
    );
    categories.animateIn();
    categories.onBack = () => {
      categories.animateOut().then(() => {
        categories.destroy();
        this.mainCycle();
      });
    };

    categories.onSelect = (index) => {
      const categoryNameIndex = this.model.getCategoriesData(gameName)[index];
      categories.animateOut().then(() => {
        categories.destroy();
        this.settingsButton.destroy();
        this.gameCycle(gameName, index, categoryNameIndex.name);
      });
    };

    categories.onScore = (index) => {
      categories.animateOut().then(() => {
        categories.destroy();
        this.settingsButton.destroy();
        this.scoreCycle(gameName, index);
      });
    };

    this.settingsButton.node.onclick = () => {
      categories.animateOut().then(() => {
        categories.destroy();

        this.settingsHandler('category', gameName);
      });
    };
  }

  private mainCycle() {
    this.logo.node.style.backgroundImage = '';
    if (this.header.node.children.length < 2)
      this.settingsButton = new Control(this.header.node, 'div', 'settings', '');
    const startPage = new StartPage(this.main.node);
    this.node.style.backgroundImage = 'url("./public/img/background.jpg")';
    startPage.animateIn();
    startPage.onGameSelect = (gameName) => {
      startPage.animateOut().then(() => {
        startPage.destroy();
        this.categoryCycle(gameName);
      });
    };

    this.settingsButton.node.onclick = () => {
      startPage.animateOut().then(() => {
        this.settingsButton.destroy();
        startPage.destroy();

        this.settingsHandler('main');
      });
    };
  }

  private settingsHandler(cycleName: string, gameName?: string) {
    this.node.style.backgroundImage = '';
    const settingsPage = new SettingsPage(this.main.node, this.settingsModel.getData());
    settingsPage.onBack = () => {
      settingsPage.destroy();
      this.cycleHandler(cycleName, gameName);
    };
    settingsPage.onSave = (settings) => {
      settingsPage.destroy();
      this.settingsModel.setData(settings);
      this.cycleHandler(cycleName, gameName);
    };
  }

  private cycleHandler(cycleName: string, gameName?: string) {
    if (cycleName === 'category') {
      this.categoryCycle(gameName);
    } else {
      this.mainCycle();
    }
  }
}
