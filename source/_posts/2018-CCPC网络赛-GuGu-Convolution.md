---
title: 2018 CCPC网络赛 GuGu Convolution
date: 2018-10-08 15:23:00
categories: 散装题解
tags: 生成函数
---

题目链接 http://acm.hdu.edu.cn/showproblem.php?pid=6442

定义序列$\{a\}=(a_0,a_1,a_2,\dots)$

它的指数型生成函数为$g_{\{a\}}(x)=\sum_{i=0}^{\infty}\frac{a_i}{i!}x^i$

设$c$是一个常数

定义序列$\{u_c\}=(c^0,c^1,c^2,\dots)$,$\{e_c\}=(0,c^1,0,c^3,0,c^5,\dots)$

定义两个生成函数$g_{\{a\}},g_{\{b\}}$的卷积$G(x)=(g_{\{a\}}*g_{\{b\}})(x)=\sum_{n=0}^{\infty}(\sum_{i+j=n}\frac{a_i}{i!}\frac{b_j}{j!})x^n$(原题面省略了阶乘，可能是写错了?)

现在给三个正整数$n,A,B$,求$G(x)=g_{u_A}*g_{e_{\sqrt{B}}}$的$x^n$前的系数乘上$n!$后的结果

赛中走了很多弯路，思路大概是这样的

首先用泰勒展开，可以看出

$g_{u_A}=e^{Ax},g_{e_B}=\frac{1}{2}(e^{\sqrt{B}x}-e^{-\sqrt{B}x})$

所以$G(x)=g_{u_A}*g_{e_{\sqrt{B}}}=\frac{1}{2}(e^{(A+\sqrt{B})x}-e^{(A-\sqrt{B})x})$

第n项系数为$\frac{(A+\sqrt{B})^n-(A-\sqrt{B})^n}{2}$

类似斐波那契数列也可以强行求出线性递推的式子然后矩阵快速幂，就是推得比较难受罢了==

更快的方法

不用泰勒展开，直接用二项式定理类似的凑一下就可以得到第$n$项系数的式子，最后也不用推递推式，答案就是$(A+\sqrt{B})^n=x+y\sqrt{B}$中去掉整数项$x$，直接快速幂就做完了。

赛中代码：

``` C++
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
ll a,b,n,mod;
struct matrix
{
    ll mx[2][2];
    matrix()
    {
        memset(mx,0,sizeof(mx));
    }
    void clear()
    {
        memset(mx,0,sizeof(mx));
    }
    void init()
    {
        memset(mx,0,sizeof(mx));
        mx[0][0]=mx[1][1]=1;
    }
    friend matrix operator *(const matrix &a,const matrix &b)
    {
        matrix c;
        for(int i=0;i<2;++i)
            for(int k=0;k<2;++k)
                for(int j=0;j<2;++j)
                    c.mx[i][j]=(c.mx[i][j]+a.mx[i][k]*b.mx[k][j])%mod;
        return c;
    }
}A,ans;
int main()
{
    int T;
    scanf("%d",&T);
    while(T--)
    {
        scanf("%I64d%I64d%I64d%I64d",&a,&b,&n,&mod);
        ans.init();
        A.mx[0][0]=2*a%mod;A.mx[0][1]=1;
        A.mx[1][0]=(b-a*a%mod+mod)%mod;A.mx[1][1]=0;
        --n;
        while(n)
        {
            if(n&1) ans=ans*A;
            A=A*A;
            n>>=1;
        }
        ll pp=0;
        for(ll i=1;1LL*i*i<=b;++i)
        if(b%(i*i)==0)
            pp=i;
        printf("%d %I64d %I64d\n",1,ans.mx[0][0]*pp%mod,b/(pp*pp));
    }
}
```