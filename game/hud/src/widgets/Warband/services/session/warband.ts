/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { client, events, signalr, WarbandMember, Gender, Race } from 'camelot-unchained';
import {
  addOrUpdate,
  BaseAction,
  merge,
  ActionDefinitions,
  AsyncAction,
  createReducer,
  removeWhere,
} from '../../../../lib/reduxUtils';

const INITIALIZE_SIGNALR = 'warband/warband/INITIALIZE_SIGNALR';
const INITIALIZE_SIGNALR_SUCCESS = 'warband/warband/INITIALIZE_SIGNALR_SUCCESS';
const INITIALIZE_SIGNALR_FAILED = 'warband/warband/INITIALIZE_SIGNALR_FAILED';

const WARBAND_JOINED = `warband/warband/WARBAND_JOINED`;
const WARBAND_UPDATE = `warband/warband/WARBAND_UPDATE`;
const WARBAND_QUIT = `warband/warband/WARBAND_QUIT`;
const WARBAND_ABANDONED = `warband/warband/WARBAND_ABANDONED`;

const MEMBER_JOINED = `warband/warband/MEMBER_JOINED`;
const MEMBER_UPDATE = `warband/warband/MEMBER_UPDATE`;
const MEMBER_REMOVED = `warband/warband/MEMBER_REMOVED`;

const characterImages = {
  humanM: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_pict-m.png',
  humanF: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_pict-f.png',
  luchorpanM: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_luchorpan-m.png',
  luchorpanF: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_luchorpan-f.png',
  valkyrieM: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_valkyrie-m.png',
  valkyrieF: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_valkyrie-m.png',
  humanmalevM: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_valkyrie-m.png',
  humanmaleaM: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_humans-m-art.png',
  humanmaletM: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_humans-m-tdd.png',
  humanmalevF: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_humans-f-vik.png',
  humanmaleaF: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_humans-f-art.png',
  humanmaletF: 'https://s3.amazonaws.com/camelot-unchained/character-creation/character/icons/icon_humans-f-tdd.png',
};

function getAvatar(gender: Gender, race: Race) {
  if (gender === Gender.Male) { // MALE
    switch (race) {
      case 2: return characterImages.luchorpanM; // Luchorpan
      case 4: return characterImages.valkyrieM; // Valkyrie
      case 15: return characterImages.humanmalevM; // Humanmalev
      case 16: return characterImages.humanmaleaM; // Humanmalea
      case 17: return characterImages.humanmaletM; // Humanmalet
      case 18: return characterImages.humanM; // Pict
    }
  } else {
    switch (race) {
      case 2: return characterImages.luchorpanF; // Luchorpan
      case 4: return characterImages.valkyrieF; // Valkyrie
      case 15: return characterImages.humanmalevF; // Humanmalev
      case 16: return characterImages.humanmaleaF; // Humanmalea
      case 17: return characterImages.humanmaletF; // Humanmalet
      case 18: return characterImages.humanF; // Pict
    }
  }
}

/**
 * Helper methods
 */

function registerWarbandEvents(dispatch: (action: WarbandAction) => any) {
  events.on(signalr.WARBAND_EVENTS_JOINED, (id: string, name: string) => dispatch(warbandJoined(id, name)));
  events.on(signalr.WARBAND_EVENTS_UPDATE, (id: string, name: string) => dispatch(warbandJoined(id, name)));
  events.on(signalr.WARBAND_EVENTS_QUIT, (id: string) => dispatch(warbandQuit(id)));
  events.on(signalr.WARBAND_EVENTS_ABANDONED, (id: string) => dispatch(warbandAbandoned(id)));
  events.on(signalr.WARBAND_EVENTS_MEMBERJOINED, (memberJSON: string) => {
    try {
      const member = JSON.parse(memberJSON);
      member.avatar = getAvatar(member.gender, member.race);
      dispatch(memberJoined(member));
    } catch (e) {
      if (client.debug) {
        console.error(`WarbandMemberJoined Failed to parse WarbandMember. | ${e}`);
      }
    }
  });
  events.on(signalr.WARBAND_EVENTS_MEMBERUPDATE, (memberJSON: string) => {
    try {
      const member = JSON.parse(memberJSON);
      member.avatar = getAvatar(member.gender, member.race);
      dispatch(memberUpdate(member));
    } catch (e) {
      if (client.debug) {
        console.error(`WarbandMemberJoined Failed to parse WarbandMember. | ${e}`);
      }
    }
  });
  events.on(signalr.WARBAND_EVENTS_MEMBERREMOVED, (characterID: string) => dispatch(memberRemoved(characterID)));
}

const systemMessage = (message: string) => events.fire('system', message);


export interface WarbandAction extends BaseAction {
  name?: string;
  id?: string;
  member?: WarbandMember;
}
/**
 * INTERNAL ACTIONS
 */

function initSignalR(): WarbandAction {
  return {
    type: INITIALIZE_SIGNALR,
    when: new Date(),
  };
}

