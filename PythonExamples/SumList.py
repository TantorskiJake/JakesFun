# Jake Tantorski August 26th, 2021

# Coding the Sum of List

list1 = [1, 2, 3, 4, 5]
list2 = [6, 7, 8, 9]

# Recursive Way
def sumOfList(list, size):
    if (size == 0):
        return 0
    else:
        return list[size - 1] + sumOfList(list, size - 1)


total1 = sumOfList(list1, len(list1))

# Sum Function Way
total2 = sum(list2)

print("Sum of List: " + str(list1) + " = " + str(total1))

print("Sum of List: " + str(list2) + " = " + str(total2))
