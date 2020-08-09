---
title: cdq分治+可撤销并查集
date: 2019-02-26 00:01:00
categories: 算法学习
tags: 
- cdq分治
- 并查集
---

#### [1.bzoj 3237 [Ahoi2013\]连通图](https://www.lydsy.com/JudgeOnline/problem.php?id=3237)

题意：给一个连通的无向图，无重边无自环，$k$个询问，每次询问给出不超过$4$条原图中的边，问将这些边删掉后，无向图是否还是保持连通。一个图是连通的当且仅当任意两个不同的点之间存在一条路径连接他们。

做法：cdq分治+可撤销并查集。每次先加入在右半区间且不在左半区间的边，递归到左半边，撤销，再加入在左半区间且不在右半区间的边，递归到右半边，撤销。

``` C++
#include<bits/stdc++.h>
using namespace std;
#define N 200010
struct DSU
{
    int fa[N],rk[N],cnt;
    pair<int*,int> stk[N<<3];
    int siz;
    void init(int n)
    {
        cnt=n;siz=0;
        for(int i=1;i<=n;++i)
            fa[i]=i,rk[i]=0;
    }
    int Find(int x)
    {
        while(x!=fa[x]) x=fa[x];
        return x;
    }
    bool Union(int x,int y)
    {
        x=Find(x);y=Find(y);
        if(x==y) return false;
        if(rk[x]<rk[y]) swap(x,y);
        stk[++siz]=pair<int*,int>(fa+y,fa[y]);
        fa[y]=x;
        if(rk[x]==rk[y])
        {
            stk[++siz]=pair<int*,int>(rk+x,rk[x]);
            ++rk[x];
        }
        stk[++siz]=pair<int*,int>(&cnt,cnt);
        --cnt;
        return true;
    }
    void Undo(int tim)
    {
        while(siz>tim)
        {
            *stk[siz].first=stk[siz].second;
            --siz;
        }
    }
} dsu;
struct edge
{
    int x,y;
} e[N];
int n,m,q;
bool vis[N],ans[N];
struct node
{
    int c,a[4];
} t[N];
 
void setvis(int l,int r,bool flag)
{
    for(int i=l;i<=r;++i)
        for(int j=0;j<t[i].c;++j)
            vis[t[i].a[j]]=flag;
}
void add(int l,int r)
{
    for(int i=l;i<=r;++i)
        for(int j=0;j<t[i].c;++j)
        {
            int o=t[i].a[j];
            if(!vis[o])
                dsu.Union(e[o].x,e[o].y);
        }
}
void solve(int l,int r)
{
    if(l==r)
    {
        ans[l]=(dsu.cnt==1);
        return;
    }
    int mid=l+r>>1,now=dsu.siz;
    setvis(l,mid,1);
    add(mid+1,r);
    setvis(l,mid,0);
 
    solve(l,mid);
    dsu.Undo(now);
 
    setvis(mid+1,r,1);
    add(l,mid);
    setvis(mid+1,r,0);
 
    solve(mid+1,r);
    dsu.Undo(now);
}
int main()
{
    scanf("%d%d",&n,&m);
    for(int i=1;i<=m;++i)
        scanf("%d%d",&e[i].x,&e[i].y);
    scanf("%d",&q);
    for(int i=1;i<=q;++i)
    {
        scanf("%d",&t[i].c);
        for(int j=0;j<t[i].c;++j)
        {
            scanf("%d",&t[i].a[j]);
            vis[t[i].a[j]]=true;
        }
    }
    dsu.init(n);
    for(int i=1;i<=m;++i)
        if(!vis[i]) dsu.Union(e[i].x,e[i].y);
        else vis[i]=false;
    solve(1,q);
    for(int i=1;i<=q;++i)
        puts(ans[i]?"Connected":"Disconnected");
    return 0;
}
```