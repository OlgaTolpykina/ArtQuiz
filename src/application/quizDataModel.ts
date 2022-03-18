import imagesDataUrl from '../assets/json/images.json';

interface IMultiLangString {
  ru: string,
  en: string
}

interface IPictureData {
  year: number,
  picture: number,
  author: IMultiLangString,
  name: IMultiLangString,
}

interface IImageDto {
  year: string,
  picture: string,
  author: IMultiLangString,
  name: IMultiLangString,
}

type IImagesDto = Record<string, IImageDto>

export interface ICategoryData{
  name: string;
  picture: string;
  score?: Array<boolean>;
}

export interface IArtistsQuestionData {
  answers: string[];
  correctAnswerIndex: number;
  artistImgUrl: string;
  artistName: string;
  correctAnswerYear: number;
  correctAnswerPictureName: string;
}

export interface IPicturesQuestionData {
  answers: string[];
  correctAnswerIndex: number;
  artistName: string;
  correctAnswerYear: number;
  correctAnswerPictureName: string;
}

export class QuizDataModel {
  private questionsPerCategory = 10;
  data: Array<IPictureData>;

  constructor() {

  }

  public async build() {
    this.data = await this.loadImagesData(imagesDataUrl);
    return this;
  }

  public getCategoriesData(gameName: string) {
    const questionsPerCategory = this.questionsPerCategory;
    const categoriesCount = Math.floor( this.data.length / questionsPerCategory);
    const categories: Array<ICategoryData> = [];
    let minIndex = (gameName === 'pictures') ? 1 : (categoriesCount / 2 + 1);
    let maxIndex = (gameName === 'pictures') ? categoriesCount / 2 : categoriesCount;
    for (let i = minIndex; i <= maxIndex; i++ ) {
      const pictureUrl = `./public/img/pictures/${i * questionsPerCategory}.jpg`;
      const categoryData: ICategoryData = {
        name: i.toString(),
        picture: pictureUrl,
        score: new Array(categoriesCount).fill(false),
      }
      categories.push(categoryData);
    }
    return categories;
  }

  public getPicturesQuestions(categoryIndex: number) {
    const questionsPerCategory = this.questionsPerCategory;
    const result: Array<IPicturesQuestionData> = [];
    for (let i = categoryIndex * questionsPerCategory; i < ( categoryIndex + 1) * questionsPerCategory; i++) {
      const answers: Array<string> = [];
      const answersCount = 4;
      const correctAnswerIndex = Math.floor(Math.random() * answersCount);
      const correctAnswer = `./public/img/pictures/${this.data[i].picture}.jpg`;
      const correctAnswerYear = this.data[i].year;
      const correctAnswerPictureName = this.data[i].name.ru;
      for(let j=0; j < answersCount; j++) {
        if(correctAnswerIndex === j) {
          answers.push(correctAnswer);
        } else {
          const randomImage = this.data[Math.floor(Math.random() * this.data.length)].picture;
          const variantUrl = `./public/img/pictures/${randomImage}.jpg`;
          answers.push(variantUrl);
        }
      }
      const question: IPicturesQuestionData = {
        artistName: this.data[i].author.ru,
        answers: answers,
        correctAnswerIndex: correctAnswerIndex,
        correctAnswerYear: correctAnswerYear,
        correctAnswerPictureName: correctAnswerPictureName,
      }
      result.push(question);
    }
    return result;
  }

  public getArtistsQuestion(categoryIndex: number) {
    const questionsPerCategory = this.questionsPerCategory;
    const result: Array<IArtistsQuestionData> = [];
    for (let i = categoryIndex * questionsPerCategory; i < ( categoryIndex + 1) * questionsPerCategory; i++) {
      const answers: Array<string> = [];
      const answersCount = 4;
      const correctAnswerIndex = Math.floor(Math.random() * answersCount);
      const correctAnswer = this.data[i].author.ru;
      for(let j=0; j < answersCount; j++) {
        if(correctAnswerIndex === j) {
          answers.push(correctAnswer);
        } else {
          const randomName = this.data[Math.floor(Math.random() * this.data.length)].author;
          answers.push(randomName.ru);
        }
      }
      const question: IArtistsQuestionData = {
        artistImgUrl: `./public/img/pictures/${this.data[i].picture}.jpg`,
        answers: answers,
        correctAnswerIndex: correctAnswerIndex,
        artistName: this.data[i].author.ru,
        correctAnswerYear: this.data[i].year,
        correctAnswerPictureName: this.data[i].name.ru,
      }
      result.push(question);
    }
    return result;
  }

  private async loadImagesData(url: string): Promise<Array<IPictureData>> {
    const res = await fetch(url);
    const imagesData: IImagesDto = await res.json();
    const modelData: Array<IPictureData> = Object.keys(imagesData).map(it => {
      const item = imagesData[it];
      const record: IPictureData = {
        year: Number(item.year),
        picture: Number(item.picture),
        author: item.author,
        name: item.name,
      };
      return record;
    });
    return modelData;
  }
}