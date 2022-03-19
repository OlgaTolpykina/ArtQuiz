import Control from '../../components/control';

export interface IQuizSettings {
  time: number;
  timeEnable: boolean;
  volume: number;
  soundsEnable: boolean;
}

export class SettingsModel {
  private settings: IQuizSettings;
  defaultSettings: IQuizSettings;

  constructor() {
    this.defaultSettings = {
      time: 10,
      timeEnable: false,
      volume: 0.3,
      soundsEnable: false,
    };
  }

  loadFromStorage() {
    const storageData = localStorage.getItem('settings');
    if (!storageData) {
      this.settings = this.defaultSettings;
    } else {
      const data: IQuizSettings = JSON.parse(storageData);
      this.settings = data;
    }
  }

  getData() {
    this.loadFromStorage();
    return JSON.parse(JSON.stringify(this.settings));
  }

  setData(data: IQuizSettings) {
    this.settings = data;
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }
}

export class SettingsPage extends Control {
  onBack: () => void;
  onSave: (settings: IQuizSettings) => void;
  settings: IQuizSettings;

  constructor(parentNode: HTMLElement, initialSettings: IQuizSettings) {
    super(parentNode, 'div', 'content_settings');
    this.node.textContent = '';
    this.settings = initialSettings;

    const percent = 100;
    const volumeWrapper = new Control(this.node, 'div', 'setting_item');
    const volumeTitle = new Control(volumeWrapper.node, 'p', 'setting_title', 'Громкость');

    const volumeInputWrapper = new Control(volumeWrapper.node, 'div', 'setting_input_wrapper');
    const volumeInput = new Control<HTMLInputElement>(volumeInputWrapper.node, 'input', 'setting_input volume');
    volumeInput.node.type = 'range';
    volumeInput.node.min = '0';
    volumeInput.node.max = '1';
    volumeInput.node.step = '0.1';
    volumeInput.node.value = this.settings.volume.toString();
    let volumeValue = +volumeInput.node.valueAsNumber / +volumeInput.node.max;
    volumeInput.node.style.background = `linear-gradient(to right, #ffbca2 0%, #ffbca2 ${
      volumeValue * percent
    }%, #a4a4a4 ${volumeValue * percent}%, #a4a4a4 100%)`;
    volumeInput.node.oninput = () => {
      this.settings.volume = volumeInput.node.valueAsNumber;
      volumeValue = +volumeInput.node.valueAsNumber / +volumeInput.node.max;
      volumeInput.node.value = volumeValue.toString();
      volumeInput.node.style.background = `linear-gradient(to right, #ffbca2 0%, #ffbca2 ${
        volumeValue * percent
      }%, #a4a4a4 ${volumeValue * percent}%, #a4a4a4 100%)`;
    };
    this.createSwitcher(volumeInputWrapper, 'sounds');

    const timeWrapper = new Control(this.node, 'div', 'setting_item');
    const timeTitle = new Control(timeWrapper.node, 'p', 'setting_title', 'Таймер');
    const valueField = new Control(timeWrapper.node, 'span', '');
    const timeInputWrapper = new Control(timeWrapper.node, 'div', 'setting_input_wrapper');
    const timeInput = new Control<HTMLInputElement>(timeInputWrapper.node, 'input', 'setting_input time');
    timeInput.node.type = 'range';
    timeInput.node.min = '10';
    timeInput.node.max = '30';
    timeInput.node.step = '1';
    timeInput.node.value = this.settings.time.toString();
    valueField.node.textContent = timeInput.node.value;
    let timeValue = (+timeInput.node.valueAsNumber - +timeInput.node.min) / (+timeInput.node.max - +timeInput.node.min);
    timeInput.node.style.background = `linear-gradient(to right, #ffbca2 0%, #ffbca2 ${timeValue * percent}%, #a4a4a4 ${
      timeValue * percent
    }%, #a4a4a4 100%)`;
    timeInput.node.oninput = () => {
      this.settings.time = timeInput.node.valueAsNumber;
      valueField.node.textContent = timeInput.node.value;
      timeValue = (+timeInput.node.valueAsNumber - +timeInput.node.min) / (+timeInput.node.max - +timeInput.node.min);
      timeInput.node.style.background = `linear-gradient(to right, #ffbca2 0%, #ffbca2 ${
        timeValue * percent
      }%, #a4a4a4 ${timeValue * percent}%, #a4a4a4 100%)`;
    };
    this.createSwitcher(timeInputWrapper, 'time');

    const backButton = new Control(this.node, 'button', 'button button_back', '');
    backButton.node.onclick = () => {
      this.onBack();
    };

    const saveButton = new Control(this.node, 'div', 'select_item', 'save');
    saveButton.node.onclick = () => {
      console.log(this.settings);
      this.onSave(this.settings);
    };
  }

  private createSwitcher(parentNode: Control<HTMLElement>, type: string) {
    const switcher = new Control(parentNode.node, 'div', 'settings__switcher');

    const switcherInput = new Control<HTMLInputElement>(switcher.node, 'input', 'settings__switcher_input');
    switcherInput.node.type = 'checkbox';
    switcherInput.node.id = `${type}`;
    switcherInput.node.checked = this.settings.timeEnable;
    switcherInput.node.oninput = () => {
      this.settings.soundsEnable = switcherInput.node.checked;
    };

    const switcherLabel = new Control<HTMLLabelElement>(switcher.node, 'label', 'settings__switcher_label');
    switcherLabel.node.setAttribute('for', `${type}`);
    const switcherInnerContainer = new Control(switcherLabel.node, 'div', 'switcher_inner-container');
    const switcherIndicator = new Control(switcherLabel.node, 'div', 'switcher_indicator');

    this.setSwitcher(type, switcherInput, switcherIndicator, switcherInnerContainer);

    switcherInput.node.onchange = () => {
      if (switcherInput.node.checked) {
        switcherIndicator.node.style.right = '0';
        switcherInnerContainer.node.style.margin = '0';
      } else {
        switcherIndicator.node.style.right = '55px';
        switcherInnerContainer.node.style.marginLeft = '-100%';
      }

      if (type === 'time') {
        this.settings.timeEnable = switcherInput.node.checked;
      } else if (type === 'sounds') {
        this.settings.soundsEnable = switcherInput.node.checked;
      } else {
        throw new Error('No such type exists' + type);
      }
    };
  }

  setSwitcher(
    type: string,
    switcher: Control<HTMLInputElement>,
    switcherIndicator: Control<HTMLElement>,
    switcherInnerContainer: Control<HTMLElement>
  ) {
    if (type === 'time') {
      switcher.node.checked = this.settings.timeEnable;
    } else if (type === 'sounds') {
      switcher.node.checked = this.settings.soundsEnable;
    } else {
      throw new Error('No such type exists' + type);
    }

    if (switcher.node.checked) {
      switcherIndicator.node.style.right = '0';
      switcherInnerContainer.node.style.margin = '0';
    } else {
      switcherIndicator.node.style.right = '55px';
      switcherInnerContainer.node.style.marginLeft = '-100%';
    }
  }
}
