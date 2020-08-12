class RadialTree{
    constructor(edges, scope = 2*Math.PI, space = 0.8){
        this.edges = [...edges];
        this.scope = scope;
        this.space = space;
        this.n = this.edges.length;
        this.leaves = new Array(this.n);
        this.dep = new Array(this.n);
        this.angle = new Array(this.n);
        this.alpha = new Array(this.n);
        this.pos = new Array(this.n);
        for(let i = 0; i < this.n; i++){
            this.leaves[i] = 0;
            this.dep[i] = 0;
            this.angle[i] = 0;
            this.alpha[i] = 0;
            this.pos[i] = {
                x : 0,
                y : 0,
            };
        }
        
        this.dfs_pre(0, -1);
        this.angle[0] = this.scope;
        this.dfs(0, -1);
    }
    getPos() {  
        return this.pos;
    }
    dfs_pre(u, fa){
        let sz = 0;
        for(const v of this.edges[u]){
            if(v == fa)
                continue;
            this.dep[v] = this.dep[u] + 1;
            this.dfs_pre(v, u);
            this.leaves[u] += this.leaves[v];
            sz++;
        }
        if(sz == 0){
            this.leaves[u] +=1;
        }
    }
    dfs(u, fa){
        var sum = this.alpha[u];
        for(const v of this.edges[u]){
            if(v == fa)
                continue;
            this.angle[v] = this.leaves[v] / this.leaves[0] * this.scope;
            this.alpha[v] = sum;
            let alpha_uv = this.alpha[v] + this.angle[v] / 2;
            let l = 0.0, r=100.0;
            for(let i = 0; i < 32; i++){
                let mid = (l + r) / 2;
                this.pos[v].x = this.pos[u].x + mid * Math.cos(alpha_uv);
                this.pos[v].y = this.pos[u].y + mid * Math.sin(alpha_uv);  
                if(this.pos[v].x ** 2 + this.pos[v].y ** 2 < this.space*this.dep[v]) {
                    l=mid;
                } else {
                    r=mid;
                }
            }
            this.pos[v].x = this.pos[u].x + l * Math.cos(alpha_uv);
            this.pos[v].y = this.pos[u].y + l * Math.sin(alpha_uv); 
            sum += this.angle[v];
            this.dfs(v, u);
        }
    }
}


