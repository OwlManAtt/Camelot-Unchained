/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { Race, Gender, Faction } from 'camelot-unchained';

import { RaceInfo } from '../../services/session/races';
import { FactionInfo } from '../../services/session/factions';
import VisualEffects from './VisualEffects';

import snowParticles from './particles/snowParticles';
import leafParticles from './particles/leafParticles';
import snowCloseParticles from './particles/snowCloseParticles';
import glowyOrbsParticles from './particles/glowyOrbsParticles';
import dustParticles from './particles/dustParticles';

declare var particlesJS: any;
declare var $: any;

export interface RaceVisualEffectsProps {
  selectedRace: RaceInfo;
  selectedFaction: FactionInfo;
  selectedGender: Gender;
}

export interface RaceVisualEffectsState {
}

export class RaceVisualEffects extends React.Component<RaceVisualEffectsProps, RaceVisualEffectsState> {
  public render() {
    const { selectedFaction, selectedRace, selectedGender } = this.props;
    const arthurianLayerInfo = [
      { id: 'bg', extraClass: 'arthurian',resistance: 120 },
      { id: 'layer1', extraClass: 'arthurian',resistance: 90},
      { id: 'clouds', extraClass: 'arthurian' },
      { id: 'dust', particleEffect: dustParticles },
      { id: 'ray3', extraClass: 'arthurian',resistance: -60 },
      { id: 'viel', extraClass: 'arthurian' },
      { id: 'viel2', extraClass: 'arthurian', resistance: 200,  shouldParallaxVertical: true },
      { id: 'base', extraClass: 'arthurian',resistance: 140 },
      { id: 'char', extraClass: `standing__${Race[selectedRace.id]}--${Gender[selectedGender]}`, resistance: 150 },
      { id: 'ray1', extraClass: 'arthurian',resistance: 40 },
      { id: 'ray2', extraClass: 'arthurian',resistance: -15 },
      { id: 'particle', extraClass: 'arthurian', resistance: -50, shouldParallaxVertical: true },
    ];
    
    const vikingLayerInfo = [
      { id: 'bg', extraClass: 'viking', resistance: 120 },
      { id: 'layer2', extraClass: 'viking', resistance: 70 },
      { id: 'layer1', extraClass: 'viking', resistance: 50 },
      { id: 'lightning', extraClass: 'viking' },
      { id: 'snow', particleEffect: snowParticles },
      { id: 'ray3', extraClass: 'viking', resistance: -60 },
      { id: 'viel', extraClass: 'viking', resistance: 200,  shouldParallaxVertical: true },
      { id: 'viel2', extraClass: 'viking' },
      { id: 'base', extraClass: 'viking', resistance: 140 },
      { id: `char`, extraClass: `viking standing__${Race[selectedRace.id]}--${Gender[selectedGender]}`, resistance:150 },
      { id: 'ray1', extraClass: 'viking', resistance: 40 },
      { id: 'ray2', extraClass: 'viking', resistance: -15 },
      { id: 'particle', extraClass: 'viking', resistance: -50, shouldParallaxVertical: true },
    ];

    const tddLayerInfo = [
      { id: 'bg', extraClass: 'tdd', resistance: 70 },
      { id: 'layer3', extraClass: 'tdd', resistance: 80 },
      { id: 'glowOrbs', particleEffect: glowyOrbsParticles },
      { id: 'layer2', extraClass: 'tdd', resistance: 100 },
      { id: 'ray3', extraClass: 'tdd', resistance: -60 },
      { id: 'viel', extraClass: 'viking', resistance: 200,  shouldParallaxVertical: true },
      { id: 'viel2', extraClass: 'viking' },
      { id: 'base', extraClass: 'viking', resistance: 140 },
      { id: 'char', extraClass: `tdd standing__${Race[selectedRace.id]}--${Gender[selectedGender]}`, resistance: 150 },
      { id: 'ray1', extraClass: 'tdd', resistance: 40 },
      { id: 'ray2', extraClass: 'tdd', resistance: -15 },
    ];

    let layerInfo;
    let miscInfo;

    switch (selectedRace.id) {
      case Race.HumanMaleA: {
        layerInfo = arthurianLayerInfo;
        break;
      }
      case Race.Pict: {
        layerInfo = arthurianLayerInfo;
        break;
      }
      case Race.HumanMaleV: {
        layerInfo = vikingLayerInfo;
        miscInfo = () => <div className='clouds viking'></div>;
        break;
      }
      case Race.Valkyrie: {
        layerInfo = vikingLayerInfo;
        miscInfo = () => <div className='clouds viking'></div>;
        break;
      } 
      case Race.HumanMaleT: {
        layerInfo = tddLayerInfo;
        miscInfo = () => <div className='clouds tdd'></div>;
        break;
      } 
      case Race.Luchorpan: {
        layerInfo = tddLayerInfo;
        miscInfo = () => <div className='clouds tdd'></div>;
        break;
      } 
      default: {
        layerInfo = arthurianLayerInfo;
        break;
      }
    }
    return (
      <VisualEffects
        layerInfo={layerInfo}
        renderMisc={miscInfo}
      />
    );
  }
}

export default RaceVisualEffects;
