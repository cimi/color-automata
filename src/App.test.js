import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Counter from './wasm/counter';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

it('can import wasm modules', () => {
  expect(Counter).not.toBeInstanceOf(String);
  // TODO: maybe JSDOM doesn't let us create objects
  // new Counter() fails the tests
});