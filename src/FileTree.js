class FileTreeNode {
    constructor(directoryName) {
        this.name = directoryName;
        this.descendants = [];
        this.parent = null;
    }

    addChild(newChild) {
        let good = true;
        this.descendants.forEach(function (child) {
            if (child.name === newChild.name) {
                good = false;
                console.warn("Child node has same name as sibling, addChild failed.");
            }
        });
        if (good) {
            this.descendants.push(newChild);
            newChild.parent = this;
        }
    }

    addChildName(newChildName) {
        let child = new FileTreeNode(newChildName);
        this.addChild(child);
    }

    // we don't really need a remove child, unless we want the user to be able to change the file system.
}

export default class FileTreeSystem {
    constructor(rootName) {
        this.root = new FileTreeNode(rootName);
        this.currentNode = this.root;
    }

    // given a child directory name navigate to it
    navigateTo(string) {

    }

    // returns the children of the current node
    getChildren() {
        return this.currentNode.descendants;
    }

    addChild(childName) {
        this.currentNode.addChildName(childName);
    }

    getCurrentDirectoryName() {
        return this.currentNode.name;
    }

    getFullPathName() {
        let current = this.currentNode;
        let fileString = this.currentNode.name;
        while (current.parent !== null) {
            current = current.parent;
            fileString = current.name + "/" + fileString;
        }
        return fileString;
    }
}