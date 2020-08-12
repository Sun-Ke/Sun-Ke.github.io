class Tree{
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