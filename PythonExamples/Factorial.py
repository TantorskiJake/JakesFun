# Jake Tantorski August 22nd, 2021

# Coding the Factorial for any number
num = int(input('Enter Number: '))
factorial = 1


def recurFactorial(n):
    if n == 1:
        return n
    else:
        # Multiply by Previous Number on Number Line
        return n * recurFactorial(n - 1)


# Check Negative || Positive || Zero
if num < 0:
    print("Sorry, No Negatives")
elif num == 0:
    print("1")
else:
    # Recursive Loop
    print("Factorial: " + str(recurFactorial(num)))
