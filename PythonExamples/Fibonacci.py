# Jake Tantorski August 22nd, 2021

# Coding the Fibonacci Sequence for any number

def Fibonacci(n):
    if n < 0:
        print("Incorrect input")
    # First Fibonacci number is 0
    elif n == 0:
        return 0
    # Second Fibonacci number is 1
    elif n == 1:
        return 1
    else:
        return Fibonacci(n - 1) + Fibonacci(n - 2)


num = int(input('Enter Fibonacci Index: '))
output = Fibonacci(num)
print("Number: " + str(output))
