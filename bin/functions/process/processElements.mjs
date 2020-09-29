import { parseCssFromElement } from './parseCssFromElement.mjs';
import { parseTypographyStylingFromElement } from './parseTypographyStylingFromElement.mjs';
import { processNestedCss } from './processNestedCss.mjs';

import { msgProcessElementsCreatingElement } from '../../meta/messages.mjs';

import {
  errorProcessElements,
  errorProcessElementsNoMainElement,
  errorProcessElementsWrongElementCount,
  errorProcessElementsWrongTextElementCount,
  errorParseElement
} from '../../meta/errors.mjs';

const getComponentChildren = (
  frame,
  componentChildren = [],
  groups = [],
  descriptions = [],
  lastId = ''
) => {
  frame.forEach((f) => {
    if (f.type === 'COMPONENT') {
      lastId = f.id;
      componentChildren.push(f);
    } else if (f.type === 'FRAME' || f.type === 'GROUP') {
      if (f.type === 'GROUP') {
        groups.push(f);
      }
      lastId = f.id;
      getComponentChildren(f.children, componentChildren, groups, descriptions, lastId);
    } else if (f.type === 'TEXT' && f.name.includes('description')) {
      descriptions.push({ name: f.name, description: f.characters, id: f.id, component: lastId });
    }
  });
  return { componentChildren, groups, descriptions, lastId };
};

/**
 * Process all elements from Figma page called "Elements"
 * 1. Filter out components
 * 2. Add description from Figma
 * 3. Parse elements (typography and styling)
 * 4. Return list of cleaned items
 *
 * @exports
 * @async
 * @function
 * @param {array} elementsPage - Figma page for Elements
 * @param {object} components - Figma components
 * @param {object} config - User configuration
 * @returns {array} - List of parsed components with CSS and all
 * @throws {errorProcessElements} - When missing required arguments
 * @throws {errorProcessElementsNoMainElement} - When no main element is found
 * @throws {errorProcessElementsWrongElementCount} - When wrong element count
 * @throws {errorProcessElementsWrongTextElementCount} - When wrong text element count
 *

 */
export async function processElements(elementsPage, components, config) {
  if (!elementsPage || !components || !config) throw new Error(errorProcessElements);

  // console.log(components);

  const IS_TEST_MODE = config.testMode;

  // console.log(elementsPage.filter(e => e.type === 'GROUP'));

  const { componentChildren, descriptions, groups } = getComponentChildren(elementsPage);

  addDescriptionToElements(componentChildren, groups, descriptions);
  // console.log(_ELEMENTS);
  // console.log('elements', _ELEMENTS);
  // const ELEMENTS = addDescriptionToElements(_ELEMENTS, components);
  // console.log(ELEMENTS);
  const parsed = await Promise.all(
    componentChildren.map(async (el) => await parseElement(el, config.remSize, config, false))
  );

  // console.log(parsed);
  return parsed;
}

const addDescriptionToElements = (components, groups, descriptions) => {
  components.forEach((c) => {
    const associatedDescription = descriptions.find((d) => d.component === c.id);
    if (associatedDescription) {
      c.description = associatedDescription.description;
    }
  });
  groups.forEach((g) => {
    const associatedDescription = descriptions.find((d) => d.component === g.id);
    if (associatedDescription) {
      g.description = associatedDescription.description;
    }
  });

  // console.log(components.map(g => g.description));
};

/**
 * Do the actual parsing and processing of an "element"-type component from Figma
 *
 * @export
 * @async
 * @function
 * @param {object} element - Object representation of item
 * @param {number} remSize - HTML body REM size
 * @param {boolean} isTest - Check if this is test
 * @returns {object} - Return new element as object
 * @throws {errorParseElement} - Throw error if not provided element or config
 */
