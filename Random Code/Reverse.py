# Jake Tantorski August 22nd, 2021

# Three ways to reverse a list in Python

myArray1 = [1, 2, 3]
myArray2 = [4, 5, 6]
myArray3 = [7, 8, 9]


def Reverse1(lst):
    lst.reverse()
    return lst


def Reverse2(lst):
    return lst[::-1]


def Reverse3(lst):
    return [ele for ele in reversed(lst)]


print(Reverse1(myArray1))
print(Reverse2(myArray2))
print(Reverse3(myArray3))
