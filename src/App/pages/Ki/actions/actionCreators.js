import { isEmpty } from 'lodash';
import * as types from './actionTypes';
import { apiGatewayDelete, apiGatewayGetAll, apiGatewayPut } from '../../../../apiGatewayClient';
import { toggleShowError } from "../../../actions/actionCreators";
import * as errors  from "../../../components/Error/ErrorTypes";

export const cacheAbility = (uuid) => {
    return({
        type: types.CACHE_ABILITY,
        uuid
    });
};

export const changeFormText = (event) => {
    event.persist();
    return({
        type: types.CHANGE_FORM_TEXT,
        target: event.target.name,
        value: event.target.value
    });
};

export const clearAbilityCache = (uuid) => {
    return({
        type: types.CLEAR_ABILITY_CACHE,
        uuid
    });
};

export const deleteAbility = (uuid, index) => {
    return dispatch => {
        return(
            apiGatewayDelete('kiAbilities', uuid)
                .then(response => {
                    if (response.data.ability.uuid === '') {
                        dispatch(deleteAbilityFailed());
                    } else {
                        dispatch(deleteAbilitySuccess(index));
                        return dispatch(sortAbilities());
                    }
                })
                .catch(err => {
                    console.error(err);
                    dispatch(deleteAbilityFailed());
                })
        )
    }
};

export const deleteAbilitySuccess = (index) => {
    return({
        type: types.DELETE_ABILITY,
        index
    });
};

const deleteAbilityFailed = () => {
    return dispatch => {
        dispatch(toggleShowError(errors.DELETE_ABILITY_FAILED));
    }
};

export const loadAbilities = () => {
    return dispatch => {
        return(
            apiGatewayGetAll('kiAbilities')
                .then(response => {
                    if (response.data.count === '') {
                        dispatch(loadAbilitiesFailed());
                    } else if (response.data.count === '0') {
                        dispatch(loadAbilitiesSuccess(response.data.abilities));
                        dispatch(toggleShowError(errors.NO_ABILITIES_FOUND));
                    } else {
                        dispatch(loadAbilitiesSuccess(response.data.abilities));
                        dispatch(sortAbilities());
                    }
                })
                .catch(err => {
                    console.error(err);
                    dispatch(loadAbilitiesFailed());
                })
        )
    };
};

const loadAbilitiesSuccess = (abilities) => {
    abilities.map(ability => {
        ability.editing = false;
        ability.editValidation = {};
        return ability;
    });

    return({
       type: types.LOAD_ABILITIES_SUCCESS,
       abilities
    });
};

const loadAbilitiesFailed = () => {
    return dispatch => {
        dispatch(toggleShowError(errors.LOAD_ABILITIES_FAILED))
    }
};

export const revertAbility = (uuid) => {
  return({
      type: types.REVERT_ABILITY,
      uuid
  });
};

export const saveAbility = (ability) => {
    return dispatch => {
        return(
            apiGatewayPut('kiAbilities', ability.uuid, ability)
                .then(response => {
                    if (isEmpty(response.data)) {
                        if (ability.isNew) {
                            delete ability.isNew;
                            dispatch(submitNewAbilitySuccess(ability));
                            dispatch(toggleAddAbilityForm());
                        } else {
                            dispatch(clearAbilityCache(ability.uuid));
                            dispatch(toggleEditAbility(ability.uuid));
                        }
                        dispatch(sortAbilities());
                    } else {
                        dispatch(saveAbilityFailed(ability.uuid));
                    }
                })
                .catch(err => {
                    console.error(err);
                    dispatch(saveAbilityFailed(ability.uuid));
                })
        )
    }
};

const submitNewAbilitySuccess = (ability) => {
    return({
        type: types.SUBMIT_NEW_ABILITY_SUCCESS,
        ability
    })
};

const saveAbilityFailed = (uuid) => {
    return dispatch => {
        dispatch(revertAbility(uuid));
        dispatch(clearAbilityCache(uuid));
        dispatch(toggleShowError(errors.UPDATE_ABILITY_FAILED));
    }
};

export const sortAbilities = () => {
  return {
      type: types.SORT_ABILITIES
  }
};

export const toggleAddAbilityForm = () => {
    return({
      type: types.TOGGLE_ADD_ABILITY_FORM
  });
};

export const toggleEditAbility = (uuid) => {
    return({
        type: types.TOGGLE_EDIT_ABILITY,
        uuid
    })
};

export const updateAbility = (event, index) => {
    event.persist();
    return({
        type: types.UPDATE_ABILITY,
        target: event.target.name,
        value: event.target.value,
        index
    });
};

export const validateEdit = (target, value, uuid) => {
    return {
        type: types.VALIDATE_EDIT,
        target: target,
        uuid,
        valid: validateField(target, value)
    }
};

export const validateNewAbility = (target, value) => {
    return {
        type: types.VALIDATE_NEW_ABILITY,
        target: target,
        valid: validateField(target, value)
    };
};

export const validateField = (target, value) => {
    let valid;

    switch(target) {
        case 'name': case'effect': {
            valid = value !== '';
            break;
        }
        case 'cost': {
            const costRegExp = new RegExp(/^\d+$/, 'i');
            valid = costRegExp.test(value);
            break
        }
        case 'damage': case 'boost': {
            const diceRegExp = new RegExp(/^\d+((d\d+)?([+\-x](\d+|STR|DEX|CON|INT|WIS|CHA))?(\+PROF)?(\+LEV)?)$/, 'i');
            valid = diceRegExp.test(value);
            break;
        }
        case 'saving': {
            const saveRegExp = new RegExp(/(^0$)|(^[AS]: \d+((d\d+)?([+\-x](\d+|STR|DEX|CON|INT|WIS|CHA))?(\+PROF)?(\+LEV)?)$)/, 'i');
            valid = saveRegExp.test(value);
            break;
        }
        default: {
            valid = false;
            break;
        }
    }

    return valid;
};
