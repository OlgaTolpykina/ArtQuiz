import Control from '../../components/control';
import { AnimatedControl } from '../../components/animatedControl';

export class StartPage extends AnimatedControl {
  onSettings: () => void;
  onGameSelect: (gameName: string) => void;

  constructor(parentNode: HTMLElement) {
    super(parentNode, 'div', { default: 'main_wrapper', hidden: 'hide' });
    this.quickOut();

    const logo = new Control(this.node, 'div', 'logo');
    const selectWrapper = new Control(this.node, 'div', 'select_wrapper');
    const picturesButton = new Control(selectWrapper.node, 'div', 'select_item pictures', 'картины');
    picturesButton.node.onclick = () => this.onGameSelect('pictures');

    const artistsButton = new Control(selectWrapper.node, 'div', 'select_item artists', 'художники');
    artistsButton.node.onclick = () => this.onGameSelect('artists');
  }
}
