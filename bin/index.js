#!/usr/bin/env node

console.time("Time taken")
const yargs = require("yargs");
const fs = require('fs');
const p = require('path');
const fastFolderSizeSync = require('fast-folder-size/sync')
const fastFolderSize = require('fast-folder-size')
const chalk = require("chalk");

const options = yargs
  .usage("Usage: -p <name>")
  .option("p", {
    alias: "path",
    describe: "Path of directory",
    type: "string",
    demandOption: true
  })
  .option("d", { alias: "clean", describe: "Delete node_modules", type: "boolean" })
  .argv;

const {path, clean = false} = options

let totalBytes = 0

/* SYNC */
// try {
//   if (!findNodeModules(path)) {
//     checkIfFileInPath(path)
//   }

//   console.log(`Total size of node_modules in ${path} is ${chalk.red.bold(formatBytes(totalBytes))}`)
//   console.timeEnd("Time taken")
// } catch (error) {
//   console.log(error.message)
// }

/* ASYNC */
try {
  const promises = []
  if (haveNodeModuleInDir(path)) {
    promises.push(findNodeModuleSize(path))
  } else {
    loopFilesInPath(path, promises)
  }

  Promise.all(promises).then(result => {
    const totalBytes = result.reduce((prev, current) => prev + current, 0)
    console.timeEnd("Time taken")

    const coloredTotalBytes = totalBytes === 0 ? chalk.green.bold(formatBytes(totalBytes)) : chalk.red.bold(formatBytes(totalBytes))
    console.log(`Total size of node_modules in ${path} is ${coloredTotalBytes}`)
  })

} catch (error) {
  console.log(error.message)
}


function findNodeModules(path) {
  const nodeModulesPath = p.join(path, 'node_modules')
  if (fs.existsSync(nodeModulesPath)) {
    const bytes = fastFolderSizeSync(nodeModulesPath)
    if (bytes) {
      const size = chalk.green(formatBytes(bytes))
      console.log(`Size: ${size} in ${nodeModulesPath}`)
      totalBytes += bytes
    }
    return true
  }
  return false
}

function findNodeModuleSize(path) {
  const nodeModulesPath = p.join(path, 'node_modules')
  return new Promise((resolve, reject) => {
    fastFolderSize(nodeModulesPath, (err, bytes) => {
      if (err) {
        throw err
      }
      if (clean) {
        fs.rm(nodeModulesPath, { recursive: true, force: true }, err => {
          if (err) {
            throw err
          }
          const size = chalk.green(formatBytes(bytes))
          console.log(`Removed ${size} in ${nodeModulesPath}`)
          resolve(bytes)
        })
      } else {
        const size = chalk.red(formatBytes(bytes))
        console.log(`Size: ${size} in ${nodeModulesPath}`)
        resolve(bytes)
      }
    })
  })
}

function haveNodeModuleInDir(path) {
  return fs.existsSync(p.join(path, 'node_modules'))
}


function checkIfFileInPath(path) {
  fs.readdirSync(path).forEach(item => {
    const itemPath = p.join(path, item)
    if (isDir(itemPath)) {
      if (!findNodeModules(itemPath)) {
        checkIfFileInPath(itemPath)
      }
    }
  })
}

function loopFilesInPath(path, promises) {
  fs.readdirSync(path).forEach(item => {
    const itemPath = p.join(path, item)
    if (isDir(itemPath)) {
      if (haveNodeModuleInDir(itemPath)) {
        promises.push(findNodeModuleSize(itemPath))
      } else {
        loopFilesInPath(itemPath, promises)
      }
    }
  })
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function isDir(path) {
  return fs.lstatSync(path).isDirectory()
}