
import { tiny } from './tiny-graphics.js';
import { widgets } from './tiny-graphics-widgets.js';

import MainScene from './main-scene.js';

const rootDiv = document.getElementById('main-canvas');
const scenes = [new MainScene()];

new widgets.Canvas_Widget(rootDiv, scenes);