function initSignalRSuccess(): WarbandAction {
  return {
    type: INITIALIZE_SIGNALR_SUCCESS,
    when: new Date(),
  };
}

function initSignalRFailed(): WarbandAction {
  return {
    type: INITIALIZE_SIGNALR_FAILED,
    when: new Date(),
  };
}

function warbandJoined(warbandID: string, warbandName: string = ''): WarbandAction {
  systemMessage(`You have joined ${warbandName && warbandName.length > 0 ? `the ${warbandName}` : 'a' } warband.`);
  return {
    id: warbandID,
    name: warbandName,
    type: WARBAND_JOINED,
    when: new Date(),
  };
}

function warbandQuit(id: string): WarbandAction {
  systemMessage('You have quit your warband.');
  return {
    type: WARBAND_QUIT,
    id,
    when: new Date(),
  };
}

function warbandAbandoned(id: string): WarbandAction {
  systemMessage('You have abandonded your warband.');
  return {
    type: WARBAND_ABANDONED,
    when: new Date(),
  };
}

function memberJoined(member: WarbandMember): WarbandAction {
  systemMessage(`${member.name} has joined your warband.`);
  return {
    type: MEMBER_JOINED,
    member,
    when: new Date(),
  };
}

function memberUpdate(member: WarbandMember): WarbandAction {
  return {
    type: MEMBER_UPDATE,
    member,
    when: new Date(),
  };
}

function memberRemoved(characterID: string): WarbandAction {
  return {
    id: characterID,
    type: MEMBER_REMOVED,
    when: new Date(),
  };
}


/**
 * EXTERNAL ACTIONS
 */

export function initialize(): AsyncAction<WarbandAction> {
  return (dispatch: (action: WarbandAction) => any) => {
    dispatch(initSignalR());

    try {
      signalr.warbandsHub.start(() => {
        dispatch(initSignalRSuccess());
        registerWarbandEvents(dispatch);
      });
    } catch (e) {
      console.error(e);
      dispatch(initSignalRFailed());
    }
  };
}

export interface WarbandState {
  isInitializing: boolean;
  signalRInitialized: boolean;
  locked?: boolean;
  activeMembers?: WarbandMember[];
  permanentMembers?: WarbandMember[];
  name?: string;
  warbandID?: string;
}

function initialState() {
  return {
    isInitializing: false,
    locked: true,
    signalRInitialized: false,
  };
}

function clearWarband() {
  return {
    activeMembers: <WarbandMember[]> [],
    name: '',
    permanentMembers: <WarbandMember[]> [],
    warbandID: <string> null,
  };
}

function memberCompare(a: WarbandMember, b: WarbandMember): boolean {
  return a.characterID === b.characterID;
}


const actionDefs: ActionDefinitions<WarbandState> = {};

actionDefs[INITIALIZE_SIGNALR] = (s, a) => {
  return merge(s, { isInitalizing: false });
};

actionDefs[INITIALIZE_SIGNALR_SUCCESS] = (s, a) => {
  return merge(s, { isInitalizing: false, signalRInitialized: true });
};

actionDefs[INITIALIZE_SIGNALR_FAILED] = (s, a) => {
  return merge(s, { isInitalizing: false, signalRInitialized: true });
};

actionDefs[WARBAND_JOINED] = (s: WarbandState, a: WarbandAction) => {
  events.fire('chat-show-room', a.id);
  return merge(s, clearWarband(), { name: a.name, warbandID: a.id });
};

actionDefs[WARBAND_UPDATE] = (s: WarbandState, a: WarbandAction) => {
  if (a.id !== s.warbandID) {
    // we changed warbands
    return merge(s, clearWarband(), { name: a.name, warbandID: a.id });
  }
  if (a.name !== s.name) {
    return merge(s, { name: a.name });
  }
};

actionDefs[WARBAND_QUIT] = (s: WarbandState, a: WarbandAction) => {
  if (s.warbandID === a.id) {
    events.fire('chat-leave-room', s.warbandID);
    return merge(s, clearWarband());
  }
  return s;
};

actionDefs[WARBAND_ABANDONED] = (s, a) => {
  if (s.warbandID === a.id) {
    events.fire('chat-leave-room', s.warbandID);
    return merge(s, clearWarband());
  }
  return s;
};

actionDefs[MEMBER_JOINED] = (s, a) => {
  return merge(s, { activeMembers: addOrUpdate(s.activeMembers, a.member, memberCompare) });
};

actionDefs[MEMBER_UPDATE] = (s, a) => {
  return merge(s, { activeMembers: addOrUpdate(s.activeMembers, a.member, memberCompare) });
};

actionDefs[MEMBER_REMOVED] = (s: WarbandState, a: WarbandAction) => {
  const members = removeWhere(s.activeMembers, m => m.characterID === a.id);
  if (members.removed.length > 0) {
    systemMessage(`${members.removed[0].name} has left your warband.`);
  }
  return merge(s, { activeMembers: members.result });
};

export default createReducer<WarbandState>(initialState(), actionDefs);
