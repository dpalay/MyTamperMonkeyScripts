#!/usr/bin/env node

import {mkdirSync, writeFileSync} from 'fs';
import path from 'path';
import { Command } from 'commander';
import inquirer from 'inquirer';


const grantOptions = [
  { name: 'none', description: 'No special permissions' },
  { name: 'GM_addStyle', description: 'Inject CSS styles into the page' },
  { name: 'GM_deleteValue', description: 'Delete the stored value under the given name' },
  { name: 'GM_listValues', description: 'Return an array of names of stored values' },
  { name: 'GM_setValue', description: 'Store the value under the given name' },
  { name: 'GM_getValue', description: 'Return the stored value for the given name' },
  { name: 'GM_xmlhttpRequest', description: 'Make an XMLHttpRequest' },
  { name: 'GM_notification', description: 'Show a desktop notification' },
  { name: 'GM_setClipboard', description: 'Copy a string to the clipboard' },
  { name: 'GM_info', description: 'Access metadata about the script' },
];

const runAtOptions = [
  { name: 'document-start', description: 'Execute the script when the DOM starts loading' },
  { name: 'document-end', description: 'Execute the script when the DOM has finished loading' },
  { name: 'document-idle', description: 'Execute the script after the DOM content is loaded, CSS, and other resources, but before the window\'s load event' },
  { name: 'context-menu', description: 'Execute the script from the context (right-click) menu on matching pages' },
];

const program = new Command()

program
  .arguments('[name] [directories...]')
  .action(async (directories, name) => {
    if (!name || !directories?.length) {
      // If name or directories are not provided, prompt the user
      const userInput = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter name:',
        },
        {
          type: 'input',
          name: 'directories',
          message: 'Enter directories (separated by space):',
          filter: (value) => value.split(' '),
        },
      ]);
      name = userInput.name;
      directories = userInput.directories;
    }
    
    const questions = [
      {
        type: 'input',
        name: 'description',
        message: 'Enter description:',
        default: 'Description of ' + name,
      },
      {
        type: 'input',
        name: 'author',
        message: 'Enter author name:',
        default: 'Your Name',
      },
      {
        type: 'input',
        name: 'match',
        message: 'Select match pattern:',
        default: 'http*:\/\/*/*',
      },
      {
        type: 'input',
        name: 'namespace',
        message: 'Enter namespace:',
        default: 'http://tampermonkey.net/',
      },
      {
        type: 'input',
        name: 'version',
        message: 'Enter version:',
        default: '0.1',
      },
      {
        type: 'checkbox',
        name: 'grant',
        message: 'Select grant permissions:',
        choices: grantOptions.map((option) => ({
          name: option.name + ' - ' + option.description,
          value: option.name,
        })),
        default: 'none'
      },
      {
        type: 'list',
        name: 'runAt',
        message: 'Select @run-at:',
        choices: runAtOptions.map((option) => ({
          name: option.name + ' - ' + option.description,
          value: option.name,
        })),
        default: 'document-end',
      },
    ];

    
    inquirer.prompt(questions).then((answers) => {
     // directories.forEach((directory) => {
        const directoryPath = path.join('src', ...(directories.map( directory => directory.toString())));
        const headerFilePath = path.join(directoryPath, 'header.txt');
        const indexFilePath = path.join(directoryPath, 'index.ts');

        // Create directory
        mkdirSync(path.resolve(directoryPath), { recursive: true });

        // Create header.txt file
        writeFileSync(path.resolve(headerFilePath), generateHeaderContent(name, answers));

        // Create index.ts file
        writeFileSync(path.resolve(indexFilePath), generateIndexContent());
     // });

      console.log('Directories and files created successfully.');
    });
  });

program.parse(process.argv);

function generateHeaderContent(name, answers) {
  const grantPermissions = answers.grant ? answers.grant.map((grant => `// @grant        ${grant}`)).join('\n') : '// @grant        none';
  return `// ==UserScript==
// @name         ${name}
// @namespace    ${answers.namespace}
// @version      ${answers.version}
// @description  ${answers.description}
// @author       ${answers.author}
// @match        ${answers.match}
// @run-at       ${answers.runAt}
${grantPermissions}
// ==/UserScript==
`;
}

function generateIndexContent() {
  return `// The contents of this file will be encapsulated in an IIFE.`
}
