/* eslint-disable no-control-regex */
import { Form, ActionPanel, Action, getPreferenceValues } from '@raycast/api';
import React from 'react';

interface Preferences {
  responsiveCopy: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();

  const [sourceValue, setSource] = React.useState('');
  const [translatedValue, setTranslated] = React.useState('');
  const [selected, setSelected] = React.useState('text');

  const sourceChange = (value: string) => {
    setSource(value.replace(/[^\x00-\xFF]/gim, ''));
    setTranslated(convert(value));
  }

  const translatedChange = (value: string) => {
    setTranslated(value.replace(/[^gonb \n]/gim, ''));
    const newSource = convertBack(value);
    if (newSource == newSource.replace(/\w/g, '')) return setSource('');
    setSource(convertBack(value));
  }

  // text to gonbinary
  function convert(value: string): string {
    let translatedGonbinary = '';
    const gonb = 'gonbgonb';
    for (let i = 0; i < value.length; i++) {
      const binaryChar = ('00000000' + value[i].charCodeAt(0).toString(2)).slice(-8).split('');
      let outChar = '';

      for (const digit in binaryChar) {
        if (binaryChar[digit] == '1') {
          outChar += gonb[digit].toUpperCase();
        } else {
          outChar += gonb[digit];
        }
      }
      translatedGonbinary += outChar + ' ';
    }
    return translatedGonbinary;
  }

  // gonbinary to text
  function convertBack(value: string): string {
    let translatedText = '';
    const gonbs = value.replaceAll('\n', ' ').split(' ');

    for (const gonb in gonbs) {
      if (gonbs[gonb] == '') {
        continue;
      }
      let outBits = '';
      for (const letter in gonbs[gonb].split('')) {
        if (isUpperCase(gonbs[gonb][letter])) {
          outBits += '1';
        } else {
          outBits += '0';
        }
      }

      translatedText += binaryAgent(outBits);
    }
    return translatedText;
  }

  // binary to characters
  function binaryAgent(str: string) {
    const newBin = str.split(' ');
    const binCode = [];

    for (let i = 0; i < newBin.length; i++) {
      binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
    }

    return binCode.join('');
  }

  function isUpperCase(str: string) {
    return str === str.toUpperCase();
  }


  return (
    <Form
      actions={
        <ActionPanel>
            <Action.CopyToClipboard
              title={selected == 'text' && preferences.responsiveCopy ? 'Copy Gonbinary' : 'Copy Text'}
              content={selected == 'text' && preferences.responsiveCopy ? translatedValue : sourceValue}
            />
            <Action.CopyToClipboard
              title={selected == 'text' && preferences.responsiveCopy ? 'Copy Text' : 'Copy Gonbinary'}
              content={selected == 'text' && preferences.responsiveCopy ? sourceValue : translatedValue}
            />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id='sourceField'
        title='Text'
        placeholder='Text goes here'
        value={sourceValue}
        onChange={sourceChange}
        onFocus={() => {setSelected('text')}}
      />

      <Form.TextArea
        id='translatedField'
        title='Gonbinary'
        placeholder='Gonbinary goes here'
        value={translatedValue}
        onChange={translatedChange}
        onFocus={() => {setSelected('gonbinary')}}
      />
    </Form>
  );
}
