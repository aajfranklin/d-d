import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactRedux from 'react-redux';
import { createMockStore } from 'redux-test-utils';
import { mountInProvider} from './utils/testUtils';
import {testPages} from './utils/testConfig';
import App from './App.js';

const state = { pages: testPages };
const store = createMockStore(state);

describe('App', () => {

    describe('On loading the home page', () => {

        describe('when testing ReactDom directly', () => {

            it('renders without crashing', () => {
                const div = document.createElement('div');

                ReactDOM.render(
                    <ReactRedux.Provider store={store}>
                        <App/>
                    </ReactRedux.Provider>,
                    div
                );
                ReactDOM.unmountComponentAtNode(div);
            });

        });

        describe('when testing with Enzyme', () => {

            let wrapper;

            beforeAll(() => {
                wrapper = mountInProvider(<App/>, store);
            });

            it('renders the nav bar', () => {
                expect(wrapper.find('nav').length).toBe(1);
            });

            it('generates nav bar items from passed in pages prop', () => {

                expect(wrapper.find('Link').length).toBe(testPages.length);

                for (let i = 0; i < testPages.length; i++) {
                    expect(wrapper.find('Link').at(i).key()).toBe(testPages[i]);
                }
            });

        });

    });

});
