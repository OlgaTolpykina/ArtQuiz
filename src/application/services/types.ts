interface IMultiLangString {
  ru: string,
  en: string
}

export interface IPictureData {
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

export type IImagesDto = Record<string, IImageDto>

export type IQuestions = Array<IQuestionData>;

export interface ICategoryData{
  name: string;
  picture: string;
  questions: IQuestionData[];
}

export interface IQuestionData {
  picturesAnswers: string[];
  artistsAnswers: string[];
  correctAnswerIndex: number;
  artistName: string;
  imgUrl: string;
  correctAnswerYear: number;
  correctAnswerPictureName: string;
}