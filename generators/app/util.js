const constant = require('./constant');
const _ = require("lodash");
const jhipsterUtils = require('generator-jhipster/generators/utils');
const packageJson = require('../../package.json');
const semver = require('semver');
const chalk = require('chalk');
const shelljs = require('shelljs');

module.exports = {
    writeCoverFiles,
    autoGenerateI18nFiles,
    autoGenerateI18nMenu,
    addNavBarItem,
    addAngularModule,
    initializing,
    copyFiles,
    updateFile,
    getCoverList,
    getCoverListChoices,
    writeDemoFiles,
    printCoverbLogo,
    getStyleSuffixForTestCase,
    getMultiLanguageForTestCase,
    replaceContent,
    removeFile,
    excludeIcons,
    updateRouteByCover,
    updateHeaderByCover,
    addRouteByCover,
    addRouteImportByCover,
    addHeaderByCover,
    addHeaderImportByCover
};
/**
 * Print coverb logo
 */
function printCoverbLogo(generator) {
    generator.log('\n');
    generator.log(`${chalk.blue(' ######   #######  ##     ## ######## ######## ')}${chalk.green(' ########  ')}`);
    generator.log(`${chalk.blue('##    ## ##     ## ##     ## ##       ##     ##')}${chalk.green(' ##     ## ')}`);
    generator.log(`${chalk.blue('##       ##     ## ##     ## ##       ##     ##')}${chalk.green(' ##     ## ')}`);
    generator.log(`${chalk.blue('##       ##     ## ##     ## ######   ######## ')}${chalk.green(' ########  ')}`);
    generator.log(`${chalk.blue('##       ##     ##  ##   ##  ##       ##   ##  ')}${chalk.green(' ##     ## ')}`);
    generator.log(`${chalk.blue('##    ## ##     ##   ## ##   ##       ##    ## ')}${chalk.green(' ##     ## ')}`);
    generator.log(`${chalk.blue(' ######   #######     ###    ######## ##     ##')}${chalk.green(' ########  ')}\n`);
    generator.success('You are working with coverb version2: '+chalk.green.bold(packageJson.version)+'\n');
    generator.log(chalk.white.bold('This is a jhipster module see more on https://www.jhipster.tech \n'));
    
}
/**
 * Get cover list as choices
 * 
 * @param {string} CLIENT_FRAMEWORK 
 */
function getCoverListChoices(CLIENT_FRAMEWORK) {
    let choices = [];
    _.forEach(getCoverList(CLIENT_FRAMEWORK), function(COVER) {
        choices.push(COVER)
    });
    return choices
}
/**
 * Get cover list by client framework
 * 
 * @param {string} CLIENT_FRAMEWORK 
 */
function getCoverList(CLIENT_FRAMEWORK) {
    switch (CLIENT_FRAMEWORK) {
        case constant.CLIENT_FRAMEWORK.ANGULAR:
            return constant.COVER_TYPE.ANGULAR;
        case constant.CLIENT_FRAMEWORK.REACT:
            return constant.COVER_TYPE.REACT;
        default:
        // OTHER CLIENT FRAMEWORK NOT SUPPORTED
            return null;
    }
}
/**
 * Check jhipster app version
 * @param {*} generator 
 */
function checkJhipster(generator) {
    const jhipsterVersion = generator.jhipsterAppConfig.jhipsterVersion;
    const minimumJhipsterVersion = packageJson.dependencies['generator-jhipster'];
    if (!semver.satisfies(jhipsterVersion, minimumJhipsterVersion)) {
        generator.warning(`\nYour generated project used an old JHipster version (${generator.jhipsterVersion})... you need at least (${generator.minimumJhipsterVersion})\n`);
    }
}
/**
 * Configure constant
 * 
 * @param {*} generator 
 */
function initializing(generator) {
    generator.debug('configuring...');
    generator.jhipsterAppConfig = generator.getJhipsterAppConfig();
    printCoverbLogo(generator);
    checkJhipster(generator);
    generator.ENABLE_TRANSLATION = generator.jhipsterAppConfig.enableTranslation;
    generator.baseName = generator.jhipsterAppConfig.baseName;
    generator.ANGULAR_X_APP_NAME = generator.getAngularXAppName();
    generator.CLIENT_FRAMEWORK = generator.jhipsterAppConfig.clientFramework;
    generator.USE_SASS = generator.jhipsterAppConfig.useSass;
}
/**
 * Call run() cover writer method
 * @param {*} generator 
 */
function writeCoverFiles(generator) {
    require(`./templates/${generator.COVER_TYPE}/writer`).run(generator);
}
/**
 * Call run() demo writer method
 * @param {*} generator 
 */
