---
title: Knapsack and Queries
date: 2018-09-12 10:40:00
categories: 散装题解
tags: 
- 背包
- 单调队列
---

来自Petrozavodsk Winter-2018. AtCoder Contest里的D题

题意是说，有$Q$次操作，分为两种，一是添加一个重量为$w$，价值为$v$的物品，保证插入的$w$单增，二是删除当前重量最小的物品。每次操作完之后，都有一个询问，询问能否从已有物品中选出一个子集，使得重量之和在模$M$之后在区间$[l,r]$内，并且价值和最大。

数据范围，$Q\le 100000,2\le M\le 500$。

$Q$和$M$一开始给定，之后每次操作强制在线。

做法：首先**背包**比较容易看出，但是有动态的插入、删除，这里的动态实际上是队列的模型，队尾入队，队首出队。我们将所有物品分成两部分，右半部分直接组成一个背包，左半部分记录从分界线开始的所有后缀组成的背包状态。那么插入就直接背进右边，删除直接删除左边第一个物品，不影响其他后缀，当左边为空时，就将右边所有物品移到左边，即将分界线移到最右侧，然后对每个后缀求背包。查询时，只需合并一次两边的背包，可以用**单调队列**优化。

这样每个物品最多只会用来做两次背包，做背包和合并两个背包的时间复杂度都是$O(M)$，所以总的时间复杂度为$O(QM)$。因为要记录左侧每个后缀，所以空间复杂度最多也是$O(QM)$。

代码仿照标程用了一些C++11的东西，比如template+using，swap两个vector，比较实用。

``` C++
#include <bits/stdc++.h>
using namespace std;
class Crypto {
public:
    Crypto() {
        sm = cnt = 0;
        seed();
    }

    int decode(int z) {
        z ^= next();
        z ^= (next() << 8);
        z ^= (next() << 16);
        z ^= (next() << 22);
        return z;
    }

    void query(long long z) {
        const long long B = 425481007;
        const long long MD = 1000000007;
        cnt++;
        sm = ((sm * B % MD + z) % MD + MD) % MD;
        seed();
    }
private:
    long long sm;
    int cnt;

    uint8_t data[256];
    int I, J;

    void swap_data(int i, int j) {
        uint8_t tmp = data[i];
        data[i] = data[j];
        data[j] = tmp;
    }

    void seed() {
        uint8_t key[8];
        for (int i = 0; i < 4; i++) {
            key[i] = (sm >> (i * 8));
        }
        for (int i = 0; i < 4; i++) {
            key[i+4] = (cnt >> (i * 8));
        }

        for (int i = 0; i < 256; i++) {
            data[i] = i;
        }
        I = J = 0;

        int j = 0;
        for (int i = 0; i < 256; i++) {
            j = (j + data[i] + key[i%8]) % 256;
            swap_data(i, j);
        }
    }

    uint8_t next() {
        I = (I+1) % 256;
        J = (J + data[I]) % 256;
        swap_data(I, J);
        return data[(data[I] + data[J]) % 256];
    }
} c;

using Pair=pair<int,int>;
using LL=long long;
template<class T> using V = vector<T>;
const LL INF=(LL)1e18;

int mod,Q;
V<Pair> rq;
V<LL> now,las;
V<V<LL>> lq;
void init()
{
    now.resize(mod,0);
    las.resize(mod,0);
    lq.push_back(V<LL>(mod,0));
    for(int i=1;i<mod;++i) lq[0][i]=now[i]=las[i]=-INF;
}
int add(int x)
{
    return (x>=mod)?x-mod:x;
}
void packinit(V<LL> &a)
{
    a[0]=0;
    for(int i=1;i<mod;++i) a[i]=-INF;
}
void pack(V<LL> &a,const V<LL> &b,int w,int v)
{
    for(int i=0;i<mod;++i) a[i]=b[i];
    for(int i=0;i<mod;++i) a[add(i+w)]=max(a[add(i+w)],b[i]+v);
}
void push(int w,int v)
{
    rq.push_back(Pair(w,v));
    pack(las,now,w,v);
    swap(now,las);
}
void realloc()
{
    packinit(now);
    while(!rq.empty())
    {
        lq.push_back(V<LL>(mod));
        pack(lq.back(),lq[lq.size()-2],rq.back().first,rq.back().second);
        rq.pop_back();
    }
}
void pop()
{
    if(lq.size()==1) realloc();
    lq.pop_back();
}

LL ask(const V<LL> &a,const V<LL> &pb,int l,int r)
{
    static int que[1005];
    static LL b[1005];
    int head=0,tail=0,len=r-l+1;
    for(int i=0;i<mod;++i) b[i]=b[i+mod]=pb[i];
    LL ans=-INF;
    for(int i=mod-1,j=l;i>=0;--i)
    {
        while(head<tail && que[head]<l-i+mod) ++head;
        while(j<r-i+mod)
        {
            ++j;
            while(head<tail && b[que[tail-1]]<=b[j]) --tail;
            que[tail++]=j;
        }
        ans=max(ans,a[i]+b[que[head]]);
    }
    if(ans<0) ans=-1;
    return ans;
}
int main()
{
    scanf("%d%d",&mod,&Q);
    init();
    while(Q--)
    {
        int t,w,v,l,r;
        scanf("%d%d%d%d%d",&t,&w,&v,&l,&r);
        t=c.decode(t);
        w=c.decode(w);
        v=c.decode(v);
        l=c.decode(l);
        r=c.decode(r);
        if(t==1) push(w%mod,v);
        else pop();
        LL ans=ask(lq.back(),now,l,r);
        c.query(ans);
        printf("%lld\n",ans);
    }
    return 0;
}
```