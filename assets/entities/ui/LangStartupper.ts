import { _decorator, Component, Node } from 'cc';
import { Service } from '../services/Service';
import { SettingsLoader } from '../services/SettingsLoader';
import { init as init_i18t, updateSceneRenderers, languageList } from '../../../extensions/i18n/assets/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('LangStartupper')
export class LangStartupper extends Service {
    private _loader: SettingsLoader;
    start() {
        this._loader = this.getServiceOrThrow(SettingsLoader);

        let langkey = "en";

        if (this._loader.gameParameters.language == "-") {
            var systemLanguageKey = navigator.language.split("-")[0];

            for (const key in languageList()) {
                if (key == systemLanguageKey) {
                    langkey = key;
                }
            }

            this._loader.gameParameters.language = langkey;
            this._loader.saveParameters();
        }

        init_i18t(this._loader.gameParameters.language);
        updateSceneRenderers();
    }

}


