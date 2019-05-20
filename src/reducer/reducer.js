import { initialState } from '../model';
import * as types from './actionTypes.js';
import update from 'react-addons-update';

function reducer(state = { ...initialState }, action) {
    switch (action.type) {

        case types.CHANGE_FORM_TEXT:
            action.event.persist();
            const target = action.event.target.name;
            const value = action.event.target.value;

            return update(state, {
               ki: { newAbility: { [target]: { $set: value } } }
            });

        case types.SUBMIT_NEW_ABILITY:
            return update(state, {
                ki: {
                    abilities: { $set: state.ki.abilities.concat({ ...state.ki.newAbility }) },
                    showAbilityForm: { $set: !state.ki.showAbilityForm },
                    newAbility: { $set: { name: '', cost: '', damage: '', saving: '', effect: '' } }
                }
            });

        case types.TOGGLE_ABILITY_FORM:
            return update(state, {
                ki: {
                    showAbilityForm: { $set: !state.ki.showAbilityForm },
                    newAbility: { $set: {name: '', cost: '', damage: '', saving: '', effect: '' } }
                }
            });

        default:
            return state;
    }
}

export default reducer;