function writeDemoFiles(generator) {
    require('./templates/demo/writer').run(generator);
}
/**
 * Copy file.NAME from file.FROM path to file.TO path
 */
function copyFiles(files, generator) {
    _.forEach(files, function(file) {
        // generator.debug('WRITING FILE: ' + file.NAME + ' FROM: '+file.FROM +' =>TO: ' + file.TO);
        switch (file.METHOD) {
            case 'CONTENT':
                generator.fs.copy(
                    generator.templatePath(file.FROM),
                    generator.destinationPath(file.TO)
                );
                break;
            case 'TEMPLATE':
                generator.template(file.FROM,file.TO);
            default:
                break;
        }
      });
}
/**
 * Autogenate i18n files
 * 
 * @param {*} COVER_NAME cover name select by user
 * @param {*} DEFAULT_FILE base to generate files
 * @param {*} generator 
 */
function autoGenerateI18nFiles(COVER_NAME, DEFAULT_FILE, generator) {
    generator.nativeLanguage = generator.jhipsterAppConfig.nativeLanguage;
    generator.getAllInstalledLanguages().forEach((language) => {
        // Generate a i18n file from default one
        generator.currentLanguagePrefix = language === generator.nativeLanguage ? '' : (`[${_.upperCase(language)}] `);
        generator.template(
            DEFAULT_FILE,
            constant.PATH.CLIENT_MAIN_SRC_DIR+'i18n/'+language+'/'+_.kebabCase(COVER_NAME)+'.json'
        );
    }, generator);
}
/**
 * Autogenate i18n menu
 * 
 * @param {*} COVER_NAME cover name select by user
 * @param {*} DEFAULT_FILE base to generate files
 * @param {*} generator 
 */
function autoGenerateI18nMenu(COVER_NAME, generator) {
    const CLIENT_MAIN_SRC_DIR = constant.PATH.CLIENT_MAIN_SRC_DIR;
    generator.nativeLanguage = generator.jhipsterAppConfig.nativeLanguage;
    generator.getAllInstalledLanguages().forEach((language) => {
        // Generate a i18n file from default one
        generator.currentLanguagePrefix = language === generator.nativeLanguage ? '' : (`[${_.upperCase(language)}] `);
        // Add menu to global.json
        updateFile(
            `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`,
            `"${_.kebabCase(COVER_NAME)}": "${generator.currentLanguagePrefix}${_.upperFirst(_.camelCase(COVER_NAME))}",`,
            constant.NEEDLE.MENU_ADD_ELEMENT,
            generator
        );
    }, generator);
}
/**
 * Add nav bar item by type
 * @param {*} TYPE
 * @param {*} NEEDLE
 * @param {*} ITEM_NAME
 * @param {*} ROOT_ROUTE 
 * @param {*} generator 
 */
function addNavBarItem (TYPE, NEEDLE, ITEM_NAME, ROOT_ROUTE, generator) {
    const NAV_BAR_PATH = constant.PATH.NAV_BAR;
    const ENABLE_TRANSLATION = generator.ENABLE_TRANSLATION;
    let CODE;
    switch (TYPE) {
        case constant.NAV_BAR_TYPE.ITEM:
            CODE = navbarItem(
                    ITEM_NAME, 
                    constant.ICON.NAV_BAR_ITEM, 
                    ROOT_ROUTE, 
                    ENABLE_TRANSLATION, 
                    generator.CLIENT_FRAMEWORK);
            break;
        case constant.NAV_BAR_TYPE.MENU:
            CODE = navbarMenu(
                ITEM_NAME, 
                constant.ICON.NAV_BAR_MENU,
                ENABLE_TRANSLATION, 
                generator.CLIENT_FRAMEWORK);
            break;
        case constant.NAV_BAR_TYPE.MENU_ITEM:
            CODE = navbarMenuItem(
                ITEM_NAME, 
                constant.ICON.NAV_BAR_MENU_ITEM, 
                ROOT_ROUTE, 
                ENABLE_TRANSLATION, 
                generator.CLIENT_FRAMEWORK);
            break;
        default:
            break;
    }
    updateFile(
        NAV_BAR_PATH,
        CODE,
        NEEDLE,
        generator
    );
}
/**
 * Add nav bar item
 * @param {*} ITEM_NAME 
 * @param {*} NAV_BAR_ICON 
 * @param {*} ROOT_ROUTE 
 * @param {*} ENABLE_TRANSLATION 
 * @param {*} CLIENT_FRAMEWORK 
 */
