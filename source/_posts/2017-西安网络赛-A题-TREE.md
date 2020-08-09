---
title: 2017 西安网络赛 A题 TREE
date: 2018-08-31 14:45:00
categories: 散装题解
tags: 
- LCA
- bitset
---

最近想起来这么一道题，当时q神没rush出来，赛后几分钟AC掉的

题目链接：https://nanti.jisuanke.com/t/17114

题意是树上有$N$个点，每个点的点权是一个01矩阵，有$Q$次询问，每次问树上从x到y这条路径上的矩阵依次乘起来的结果是多少(模2意义下)。数据范围$N\le 3000,Q\le 30000$，矩阵大小$64\times 64$。

首先这里的模2意义下的矩阵乘法可以用**bitset优化**，每行一个bitset，每列一个bitset，这样做乘法就是左行右列and起来，然后count一下1的个数，复杂度$O({64}^2)$。

注意到这道题中维护的信息只能合并，不能做“减法”，也就是不能使用逆矩阵，因为逆矩阵不一定存在。

一个显然的暴力思路是就是**树上倍增**，但很不幸，时间复杂度$O({64}^2QlogN)$达到了$1.4\times 10^9$肯定会超时。

我们用**离线求LCA**的方法，就可以把log去掉了。这里要注意题目中是点权，我们要先把点权看成边权，然后再把x与y的LCA处的矩阵乘上。另外，矩阵乘法是有顺序的，所以一条链，从上到下与从下到上乘起来是不一样的，所以要用两个并查集分别维护。忽略并查集的话，最终总的时间复杂度为$O({64}^2N+{64}^2Q)$。

这个题实际上还有树分治的写法，改天补一下。

``` C++	
#include<bits/stdc++.h>
using namespace std;
#define N 30010
typedef unsigned long long ull;
typedef long long ll;
const ll mod=19260817;
const ll mod2=mod*mod;
int p19[66],p26[66];
int _e,_p[N],_last[N<<1],_head[N<<1],_w[N<<1],_dir[N<<1];
vector<int> edge[N];
int fa[2][N],lca[N];
bool vis[N];
int n,m;
ull seed;

struct node
{
    int x,i,o;
};
vector<node> que[N];
struct matrix64
{
    bitset<64> mx[64],my[64];
    matrix64()
    {
        for(int i=0;i<64;++i)
            mx[i].reset(),my[i].reset();
    }
    void clear()
    {
        for(int i=0;i<64;++i)
            mx[i].reset(),my[i].reset();
    }
    void init()
    {
        for(int i=0;i<64;++i)
            mx[i].reset(),my[i].reset();
        for(int i=0;i<64;++i)
            mx[i][i]=my[i][i]=1;
    }
    void set(int x,int y)
    {
        mx[x][y]=1;
        my[y][x]=1;
    }
    friend matrix64 operator *(const matrix64 &a,const matrix64 &b)
    {
        matrix64 c;
        bitset<64> tmp;
        for(int i=0;i<64;++i)
            for(int j=0;j<64;++j)
            {
                tmp=a.mx[i]&b.my[j];
                if(tmp.count()&1)
                {
                    c.mx[i][j]=1;
                    c.my[j][i]=1;
                }
            }
        return c;
    }
} A[N],dis[2][N],ans[2][N];

void addquery(int x,int y,int c,int o)
{
    _head[++_e]=y;_w[_e]=c;_dir[_e]=o;
    _last[_e]=_p[x];
    _p[x]=_e;
}

int getfa(int x,int o)
{
    if(x==fa[o][x]) return x;
    int rt=getfa(fa[o][x],o);
    if(o==0) dis[o][x]=dis[o][x]*dis[o][fa[o][x]];
    else dis[o][x]=dis[o][fa[o][x]]*dis[o][x];
    return fa[o][x]=rt;
}
void dfs(int x,int pre)
{
    fa[0][x]=x;fa[1][x]=x;
    dis[0][x].init();dis[1][x].init();
    vis[x]=true;
    for(int i=0;i<edge[x].size();++i)
    {
        int y=edge[x][i];
        if(y!=pre)
        {
            dfs(y,x);
            fa[0][y]=x;fa[1][y]=x;
            dis[0][y]=A[y];dis[1][y]=A[y];
        }
    }
    for(int j=_p[x];j;j=_last[j])
    {
        int y=_head[j];
        int i=_w[j],o=_dir[j];
        if(vis[y])
        {
            lca[i]=getfa(y,o);
            ans[o][i]=dis[o][y];
            que[lca[i]].push_back(node{x,i,o^1});
        }
    }
    for(auto &pr:que[x])
    {
        getfa(pr.x,pr.o);
        ans[pr.o][pr.i]=dis[pr.o][pr.x];
    }
}
int calc(matrix64 &tmp)
{
    ll now=0;
    for(int j=0;j<64;++j)
        for(int k=0;k<64;++k)
        if(tmp.mx[j][k])
        {
            now=(now+1LL*p19[j+1]*p26[k+1]);
            if(now>=mod2) now-=mod2;
        }
    return now%mod;
}
int main()
{
    p19[0]=p26[0]=1;
    for(int i=1;i<=64;++i)
    {
        p19[i]=19LL*p19[i-1]%mod;
        p26[i]=26LL*p26[i-1]%mod;
    }
    while(scanf("%d%d",&n,&m)!=EOF)
    {
        _e=0;
        for(int i=1;i<=n;++i)
        {
            _p[i]=0;
            edge[i].clear();
            que[i].clear();
        }
        for(int i=1;i<n;++i)
        {
            int x,y;
            scanf("%d%d",&x,&y);
            edge[x].push_back(y);
            edge[y].push_back(x);
        }
        scanf("%llu",&seed);
        for(int i=1;i<=n;++i)
        {
            A[i].clear();
            for(int j=0;j<64;++j)
            {
                seed^=seed*seed+15;
                for(int k=0;k<64;++k)
                if((seed>>k)&1)
                    A[i].set(j,k);
            }
        }
        for(int i=1;i<=m;++i)
        {
            int x,y;
            scanf("%d%d",&x,&y);
            addquery(x,y,i,1);
            addquery(y,x,i,0);
            ans[0][i].init();
            ans[1][i].init();
        }
        for(int i=1;i<=n;++i) vis[i]=false;
        dfs(1,0);
        for(int i=1;i<=m;++i)
        {
            matrix64 tmp=ans[0][i]*A[lca[i]];
            tmp=tmp*ans[1][i];
            printf("%d\n",calc(tmp));
        }
    }
}
```