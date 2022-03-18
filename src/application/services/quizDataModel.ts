import imagesDataUrl from '../../assets/json/images.json';
import { IPictureData, ICategoryData, IQuestionData, IImagesDto } from './types';

export class QuizDataModel {
  private questionsPerCategory = 10;
  data: Array<IPictureData>;

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
        questions: this.getQuestions(gameName, i - 1),
      }
      categories.push(categoryData);
    }
    return categories;
  }

  public getQuestions(gameName: string, categoryIndex: number) {
    const questionsPerCategory = this.questionsPerCategory;
    const result: Array<IQuestionData> = [];
    for (let i = categoryIndex * questionsPerCategory; i < ( categoryIndex + 1) * questionsPerCategory; i++) {
      const picturesAnswers: Array<string> = [];
      const artistsAnswers: Array<string> = [];
      const answersCount = 4;
      const correctAnswerIndex = Math.floor(Math.random() * answersCount);
      const correctPictureAnswer = `./public/img/${gameName}/${this.data[i].picture}.jpg`;
      const correctArtistsAnswer = this.data[i].author.ru;
      const correctAnswerYear = this.data[i].year;
      const correctAnswerPictureName = this.data[i].name.ru;
      for(let j=0; j < answersCount; j++) {
        if(correctAnswerIndex === j) {
          picturesAnswers.push(correctPictureAnswer);
          artistsAnswers.push(correctArtistsAnswer);
        } else {
          const randomImage = this.data[Math.floor(Math.random() * this.data.length)].picture;
          const variantUrl = `./public/img/${gameName}/${randomImage}.jpg`;
          picturesAnswers.push(variantUrl);

          const randomName = this.data[Math.floor(Math.random() * this.data.length)].author;
          artistsAnswers.push(randomName.ru);
        }
      }
      const question: IQuestionData = {
        imgUrl: `./public/img/pictures/${this.data[i].picture}.jpg`,
        artistName: this.data[i].author.ru,
        picturesAnswers: picturesAnswers,
        artistsAnswers: artistsAnswers,
        correctAnswerIndex: correctAnswerIndex,
        correctAnswerYear: correctAnswerYear,
        correctAnswerPictureName: correctAnswerPictureName,
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