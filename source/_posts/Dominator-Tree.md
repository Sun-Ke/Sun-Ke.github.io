---
title: Dominator Tree
date: 2018-09-14 12:28:00
categories: 算法学习
tags: 图论
---

### 问题引入

题目要求解决的模型： 给定有向图G（可能有环）和图中的一个点r，对于G中的任意一个点x，求从r到x的路径上（可能有很多条）必须经过的点集。

- **Flow Graph**：若有向图G中存在一点r，从r出发可到达G中所有的点，则称G是Flow Graph，记为(G,r)。
- **必经点（dom）**：若在(G,r)中从r到y的路径一定经过点x，则称x是从r到达y的必经点，记为x dom y。 从r出发到达y的所有必经点构成的集合记为dom(y)，即dom(y)={x | x dom y}。
- **最近必经点（idom）**： 节点y的必经点集合dom(y)中dfn值最大的点x是距离y最近的必经点，称为y的最近必经点。最近必经点是唯一的，因此可以记x=idom(y)。

于是可以按下面$O(V^2)$暴力求解

- $pre(y)=\{x|(x,y)\in E\}$ y的前驱节点集合
- $suc(x)=\{y|(x,y)\in E\}$ x的后继节点集合
- $dom(r)=\{r\}$
- $dom(y)=\cap _{x\in pre(y)} dom(x) \cup \{y\}$
- $idom(x)=id[Max\{dfn[y]|y\in dom(x)\}]$

### Dominator Tree

设有向图$G=(V,E)$，$(G,r)$是一个Flow Graph，则称$(G,r)$的子图$D=(V, \{ (idom(i),i) | i\in V , i\neq r \}, r)$为$(G,r)$的一棵Dominator Tree。

$(G,r)$的Dominator Tree是一棵有向有根树，从$r$出发可以到达G中的所有点，并且树上的每条边$(u,v)$都满足：$u=idom(v)$，即父节点是子节点的最近必经点。

- $x=idom(y)$，当且仅当有向边$(x,y)$是Dominator Tree中的一条树枝边。
- $x dom y$，当且仅当在Dominator Tree中存在一条从$x$到$y$的路径。
- $x$的必经点集合$dom(x)$是Dominator Tree上$x$的所有祖先以及$x$自身。

### 半必经点

**半必经点（semi）** 在搜索树T上点$y$的祖先中，经过时间戳比$y$大的节点可以到达$y$的深度最小的祖先$x$，称为$y$的半必经点。关于半必经点有如下性质：

- 半必经点也是唯一的，因此可以记$x=semi(y)$。

- 一个点的半必经点必定是它在dfs树上的祖先，$dfn[semi[x]]<dfn[x]$。

- 半必经点不一定是x的必经点。

<center><img src="https://lc-gluttony.s3.amazonaws.com/YnMictO7MdpA/c42cdea6de96987ed706/%E6%94%AF%E9%85%8D%E6%A0%911.png" width="40%">&nbsp&nbsp&nbsp<img src="https://lc-gluttony.s3.amazonaws.com/YnMictO7MdpA/859757ae0cba42d97c01/%E6%94%AF%E9%85%8D%E6%A0%912.png" width="35%"></center>

**如何求半必经点**：对于G中一点y，考虑所有$x\in pre(y)$，设$temp=INF$。

- 若$dfn[x]<dfn[y]$，则$(x,y)$为树枝边或前向边，此时$temp=min(temp,dfn[x])$
- 若$dfn[x]>dfn[y]$，则$(x,y)$为横叉边或后向边，此时任意$x$在$T$中的祖先$z$，满足$dfn[z]>dfn[y]$时，$temp=min(temp,dfn[semi[z]])$
- $semi[y]=id[temp]$

### 必经点

对于G中的一点$x$，考虑搜索树T中$semi(x)$到$x$的路径上除端点之外的点构成的集合path

设$y=id[min\{dfn[semi(z)]|z\in path\}]$，即path中半必经节点的时间戳最小的节点。

- $semi(x)=semi(y)$时，$idom(x)=semi(x)$
- $semi(x)\neq semi(y)$时，$idom(x)=idom(y)$

