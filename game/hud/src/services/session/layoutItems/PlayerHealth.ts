/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PlayerHealth from '../../../components/PlayerHealth';
import { LayoutMode } from '../../../components/HUDDrag';
import HUDZOrder from '../HUDZOrder';

export default {
  position: {
    x: {
      anchor: 3,
      offset: 0,
    },
    y: {
      anchor: 7,
      offset: 0,
    },
    size: {
      width: 300,
      height: 180,
    },
    scale: 0.6,
    opacity: 1,
    visibility: true,
    zOrder: HUDZOrder.PlayerHealth,
    layoutMode: LayoutMode.GRID,
  },
  dragOptions: {
    lockHeight: true,
    lockWidth: true,
  },
  component: PlayerHealth,
  props: {},
};
