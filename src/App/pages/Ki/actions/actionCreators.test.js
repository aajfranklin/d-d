import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actionCreators from './actionCreators';
import * as types from './actionTypes';
import { PUSH_ERROR } from '../../../actions/actionTypes';
import * as errors from '../../../components/Error/ErrorTypes';
import { testState } from '../../../../testUtils';

jest.mock('../../../../apiGatewayClient');

describe('Ki action creator', () => {
  describe('synchronous actions', () => {
    it('should create an action to cache an ability', () => {
      const expectedAction = {
        type: types.CACHE_ABILITY,
        uuid: '1',
      };

      expect(actionCreators.cacheAbility('1')).toStrictEqual(expectedAction);
    });

    it('should create an action to change form text', () => {
      const event = {
        target: {
          name: 'testName',
          value: 'testValue',
        },
        persist: () => {},
      };

      const expectedAction = {
        type: types.UPDATE_NEW_ABILITY,
        target: 'testName',
        value: 'testValue',
      };

      expect(actionCreators.updateNewAbility(event)).toStrictEqual(expectedAction);
    });

    it('should create an action to clear a cached ability', () => {
      const expectedAction = {
        type: types.CLEAR_ABILITY_CACHE,
        uuid: '1',
      };

      expect(actionCreators.clearAbilityCache('1')).toStrictEqual(expectedAction);
    });

    it('should create an action to revert an ability', () => {
      const expectedAction = {
        type: types.REVERT_ABILITY,
        uuid: '1',
      };

      expect(actionCreators.revertAbility('1')).toStrictEqual(expectedAction);
    });

    it('should create an action to sort abilities', () => {
      const expectedAction = {
        type: types.SORT_ABILITIES,
      };

      expect(actionCreators.sortAbilities()).toStrictEqual(expectedAction);
    });

    it('should create an action to toggle the add ability form', () => {
      const expectedAction = {
        type: types.TOGGLE_ADD_ABILITY_FORM,
      };

      expect(actionCreators.toggleAddAbilityForm()).toStrictEqual(expectedAction);
    });

    it('should create an action to toggle editing an ability', () => {
      const expectedAction = {
        type: types.TOGGLE_EDIT_ABILITY,
        uuid: '1',
      };

      expect(actionCreators.toggleEditAbility('1')).toStrictEqual(expectedAction);
    });

    it('should create an action to update an ability', () => {
      const event = {
        target: {
          name: 'testName',
          value: 'testValue',
        },
        persist: () => {},
      };

      const expectedAction = {
        type: types.UPDATE_ABILITY,
        target: 'testName',
        value: 'testValue',
        index: '1',
      };

      expect(actionCreators.updateAbility(event, '1')).toStrictEqual(expectedAction);
    });

    it('should create an action to validate a new ability', () => {
      const expectedAction = {
        type: types.VALIDATE_NEW_ABILITY,
        target: 'test',
        valid: false,
      };

      expect(actionCreators.validateNewAbility('test')).toStrictEqual(expectedAction);
    });

    it('should create an action to validate an edit', () => {
      const expectedAction = {
        type: types.VALIDATE_EDIT,
        target: 'test',
        uuid: 'test',
        valid: false,
      };

      expect(actionCreators.validateEdit('test', 'test', 'test')).toStrictEqual(expectedAction);
    });

    describe('when validating a field', () => {
      it('should accept an exclusively numeric cost field', () => {
        expect(actionCreators.validateField('cost', '123')).toBe(true);
      });

      it('should reject a non-numeric cost field', () => {
        expect(actionCreators.validateField('cost', 'testValue')).toBe(false);
      });

      it('should reject a mixed cost field', () => {
        expect(actionCreators.validateField('cost', '1test')).toBe(false);
      });

      it('should accept a dice-roll formatted damage field', () => {
        expect(actionCreators.validateField('damage', '1d6')).toBe(true);
      });

      it('should accept a dice-roll formatted damage field with modifiers', () => {
        expect(actionCreators.validateField('damage', '1d6+1')).toBe(true);
        expect(actionCreators.validateField('damage', '1d6-1')).toBe(true);
        expect(actionCreators.validateField('damage', '1d6x1')).toBe(true);
        expect(actionCreators.validateField('damage', '1d6+WIS')).toBe(true);
        expect(actionCreators.validateField('damage', '1d6+WIS+PROF')).toBe(true);
        expect(actionCreators.validateField('damage', '1d6+PROF')).toBe(true);
        expect(actionCreators.validateField('damage', '1d6+PROF+LEV')).toBe(true);
        expect(actionCreators.validateField('damage', '1d6+LEV')).toBe(true);
      });

      it('should accept an exclusively numeric damage field', () => {
        expect(actionCreators.validateField('damage', '123')).toBe(true);
      });

      it('should reject a damage field without dice number', () => {
        expect(actionCreators.validateField('damage', 'D6')).toBe(false);
      });

      it('should reject a damage field without dice value', () => {
        expect(actionCreators.validateField('damage', '1d')).toBe(false);
      });

      it('should reject a damage field with partial or arbitrary modifier', () => {
        expect(actionCreators.validateField('damage', '1d6+')).toBe(false);
        expect(actionCreators.validateField('damage', '1d6-')).toBe(false);
        expect(actionCreators.validateField('damage', '1d6x')).toBe(false);
        expect(actionCreators.validateField('damage', '1d6+WISDOMTOOTH')).toBe(false);
      });

      it('should reject an arbitrary damage field', () => {
        expect(actionCreators.validateField('damage', 'test')).toBe(false);
      });

      it('should reject an empty name field', () => {
        expect(actionCreators.validateField('name', '')).toBe(false);
      });

      it('should accept an attack/saving field with proficiency, base stat, level', () => {
        expect(actionCreators.validateField('saving', 'S: 1d6+CHA+PROF')).toBe(true);
        expect(actionCreators.validateField('saving', 'S: 1d6+PROF')).toBe(true);
        expect(actionCreators.validateField('saving', 'S: 1d6+LEV')).toBe(true);
        expect(actionCreators.validateField('saving', 'S: 1d6+PROF+LEV')).toBe(true);
        expect(actionCreators.validateField('saving', 'S: 1d6+WIS+LEV')).toBe(true);
      });

      it('should reject an attack/saving field that does not indicate its type with its prefix', () => {
        expect(actionCreators.validateField('saving', '1d6+PROF+CHA')).toBe(false);
      });

      it('should reject an arbitrary attack/saving field', () => {
        expect(actionCreators.validateField('saving', 'arbitrary')).toBe(false);
        expect(actionCreators.validateField('saving', '0asfd')).toBe(false);
      });

      it('should accept an attack/saving field of 0', () => {
        expect(actionCreators.validateField('saving', '0')).toBe(true);
      });
    });
  });

  describe('asynchronous actions', () => {
    const middleware = [thunk];
    const mockStore = configureMockStore(middleware);

    describe('when deleting an ability', () => {
      describe('when the DELETE and DeleteItem calls succeed', () => {
        it('should create an action to delete an ability', () => {
          const store = mockStore();
          const ability = {
            uuid: '1',
          };
          const expectedActions = [
            { type: types.DELETE_ABILITY, index: '1' },
            { type: types.SORT_ABILITIES },
          ];

          return store.dispatch(actionCreators.deleteAbility(ability, '1')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
        });
      });

      describe('when the DELETE call to API gateway fails', () => {
        it('should create action to show an error', () => {
          testState.app.apiGatewayMockOutcome = 'apiGatewayError';
          const store = mockStore();
          const expectedActions = [
            { type: PUSH_ERROR, errorMessage: errors.DELETE_ABILITY_FAILED },
          ];

          return store.dispatch(actionCreators.deleteAbility('deleteNetworkFailure')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
        });
      });

      describe('when the DeleteItem call to DynamoDB fails', () => {
        it('should create action to show an error', () => {
          testState.app.apiGatewayMockOutcome = 'dynamoDbError';
          const store = mockStore();
          const expectedActions = [
            { type: PUSH_ERROR, errorMessage: errors.DELETE_ABILITY_FAILED },
          ];

          return store.dispatch(actionCreators.deleteAbility('')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
        });
      });
    });

    describe('when loading abilities', () => {
      describe('when the GET and Scan succeed', () => {
        describe('when there are abilities in the DB', () => {
          it('should create an action to return fetched abilities', () => {
            const store = mockStore();
            const expectedActions = [
              { type: types.LOAD_ABILITIES_SUCCESS, abilities: testState.ki.abilities },
              { type: types.SORT_ABILITIES },
            ];

            return store.dispatch(actionCreators.loadAbilities()).then(() => {
              expect(store.getActions()).toEqual(expectedActions);
            });
          });
        });

        describe('when no abilities are returned', () => {
          it('should create an actions to return empty fetched abilities and show an error', () => {
            testState.app.apiGatewayMockOutcome = 'noneFound';
            const store = mockStore();
            const expectedActions = [
              { type: types.LOAD_ABILITIES_SUCCESS, abilities: [] },
              { type: PUSH_ERROR, errorMessage: errors.NO_ABILITIES_FOUND },
            ];

            return store.dispatch(actionCreators.loadAbilities()).then(() => {
              expect(store.getActions()).toEqual(expectedActions);
            });
          });
        });
      });

      describe('when the GET call to API gateway fails', () => {
        it('should create an action to show an error', () => {
          testState.app.apiGatewayMockOutcome = 'apiGatewayError';
          const store = mockStore();
          const expectedActions = [{
            type: PUSH_ERROR, errorMessage: errors.LOAD_ABILITIES_FAILED,
          }];

          return store.dispatch(actionCreators.loadAbilities()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
        });
      });

      describe('when the Scan call to DynamoDB fails', () => {
        it('should create an action to show an error', () => {
          testState.app.apiGatewayMockOutcome = 'dynamoDbError';
          const store = mockStore();
          const expectedActions = [{
            type: PUSH_ERROR, errorMessage: errors.LOAD_ABILITIES_FAILED,
          }];

          return store.dispatch(actionCreators.loadAbilities()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
        });
      });
    });

    describe('when an updated ability is saved', () => {
      describe('when the PUT and PutItem calls succeed', () => {
        describe('if the ability is new', () => {
          it('should create actions to clear ability cache and toggle ability editing', () => {
            const store = mockStore();
            const ability = { uuid: '1', name: 'preSave', isNew: true };
            const expectedActions = [
              { type: types.SUBMIT_NEW_ABILITY_SUCCESS, ability },
              { type: types.TOGGLE_ADD_ABILITY_FORM },
              { type: types.SORT_ABILITIES },
            ];

            return store.dispatch(actionCreators.saveAbility(ability)).then(() => {
              expect(store.getActions()).toEqual(expectedActions);
            });
          });
        });

        describe('if the ability has been edited', () => {
          it('should create actions to clear ability cache and toggle ability editing', () => {
            const store = mockStore();
            const ability = { uuid: '1', name: 'preSave' };
            const expectedActions = [
              { type: types.CLEAR_ABILITY_CACHE, uuid: '1' },
              { type: types.TOGGLE_EDIT_ABILITY, uuid: '1' },
              { type: types.SORT_ABILITIES },
            ];

            return store.dispatch(actionCreators.saveAbility(ability)).then(() => {
              expect(store.getActions()).toEqual(expectedActions);
            });
          });
        });
      });

      describe('when the PUT call to API gateway fails', () => {
        it('should create actions to revert ability, clear ability cache, toggle ability editing, and show an error', () => {
          testState.app.apiGatewayMockOutcome = 'apiGatewayError';
          const store = mockStore();
          const ability = { name: 'preSave', uuid: 'putNetworkFailure' };
          const expectedActions = [
            { type: types.REVERT_ABILITY, uuid: 'putNetworkFailure' },
            { type: types.CLEAR_ABILITY_CACHE, uuid: 'putNetworkFailure' },
            { type: PUSH_ERROR, errorMessage: errors.SAVE_ABILITY_FAILED },
          ];

          return store.dispatch(actionCreators.saveAbility(ability)).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
        });
      });

      describe('when the PutItem call to DynamoDB fails', () => {
        it('should create actions to revert ability, clear ability cache, toggle ability editing, and show an error', () => {
          testState.app.apiGatewayMockOutcome = 'dynamoDbError';
          const store = mockStore();
          const ability = { name: 'preSave' };
          const expectedActions = [
            { type: types.REVERT_ABILITY, uuid: undefined },
            { type: types.CLEAR_ABILITY_CACHE, uuid: undefined },
            { type: PUSH_ERROR, errorMessage: errors.SAVE_ABILITY_FAILED },
          ];

          return store.dispatch(actionCreators.saveAbility(ability)).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
        });
      });
    });
  });
});