function navbarItem(ITEM_NAME, NAV_BAR_ICON, ROOT_ROUTE, ENABLE_TRANSLATION, CLIENT_FRAMEWORK) {
        let CODE;
        switch (CLIENT_FRAMEWORK) {
            case constant.CLIENT_FRAMEWORK.ANGULAR:
                CODE = 
        `|<li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        |                <a class="nav-link" routerLink="${ROOT_ROUTE}${_.kebabCase(ITEM_NAME)}" (click)="collapseNavbar()">
        |                    <fa-icon [icon]="'${NAV_BAR_ICON}'" [fixedWidth]="true"></fa-icon>
        |                    <span${ENABLE_TRANSLATION ? ` jhiTranslate="global.menu.${_.kebabCase(ITEM_NAME)}"` : ''}>${_.upperFirst(_.camelCase(ITEM_NAME))}</span>
        |                </a>
        |            </li>`;
                break;
            case constant.CLIENT_FRAMEWORK.REACT:
                // TODO:
                break;
            default:
                break;
        }
        return CODE;
}
/**
 * Add menu nav bar
 * @param {*} MENU_NAME 
 * @param {*} NAV_BAR_ICON 
 * @param {*} ENABLE_TRANSLATION 
 * @param {*} CLIENT_FRAMEWORK 
 */
function navbarMenu(MENU_NAME, NAV_BAR_ICON, ENABLE_TRANSLATION, CLIENT_FRAMEWORK) {
    let CODE;
    switch (CLIENT_FRAMEWORK) {
        case constant.CLIENT_FRAMEWORK.ANGULAR:
            CODE = 
        `|<li ngbDropdown class="nav-item dropdown pointer" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        |                <a class="nav-link dropdown-toggle" ngbDropdownToggle href="javascript:void(0);" id="${_.kebabCase(MENU_NAME)}">
        |                    <span>
        |                        <fa-icon [icon]="'${NAV_BAR_ICON}'"></fa-icon>
        |                        <span${ENABLE_TRANSLATION ? ` jhiTranslate="global.menu.${_.kebabCase(MENU_NAME)}"` : ''}>${_.upperFirst(_.camelCase(MENU_NAME))}</span>
        |                    </span>
        |                </a>
        |                <ul class="dropdown-menu" ngbDropdownMenu>
        |                <!-- jhipster-needle-add-item-to-${_.kebabCase(MENU_NAME)}-menu - JHipster will add items to the ${_.kebabCase(MENU_NAME)} menu here -->
        |                </ul>
        |            </li>`;
            break;
        case constant.CLIENT_FRAMEWORK.REACT:
            // TODO:
            break;
        default:
            break;
    }
    return CODE;
}
/**
 * Add nav bar menu item
 * @param {*} ITEM_NAME 
 * @param {*} NAV_BAR_ICON 
 * @param {*} ROOT_ROUTE 
 * @param {*} ENABLE_TRANSLATION 
 * @param {*} CLIENT_FRAMEWORK 
 */
function navbarMenuItem(ITEM_NAME, NAV_BAR_ICON, ROOT_ROUTE, ENABLE_TRANSLATION, CLIENT_FRAMEWORK) {
    let CODE;
    switch (CLIENT_FRAMEWORK) {
        case constant.CLIENT_FRAMEWORK.ANGULAR:
            CODE =
            `|<li>
            |                    <a class="dropdown-item" routerLink="${ROOT_ROUTE}${_.kebabCase(ITEM_NAME)}" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
            |                        <fa-icon [icon]="'${NAV_BAR_ICON}'" [fixedWidth]="true"></fa-icon>
            |                        <span${ENABLE_TRANSLATION ? ` jhiTranslate="${_.kebabCase(ITEM_NAME)}.page.title"` : ''}>${_.upperFirst(_.camelCase(ITEM_NAME))}</span>
            |                    </a>
            |                </li>`;
            break;
        case constant.CLIENT_FRAMEWORK.REACT:
            // TODO:
            break;
        default:
            break;
    }
    return CODE;
}
/**
 * Update a file
 * @param {*} FILE 
 * @param {*} CODE 
 * @param {*} NEEDLE 
 * @param {*} generator 
 */
function updateFile(FILE, CODE, NEEDLE, generator) {
    jhipsterUtils.rewriteFile(
        {
            file: FILE,
            needle: NEEDLE,
            splicable: [generator.stripMargin(CODE)]
        },
        generator
    );
}
/**
 * Add angular module
 * @param {*} ANGULAR_X_APP_NAME 
 * @param {*} COVER_NAME 
 * @param {*} ROOT_ROUTE 
 * @param {*} generator 
 */
