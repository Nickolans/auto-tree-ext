// const fs = require('fs');
import * as fs from 'fs';

export const getFilesFromDir = async (dir) => {
    return new Promise(resolve => {
        const fileArray = []
        fs.readdir(dir, (err, files) => {
            // 1. Check for error
            if (err) {
                console.log("Error in getFilesFromDir!\n\t", err)
            }
            // 2. Add files to array
            files.forEach(file => {
                fileArray.push(file)
            });
            resolve(fileArray)
        })
    })
}

const isDirEmpty = async (dir) => {
    return new Promise(resolve => {
        let files = getFilesFromDir(dir)
        resolve(files.length == 0)
    })
}

const isDir = (dir) => {
    return (fs.lstatSync(dir).isDirectory())
}

const isHiddenDir = (dir) => {
    return dir[0] == ".";
}

const getFileTree = async (dir) => {
    console.log(dir)
    return new Promise(async resolve => {
        // If initial dir is empty, ignore.
        const dirEmpty = await isDirEmpty(dir)
        if (dirEmpty) {
            resolve({})
        }
        // Otherwise, get ready...
        let tree = []
        const files = await getFilesFromDir(dir)
        files.forEach(element => {
            if (element[0] == ".") {
                // Ignore!
            }
            else {
                // If element is a dir, then...
                if (fs.lstatSync(dir + element).isDirectory()) {
                    (async () => {
                        tree.push({
                            "child": await getFileTree(dir + element + "/"),
                            "name": element
                        })
                    })();
                } else {
                    tree.push({
                        "child": [],
                        "name": element
                    })
                }
                tree.element = element
            }
        })
        resolve(tree)
    })
};

class Node {
    constructor(fileName, filePath, children) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.children = children;
    }

    addChild(newChild) {
        this.children.push(newChild)
    }
}

// RETURN NODE
export const generateNodeTree = async (node) => {

    return new Promise(async resolve => {

        // 1. Grab files from directory
        const files = await getFilesFromDir(node.filePath)

        // 2. Iterate through given files
        files.forEach((file) => {

            if (!isHiddenDir(file)) {

                // 3. Check if directory
                const directory = node.filePath + "/" + file
                const isDirectory = isDir(directory)
                console.log(directory)

                const childNode = new Node(file, directory, [])

                // 4. If directory, then run call generateNodeTree
                if (isDirectory) {
                    generateNodeTree(childNode).then((child) => {
                        node.addChild(child)
                    })

                }
                // 5. If not directory, do nothing?
                else {
                    node.addChild(childNode)
                }
            }
        })

        resolve(node)
    })
}

const root = new Node("root", ".", [])
generateNodeTree(root)
