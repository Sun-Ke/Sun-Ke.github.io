---
title: bzoj 3569 DZY Loves Chinese II
date: 2019-02-18 12:05:00
categories: 散装题解
tags: 随机化
---

题意：给一个$n$个点$m$条边的(连通)无向图，$q$个询问，每次询问给出$k$条原图中的边，问将这些边删掉后，无向图是否还是保持连通。一个图是连通的当且仅当任意两个不同的点之间存在一条路径连接他们。$N\le 100000,M\le 500000,Q\le 50000,1\le K\le 15$。

这道题实际上是[bzoj 3237](https://www.lydsy.com/JudgeOnline/problem.php?id=3237)的加强版。

对原图随便找一个生成树出来，对非树边随机边权，树边边权则为覆盖它的所有非树边权值的异或和，那么一个边集删去后使得图不连通等价于这个边集**存在一个子集**的权值异或和为0。

随机是为了让边权异或和在不应该是0的情况下不为0。

正确性证明参考这篇 http://dwjshift.logdown.com/posts/2830435

时间复杂度$O(m+n+32qk)$

``` C++
#include<bits/stdc++.h>
using namespace std;
#define N 100010
#define M 500010
typedef unsigned int uint;
 
const int MAXL = 31;
struct LinearBasis
{
    uint a[MAXL + 5];
    vector<uint> v;
    void clear()
    {
        memset(a,0,sizeof(a));
        v.clear();
    }
    void insert(uint t)
    {
        for(int j=MAXL;j>=0;j--)
        if((t>>j)&1)
        {
            if(a[j]) t^=a[j];
            else
            {
                for(int k=0;k<j;k++) if((t>>k)&1) t^=a[k];
                for(int k=j+1;k<=MAXL;k++) if((a[k]>>j)&1) a[k]^=t;
                a[j]=t;
                return;
            }
        }
    }
    void build()
    {
        for(int j=0;j<=MAXL;++j)
            if(a[j]) v.push_back(a[j]);
    }
} st;
int n,m,q;
int fa[N];
uint val[N],eval[M];
uint s=2323423;
int e,head[M<<1],w[M<<1],last[M<<1],p[N];
uint getNext()
{
    s=s^(s<<13);
    s=s^(s>>17);
    s=s^(s<<5);
    return s;
}
int getfa(int x)
{
    if(x==fa[x]) return x;
    return fa[x]=getfa(fa[x]);
}
bool Union(int x,int y)
{
    x=getfa(x);y=getfa(y);
    if(x==y) return false;
    fa[x]=y;
    return true;
}
void add(int x,int y,int o)
{
    head[++e]=y;w[e]=o;
    last[e]=p[x];
    p[x]=e;
}
void dfs(int x,int pre,int eid)
{
    for(int j=p[x];j;j=last[j])
    {
        int y=head[j];
        if(y==pre) continue;
        dfs(y,x,w[j]);
        val[x]^=val[y];
    }
    eval[eid]=val[x];
}
int main()
{
    scanf("%d%d",&n,&m);
    for(int i=1;i<=n;++i) fa[i]=i;
    for(int i=1;i<=m;++i)
    {
        int x,y;
        scanf("%d%d",&x,&y);
        if(Union(x,y))
        {
            add(x,y,i);
            add(y,x,i);
        }
        else
        {
            eval[i]=getNext();
            val[x]^=eval[i];
            val[y]^=eval[i];
        }
    }
    dfs(1,0,0);
    int res=0;
    scanf("%d",&q);
    while(q--)
    {
        st.clear();
        int k;
        scanf("%d",&k);
        for(int i=0;i<k;++i)
        {
            int x;
            scanf("%d",&x);
            x^=res;
            st.insert(eval[x]);
        }
        st.build();
        if(st.v.size()<k) puts("Disconnected");
        else ++res,puts("Connected");
    }
    return 0;
}
```

 

 