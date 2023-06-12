import Parser from 'web-tree-sitter';

import {readFileSync, readdirSync, existsSync, read} from 'node:fs'

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const path = `${__dirname}/JSONTestSuite/test_parsing/`

const level = 'debug' // Deno.args.length > 0? Deno.args[0]: 'info'

const debug = (...args) => {if (level === 'debug') console.debug(...args)}

const env = process.env
if (existsSync('.env.json')) {
  Object.assign(env, JSON.parse(readFileSync('.env.json')))
}

const TS_FITZJSON_WASM_PATH = env.TS_FITZJSON_WASM_PATH ?? 'node_modules/@xtao-org/tree-sitter-fitzjson/tree-sitter-fitzjson.wasm'

/**
 * @param {Parser.SyntaxNode} node
 * TODO: perhaps truncate errors if too many
 */
const getErrors1 = (node, errors = []) => {
  if (node.type === 'ERROR' || node.type === 'MISSING' || node.hasError() || node.isMissing()) errors.push(node)
  for (const c of node.children) {
    getErrors1(c, errors)
  }
  return errors
}

const getErrors = (node) => {
  const errors1 = getErrors1(node)

  return errors1.map(e => [e.toString(), e.startPosition, e.endPosition])
}

const makeParser = async () => {
  await Parser.init();
  const parser = new Parser();
  // todo: path to parser
  const Lang = await Parser.Language.load(TS_FITZJSON_WASM_PATH);
  parser.setLanguage(Lang);

  return parser
} 

const test = async (name, fn) => {
  console.log('Test', name)
  await fn()
}

const file = (path) => {
  return readFileSync(path, {encoding: 'utf-8'})
}

// oof cases:
// Expected n_object_lone_continuation_byte_in_key_and_trailing_comma.json to fail
// {"�":"0",} -- this seems to be a tree-sitter thing; it accepts non-code-points even with the /u flag

// interesting cases:
// {9999E9999:1}
// [é] -- maybe identifiers should be limited to a-zA-Z?

// cases to be filtered out in the interpreter (todo: test)
// {null:null,null:null} -- duplicate key null
// {"a" b} --> unknown reference to b
// ["x", truth] --> truth unknown
// abc --> abc unknown
// aå
// å
// [True] -- maybe a linter could warn of confusion; ACTUALLY this will error because True is not found

// not sure cases:
// Expected n_single_space.json to fail -- empty top
//  
// Expected n_structure_UTF8_BOM_no_data.json to fail -- may be a tree-sitter thing
// ﻿
// Expected n_structure_no_data.json to fail -- empty top
//

const main = async () => {

  const parser = await makeParser()

  // let str = ''
  // for (let i = 0; i < 100000; ++i) str += '['

  // const rootNode = parser.parse(str).rootNode
  // console.log(rootNode.type, rootNode.isMissing())

//   const rootNode = parser.parse(String.raw`["new 
//   line\n
// \r
// xxx
// "]`).rootNode

  // const ers = getErrors(rootNode)

  // console.log(rootNode.toString(), ers)

  // process.exit()

  for (const name of readdirSync(path)) {
    // const {name} = dirEntry
    await test(name, async () => {
      const str = file(path + '/' + name)
      const parser = await makeParser()
      let failedAsExpected = false

      const tree = parser.parse(str)
      
      const errors = getErrors(tree.rootNode)
    
      if (errors.length > 0) {
        if (name.startsWith('y_')) {
          console.error(ret)
          throw Error(`Expected ${name} to pass`)
        } else if (name.startsWith('i_')) {
          // name.startsWith('i_') && !['i_string_UTF-16LE_with_BOM.json', 'i_string_utf16LE_no_BOM.json', 'i_string_utf16BE_no_BOM.json'].includes(name)
          failedAsExpected = true
          debug("could optionally succeed, but didn't")
        } else {
          failedAsExpected = true
          debug('failed as expected', errors)
        }
      }
      if (failedAsExpected === false) {
        // const ret = stream.end()
    
        if (errors.length > 0) {
          if (name.startsWith('y_') || name.startsWith('i_') && !['i_string_UTF-16LE_with_BOM.json', 'i_string_utf16LE_no_BOM.json', 'i_string_utf16BE_no_BOM.json'].includes(name)) {
            console.error(ret)
            throw Error(`Expected ${name} to pass`)
          } else {
            debug('failed, as expected', errors)
          }
        } else if (name.startsWith('n_')) {
          console.error(errors)
          debug(`Expected ${name} to fail`)
          console.log(str)
          // throw Error(`Expected ${name} to fail`)
        }
      }
    })
  }  
}


main()