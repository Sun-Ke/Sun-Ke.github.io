import random  # 导入随机数模块

# 老师提前写下一个数字，记为number
# 这里采用随机生成的方式
number = random.randint(1, 20)  # 随机一个1到20的数字赋值给number
guess = -1

while guess != number:  # 当没猜中时
    guess = int(input("在1-20之间猜一个数字："))
    if guess == number:
        print("猜中了！")
    elif guess < number:
        print("猜的数字小了")
    else:
        print("猜的数字大了")

print("游戏结束~")
