import footerTemplate from './template';

class Footer {
  private rootNode: HTMLElement;

  constructor() {
    this.rootNode = document.createElement('footer');
    this.rootNode.className = 'footer';
  }

  public getTemplate(): HTMLElement {
    this.rootNode.textContent = '';
    this.rootNode.insertAdjacentHTML('afterbegin', footerTemplate());
    return this.rootNode;
  }
}

export default new Footer();