export async function parseElement(element, remSize, config, isTest = false) {
  if (!element || !remSize) throw new Error(errorParseElement);

  let html = ``;
  let newElement = {};
  let extraProps = ``; // Any extra properties, like "placeholder"
  let text = element.description;
  let imports = [];

  // Set up the absolute essentials
  newElement.id = element.id;
  newElement.name = element.name;

  // Set element type
  let elementType = 'div';

  if (element.description) {
    if (element.description.match(/element=(.*)/))
      elementType = element.description.match(/element=(.*)/)[1];
    newElement.element = elementType;

    // Set description
    let description = element.description;
    if (element.description.match(/description=(.*)/)) {
      const INDEX = element.description.indexOf('description=');
      const MARKER_LENGTH = 12; // "description=" is 12 characters
      description = description.slice(INDEX + MARKER_LENGTH, description.length);
      description.replace(/^\s*\n/gm, '');
      newElement.description = description;
    }
  }

  html += `<${elementType}>{{TEXT}}</${elementType}>`;

  // Since the Figma component has to put all the styling etc. on an item (ex. a rectangle) contained directly
  // within it, we need to also get the properties from THAT item in order to create/parse CSS.
  // NOTE: The item is expected to have the same name as the component overall, such as "Input", "Button", or "H1"
  let css = ` `;

  // Nested, layered, or "stateful" elements
  // Requires that "element" (i.e. Figma component) has only groups at the base of the component
  // You can hide groups by adding a leading underscore to their name, like this: "_Redlines" (which would then be ignored below)
  // console.log('|||||');
  if (element.children.every((a) => a.type === 'GROUP')) {
    await Promise.all(
      element.children.map(async (el) => {
        // Ignore children with a leading underscore in their name
        if (el.name[0] !== '_') {
          // console.log(el.children);
          const MAIN_ELEMENT = el.children.filter(
            (e) => e.type === 'RECTANGLE' && e.name[0] !== '_'
          )[0];
          // console.log('MAIN_ELEMENT', MAIN_ELEMENT);
          const TEXT_ELEMENT = el.children.filter((e) => e.type === 'TEXT' && e.name[0] !== '_')[0];

          // Set placeholder text
          if (element.children) {
            element.children.filter((child) => {
              if (
                (child.type === 'GROUP' && child.name.toLowerCase() === 'placeholder') ||
                (child.type === 'GROUP' && child.name.toLowerCase() === ':placeholder')
              ) {
                child.children.filter((c) => {
                  if (
                    (c.type === 'TEXT' && c.name.toLowerCase() === 'placeholder') ||
                    (c.type === 'TEXT' && c.name.toLowerCase() === ':placeholder')
                  ) {
                    if (!extraProps.includes(`placeholder="${c.characters}"`))
                      extraProps += `placeholder="${c.characters}" `;
                  }
                });
              }
            });
          }

          // Set "type", for example for input element
          // if (element.description.match(/type=(.*)/)) {
          //   const TYPE = element.description.match(/type=(.*)/)[1];
          //   if (!extraProps.includes(`type="${TYPE}`)) extraProps += `type="${TYPE}" `;
          // }

          // Check and set correct selector type: class or pseudo-element
          const SELECTOR_TYPE = '.';

          if (!MAIN_ELEMENT) throw new Error(errorProcessElementsNoMainElement);

          // Clean names from any spaces
          const FIXED_NAME = MAIN_ELEMENT.name.replace(/\s/gi, '');

          // Parse layout CSS from element
          // console.log(msgProcessElementsCreatingElement(MAIN_ELEMENT.name, FIXED_NAME));

          let elementStyling = await parseCssFromElement(
            MAIN_ELEMENT,
            TEXT_ELEMENT,
            null, //IMAGE
            remSize,
            isTest
          );
          imports = imports.concat(elementStyling.imports);
          css += `\n${SELECTOR_TYPE}${FIXED_NAME} {\n${elementStyling.css}}`;

          // Parse typography CSS from element (requires layout element to exist)
          // if (TEXT_ELEMENT) {
          //   let typography = await parseTypographyStylingFromElement(
          //     TEXT_ELEMENT,
          //     remSize,
          //     config,
          //     isTest
          //   );
          //   imports = imports.concat(typography.imports);
          //   css += `\n${SELECTOR_TYPE}${FIXED_NAME} {\n${typography.css}}`;
          //   text = TEXT_ELEMENT.characters;
          // }
        }
      })
    );
    console.log(css, element);
    // css = processNestedCss(css);
  }
  // Handle regular non-nested elements below
  else {
    // Check for text elements
    const TEXT_ELEMENT = element.children.filter((e) => e.type === 'TEXT' && e.name[0] !== '_');
    // if (TEXT_ELEMENT.length > 1)
    //   throw new Error(`${errorProcessElementsWrongTextElementCount} ${element.name}!`);

    // Set placeholder text
    if (element.children) {
      element.children.filter((c) => {
        if (
          (c.type === 'TEXT' && c.name.toLowerCase() === 'placeholder') ||
          (c.type === 'TEXT' && c.name.toLowerCase() === ':placeholder')
        ) {
          extraProps += `placeholder="${c.characters}"`;
        }
      });
    }

    // Set "type", for example for input element
    // if (element.description.match(/type=(.*)/)) {
    //   const TYPE = element.description.match(/type=(.*)/)[1];
    //   extraProps += ` type="${TYPE}"`;
    // }

    // Set text styling
    // if (TEXT_ELEMENT.length === 1) {
    //   let typography = await parseTypographyStylingFromElement(
    //     TEXT_ELEMENT[0],
    //     remSize,
    //     config,
    //     isTest
    //   );
    //   imports = imports.concat(typography.imports);
    //   css += typography.css;
    //   text = TEXT_ELEMENT[0].characters;
    // }

    html = html.replace('{{TEXT}}', text);

    // Process CSS for any component that has a self-named layer
    // This pattern is how we communicate that it's a layout element, e.g. input and not a H1
    const { updatedCss, updatedImports } = await processCssSelfnamedLayer(
      element,
      TEXT_ELEMENT,
      css,
      imports,
      remSize,
      isTest
    );

    imports = updatedImports;
    css = updatedCss;
  }

  // Flatten imports and remove duplicates
  imports = [...new Set(imports)];

  // Apply to new object
  newElement.css = css;
  newElement.html = html;
  newElement.extraProps = extraProps;
  newElement.text = text;
  newElement.imports = imports;

  // console.log(newElement);

  return newElement;
}

async function processCssSelfnamedLayer(element, textElement, css, imports, remSize, isTest) {
  let updatedCss = css;
  let updatedImports = imports;

  const MAIN_ELEMENT = element.children.filter((e) => e.name === element.name);
  const TEXT_ELEMENT = textElement;

  if (MAIN_ELEMENT[0]) {
    if (MAIN_ELEMENT.length !== 1)
      throw new Error(`${errorProcessElementsWrongElementCount} ${element.name}!`);

    const FIXED_NAME = MAIN_ELEMENT[0].name.replace(/\s/gi, '');
    // console.log(msgProcessElementsCreatingElement(MAIN_ELEMENT[0].name, FIXED_NAME));

    let elementStyling = await parseCssFromElement(
      MAIN_ELEMENT[0],
      TEXT_ELEMENT[0],
      null,
      remSize,
      isTest
    );

    updatedImports = updatedImports.concat(elementStyling.imports);
    updatedCss += elementStyling.css;
  }

  return { updatedCss, updatedImports };
}