function addAngularModule(ANGULAR_X_APP_NAME, COVER_NAME, ROOT_ROUTE, generator) {
    // add module import
    updateFile(
        constant.PATH.MODULE,
        `|import { ${_.upperFirst(ANGULAR_X_APP_NAME)}${_.upperFirst(_.camelCase(COVER_NAME))}Module } from 'app/${ROOT_ROUTE}${_.kebabCase(COVER_NAME)}/module';`,
        constant.NEEDLE.ADD_ANGULAR_MODULE_IMPORT,
        generator
    );
    // add module
    updateFile(
        constant.PATH.MODULE,
        `|${_.upperFirst(ANGULAR_X_APP_NAME)}${_.upperFirst(_.camelCase(COVER_NAME))}Module,`,
        constant.NEEDLE.ADD_ANGULAR_MODULE,
        generator
    );
}
/**
 * Get style suffix for TEST_CASE
 * 
 * @param {} TEST_CASE 
 */
function getStyleSuffixForTestCase(TEST_CASE) {
    switch (TEST_CASE) {
      case constant.TEST_CASE.CSS:
        return 'css';
      case constant.TEST_CASE.SCSS:
        return 'scss';
      case constant.TEST_CASE.CSS_MULTI_LANGUAGE:
        return 'css';
      case constant.TEST_CASE.SCSS_MULTI_LANGUAGE:
        return 'scss';
      default:
        return 'style for test case not defined';
    }
}
/**
 * Get multilanguage flag for TEST_CASE
 * 
 * @param {} TEST_CASE 
 */
function getMultiLanguageForTestCase(TEST_CASE) {
    switch (TEST_CASE) {
      case constant.TEST_CASE.CSS:
        return false;
      case constant.TEST_CASE.SCSS:
        return false;
      case constant.TEST_CASE.CSS_MULTI_LANGUAGE:
        return true;
      case constant.TEST_CASE.SCSS_MULTI_LANGUAGE:
        return true;
      default:
        return 'multilanguage for test case not defined';
    }
}
/**
 * Replace content
 * @param {*} args 
 * @param {*} generator 
 */
function replaceContent(args, generator){
    jhipsterUtils.replaceContent(args,generator);
}
/**
 * remove file
 * @param {*} file 
 * @param {*} generator 
 */
function removeFile(file, generator){
    generator.removeFile(file);
}
/**
 * Exlude icon from webpack build for react client
 * @param {} generator 
 */
function excludeIcons(generator) {
    const file = `tsconfig.json`;
    const pattern = `"node_modules"`;
    const content = pattern+`,
    "${constant.PATH.ICON}"`;
    replaceContent(
      {
        file: file,
        pattern,
        content
      },
      generator
    );
}
/**
 * Update route by cover
 * @param {*} generator 
 */
async function updateRouteByCover(generator){
    addRouteByCover(generator);
    await addRouteImportByCover(generator);
  };
/**
 * Add route by cover
 * @param {*} generator 
 */
function addRouteByCover(generator) {
    const file = constant.PATH.ROUTE_REACT+`routes.tsx`;
    const pattern = `<Switch>`;
    const content = `<Switch>
      <ErrorBoundaryRoute path="/${_.kebabCase(generator.COVER_NAME)}" component={${_.upperFirst(_.camelCase(generator.COVER_NAME))}} />`
    replaceContent({
        file: file,
        pattern,
        content, 
    },generator);
}
/**
 * Add route import by cover
 * @param {*} generator 
 */
function addRouteImportByCover(generator) {
    const file = constant.PATH.ROUTE_REACT+`routes.tsx`;
    const pattern = `import { AUTHORITIES } from 'app/config/constants';`;
    const content = `import { AUTHORITIES } from 'app/config/constants';
import ${_.upperFirst(_.camelCase(generator.COVER_NAME))} from 'app/${generator.ROOT_ROUTE}${_.kebabCase(generator.COVER_NAME)}/component';`;
    replaceContent({
        file: file,
        pattern,
        content
    },generator);
}
/**
 * Update header by cover
 * @param {*} generator 
 */
async function updateHeaderByCover(generator){
    addHeaderImportByCover(generator) // Wait for this
    await addHeaderByCover(generator) // Then wait for that
  };
/**
 * Add header by cover
 * @param {*} generator 
 */
function addHeaderByCover(generator) {
    const file = constant.PATH.HEADER_REACT+`header.tsx`;
    const pattern = `<Home />`;
    const content = `<Home />
              <${_.upperFirst(_.camelCase(generator.COVER_NAME))} />`
    replaceContent({
        file: file,
        pattern,
        content, 
    },generator);
}
/**
 * Add header import by cover
 * @param {*} generator 
 */
function addHeaderImportByCover(generator) {
    const file = constant.PATH.HEADER_REACT+`header.tsx`;
    const pattern = `import React from 'react';`;
    const content = `import React from 'react';
import ${_.upperFirst(_.camelCase(generator.COVER_NAME))} from 'app/${generator.ROOT_ROUTE}${_.kebabCase(generator.COVER_NAME)}/navbar.item';`;
    replaceContent({
        file: file,
        pattern,
        content
    },generator);
}