class LayeredTree{
    constructor(edges,sibling_separation = 1, node_size = 0.55, subtree_separation = 1.1, level_separation = 1.8){
        this.edges = [...edges];
        this.sibling_separation = sibling_separation;
        this.subtree_separation = subtree_separation;
        this.level_separation = level_separation;
        this.node_size = node_size;
        this.n = this.edges.length;
        this.dep = new Array(this.n);
        this.size = new Array(this.n);
        this.parent = new Array(this.n);
        this.pos = new Array(this.n);
        this.prelim = new Array(this.n);
        this.modifier = new Array(this.n);
        this.leftSibling = new Array(this.n);
        this.rightSibling = new Array(this.n);
        this.leftNeighbor = new Array(this.n);
        this.tmp = new Array(this.n);
        for(let i = 0; i < this.n; i++){
            this.dep[i] = 0;
            this.size[i] = 0;
            this.parent[i] = -1;
            this.leftNeighbor[i] = -1;
            this.leftSibling[i] = -1;
            this.rightSibling[i] = -1;
            this.tmp[i] = -1;
            this.prelim[i] = 0;
            this.modifier[i] = 0;
            this.pos[i] = {
                x : 0,
                y : 0,
            };
           
        }
        this.dfs(0, -1, 0);
        this.firstWalk(0, 0);
        this.xTopAdjustment = this.pos[0].x - this.prelim[0];
        this.yTopAdjustment = this.pos[0].y;
        this.secondWalk(0, 0, 0);
    }
    getPos() {  
        return this.pos;
    }
    dfs(x, fa, level){
        this.size[x] += 1;
        this.dep[x] = level;
        this.leftNeighbor[x] = this.tmp[level];
        this.tmp[level] = x;
        let index = this.edges[x].indexOf(fa);
        if (index > -1){
            this.edges[x].splice(index, 1);
        }
        for(let i = 0; i< this.edges[x].length; i++){
            let y = this.edges[x][i];
            this.dfs(y, x, level + 1);
            this.size[x] += this.size[y];
            this.parent[y] = x;
            if (i > 0) {
                this.leftSibling[y] = this.edges[x][i-1];
            }
            if(i + 1 < this.edges[x].length) {
                this.rightSibling[y] = this.edges[x][i+1];
            }
        }
    }
    getLeftMost(cur, level, depth) {
        let size = this.size;
        let edges = this.edges;
        if (level >= depth) {
            return cur;
        }
        if (size[cur] == 1) {
            return -1;
        }
        for(let child of edges[cur]) {
            let temp = this.getLeftMost(child, level + 1, depth);
            if (temp != -1)
                return temp;
        }
        return -1;
    }
    apportion(cur){
        let edges = this.edges;
        let size = this.size;
        let parent = this.parent;
        let leftNeighbor = this.leftNeighbor;
        let leftSibling = this.leftSibling;
        let modifier = this.modifier;
        let prelim = this.prelim;
        let leftmost = edges[cur][0];
        let neighbor = leftNeighbor[leftmost];
        let compareDepth = 1;
        while (leftmost != -1 && neighbor != -1) {
            let leftModsum = 0, rightModsum = 0;
            let ancestorLeftmost = leftmost;
            let ancestorNeighbor = neighbor;
            for(let i = 0; i < compareDepth; i++){
                ancestorLeftmost = parent[ancestorLeftmost];
                ancestorNeighbor = parent[ancestorNeighbor];
                rightModsum += modifier[ancestorLeftmost];
                leftModsum += modifier[ancestorNeighbor];
            }
            let moveDistance = prelim[neighbor] + leftModsum + this.subtree_separation + this.node_size - (prelim[leftmost] + rightModsum);
            if (moveDistance > 0.0) {
                let temp = cur;
                let leftSiblings = 0;
                while (temp != -1 && temp != ancestorNeighbor) {
                    leftSiblings += 1;
                    temp = leftSibling[temp];
                }
                if (temp != -1) {
                    let portion = moveDistance / leftSiblings;
                    temp = cur;
                    while (temp != ancestorNeighbor) {
                        prelim[temp] += moveDistance;
                        modifier[temp] += moveDistance;
                        moveDistance -= portion;
                        temp = leftSibling[temp];
                    }
                } else {
                    return;
                }
            }
            compareDepth += 1;
            if (size[leftmost] == 1)
                leftmost = this.getLeftMost(cur, 0, compareDepth);
            else
                leftmost = edges[leftmost][0];
            neighbor = leftNeighbor[leftmost];
        }
    }
    firstWalk(cur, level){
        let size = this.size;
        let edges = this.edges;
        let leftSibling = this.leftSibling;
        let prelim = this.prelim;
        let modifier = this.modifier;
        if (size[cur] == 1) {
            if (leftSibling[cur] == -1) {
                prelim[cur] = 0;
            } else {
                prelim[cur] = prelim[leftSibling[cur]] + this.sibling_separation + this.node_size;
            }
        } else {
            for(let child of edges[cur]) {
                this.firstWalk(child, level + 1);
            }
            let midpos = (prelim[edges[cur][0]] + prelim[edges[cur][edges[cur].length-1]]) / 2;
            if (leftSibling[cur] != -1) {
                prelim[cur] = prelim[leftSibling[cur]] + this.sibling_separation + this.node_size;
                modifier[cur] = prelim[cur] - midpos;
                this.apportion(cur);
            }
            else {
                prelim[cur] = midpos;
            }
        }
    }
    secondWalk(cur, level, modsum){
        let pos = this.pos;
        let edges = this.edges;
        pos[cur].x = this.xTopAdjustment + this.prelim[cur] + modsum;
        pos[cur].y = this.yTopAdjustment + level * this.level_separation
        for(let child of edges[cur])
            this.secondWalk(child, level + 1, modsum + this.modifier[cur]);
    }
}