### 题目

#### 1.[hdu 4694 Important Sisters](http://acm.hdu.edu.cn/showproblem.php?pid=4694)

给一个有向图，输出每个点的必经点集合里的点的编号和，源点是n

``` C++
#include<bits/stdc++.h>
using namespace std;
#define N 500010
vector<int> edge[N],redge[N],edom[N];

int mn[N],dfn[N],idom[N],sdom[N],id[N],fa[N],f[N];
int cnt;

int find(int x)
{
    if(f[x]==x)return x;
    int y=find(f[x]);
    if(sdom[mn[x]]>sdom[mn[f[x]]])mn[x]=mn[f[x]];
    return  f[x]=y;
}
void dfs(int u)
{
    id[dfn[u]=++cnt]=u;
    for(auto &v:edge[u])
        if(!dfn[v])dfs(v),fa[dfn[v]]=dfn[u];
}
int n,m;
inline void tarjan(int s)
{
    for(int i=1; i<=n; i++)f[i]=sdom[i]=mn[i]=fa[i]=i,dfn[i]=0;
    cnt=0;
    dfs(s);
    int k,x;
    for(int i=cnt; i>1; i--)
    {
        for(auto &v:redge[id[i]])
            if(dfn[v])
                find(k=dfn[v]),sdom[i]= sdom[i]<sdom[mn[k]]?sdom[i]:sdom[mn[k]];
        edom[sdom[i]].push_back(i);
        f[i]=x=fa[i];
        for(auto &v:edom[x])
            find(k=v),idom[k] = sdom[mn[k]] < x?mn[k]:x;
        edom[x].clear();
    }
    for(int i=2; i<=cnt; i++)
    {
        if(idom[i]!=sdom[i])idom[i]=idom[idom[i]];
        edom[id[idom[i]]].push_back(id[i]);
        //if(idom[i]==i)puts("WA");
    }
}


int Ans[N];
void Mp(int u,int p)
{
    Ans[u]=p;
    for(auto &v:edom[u])
        Mp(v,p+v);
}


void out(int x)
{
    if(!x)
    {
        putchar('0');
        return ;
    }
    if(x>9)out(x/10);
    putchar('0'+x%10);
}

int main()
{
    while(scanf("%d%d",&n,&m)!=EOF)
    {
        cnt=0;
        for(int i=1;i<=n;++i) edge[i].clear(),redge[i].clear(),edom[i].clear();
        for(int i=1; i<=m; i++)
        {
            int x,y;
            scanf("%d%d",&x,&y);
            edge[x].push_back(y);
            redge[y].push_back(x);
        }
        tarjan(n);
        Mp(n,n);
        for(int i=1; i<=n; i++)
            out(Ans[i]),putchar(i==n?'\n':' '),Ans[i]=0;
    }


    return 0;
}
```

#### 2.[2017-2018 Petrozavodsk Winter Training Camp, Saratov SU Contest L](http://codeforces.com/gym/101741)

无向图，边有边权，起点为1号点，询问如果增大输入中第i条边的边权，最短路会受到影响的点有多少个。

做法很自然，在最短路构成的DAG上求支配树，询问的就是支配树子树大小了。这里把边新建点，方便处理。

