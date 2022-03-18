import Control from '../../components/control';
import { AnimatedControl } from '../../components/animatedControl';
import './startPage.css';

export class StartPage extends AnimatedControl {
  onSettings: () => void;
  onGameSelect: (gameName: string) => void;

  constructor(parentNode: HTMLElement) {
    super (parentNode, 'div', { default: 'main_wrapper', hidden: 'hide'});
    this.quickOut();

    const selectWrapper = new Control(this.node, 'div', 'select_wrapper');
    const picturesButton = new Control(selectWrapper.node, 'button', 'select_item', 'pictures');
    picturesButton.node.onclick = () => this.onGameSelect('pictures');

    const artistsButton = new Control(selectWrapper.node, 'button', 'select_item', 'artists');
    artistsButton.node.onclick = () => this.onGameSelect('artists');

    const settingsWrapper = new Control(this.node, 'div', 'main_bottom');
    const settingsButton = new Control(settingsWrapper.node, 'button', 'button', 'settings');
    settingsButton.node.onclick = () => this.onSettings();
  }
}