``` C++
#include<bits/stdc++.h>
using namespace std;
#define N 400010
typedef long long ll;
int n,m,e;
int p[N],head[N],last[N],w[N];
bool vis[N];
ll dis[N];
int id[N],ans[N],num[N];
void add(int x,int y,int c)
{
    head[e]=y;w[e]=c;
    last[e]=p[x];
    p[x]=e++;
}
struct node
{
    int x;
    ll dis;
    node(){}
    node(int x_,ll dis_)
    {
        x=x_;
        dis=dis_;
    }
    bool operator <(const node &t)const
    {
        return dis>t.dis;
    }
};
priority_queue<node> q;
void dijkstra()
{
    for(int i=0;i<n;++i)
    {
        dis[i]=1LL<<60;
        vis[i]=0;
    }
    dis[0]=0;
    q.push(node(0,0));
    while(!q.empty())
    {
        int x=q.top().x;
        q.pop();
        if(vis[x]) continue;
        vis[x]=true;
        for(int j=p[x];j!=-1;j=last[j])
        {
            int y=head[j];
            if(dis[y]>dis[x]+w[j])
            {
                dis[y]=dis[x]+w[j];
                q.push(node(y,dis[y]));
            }
        }
    }
}

int fa[N],nodeName[N],nodeID[N];

int ncnt=0;
vector<int> edge[N],redge[N];
void dfs(int x)
{
    vis[x]=true;
    nodeID[x]=ncnt;
    nodeName[ncnt++]=x;
    for(auto &y:edge[x])
    if(!vis[y])
    {
        fa[y]=x;
        dfs(y);
    }
}
int semi[N],idom[N],ufs[N];
int mnsemi[N];
vector<int> bucket[N];
int ufs_union(int x,int y)
{
    ufs[x]=y;
}
void ufs_internal_find(int x)
{
    if(ufs[ufs[x]]==ufs[x]) return;
    ufs_internal_find(ufs[x]);
    if(semi[mnsemi[ufs[x]]]<semi[mnsemi[x]])
        mnsemi[x]=mnsemi[ufs[x]];
    ufs[x]=ufs[ufs[x]];
}
int ufs_find(int x)
{
    if(ufs[x]==x) return x;
    ufs_internal_find(x);
    return mnsemi[x];
}
void calc_dominator_tree(int n)
{
    for(int i=0;i<n;++i)
        semi[i]=mnsemi[i]=ufs[i]=i;
    for(int x=n-1;x>0;x--)
    {
        int tfa=nodeID[fa[nodeName[x]]];
        for(auto &y:redge[nodeName[x]])
        if(vis[y])
        {
            int fy=ufs_find(nodeID[y]);
            if(semi[fy]<semi[x])
                semi[x]=semi[fy];
        }
        bucket[semi[x]].push_back(x);
        ufs_union(x,tfa);

        for(auto &y:bucket[tfa])
        {
            int fy=ufs_find(y);
            idom[nodeName[y]]=nodeName[semi[fy]<semi[y]?fy:tfa];
        }
        bucket[tfa].clear();
    }
    for(int x=1;x<n;++x)
        if(idom[nodeName[x]]!=nodeName[semi[x]])
            idom[nodeName[x]]=idom[idom[nodeName[x]]];
    idom[nodeName[0]]=-1;
}
void dfs(int x,int pre)
{
    num[x]=(x<n);
    for(auto &y:edge[x])
    if(y!=pre)
    {
        dfs(y,x);
        num[x]+=num[y];
    }
}
int main()
{
    memset(p,-1,sizeof(p));
    scanf("%d%d",&n,&m);
    for(int i=0;i<m;++i)
    {
        int x,y,c;
        scanf("%d%d%d",&x,&y,&c);
        --x;--y;
        add(x,y,c);
        add(y,x,c);
    }
    dijkstra();
    int tot=n;
    for(int j=0;j<e;++j)
    {
        if(dis[head[j]]==dis[head[j^1]]+w[j])
        {
            id[tot]=j/2;
            edge[head[j^1]].push_back(tot);
            edge[tot].push_back(head[j]);
            redge[head[j]].push_back(tot);
            redge[tot].push_back(head[j^1]);
            ++tot;
            //cout<<head[j^1]<<" "<<head[j]<<endl;
        }
    }

    memset(fa,-1,sizeof(fa));
    memset(idom,-1,sizeof(idom));
    memset(vis,0,sizeof(vis));
    ncnt=0;
    dfs(0);
    calc_dominator_tree(ncnt);
    for(int i=0;i<tot;++i)
        edge[i].clear();
    for(int i=1;i<tot;++i)
        edge[idom[i]].push_back(i);
    dfs(0,-1);
    for(int i=n;i<tot;++i)
        ans[id[i]]=num[i];
    for(int i=0;i<m;++i)
        printf("%d\n",ans[i]);
    return 0;
}
```